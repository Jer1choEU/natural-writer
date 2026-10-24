"use client";

import { useEffect, useMemo, useState } from "react";

type Alternative = {
  id: "A" | "B";
  text: string;
  similarity?: number;
  strategy?: string;
  qualityScore?: number | null;
  semanticGuardPassed?: boolean;
};

type PreferenceRecord = {
  original: string;
  preferred: string;
  rejected: string;
  createdAt: string;
};

const STORAGE_KEY = "natural-writer-preferences-v1";
const MAX_STORED_PREFERENCES = 50;
const MAX_RECENT_EXAMPLES = 3;
const MIGRATED_KEY = "natural-writer-migrated-to-cloud-v1";
const PENDING_KEY = "natural-writer-pending-learning-v1";

type LearningRecord = PreferenceRecord & { kind: "choice" | "edit"; mode: "social" | "natural" };

function readPending(): LearningRecord[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function addPending(event: LearningRecord) {
  const list = readPending();
  localStorage.setItem(PENDING_KEY, JSON.stringify([...list, event].slice(-500)));
}


function readPreferences(): PreferenceRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is PreferenceRecord =>
        Boolean(
          item &&
            typeof item.original === "string" &&
            typeof item.preferred === "string" &&
            typeof item.rejected === "string" &&
            typeof item.createdAt === "string"
        )
    );
  } catch {
    return [];
  }
}

