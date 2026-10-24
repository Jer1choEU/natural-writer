import { createHash, randomUUID } from "node:crypto";
import { createClient, type Client } from "@libsql/client";
import {
  STAT_FIELDS, eventFeatures, importFeatures, profileFromAggregates,
  type LearningEvent, type LearningMode,
} from "@/lib/learning-profile";
import type { StylePreferenceProfile } from "@/lib/preference-profile";
import type { PreferenceExample } from "@/lib/humanizer";

let client: Client | undefined;
let initialized: Promise<void> | undefined;

export function learningDatabaseConfigured() {
  const url = process.env.TURSO_DATABASE_URL;
  return Boolean(url && (url.startsWith("file:") || process.env.TURSO_AUTH_TOKEN));
}

function database(): Client {
  if (!learningDatabaseConfigured()) throw new Error("LEARNING_DB_NOT_CONFIGURED");
  const url = process.env.TURSO_DATABASE_URL!;
  return client ||= createClient(url.startsWith("file:") ? { url } : {
    url, authToken: process.env.TURSO_AUTH_TOKEN!,
  });
}

async function ready(): Promise<Client> {
  const db = database();
  initialized ||= db.batch([
    "CREATE TABLE IF NOT EXISTS learning_settings (owner_id TEXT PRIMARY KEY, auto_learning INTEGER NOT NULL DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS learning_events (owner_id TEXT NOT NULL, event_id TEXT NOT NULL, kind TEXT NOT NULL, mode TEXT NOT NULL, original TEXT NOT NULL, preferred TEXT NOT NULL, rejected TEXT NOT NULL, weight REAL NOT NULL, features TEXT NOT NULL, created_at TEXT NOT NULL, fingerprint TEXT NOT NULL, PRIMARY KEY(owner_id, event_id), UNIQUE(owner_id, fingerprint))",
    "CREATE INDEX IF NOT EXISTS idx_learning_owner_mode ON learning_events(owner_id, mode, created_at)",
    "CREATE TABLE IF NOT EXISTS learning_profiles (owner_id TEXT NOT NULL, mode TEXT NOT NULL, version INTEGER NOT NULL, event_count INTEGER NOT NULL, profile_json TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY(owner_id, mode, version))",
    "CREATE TABLE IF NOT EXISTS learning_pins (owner_id TEXT NOT NULL, mode TEXT NOT NULL, version INTEGER NOT NULL, PRIMARY KEY(owner_id, mode))",
  ], "write").then(() => {}).catch(error => { initialized = undefined; throw error; });
  await initialized;
  return db;
}
const number = (value: unknown) => Number(value || 0);
const validDate = (value: string) => !Number.isNaN(Date.parse(value)) ?
  new Date(value).toISOString() : new Date().toISOString();

export function sanitizeEvent(value: unknown): LearningEvent | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (!["choice","edit","import"].includes(String(raw.kind))) return null;
  const kind = raw.kind as LearningEvent["kind"];
  const mode = raw.mode === "natural" || raw.mode === "social" ? raw.mode : "general";
  const original = typeof raw.original === "string" ? raw.original.trim() : "";
  const preferred = typeof raw.preferred === "string" ? raw.preferred.trim() : "";
  const rejected = typeof raw.rejected === "string" ? raw.rejected.trim() : "";
  if (!preferred || preferred.length > 10000 || original.length > 10000 || rejected.length > 10000) return null;
  if (kind === "choice" && (!original || !rejected)) return null;
  if (kind === "edit" && (!original || original === preferred)) return null;
  if (kind === "import" && preferred.length < 80) return null;
  return {
    kind, mode,
    original: kind === "import" ? "" : original,
    preferred,
    rejected: kind === "edit" ? original : kind === "import" ? "" : rejected,
    createdAt: validDate(typeof raw.createdAt === "string" ? raw.createdAt : ""),
    weight: kind === "edit" ? 2 : 1,
  };
}

async function getSetting(owner: string) {
  const db = await ready();
  await db.execute({ sql: "INSERT OR IGNORE INTO learning_settings(owner_id) VALUES (?)", args: [owner] });
  const result = await db.execute({ sql: "SELECT auto_learning FROM learning_settings WHERE owner_id = ?", args: [owner] });
  return number(result.rows[0]?.auto_learning) === 1;
}

export async function setAutoLearning(owner: string, enabled: boolean) {
  const db = await ready();
  await db.execute({
    sql: "INSERT INTO learning_settings(owner_id, auto_learning) VALUES (?, ?) ON CONFLICT(owner_id) DO UPDATE SET auto_learning=excluded.auto_learning",
    args: [owner, Number(enabled)],
  });
  return enabled;
}

