"use client";

import { useEffect, useMemo, useState } from "react";

type Alternative = {
  id: "A" | "B";
  text: string;
  similarity?: number;
  strategy?: string;
};

type PreferenceRecord = {
  original: string;
  preferred: string;
  rejected: string;
  createdAt: string;
};

const STORAGE_KEY = "natural-writer-preferences-v1";
const MAX_STORED_PREFERENCES = 50;
const MAX_USED_PREFERENCES = 5;

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
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [preferenceCount, setPreferenceCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreferenceCount(readPreferences().length);
  }, []);

  const canTransform = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  async function transform() {
    if (!canTransform) return;

    setLoading(true);
    setError("");
    setAlternatives([]);
    setSelectedIndex(null);

    try {
      const storedPreferences = readPreferences();
      const preferenceExamples = storedPreferences.slice(-MAX_USED_PREFERENCES);

      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          preferenceExamples,
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
      } else if (typeof data.text === "string") {
        setAlternatives([{ id: "A", text: data.text }]);
      } else {
        throw new Error("Il motore non ha restituito una riscrittura valida.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto.");
    } finally {
      setLoading(false);
    }
  }

  function choosePreference(index: number) {
    if (selectedIndex !== null || alternatives.length < 2) return;

    const preferred = alternatives[index];
    const rejected = alternatives[index === 0 ? 1 : 0];
    if (!preferred || !rejected) return;

    const current = readPreferences();
    const next: PreferenceRecord[] = [
      ...current,
      {
        original: input.trim(),
        preferred: preferred.text,
        rejected: rejected.text,
        createdAt: new Date().toISOString(),
      },
    ].slice(-MAX_STORED_PREFERENCES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setPreferenceCount(next.length);
    setSelectedIndex(index);
  }

  function resetTraining() {
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
            <> · il motore usa le ultime {Math.min(preferenceCount, MAX_USED_PREFERENCES)}</>
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
            onChange={(event) => setInput(event.target.value)}
            placeholder="Incolla qui il testo da riscrivere..."
          />
        </div>

        <aside className="controls">
          <button className="primary" disabled={!canTransform} onClick={transform}>
            {loading ? "Sto creando A/B..." : "Trasforma"}
          </button>
          <p className="hint">Genera due versioni. Scegli quella che preferisci per allenare le riscritture successive.</p>
          {error && <p className="error">{error}</p>}
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

                    <textarea value={alternative.text} readOnly />

                    {alternatives.length >= 2 && (
                      <button
                        className="choiceButton"
                        disabled={selectedIndex !== null}
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
