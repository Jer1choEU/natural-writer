"use client";

import { useMemo, useState } from "react";

type Mode = "natural" | "professional" | "social";
type Platform = "instagram" | "facebook" | "linkedin" | "x" | "threads";

const modeLabels: Record<Mode, string> = {
  natural: "Naturale",
  professional: "Professionale",
  social: "Social post",
};

const stylePresets = [
  ["balanced", "Naturale equilibrato"],
  ["editorial", "Editoriale autorevole"],
  ["social-direct", "Social diretto"],
  ["linkedin-personal", "LinkedIn personale"],
  ["journalistic", "Giornalistico asciutto"],
  ["political-comment", "Commento politico incisivo"],
  ["storytelling", "Storytelling personale"],
  ["minimal", "Minimalista"],
  ["explainer", "Divulgazione chiara"],
  ["civic", "Post civico / attivismo"],
] as const;

const platforms: { value: Platform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "threads", label: "Threads" },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("natural");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [tone, setTone] = useState("diretto");
  const [preset, setPreset] = useState("balanced");
  const [intensity, setIntensity] = useState<"leggera" | "media" | "profonda">("media");
  const [emoji, setEmoji] = useState(true);
  const [cta, setCta] = useState(false);
  const [question, setQuestion] = useState(false);
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
        body: JSON.stringify({
          text: input,
          mode,
          platform,
          tone,
          preset,
          intensity,
          emoji,
          cta,
          question,
        }),
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
      <section className="modeBar">
        {(Object.keys(modeLabels) as Mode[]).map((item) => (
          <button
            className={mode === item ? "mode active" : "mode"}
            key={item}
            onClick={() => setMode(item)}
          >
            {modeLabels[item]}
          </button>
        ))}
      </section>

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
          <label>
            Stile
            <select value={preset} onChange={(e) => setPreset(e.target.value)}>
              {stylePresets.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            Intensità
            <select
              value={intensity}
              onChange={(e) =>
                setIntensity(e.target.value as "leggera" | "media" | "profonda")
              }
            >
              <option value="leggera">Leggera</option>
              <option value="media">Media</option>
              <option value="profonda">Profonda</option>
            </select>
          </label>

          <label>
            Tono
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="diretto">Diretto</option>
              <option value="colloquiale">Colloquiale</option>
              <option value="caldo">Caldo</option>
              <option value="sobrio">Sobrio</option>
              <option value="energico">Energico</option>
            </select>
          </label>

          {mode === "social" && (
            <>
              <label>
                Piattaforma
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                >
                  {platforms.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="toggle">
                <input
                  type="checkbox"
                  checked={emoji}
                  onChange={(e) => setEmoji(e.target.checked)}
                />
                Emoji
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={cta}
                  onChange={(e) => setCta(e.target.checked)}
                />
                Call to action
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={question}
                  onChange={(e) => setQuestion(e.target.checked)}
                />
                Domanda finale
              </label>
            </>
          )}

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

      <footer>
        MVP • {modeLabels[mode]}
        {mode === "social" ? ` • ${platform}` : ""}
      </footer>
    </main>
  );
}