async function lastSnapshot(owner: string, mode: LearningMode) {
  const db = await ready();
  const rows = await db.execute({
    sql: "SELECT version, event_count, profile_json, created_at FROM learning_profiles WHERE owner_id=? AND mode=? ORDER BY version DESC LIMIT 1",
    args: [owner, mode],
  });
  return rows.rows[0] || null;
}

async function calculateProfile(owner: string, mode: LearningMode) {
  const db = await ready();
  const aggregates = STAT_FIELDS.map(field =>
    "COALESCE(SUM(CAST(json_extract(features, '$." + field + "') AS REAL) * weight), 0) AS " + field
  ).join(", ");
  const results = await db.execute({
    sql: "SELECT COUNT(*) AS count, COALESCE(SUM(weight),0) AS weights, " + aggregates +
      " FROM learning_events WHERE owner_id=? AND kind IN ('choice','edit') AND (mode=? OR mode='general')",
    args: [owner, mode],
  });
  const row = results.rows[0];
  const weights = number(row?.weights);
  const stats = Object.fromEntries(STAT_FIELDS.map(key => [key, weights ? number(row?.[key]) / weights : 0]));
  const imports = await db.execute({
    sql: "SELECT COUNT(*) AS count, AVG(CAST(json_extract(features,'$.gulpease') AS REAL)) AS gulpease, " +
      "AVG(CAST(json_extract(features,'$.sentenceLengthStdDev') AS REAL)) AS sentenceLengthStdDev " +
      "FROM learning_events WHERE owner_id=? AND kind='import' AND (mode=? OR mode='general')",
    args: [owner, mode],
  });
  const i = imports.rows[0];
  const built = profileFromAggregates(number(row?.count), stats, {
    count: number(i?.count), gulpease: number(i?.gulpease),
    sentenceLengthStdDev: number(i?.sentenceLengthStdDev),
  });
  return { ...built, eventCount: number(row?.count) + number(i?.count) };
}

async function consolidate(owner: string, mode: LearningMode) {
  const db = await ready();
  const snapshot = await lastSnapshot(owner, mode);
  const calculated = await calculateProfile(owner, mode);
  const previousCount = number(snapshot?.event_count);
  // No snapshot for a mode with zero observations. A Social selection must not
  // create a phantom "Natural" version (and vice versa).
  if (calculated.eventCount === 0) return;
  if (snapshot && (calculated.eventCount <= previousCount ||
    (calculated.eventCount > 5 && calculated.eventCount - previousCount < 5))) return;
  const version = number(snapshot?.version) + 1;
  // An immutable snapshot; conflicting concurrent writers cannot clobber one another.
  await db.execute({
    sql: "INSERT OR IGNORE INTO learning_profiles(owner_id,mode,version,event_count,profile_json,created_at) VALUES(?,?,?,?,?,?)",
    args: [owner, mode, version, calculated.eventCount, JSON.stringify(calculated), new Date().toISOString()],
  });
}

export async function recordLearningEvents(owner: string, raw: unknown[], automatic = false) {
  const db = await ready();
  if (automatic && !(await getSetting(owner))) throw new Error("AUTO_LEARNING_DISABLED");
  const events = raw.slice(0, 50).map(sanitizeEvent).filter((e): e is LearningEvent => e !== null);
  if (!events.length) return { saved: 0, count: (await getLearningStatus(owner)).count };
  const commands = events.map(event => {
    const features = event.kind === "import" ? importFeatures(event.preferred) : eventFeatures(event);
    const identity = event.kind + "|" + event.mode + "|" + event.original + "|" +
      event.preferred + "|" + event.rejected + (event.kind === "import" ? "" : "|" + event.createdAt);
    const fingerprint = createHash("sha256").update(identity).digest("hex");
    return {
      sql: "INSERT OR IGNORE INTO learning_events(owner_id,event_id,kind,mode,original,preferred,rejected,weight,features,created_at,fingerprint) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      args: [owner, randomUUID(), event.kind, event.mode, event.original, event.preferred,
        event.rejected, event.weight, JSON.stringify(features), event.createdAt, fingerprint],
    };
  });
  const results = await db.batch(commands, "write");
  const saved = results.reduce((sum, r) => sum + r.rowsAffected, 0);
  if (saved) await Promise.all([consolidate(owner, "social"), consolidate(owner, "natural")]);
  return { saved, count: (await getLearningStatus(owner)).count };
}

