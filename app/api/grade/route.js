import { NextResponse } from "next/server";
import { chat } from "../../lib/openrouter";
import { getSession } from "../../lib/interview-sessions";
import { buildGradePrompt } from "../../lib/prompt";

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sessionId } = body;

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 }
    );
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.answers.length !== session.questions.length) {
    return NextResponse.json(
      {
        error: `All ${session.questions.length} questions must be answered before grading`,
      },
      { status: 400 }
    );
  }

  const prompt = buildGradePrompt(session);

  let raw;
  try {
    raw = await chat(
      [
        {
          role: "system",
          content: "You are an expert interviewer. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      { json: true }
    );
  } catch (error) {
    console.error("Grade chat error:", error);
    return NextResponse.json(
      { error: "The AI provider could not be reached. Try again in a moment." },
      { status: 502 }
    );
  }

  let grade;
  try {
    grade = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "AI returned unparseable feedback. Please retry." },
      { status: 500 }
    );
  }

  return NextResponse.json(grade);
}