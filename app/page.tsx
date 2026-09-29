"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canTransform = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  async function transform() {
    if (!canTransform) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante la trasformazione.");
      }

      setOutput(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="workspace">
        <div className="panel">
          <div className="panelHeader">
            <strong>Testo originale</strong>
            <span>{input.length} caratteri</span>
          </div>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Incolla qui il testo da riscrivere..."
          />
        </div>

        <aside className="controls">
          <button className="primary" disabled={!canTransform} onClick={transform}>
            {loading ? "Sto riscrivendo..." : "Trasforma"}
          </button>
          {error && <p className="error">{error}</p>}
        </aside>

        <div className="panel">
          <div className="panelHeader">
            <strong>Risultato</strong>
            <button
              className="copy"
              onClick={() => output && navigator.clipboard.writeText(output)}
              disabled={!output}
            >
              Copia
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Il testo trasformato apparirà qui..."
          />
        </div>
      </section>
    </main>
  );
}