export async function getLearningStatus(owner: string) {
  const db = await ready();
  const enabled = await getSetting(owner);
  const counts = await db.execute({
    sql: "SELECT COUNT(*) AS total, SUM(CASE WHEN kind='import' THEN 1 ELSE 0 END) AS imports FROM learning_events WHERE owner_id=?",
    args: [owner],
  });
  const pins = await db.execute({ sql: "SELECT mode,version FROM learning_pins WHERE owner_id=?", args: [owner] });
  const snapshots = await db.execute({
    sql: "SELECT mode, COUNT(*) AS version FROM learning_profiles WHERE owner_id=? AND event_count>0 GROUP BY mode",
    args: [owner],
  });
  return {
    configured: true,
    enabled,
    count: number(counts.rows[0]?.total),
    imports: number(counts.rows[0]?.imports),
    versions: Object.fromEntries(snapshots.rows.map(row => [String(row.mode), number(row.version)])),
    pinned: Object.fromEntries(pins.rows.map(row => [String(row.mode), number(row.version)])),
    backupConfigured: Boolean(process.env.CRON_SECRET && (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)),
  };
}

export async function learningContext(owner: string, mode: LearningMode): Promise<{
  profile: StylePreferenceProfile;
  examples: PreferenceExample[];
  styleReferences: string[];
}> {
  const db = await ready();
  const pin = await db.execute({ sql: "SELECT version FROM learning_pins WHERE owner_id=? AND mode=?", args: [owner,mode] });
  const pinned = pin.rows[0]?.version;
  const selected = pinned
    ? await db.execute({ sql: "SELECT profile_json FROM learning_profiles WHERE owner_id=? AND mode=? AND version=?",
      args: [owner, mode, number(pinned)] }) : null;
  const snapshot = selected?.rows[0] || await lastSnapshot(owner, mode);
  const built = snapshot ? JSON.parse(String(snapshot.profile_json)) as Awaited<ReturnType<typeof calculateProfile>>
    : await calculateProfile(owner, mode);
  const recent = await db.execute({
    sql: "SELECT original,preferred,rejected FROM learning_events WHERE owner_id=? AND kind IN ('choice','edit') AND (mode=? OR mode='general') ORDER BY created_at DESC LIMIT 3",
    args: [owner, mode],
  });
  const style = await db.execute({
    sql: "SELECT preferred FROM learning_events WHERE owner_id=? AND kind='import' AND (mode=? OR mode='general') ORDER BY created_at DESC LIMIT 2",
    args: [owner, mode],
  });
  return {
    profile: built.profile,
    examples: recent.rows.map(row => ({
      original: String(row.original), preferred: String(row.preferred), rejected: String(row.rejected),
    })),
    styleReferences: style.rows.map(row => String(row.preferred).slice(0, 900)),
  };
}

export async function restorePreviousLearningProfile(owner: string, mode: LearningMode) {
  const db = await ready();
  const latest = await db.execute({
    sql: "SELECT version, event_count, profile_json FROM learning_profiles WHERE owner_id=? AND mode=? AND event_count>0 ORDER BY version DESC LIMIT 2",
    args: [owner, mode],
  });
  if (latest.rows.length < 2) throw new Error("NO_OLDER_PROFILE");
  const [, previous] = latest.rows;
  await db.execute({
    sql: "INSERT INTO learning_pins(owner_id,mode,version) VALUES(?,?,?) ON CONFLICT(owner_id,mode) DO UPDATE SET version=excluded.version",
    args: [owner, mode, number(previous.version)],
  });
  return { version: number(previous.version), pinned: true };
}

export async function resumeAutomaticLearningProfile(owner: string, mode: LearningMode) {
  const db = await ready();
  await db.execute({ sql: "DELETE FROM learning_pins WHERE owner_id=? AND mode=?", args: [owner,mode] });
  return { pinned: false };
}

export async function exportLearning(owner: string) {
  const db = await ready();
  const events = await db.execute({
    sql: "SELECT kind, mode, original, preferred, rejected, weight, created_at FROM learning_events WHERE owner_id=? ORDER BY created_at, event_id",
    args: [owner],
  });
  const profiles = await db.execute({
    sql: "SELECT mode,version,event_count,profile_json,created_at FROM learning_profiles WHERE owner_id=? ORDER BY mode, version",
    args: [owner],
  });
  const pins = await db.execute({ sql: "SELECT mode,version FROM learning_pins WHERE owner_id=?", args: [owner] });
  return {
    format: "natural-writer-learning-v1",
    exportedAt: new Date().toISOString(),
    events: events.rows,
    profiles: profiles.rows,
    pinnedVersions: pins.rows,
  };
}

export async function clearLearning(owner: string) {
  const db = await ready();
  await db.batch([
    { sql: "DELETE FROM learning_events WHERE owner_id=?", args: [owner] },
    { sql: "DELETE FROM learning_profiles WHERE owner_id=?", args: [owner] },
    { sql: "DELETE FROM learning_pins WHERE owner_id=?", args: [owner] },
    { sql: "DELETE FROM learning_settings WHERE owner_id=?", args: [owner] },
  ], "write");
}
