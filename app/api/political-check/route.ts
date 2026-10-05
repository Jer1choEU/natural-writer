import { NextResponse } from "next/server";
import { checkM5SPoliticalCoherence } from "@/lib/m5s-coherence";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "Inserisci un testo da analizzare." },
        { status: 400 }
      );
    }

    if (text.length > 20000) {
      return NextResponse.json(
        { error: "Il testo supera il limite di 20.000 caratteri." },
        { status: 400 }
      );
    }

    const result = await checkM5SPoliticalCoherence(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("M5S political coherence API error", error);
    return NextResponse.json(
      { error: "Non è stato possibile completare il controllo politico." },
      { status: 500 }
    );
  }
}
