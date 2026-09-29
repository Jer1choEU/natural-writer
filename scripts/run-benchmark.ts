import fs from "node:fs/promises";
import path from "node:path";
import { humanizeText, type HumanizeOptions } from "../lib/humanizer";
import { BENCHMARK_SAMPLES } from "../benchmarks/samples";
import { analyzeText, heuristicScore, rewriteSimilarity } from "../benchmarks/scoring";
import { judgeRewrite } from "../benchmarks/quality-judge";

const allPresets = [
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

const allIntensities = ["leggera", "media", "profonda"] as const;

const presets = (process.env.BENCHMARK_PRESETS || "balanced,social-direct,journalistic")
  .split(",")
  .map((value) => value.trim())
  .filter((value): value is (typeof allPresets)[number] =>
    allPresets.includes(value as (typeof allPresets)[number])
  );

const intensities = (process.env.BENCHMARK_INTENSITIES || "media")
  .split(",")
  .map((value) => value.trim())
  .filter((value): value is (typeof allIntensities)[number] =>
    allIntensities.includes(value as (typeof allIntensities)[number])
  );

const models = (process.env.BENCHMARK_MODELS || "gemini-3.5-flash-lite,gemini-3.5-flash,gemini-3.8-flash")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY non configurata");
  }

  const limit = Number(process.env.BENCHMARK_LIMIT || "1");
  const selectedSamples = BENCHMARK_SAMPLES.slice(0, limit);
  const results = [];

  for (const sample of selectedSamples) {
    for (const preset of presets) {
      for (const intensity of intensities) {
        for (const model of models) {
        const options: HumanizeOptions = {
          mode: sample.category === "social" || sample.category === "civic" ? "social" : "natural",
          platform: sample.category === "social" || sample.category === "civic" ? "facebook" : undefined,
          tone: "diretto",
          intensity,
          preset,
          emoji: false,
          cta: false,
          question: false,
          model,
        };

        try {
          const rewritten = await humanizeText(sample.text, options);
          const originalMetrics = analyzeText(sample.text);
          const rewrittenMetrics = analyzeText(rewritten.text);

          let qualityJudge = null;
          try {
            qualityJudge = await judgeRewrite(sample.text, rewritten.text);
          } catch (judgeError) {
            console.error(`${sample.id} | ${preset} | ${intensity} | ${model} | JUDGE FAILED`);
            console.error(judgeError);
          }

          results.push({
            sampleId: sample.id,
            category: sample.category,
            preset,
            intensity,
            model,
            original: sample.text,
            rewritten: rewritten.text,
            originalMetrics,
            rewrittenMetrics,
            heuristicScore: heuristicScore(originalMetrics, rewrittenMetrics),
            rewriteSimilarity: rewriteSimilarity(sample.text, rewritten.text),
            qualityJudge,
            status: "ok",
          });

          console.log(
            `${sample.id} | ${preset} | ${intensity} | ${model} | heuristic ${results.at(-1)?.heuristicScore} | similarity ${results.at(-1)?.rewriteSimilarity} | quality ${qualityJudge?.overall ?? "n/a"}`
          );
        } catch (error) {
          console.error(`${sample.id} | ${preset} | ${intensity} | ${model} | FAILED`);
          console.error(error);
          results.push({
            sampleId: sample.id,
            category: sample.category,
            preset,
            intensity,
            model,
            original: sample.text,
            rewritten: null,
            originalMetrics: analyzeText(sample.text),
            rewrittenMetrics: null,
            heuristicScore: null,
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
          });
        }
        }
      }
    }
  }

  const outDir = path.join(process.cwd(), "benchmark-results");
  await fs.mkdir(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "latest.json");
  await fs.writeFile(jsonPath, JSON.stringify(results, null, 2));

  const grouped = new Map<string, { total: number; count: number; qualityTotal: number; qualityCount: number; similarityTotal: number; similarityCount: number }>();
  for (const row of results) {
    if (row.status !== "ok" || row.heuristicScore == null) continue;
    const key = `${row.model}::${row.preset}::${row.intensity}`;
    const current = grouped.get(key) || { total: 0, count: 0, qualityTotal: 0, qualityCount: 0, similarityTotal: 0, similarityCount: 0 };
    current.total += row.heuristicScore;
    current.count += 1;
    if (row.rewriteSimilarity != null) {
      current.similarityTotal += row.rewriteSimilarity;
      current.similarityCount += 1;
    }
    if (row.qualityJudge?.overall != null) {
      current.qualityTotal += row.qualityJudge.overall;
      current.qualityCount += 1;
    }
    grouped.set(key, current);
  }

  const summary = [...grouped.entries()]
    .map(([key, value]) => {
      const [model, preset, intensity] = key.split("::");
      return {
        model,
        preset,
        intensity,
        avgHeuristicScore: Number((value.total / value.count).toFixed(2)),
        avgQualityScore:
          value.qualityCount > 0
            ? Number((value.qualityTotal / value.qualityCount).toFixed(2))
            : null,
        avgRewriteSimilarity:
          value.similarityCount > 0
            ? Number((value.similarityTotal / value.similarityCount).toFixed(3))
            : null,
        samples: value.count,
      };
    })
    .sort((a, b) => (b.avgQualityScore ?? -1) - (a.avgQualityScore ?? -1));

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
