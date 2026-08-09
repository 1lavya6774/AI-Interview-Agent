import { NextResponse } from "next/server";
import {
  getSession,
  getCurrentQuestion,
  recordAnswer,
} from "../../lib/interview-sessions";

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sessionId, answer } = body;

  if (!sessionId || !answer) {
    return NextResponse.json(
      { error: "sessionId and answer are required" },
      { status: 400 }
    );
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const isDone = recordAnswer(session, answer);

  if (isDone) {
    return NextResponse.json({ done: true });
  }

  const nextQuestion = getCurrentQuestion(session);
  return NextResponse.json({ done: false, nextQuestion });
}