export default function Home() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"social" | "natural">("social");
  const [selectedFragment, setSelectedFragment] = useState<{ index: number; start: number; end: number } | null>(null);
  const [fragmentBusyIndex, setFragmentBusyIndex] = useState<number | null>(null);
  const [fragmentError, setFragmentError] = useState("");
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [preferenceCount, setPreferenceCount] = useState(0);
  const [storageMode, setStorageMode] = useState<"checking" | "cloud" | "local">("checking");
  const [autoLearningEnabled, setAutoLearningEnabled] = useState(false);
  const [generatedAlternatives, setGeneratedAlternatives] = useState<Alternative[]>([]);
  const [trainingNotice, setTrainingNotice] = useState("");
  const [trainingBusy, setTrainingBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function initializeLearning() {
      setPreferenceCount(readPreferences().length);
      try {
        const r = await fetch("/api/learning", { cache: "no-store" });
        if (!r.ok) { if (active) setStorageMode("local"); return; }
        let status = await r.json();
        if (!active) return;
        setStorageMode("cloud");
        setAutoLearningEnabled(Boolean(status.enabled));

        // Migrate legacy data only after server acknowledgement. Keep the
        // original local copy as a safety backup; server fingerprints dedupe retries.
        const old = readPreferences();
        if (old.length > 0 && !localStorage.getItem(MIGRATED_KEY)) {
          const migration = await fetch("/api/learning", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "migrate", events: old.map(e => ({
              ...e, kind: "choice", mode: "general",
            })) }),
          });
          if (migration.ok) localStorage.setItem(MIGRATED_KEY, "yes");
          else setTrainingNotice("Importazione dei vecchi dati non completata: il backup locale è intatto.");
        }
        const pending = readPending();
        if (pending.length) {
          const allowed = pending.filter(event => event.kind === "choice" || status.enabled);
          const remaining = pending.filter(event => !allowed.includes(event));
          for (let i = 0; i < allowed.length; i += 50) {
            const batch = allowed.slice(i, i + 50);
            const response = await fetch("/api/learning", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "record", events: batch,
                automatic: batch.some(e => e.kind === "edit") }),
            });
            if (!response.ok) remaining.push(...batch);
          }
          localStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
        }
        const updated = await fetch("/api/learning", { cache: "no-store" });
        if (updated.ok) status = await updated.json();
        if (active) setPreferenceCount(status.count);
      } catch {
        if (active) {
          setStorageMode("local");
          setTrainingNotice("Memoria cloud non raggiungibile: conserviamo le preferenze nel browser.");
        }
      }
    }
    void initializeLearning();
    return () => { active = false; };
  }, []);

  async function saveCloudEvents(events: LearningRecord[], automatic = false): Promise<boolean> {
    try {
      const r = await fetch("/api/learning", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "record", events, automatic }),
      });
      if (!r.ok) throw new Error("Non è stato possibile confermare il salvataggio cloud.");
      const data = await r.json();
      setPreferenceCount(data.count);
      return true;
    } catch {
      events.forEach(addPending);
      setTrainingNotice("Salvataggio cloud in sospeso: le modifiche sono conservate localmente.");
      return false;
    }
  }


  const canTransform = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function transform() {
    if (!canTransform) return;

    setLoading(true);
    setError("");
    setAlternatives([]);
    setGeneratedAlternatives([]);
    setSelectedIndex(null);
    setSelectedFragment(null);
    setFragmentError("");

    try {
      const storedPreferences = readPreferences();
      const preferenceExamples = storedPreferences.slice(-MAX_STORED_PREFERENCES);

      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          preferenceExamples,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante la trasformazione.");
      }

      const received = Array.isArray(data.alternatives)
        ? data.alternatives.filter(
            (item: unknown): item is Alternative =>
              Boolean(
                item &&
                  typeof item === "object" &&
                  "text" in item &&
                  typeof (item as Alternative).text === "string"
              )
          )
        : [];

      if (received.length >= 2) {
        setAlternatives(received.slice(0, 2));
        setGeneratedAlternatives(received.slice(0, 2));
      } else if (typeof data.text === "string") {
        setAlternatives([{ id: "A", text: data.text }]);
        setGeneratedAlternatives([{ id: "A", text: data.text }]);
      } else {
        throw new Error("Il motore non ha restituito una riscrittura valida.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto.");
    } finally {
      setLoading(false);
    }
  }

  function updateAlternative(index: number, text: string) {
    setAlternatives((current) =>
      current.map((candidate, candidateIndex) =>
        candidateIndex === index ? { ...candidate, text } : candidate
      )
    );
    setSelectedFragment(null);
  }

  async function rewriteSelection(index: number) {
    const selection = selectedFragment;
    const current = alternatives[index];
    if (!selection || selection.index !== index || !current || fragmentBusyIndex !== null) return;
    const fragment = current.text.slice(selection.start, selection.end);
    if (!fragment.trim()) return;

    setFragmentBusyIndex(index);
    setFragmentError("");
    try {
      const response = await fetch("/api/rewrite-fragment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fragment,
          context: current.text,
          mode,
        }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.text !== "string") {
        throw new Error(data.error || "La riscrittura locale non è riuscita.");
      }
      // Use the text captured at selection time, avoiding edits on a stale selection.
      if (alternatives[index]?.text !== current.text) {
        throw new Error("Il testo è cambiato: seleziona nuovamente il passaggio.");
      }
      updateAlternative(index,
        current.text.slice(0, selection.start) + data.text + current.text.slice(selection.end)
      );
    } catch (error) {
      setFragmentError(error instanceof Error ? error.message : "Errore nella riscrittura locale.");
    } finally {
      setFragmentBusyIndex(null);
      setSelectedFragment(null);
    }
  }

  async function copyAlternative(index: number) {
    const alternative = alternatives[index];
    const generated = generatedAlternatives[index];
    if (!alternative) return;
    try {
      await navigator.clipboard.writeText(alternative.text);
    } catch {
      setTrainingNotice("Impossibile copiare il testo negli appunti.");
      return;
    }
    // Only a genuine, used human correction is suitable as an automatic signal.
    if (storageMode !== "cloud" || !autoLearningEnabled ||
        !generated || generated.text === alternative.text) return;
    const event: LearningRecord = {
      kind: "edit", mode, original: generated.text, preferred: alternative.text,
      rejected: generated.text, createdAt: new Date().toISOString(),
    };
    setTrainingBusy(true);
    await saveCloudEvents([event], true);
    setTrainingBusy(false);
  }

  async function choosePreference(index: number) {
    if (selectedIndex !== null || alternatives.length < 2 || trainingBusy) return;
    const preferred = alternatives[index];
    const rejected = alternatives[index === 0 ? 1 : 0];
    if (!preferred || !rejected) return;
    const event: LearningRecord = {
      kind: "choice", mode, original: input.trim(), preferred: preferred.text,
      rejected: rejected.text, createdAt: new Date().toISOString(),
    };
    setTrainingBusy(true);
    if (storageMode === "cloud") {
      const events: LearningRecord[] = [event];
      const generated = generatedAlternatives[index];
      if (autoLearningEnabled && generated && preferred.text !== generated.text) {
        events.push({
          kind: "edit", mode, original: generated.text,
          preferred: preferred.text, rejected: generated.text,
          createdAt: new Date().toISOString(),
        });
      }
      await saveCloudEvents(events, false);
    } else {
      const current = readPreferences();
      const next: PreferenceRecord[] = [...current, event].slice(-MAX_STORED_PREFERENCES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setPreferenceCount(next.length);
    }
    setSelectedIndex(index);
    setTrainingBusy(false);
  }

  function resetTraining() {
    if (storageMode === "cloud") {
      setTrainingNotice("Per cancellare o esportare il training cloud, apri la sezione Memoria.");
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    setPreferenceCount(0);
    setSelectedIndex(null);
  }

  return (
    <main className="shell">
      <div className="trainingBar">
        <span>
          Training locale: <strong>{preferenceCount}</strong> scelte
          {preferenceCount > 0 && (
            <> · profilo su {preferenceCount} scelte · ultimi {Math.min(preferenceCount, MAX_RECENT_EXAMPLES)} esempi diretti</>
          )}
        </span>
        {preferenceCount > 0 && (
          <button className="resetTraining" onClick={resetTraining}>
            Azzera training
          </button>
        )}
      </div>

      <section className="workspace">
        <div className="panel">
          <div className="panelHeader">
            <strong>Testo originale</strong>
            <span>{input.length} caratteri</span>
          </div>
          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            placeholder="Incolla qui il testo da riscrivere..."
          />
        </div>

        <aside className="controls">
          <label className="settingField">Modalità
            <select value={mode} onChange={(event) => setMode(event.target.value as "social" | "natural")}>
              <option value="social">Social</option>
              <option value="natural">Naturale</option>
            </select>
          </label>
          <button className="primary" disabled={!canTransform} onClick={transform}>
            {loading ? "Sto creando A/B..." : "Trasforma"}
          </button>
          {error && <p className="error">{error}</p>}
          {fragmentError && <p className="error">{fragmentError}</p>}
        </aside>

        <div className="panel resultPanel">
          <div className="panelHeader">
            <strong>Confronto A/B</strong>
            <span>{alternatives.length >= 2 ? "Scegli la migliore" : "Risultato"}</span>
          </div>

          {alternatives.length === 0 ? (
            <div className="emptyResult">
              {loading
                ? "Sto preparando e confrontando le due riscritture..."
                : "Le due varianti appariranno qui."}
            </div>
          ) : (
            <div className="optionsGrid">
              {alternatives.map((alternative, index) => {
                const selected = selectedIndex === index;
                const rejected = selectedIndex !== null && selectedIndex !== index;

                return (
                  <article
                    className={[
                      "optionCard",
                      selected ? "selected" : "",
                      rejected ? "rejected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={alternative.id || index}
                  >
                    <div className="optionToolbar">
                      <strong>Versione {index === 0 ? "A" : "B"}</strong>
                      <button
                        className="copy"
                        onClick={() => navigator.clipboard.writeText(alternative.text)}
                      >
                        Copia
                      </button>
                    </div>

                    <textarea
                      aria-label={"Versione " + (index === 0 ? "A" : "B") + " modificabile"}
                      value={alternative.text}
                      readOnly={fragmentBusyIndex === index || selectedIndex !== null}
                      onChange={(event) => updateAlternative(index, event.target.value)}
                      onSelect={(event) => {
                        const start = event.currentTarget.selectionStart;
                        const end = event.currentTarget.selectionEnd;
                        if (end > start) setSelectedFragment({ index, start, end });
                      }}
                    />
                    <div className="fragmentToolbar">
                      <span>Modifica il testo o seleziona un passaggio</span>
                      <button className="copy" disabled={loading || fragmentBusyIndex !== null ||
                        selectedIndex !== null || selectedFragment?.index !== index}
                        onClick={() => rewriteSelection(index)}>
                        {fragmentBusyIndex === index ? "Riscrittura..." : "Riformula selezione"}
                      </button>
                    </div>

                    {alternatives.length >= 2 && (
                      <button
                        className="choiceButton"
                        disabled={selectedIndex !== null || fragmentBusyIndex !== null}
                        onClick={() => choosePreference(index)}
                      >
                        {selected
                          ? "✓ Preferenza registrata"
                          : rejected
                            ? "Non scelta"
                            : "Preferisco questa"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
