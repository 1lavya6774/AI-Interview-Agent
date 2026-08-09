import { NextResponse } from "next/server";
import { chat } from "../../lib/openrouter";
import { createSession } from "../../lib/interview-sessions";
import {
  buildInterviewPrompt,
  INTERVIEW_TYPES,
  DIFFICULTIES,
  normalizeChoice,
} from "../../lib/prompt";

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { resumeText, role } = body;
  const interviewType = normalizeChoice(
    body.interviewType,
    INTERVIEW_TYPES,
    INTERVIEW_TYPES[2] // Mixed
  );
  const difficulty = normalizeChoice(
    body.difficulty,
    DIFFICULTIES,
    DIFFICULTIES[1] // Mid
  );

  if (!resumeText || !role) {
    return NextResponse.json(
      { error: "resumeText and role are required" },
      { status: 400 }
    );
  }

  const questionCount = Math.max(
    5,
    Math.min(15, Number(body.questionCount) || 10)
  );

  const prompt = buildInterviewPrompt({
    resumeText,
    role,
    questionCount,
    interviewType,
    difficulty,
  });

  const systemMessage = {
    role: "system",
    content: "You are an expert interviewer. Always respond with valid JSON only.",
  };
  const userMessage = { role: "user", content: prompt };

  let raw;
  try {
    raw = await chat([systemMessage, userMessage], { json: true });
  } catch (error) {
    console.error("Start chat error:", error);
    const msg = error?.message || "Unknown error";
    if (msg.includes("Missing credentials") || msg.includes("401") || msg.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not set. Add it to your environment variables.", debug: msg },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "The AI provider could not be reached. Try again in a moment.", debug: msg },
      { status: 502 }
    );
  }

  let questions;
  try {
    const parsed = JSON.parse(raw);
    questions = parsed.questions;
  } catch {
    return NextResponse.json(
      { error: "AI returned unparseable questions. Please retry." },
      { status: 500 }
    );
  }

  if (!Array.isArray(questions) || questions.length !== questionCount) {
    return NextResponse.json(
      { error: `AI returned ${questions?.length ?? 0} questions instead of ${questionCount}. Please retry.` },
      { status: 500 }
    );
  }

  const sessionId = createSession({
    resumeText,
    role,
    questions,
    interviewType,
    difficulty,
  });
  return NextResponse.json({ sessionId, questions, currentQuestion: questions[0] });
}