import { NextResponse } from "next/server";
import { humanizeText, type HumanizeOptions } from "@/lib/humanizer";

export const runtime = "nodejs";

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

    const options: HumanizeOptions = {
      mode: "social",
      tone: "diretto",
      intensity: "media",
      preset: "balanced",
      emoji: false,
      cta: false,
      question: false,
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
