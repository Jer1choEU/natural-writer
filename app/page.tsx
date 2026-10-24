"use client";

import { useEffect, useMemo, useState } from "react";
import { STYLE_PRESETS, type StylePreset } from "@/lib/style-presets";

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
const MAX_RECENT_EXAMPLES = 3;

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
  const [mode, setMode] = useState<"natural" | "professional" | "social">("social");
  const [intensity, setIntensity] = useState<"leggera" | "media" | "profonda">("media");
  const [preset, setPreset] = useState<StylePreset>("balanced");
  const [platform, setPlatform] = useState<"instagram" | "facebook" | "linkedin" | "x" | "threads">("facebook");
  const [tone, setTone] = useState("diretto");
  const [politicalStyle, setPoliticalStyle] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const [cta, setCta] = useState(false);
  const [question, setQuestion] = useState(false);
  const [lockedTermsInput, setLockedTermsInput] = useState("");
  const [selectedFragment, setSelectedFragment] = useState<{ index: number; start: number; end: number } | null>(null);
  const [fragmentBusyIndex, setFragmentBusyIndex] = useState<number | null>(null);
  const [fragmentError, setFragmentError] = useState("");
  const lockedTerms = useMemo(() =>
    lockedTermsInput.split(/\n/).map((term) => term.trim()).filter(Boolean).slice(0, 20),
    [lockedTermsInput]
  );

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
          intensity,
          preset,
          platform,
          tone,
          politicalStyle,
          lockedTerms,
          emoji,
          cta,
          question,
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
          intensity,
          lockedTerms,
          politicalStyle,
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
              setPoliticalResult(null);
              setPoliticalError("");
            }}
            placeholder="Incolla qui il testo da riscrivere..."
          />
        </div>

        <aside className="controls">
          <div className="quickOptions">
            <label className="settingField">Modalità
              <select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
                <option value="social">Social</option>
                <option value="natural">Naturale</option>
                <option value="professional">Professionale</option>
              </select>
            </label>
            <label className="settingField">Intensità
              <select value={intensity} onChange={(event) => setIntensity(event.target.value as typeof intensity)}>
                <option value="leggera">Leggera</option>
                <option value="media">Media</option>
                <option value="profonda">Profonda</option>
              </select>
            </label>
          </div>
          <details className="editorSettings">
            <summary>Impostazioni avanzate</summary>
            <label className="settingField">Preset
              <select value={preset} onChange={(event) => setPreset(event.target.value as StylePreset)}>
                {Object.entries(STYLE_PRESETS).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </label>
            <label className="settingField">Tono
              <select value={tone} onChange={(event) => setTone(event.target.value)}>
                <option value="diretto">Diretto</option>
                <option value="conversazionale">Conversazionale</option>
                <option value="misurato">Misurato</option>
                <option value="formale">Formale</option>
                <option value="coinvolgente">Coinvolgente</option>
              </select>
            </label>
            {mode === "social" && (
              <label className="settingField">Piattaforma
                <select value={platform} onChange={(event) => setPlatform(event.target.value as typeof platform)}>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="x">X</option>
                  <option value="threads">Threads</option>
                </select>
              </label>
            )}
            <label className="settingField">Termini da proteggere
              <textarea className="protectedTerms" value={lockedTermsInput}
                onChange={(event) => setLockedTermsInput(event.target.value)}
                placeholder="Uno per riga (max 20)" />
            </label>
            <label className="settingCheck"><input type="checkbox" checked={politicalStyle}
              onChange={(event) => setPoliticalStyle(event.target.checked)} /> Stile M5S</label>
            {mode === "social" && (
              <>
                <label className="settingCheck"><input type="checkbox" checked={emoji}
                  onChange={(event) => setEmoji(event.target.checked)} /> Aggiungi emoji se utili</label>
                <label className="settingCheck"><input type="checkbox" checked={cta}
                  onChange={(event) => setCta(event.target.checked)} /> Call to action</label>
                <label className="settingCheck"><input type="checkbox" checked={question}
                  onChange={(event) => setQuestion(event.target.checked)} /> Domanda finale</label>
              </>
            )}
          </details>
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
