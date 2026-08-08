import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function chat(messages, { model = "openrouter/auto", json = false } = {}) {
  const response = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: 2000,
    response_format: json ? { type: "json_object" } : undefined,
  });

  return response.choices[0].message.content;
}
