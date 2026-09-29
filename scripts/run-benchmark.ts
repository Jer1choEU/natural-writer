import fs from "node:fs/promises";
import path from "node:path";
import { humanizeText, type HumanizeOptions } from "../lib/humanizer";
import { BENCHMARK_SAMPLES } from "../benchmarks/samples";
import { analyzeText, heuristicScore } from "../benchmarks/scoring";

const presets = [
  "balanced",
  "editorial",
  "social-direct",
  "linkedin-personal",
  "journalistic",
  "political-comment",
  "storytelling",
  "minimal",
  "explainer",
  "civic",
] as const;

const intensities = ["leggera", "media", "profonda"] as const;

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY non configurata");
  }

  const limit = Number(process.env.BENCHMARK_LIMIT || "10");
  const selectedSamples = BENCHMARK_SAMPLES.slice(0, limit);
  const results = [];

  for (const sample of selectedSamples) {
    for (const preset of presets) {
      for (const intensity of intensities) {
        const options: HumanizeOptions = {
          mode: sample.category === "social" || sample.category === "civic" ? "social" : "natural",
          platform: sample.category === "social" || sample.category === "civic" ? "facebook" : undefined,
          tone: "diretto",
          intensity,
          preset,
          emoji: false,
          cta: false,
          question: false,
        };

        const rewritten = await humanizeText(sample.text, options);
        const originalMetrics = analyzeText(sample.text);
        const rewrittenMetrics = analyzeText(rewritten.text);

        results.push({
          sampleId: sample.id,
          category: sample.category,
          preset,
          intensity,
          original: sample.text,
          rewritten: rewritten.text,
          originalMetrics,
          rewrittenMetrics,
          heuristicScore: heuristicScore(originalMetrics, rewrittenMetrics),
        });

        console.log(
          `${sample.id} | ${preset} | ${intensity} | score ${results.at(-1)?.heuristicScore}`
        );
      }
    }
  }

  const outDir = path.join(process.cwd(), "benchmark-results");
  await fs.mkdir(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "latest.json");
  await fs.writeFile(jsonPath, JSON.stringify(results, null, 2));

  const grouped = new Map<string, { total: number; count: number }>();
  for (const row of results) {
    const key = `${row.preset}::${row.intensity}`;
    const current = grouped.get(key) || { total: 0, count: 0 };
    current.total += row.heuristicScore;
    current.count += 1;
    grouped.set(key, current);
  }

  const summary = [...grouped.entries()]
    .map(([key, value]) => {
      const [preset, intensity] = key.split("::");
      return {
        preset,
        intensity,
        avgScore: Number((value.total / value.count).toFixed(2)),
        samples: value.count,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  await fs.writeFile(
    path.join(outDir, "summary.json"),
    JSON.stringify(summary, null, 2)
  );

  console.table(summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
