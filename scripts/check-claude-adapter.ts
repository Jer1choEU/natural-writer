/**
 * Offline Anthropic HTTP contract regression. No paid API calls.
 */
import { callClaude, generateClaudeJson, generateClaudeText } from "../lib/claude";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function run() {
  const savedFetch = globalThis.fetch;
  const savedKey = process.env.ANTHROPIC_API_KEY;
  const savedGemini = process.env.GEMINI_API_KEY;
  const requests: Array<{ url: string; headers: Record<string,string>; body: Record<string,unknown> }> = [];
  try {
    // Deliberately supply no Google credentials: all calls must use Anthropic.
    delete process.env.GEMINI_API_KEY;
    process.env.ANTHROPIC_API_KEY = "unit-test-fake-secret";
    let payload = "Testo corretto.";
    let stopReason = "end_turn";
    globalThis.fetch = (async (url, options) => {
      const headers = (options?.headers || {}) as Record<string,string>;
      requests.push({ url: String(url), headers, body: JSON.parse(String(options?.body)) });
      return new Response(JSON.stringify({
        stop_reason: stopReason,
        content: [{ type: "text", text: payload }],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch;

    const edited = await generateClaudeText("Scrivi italiano naturale.", "Testo da correggere.", "claude-sonnet-5-5");
    assert(edited === "Testo corretto.", "Plain rewrite must parse Claude text");
    assert(requests[0].url === "https://api.anthropic.com/v1/messages", "Must never call Google endpoints");
    assert(requests[0].headers["anthropic-version"] === "2023-06-01", "Claude API version required");
    assert(requests[0].headers["x-api-key"] === "unit-test-fake-secret", "API key must stay in request headers");
    assert(!requests[0].url.includes("unit-test-fake-secret"), "Never put credentials in URL");
    assert(requests[0].body.model === "claude-sonnet-5-5", "Sonnet model not passed");
    assert(!JSON.stringify(requests[0].body).includes("unit-test-fake-secret"), "No API key in prompt body");

    payload = JSON.stringify({ confirmed: true });
    const schema = { type:"object", properties:{confirmed:{type:"boolean"}}, required:["confirmed"], additionalProperties:false };
    const obj = await generateClaudeJson<{confirmed: boolean}>(
      "claude-haiku-5-5", "Return JSON.", "Please confirm.", schema,
    );
    assert(obj.confirmed, "Structured Claude reply should be parsed");
    assert((requests[1].body as any).output_config?.format?.type === "json_schema",
      "Structured output schema should be sent to Claude");

    stopReason = "max_tokens";
    let rejectedTruncation = false;
    try { await callClaude("claude-haiku-5-5","prompt","data"); }
    catch { rejectedTruncation = true; }
    assert(rejectedTruncation, "Incomplete response must not be accepted");

    let rejectedModel = false;
    try { await callClaude("not-a-claude-model","prompt","data"); }
    catch { rejectedModel = true; }
    assert(rejectedModel, "Only validated Claude model identifiers are permitted");
    console.log("Claude adapter contract checks: OK");
  } finally {
    globalThis.fetch = savedFetch;
    if (savedKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = savedKey;
    if (savedGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = savedGemini;
  }
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
