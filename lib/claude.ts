/**
 * Single Anthropic Messages API integration for Natural Writer.
 * Texts and API keys never enter query strings or application logs.
 * Credentials are server-only and are intentionally NOT shared with production
 * unless the owner explicitly configures them for that environment.
 */
export const defaultClaudeModel = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
export const defaultClaudeSemanticModel = process.env.CLAUDE_SEMANTIC_MODEL || "claude-haiku-5-5";
export const defaultClaudeJudgeModel = process.env.CLAUDE_JUDGE_MODEL || "claude-haiku-5-5";

type JsonSchema = Record<string, unknown>;
export type ClaudeCallOptions = {
  maxTokens?: number;
  temperature?: number;
  jsonSchema?: JsonSchema;
};

function validModel(model: string) {
  if (!/^claude-[a-z0-9-]+$/i.test(model)) throw new Error("Invalid Claude model identifier");
}

function retryable(status: number) {
  return status === 429 || status === 408 || status === 409 || status >= 500;
}

/** The model is never allowed to silently return truncated text or JSON. */
export async function callClaude(
  model: string,
  instructions: string,
  input: string,
  options: ClaudeCallOptions = {},
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY non configurata sul server.");
  validModel(model);

  const maxTokens = options.maxTokens ?? 8192;
  if (!Number.isInteger(maxTokens) || maxTokens < 128 || maxTokens > 32768) {
    throw new Error("Invalid maxTokens for Claude request");
  }
  const body = {
    model,
    max_tokens: maxTokens,
    system: instructions,
    messages: [{ role: "user", content: input }],
    ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
    ...(options.jsonSchema
      ? { output_config: { format: { type: "json_schema", schema: options.jsonSchema } } }
      : {}),
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(90000),
      });
    } catch (error) {
      if (attempt === 0) continue;
      throw new Error(error instanceof Error ? "Claude connection failed: " + error.name : "Claude connection failed");
    }
    if (!response.ok) {
      // Never include the response body: it could expose user-supplied text.
      if (retryable(response.status) && attempt === 0) continue;
      throw new Error("Claude API HTTP " + response.status);
    }
    const data = await response.json() as {
      content?: Array<{ type?: string; text?: string }>;
      stop_reason?: string;
    };
    if (data.stop_reason !== "end_turn") {
      throw new Error("Claude returned incomplete generation: " + (data.stop_reason || "unknown"));
    }
    const output = (data.content || [])
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text!).join("").trim();
    if (!output) throw new Error("Claude returned empty text");
    return output;
  }
  throw new Error("Claude request failed");
}

export async function generateClaudeText(
  instructions: string,
  input: string,
  model: string,
): Promise<string> {
  return callClaude(model, instructions, input, { maxTokens: 8192 });
}

export async function generateClaudeJson<T>(
  model: string,
  instructions: string,
  input: string,
  schema?: JsonSchema,
): Promise<T> {
  const json = await callClaude(model, instructions + "\nRispondi soltanto con JSON valido.", input, {
    maxTokens: 8192, temperature: 0, jsonSchema: schema,
  });
  // A structured output is still validated by domain-specific parsers.
  return JSON.parse(json) as T;
}
