import { NextResponse } from "next/server";
import { STYLE_PRESETS, type StylePreset } from "@/lib/style-presets";
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

    const allowedModes = ["natural", "professional", "social"] as const;
    const allowedIntensities = ["leggera", "media", "profonda"] as const;
    const allowedPlatforms = ["instagram", "facebook", "linkedin", "x", "threads"] as const;

    const mode = allowedModes.find((value) => value === body.mode) || "social";
    const intensity = allowedIntensities.find((value) => value === body.intensity) || "media";
    const preset = Object.prototype.hasOwnProperty.call(STYLE_PRESETS, body.preset)
      ? body.preset as StylePreset
      : "balanced";
    const platform = allowedPlatforms.find((value) => value === body.platform) || "facebook";
    const lockedTerms = Array.isArray(body.lockedTerms)
      ? body.lockedTerms.filter((term: unknown): term is string =>
          typeof term === "string" && term.trim().length > 0
        ).slice(0, 20).map((term: string) => term.trim().slice(0, 80))
      : [];

    const options: HumanizeOptions = {
      mode,
      platform,
      tone: typeof body.tone === "string" ? body.tone.slice(0, 60) : "diretto",
      intensity,
      preset,
      emoji: body.emoji === true,
      cta: body.cta === true,
      question: body.question === true,
      politicalStyle: body.politicalStyle === true,
      lockedTerms,
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
