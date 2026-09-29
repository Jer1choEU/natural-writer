"use client";

import { useMemo, useState } from "react";

type Mode = "natural" | "professional" | "social";
type Platform = "instagram" | "facebook" | "linkedin" | "x" | "threads";

const modeLabels: Record<Mode, string> = {
  natural: "Naturale",
  professional: "Professionale",
  social: "Social post",
};

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
  const [intensity, setIntensity] = useState("media");
  const [emoji, setEmoji] = useState(true);
  const [cta, setCta] = useState(false);
  const [question, setQuestion] = useState(false);

  const canTransform = useMemo(() => input.trim().length > 0, [input]);

  function transform() {
    if (!canTransform) return;
    setOutput(
      "Il motore di riscrittura verrà collegato qui. L'interfaccia è già pronta per inviare testo, modalità e preferenze all'API."
    );
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">NATURAL WRITER</p>
          <h1>Scrivi come una persona, non come un modello.</h1>
          <p className="subtitle">
            Trasforma testi rigidi o impersonali in contenuti più naturali,
            mantenendo intatto il significato.
          </p>
        </div>
      </header>

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
            Intensità
            <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
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
                <input type="checkbox" checked={emoji} onChange={(e) => setEmoji(e.target.checked)} />
                Emoji
              </label>
              <label className="toggle">
                <input type="checkbox" checked={cta} onChange={(e) => setCta(e.target.checked)} />
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
            Trasforma
          </button>
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
