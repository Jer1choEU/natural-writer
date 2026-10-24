import { requireLearningOwner } from "@/lib/learning-auth";
import { exportLearning, learningDatabaseConfigured } from "@/lib/learning-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await requireLearningOwner();
    if (!learningDatabaseConfigured()) {
      return Response.json({ error: "Database non ancora collegato." }, { status: 503 });
    }
    const data = await exportLearning(owner);
    return new Response(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"natural-writer-learning-backup.json\"",
        "Cache-Control": "no-store, private",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 503;
    if (status === 503) console.error("Export learning failed", error);
    return Response.json({ error: status === 401 ? "Non autorizzato." : "Esportazione non disponibile." }, { status });
  }
}
