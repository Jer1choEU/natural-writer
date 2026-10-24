"use client";

import { useEffect, useState } from "react";

type Status = {
  configured: boolean;
  enabled: boolean;
  count: number;
  imports: number;
  versions: Record<string, number>;
};

const BACKUP_KEY = "natural-writer-preferences-v1";

export default function LearningPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [importText, setImportText] = useState("");
  const [mode, setMode] = useState<"social" | "natural">("social");
  const [authored, setAuthored] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);

  async function refresh() {
    try {
      const response = await fetch("/api/learning", { cache: "no-store" });
      if (!response.ok) throw new Error(await response.text());
      const result: Status = await response.json();
      setStatus(result);
      setConfigured(true);
    } catch {
      setConfigured(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Operazione non riuscita.");
      await refresh();
      return data;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore sconosciuto.");
      return null;
    } finally { setBusy(false); }
  }

  async function importSamples() {
    if (!authored) { setMessage("Conferma che i testi siano tuoi."); return; }
    const texts = importText.split(/\n\s*---\s*\n/g).map(x => x.trim()).filter(x => x.length >= 80);
    if (!texts.length) { setMessage("Inserisci almeno un testo di 80 caratteri."); return; }
    if (texts.length > 50) { setMessage("Importa al massimo 50 testi alla volta."); return; }
    const now = Date.now();
    const result = await send({
      action: "import", authored: true,
      events: texts.map((preferred, i) => ({
        kind: "import", mode, original: "", preferred, rejected: "",
        createdAt: new Date(now + i).toISOString(),
      })),
    });
    if (result) { setMessage(String(result.saved) + " esempi salvati."); setImportText(""); setAuthored(false); }
  }

  async function restore(modeToRestore: "social" | "natural") {
    if (!window.confirm("Ripristinare il profilo stilistico precedente per " + modeToRestore + "?")) return;
    const result = await send({ action: "restore", mode: modeToRestore });
    if (result) setMessage("Versione stilistica precedente ripristinata.");
  }

  async function erase() {
    if (!window.confirm("Eliminare definitivamente gli eventi e i profili cloud? Esporta prima un backup.")) return;
    if (window.prompt("Scrivi ELIMINA per confermare") !== "ELIMINA") return;
    const result = await send({ action: "clear", confirm: "ELIMINA" });
    if (result) {
      localStorage.removeItem(BACKUP_KEY);
      localStorage.removeItem("natural-writer-pending-learning-v1");
      setMessage("Memoria cloud e storico locale eliminati.");
    }
  }

  return (
    <main className="learningPage">
      <header className="learningHeader">
        <div>
          <h1>Memoria stilistica</h1>
          <p>Conserva il tuo stile e impara dalle correzioni, senza cambiare l'interfaccia di scrittura.</p>
        </div>
        <a href="/">← Torna all'editor</a>
      </header>

      {configured === false ? (
        <section className="learningCard">
          <h2>Collega il database</h2>
          <p>Il training attuale rimane salvato nel browser. Per attivare la memoria permanente collega Turso al progetto Vercel e configura <code>TURSO_DATABASE_URL</code> e <code>TURSO_AUTH_TOKEN</code>. Non cancellare i dati locali: verranno migrati automaticamente alla prima apertura.</p>
          <a href="https://vercel.com/marketplace/tursocloud/database" target="_blank" rel="noreferrer">Apri l'integrazione Turso per Vercel ↗</a>
        </section>
      ) : configured === null ? (
        <section className="learningCard">Verifica della memoria cloud…</section>
      ) : (
        <>
          <section className="learningCard">
            <div className="learningRow">
              <div>
                <h2>Auto-Learning</h2>
                <p>Quando modifichi una versione e la copi, Natural Writer può imparare automaticamente da quella correzione. Non registra ciò che scrivi durante la digitazione e non impara da generazioni non utilizzate.</p>
              </div>
              <label className="learningToggle">
                <input type="checkbox" checked={status?.enabled || false} disabled={busy}
                  onChange={(e) => { void send({ action: "settings", enabled: e.target.checked }); }} />
                <span>{status?.enabled ? "Attivo" : "Disattivato"}</span>
              </label>
            </div>
            <div className="learningStats">
              <span><strong>{status?.count ?? 0}</strong> eventi salvati</span>
              <span><strong>{status?.imports ?? 0}</strong> esempi autentici</span>
              <span><strong>{status?.versions?.social ?? 0}</strong> versioni Social</span>
              <span><strong>{status?.versions?.natural ?? 0}</strong> versioni Naturale</span>
            </div>
          </section>

          <section className="learningCard">
            <h2>Importa il tuo stile</h2>
            <p>Incolla testi scritti personalmente da te, separando più esempi con una riga contenente soltanto <code>---</code>. I campioni sono utilizzati come riferimenti di stile: non devono trasferire fatti o opinioni nelle nuove riscritture.</p>
            <label>Tipo di scrittura
              <select value={mode} onChange={e => setMode(e.target.value as typeof mode)}>
                <option value="social">Social</option><option value="natural">Naturale</option>
              </select>
            </label>
            <textarea rows={8} value={importText} onChange={e => setImportText(e.target.value)}
              placeholder="Incolla qui uno o più testi autentici…" />
            <label className="learningCheckbox">
              <input type="checkbox" checked={authored} onChange={e => setAuthored(e.target.checked)} />
              Confermo di essere l'autore dei testi e autorizzo a utilizzarli per il mio profilo stilistico.
            </label>
            <button className="primary" disabled={busy || !authored || !importText.trim()}
              onClick={() => void importSamples()}>Importa esempi</button>
          </section>

          <section className="learningCard">
            <h2>Backup e controllo</h2>
            <p>Esporta lo storico completo per una copia indipendente. Puoi tornare a una versione precedente del profilo senza cancellare gli eventi originali.</p>
            <div className="learningActions">
              <a className="learningAction" href="/api/learning/export">Scarica backup JSON</a>
              <button disabled={busy} onClick={() => void restore("social")}>Ripristina Social</button>
              <button disabled={busy} onClick={() => void restore("natural")}>Ripristina Naturale</button>
              <button disabled={busy} className="learningDelete" onClick={() => void erase()}>Elimina tutti i dati</button>
            </div>
          </section>
        </>
      )}
      {message && <p className="learningMessage" role="status">{message}</p>}
    </main>
  );
}
