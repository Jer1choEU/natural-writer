import { NextResponse } from "next/server";
import { rewriteFragment, type HumanizeOptions } from "@/lib/humanizer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY non configurata." }, { status: 500 });
    }
    const body = await request.json();
    const fragment = typeof body.fragment === "string" ? body.fragment.trim() : "";
    const context = typeof body.context === "string" ? body.context.slice(0, 12000) : "";
    if (!fragment || fragment.length > 3000) {
      return NextResponse.json({ error: "Seleziona un passaggio di massimo 3000 caratteri." }, { status: 400 });
    }
    const intensity = body.intensity === "leggera" || body.intensity === "profonda"
      ? body.intensity : "media";
    const lockedTerms = Array.isArray(body.lockedTerms)
      ? body.lockedTerms.filter((term: unknown): term is string => typeof term === "string")
          .slice(0, 20).map((term: string) => term.trim().slice(0, 80))
      : [];
    const options: HumanizeOptions = {
      mode: body.mode === "professional" || body.mode === "natural" ? body.mode : "social",
      intensity,
      lockedTerms,
      politicalStyle: body.politicalStyle === true,
    };
    const text = await rewriteFragment(fragment, context, options);
    return NextResponse.json({ text, unchanged: text === fragment });
  } catch (error) {
    console.error("Fragment rewrite error", error);
    return NextResponse.json({ error: "Impossibile riscrivere il passaggio." }, { status: 500 });
  }
}
