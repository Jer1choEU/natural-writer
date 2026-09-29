import { NextResponse } from "next/server";
import { humanizeText, type HumanizeOptions } from "@/lib/humanizer";

export const runtime = "nodejs";

const allowedModes = new Set(["natural", "professional", "social"]);
const allowedIntensities = new Set(["leggera", "media", "profonda"]);
const allowedPlatforms = new Set(["instagram", "facebook", "linkedin", "x", "threads"]);
const allowedPresets = new Set(["balanced", "editorial", "social-direct", "linkedin-personal", "journalistic", "political-comment", "storytelling", "minimal", "explainer", "civic"]);

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY non configurata sul server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "Inserisci un testo da trasformare." }, { status: 400 });
    }

    if (text.length > 20000) {
      return NextResponse.json(
        { error: "Il testo supera il limite MVP di 20.000 caratteri." },
        { status: 400 }
      );
    }

    if (!allowedModes.has(body.mode)) {
      return NextResponse.json({ error: "Modalità non valida." }, { status: 400 });
    }

    const options: HumanizeOptions = {
      mode: body.mode,
      tone: typeof body.tone === "string" ? body.tone.slice(0, 50) : "diretto",
      intensity: allowedIntensities.has(body.intensity) ? body.intensity : "media",
      emoji: Boolean(body.emoji),
      cta: Boolean(body.cta),
      question: Boolean(body.question),
      preset: allowedPresets.has(body.preset) ? body.preset : "balanced",
    };

    if (body.mode === "social") {
      options.platform = allowedPlatforms.has(body.platform) ? body.platform : "instagram";
    }

    const result = await humanizeText(text, options);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Natural Writer API error", error);
    return NextResponse.json(
      { error: "Non è stato possibile completare la trasformazione." },
      { status: 500 }
    );
  }
}
