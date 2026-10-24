import { NextResponse } from "next/server";
import { analyzeItalianText } from "@/lib/editorial-metrics";
import { requireLearningOwner } from "@/lib/learning-auth";
import { learningContext, learningDatabaseConfigured } from "@/lib/learning-store";
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

    let preferenceExamples = cleanPreferenceExamples(body.preferenceExamples);
    let savedProfile: HumanizeOptions["preferenceProfile"];
    let styleReferences: string[] = [];

    // Source of truth is the server once Turso is connected. Browser data is only
    // a fallback during setup or a temporary cloud outage.
    if (learningDatabaseConfigured()) {
      try {
        const owner = await requireLearningOwner();
        const saved = await learningContext(owner, body.mode === "natural" ? "natural" : "social");
        preferenceExamples = saved.examples;
        savedProfile = saved.profile;
        styleReferences = saved.styleReferences;
      } catch (storageError) {
        console.error("Learning context unavailable, using local fallback", storageError);
      }
    }

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
      preferenceProfile: savedProfile,
      styleReferences,
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
