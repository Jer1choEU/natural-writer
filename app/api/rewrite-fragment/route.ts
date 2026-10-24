import { NextResponse } from "next/server";
import { rewriteFragment, type HumanizeOptions } from "@/lib/humanizer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY non configurata." }, { status: 500 });
    }
    const body = await request.json();
    const fragment = typeof body.fragment === "string" ? body.fragment.trim() : "";
    const context = typeof body.context === "string" ? body.context.slice(0, 12000) : "";
    if (!fragment || fragment.length > 3000) {
      return NextResponse.json({ error: "Seleziona un passaggio di massimo 3000 caratteri." }, { status: 400 });
    }
    const options: HumanizeOptions = {
      mode: body.mode === "natural" ? "natural" : "social",
      intensity: "media",
      politicalStyle: true,
    };
    const text = await rewriteFragment(fragment, context, options);
    return NextResponse.json({ text, unchanged: text === fragment });
  } catch (error) {
    console.error("Fragment rewrite error", error);
    return NextResponse.json({ error: "Impossibile riscrivere il passaggio." }, { status: 500 });
  }
}
