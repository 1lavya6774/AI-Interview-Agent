import OpenAI from "openai";

let _openai;

function getClient() {
  if (!_openai) {
    _openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
  return _openai;
}

export async function chat(
  messages,
  { model = "meta-llama/llama-3.1-8b-it:free", json = false } = {}
) {
  const response = await getClient().chat.completions.create({
    model,
    messages,
    max_tokens: 2000,
    response_format: json ? { type: "json_object" } : undefined,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from model");
  }
  return content;
}