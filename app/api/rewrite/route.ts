import { NextResponse } from "next/server";
import {
  humanizeText,
  type HumanizeOptions,
  type PreferenceExample,
} from "@/lib/humanizer";

export const runtime = "nodejs";

function cleanPreferenceExamples(value: unknown): PreferenceExample[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-5)
    .flatMap((raw) => {
      if (!raw || typeof raw !== "object") return [];
      const item = raw as Record<string, unknown>;

      const original =
        typeof item.original === "string" ? item.original.trim().slice(0, 1500) : "";
      const preferred =
        typeof item.preferred === "string" ? item.preferred.trim().slice(0, 1500) : "";
      const rejected =
        typeof item.rejected === "string" ? item.rejected.trim().slice(0, 1500) : "";

      if (!original || !preferred || !rejected) return [];
      return [{ original, preferred, rejected }];
    });
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY non configurata sul server." },
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

    const preferenceExamples = cleanPreferenceExamples(body.preferenceExamples);

    const options: HumanizeOptions = {
      mode: "social",
      tone: "diretto",
      intensity: "media",
      preset: "balanced",
      emoji: false,
      cta: false,
      question: false,
      preferenceExamples,
      returnAlternatives: true,
    };

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
