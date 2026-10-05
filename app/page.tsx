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

type PoliticalClassification =
  | "carta-coerente"
  | "nova-coerente"
  | "in-tensione"
  | "non-determinabile";

type PoliticalCheckResult = {
  overall: "coerente" | "misto" | "in-tensione" | "non-determinabile";
  summary: string;
  findings: Array<{
    claim: string;
    classification: PoliticalClassification;
    explanation: string;
    entryId: string | null;
    entryTitle: string | null;
    sourceIds: string[];
  }>;
  sources: Array<{
    id: string;
    title: string;
    authority: string;
    effectiveDate?: string;
    url: string;
  }>;
  modelUsed: boolean;
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
  const [politicalLoading, setPoliticalLoading] = useState(false);
  const [politicalResult, setPoliticalResult] = useState<PoliticalCheckResult | null>(null);
  const [politicalError, setPoliticalError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPreferenceCount(readPreferences().length);
  }, []);

  const canTransform = useMemo(
    () => input.trim().length > 0 && !loading && !politicalLoading,
    [input, loading, politicalLoading]
  );

  const canCheckPolitics = useMemo(
    () => input.trim().length > 0 && !loading && !politicalLoading,
    [input, loading, politicalLoading]
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

  async function checkPolitics() {
    if (!canCheckPolitics) return;

    setPoliticalLoading(true);
    setPoliticalError("");
    setPoliticalResult(null);

    try {
      const response = await fetch("/api/political-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante il controllo politico.");
      }

      setPoliticalResult(data as PoliticalCheckResult);
    } catch (err) {
      setPoliticalError(
        err instanceof Error ? err.message : "Errore imprevisto."
      );
    } finally {
      setPoliticalLoading(false);
    }
  }

  function politicalLabel(classification: PoliticalClassification) {
    switch (classification) {
      case "carta-coerente":
        return "Coerente con la Carta";
      case "nova-coerente":
        return "Coerente con NOVA";
      case "in-tensione":
        return "In tensione";
      default:
        return "Non determinabile";
    }
  }

  function overallLabel(overall: PoliticalCheckResult["overall"]) {
    switch (overall) {
      case "coerente":
        return "Coerente";
      case "misto":
        return "Misto";
      case "in-tensione":
        return "In tensione";
      default:
        return "Non determinabile";
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
            onChange={(event) => {
              setInput(event.target.value);
              setPoliticalResult(null);
              setPoliticalError("");
            }}
            placeholder="Incolla qui il testo da riscrivere..."
          />
        </div>

        <aside className="controls">
          <button className="primary" disabled={!canTransform} onClick={transform}>
            {loading ? "Sto creando A/B..." : "Trasforma"}
          </button>
          <button
            className="secondary"
            disabled={!canCheckPolitics}
            onClick={checkPolitics}
          >
            {politicalLoading ? "Sto controllando..." : "Controlla coerenza M5S"}
          </button>
          <p className="hint">La riscrittura genera due versioni. Il controllo politico è separato e non modifica il testo.</p>
          {error && <p className="error">{error}</p>}
          {politicalError && <p className="error">{politicalError}</p>}
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

      {(politicalLoading || politicalResult) && (
        <section className="coherencePanel">
          <div className="coherenceHeader">
            <div>
              <strong>Coerenza politica M5S</strong>
              <p>Confronto documentale separato dalla riscrittura.</p>
            </div>
            {politicalResult && (
              <span className={`overallBadge overall-${politicalResult.overall}`}>
                {overallLabel(politicalResult.overall)}
              </span>
            )}
          </div>

          {politicalLoading ? (
            <div className="coherenceLoading">
              Analizzo solo le fonti ufficiali pertinenti...
            </div>
          ) : politicalResult ? (
            <>
              <p className="coherenceSummary">{politicalResult.summary}</p>

              {politicalResult.findings.length === 0 ? (
                <div className="noFindings">
                  Nessuna posizione esplicita classificabile con sufficiente sicurezza.
                </div>
              ) : (
                <div className="findingsList">
                  {politicalResult.findings.map((finding, index) => (
                    <article className="findingCard" key={`${finding.entryId || "none"}-${index}`}>
                      <div className="findingTopline">
                        <span className={`findingBadge finding-${finding.classification}`}>
                          {politicalLabel(finding.classification)}
                        </span>
                        {finding.entryTitle && (
                          <span className="findingReference">{finding.entryTitle}</span>
                        )}
                      </div>
                      <strong className="findingClaim">{finding.claim}</strong>
                      <p>{finding.explanation}</p>
                    </article>
                  ))}
                </div>
              )}

              {politicalResult.sources.length > 0 && (
                <div className="coherenceSources">
                  <strong>Fonti ufficiali usate</strong>
                  <div className="sourceLinks">
                    {politicalResult.sources.map((source) => (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        key={source.id}
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!politicalResult.modelUsed && (
                <p className="modelNote">
                  Nessuna chiamata al modello: il retrieval non ha trovato una base ufficiale abbastanza pertinente.
                </p>
              )}
            </>
          ) : null}
        </section>
      )}
    </main>
  );
}
