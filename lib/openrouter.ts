import OpenAI from "openai";
import type { ChatMessage } from "./sessions";

// Primary OpenRouter client
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Fallback client (e.g., a direct OpenAI-compatible endpoint or a different key)
const fallbackClient = new OpenAI({
  baseURL: process.env.FALLBACK_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.FALLBACK_API_KEY || process.env.OPENROUTER_API_KEY,
});

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openrouter/auto";
const FALLBACK_MODEL = process.env.FALLBACK_MODEL || "openrouter/free";

/**
 * Calls OpenRouter with the given messages. If the primary call fails with a
 * 404 (model unavailable), retries with the fallback model (defaults to
 * openrouter/free). If the primary fails for any other reason, also retries
 * once with the fallback client/model.
 */
export async function chatWithFallback(
  messages: ChatMessage[],
  { model = DEFAULT_MODEL, maxTokens = 2000, temperature = 0.7 } = {}
): Promise<string> {
  try {
    return await callClient(openrouter, messages, model, maxTokens, temperature);
  } catch (primaryError) {
    console.error("[openrouter] Primary call failed, trying fallback:", primaryError);

    const err = primaryError as { status?: number; message?: string };

    // If the primary model 404'd (unavailable), fall back to openrouter/free
    const isModelUnavailable =
      err?.status === 404 ||
      (err?.message &&
        /model.*(not found|unavailable|does not exist)/i.test(err.message));

    const fallbackModel = isModelUnavailable
      ? "openrouter/free"
      : FALLBACK_MODEL;

    try {
      return await callClient(
        fallbackClient,
        messages,
        fallbackModel,
        maxTokens,
        temperature
      );
    } catch (fallbackError) {
      console.error("[openrouter] Fallback call also failed:", fallbackError);
      throw new Error("OpenRouter call failed on both primary and fallback");
    }
  }
}

async function callClient(
  client: OpenAI,
  messages: ChatMessage[],
  model: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from model");
  }
  return content;
}