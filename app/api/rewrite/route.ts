import { NextResponse } from "next/server";
import { analyzeItalianText } from "@/lib/editorial-metrics";
import {
  humanizeText,
  type HumanizeOptions,
  type PreferenceExample,
} from "@/lib/humanizer";

export const runtime = "nodejs";

function cleanPreferenceExamples(value: unknown): PreferenceExample[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-50)
    .flatMap((raw) => {
      if (!raw || typeof raw !== "object") return [];
      const item = raw as Record<string, unknown>;

      const original =
        typeof item.original === "string" ? item.original.trim().slice(0, 1200) : "";
      const preferred =
        typeof item.preferred === "string" ? item.preferred.trim().slice(0, 1200) : "";
      const rejected =
        typeof item.rejected === "string" ? item.rejected.trim().slice(0, 1200) : "";

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

    // Keep the public interface intentionally simple. M5S style is always enabled.
    const mode: HumanizeOptions["mode"] = body.mode === "natural" ? "natural" : "social";
    const options: HumanizeOptions = {
      mode,
      tone: "diretto",
      intensity: "media",
      preset: mode === "social" ? "social-direct" : "balanced",
      politicalStyle: true,
      emoji: false,
      cta: false,
      question: false,
      preferenceExamples,
      returnAlternatives: true,
    };

    const result = await humanizeText(text, options);
    return NextResponse.json({
      ...result,
      diagnostics: {
        original: analyzeItalianText(text),
        rewritten: analyzeItalianText(result.text),
      },
    });
  } catch (error) {
    console.error("Natural Writer API error", error);
    return NextResponse.json(
      { error: "Non è stato possibile completare la trasformazione." },
      { status: 500 }
    );
  }
}
