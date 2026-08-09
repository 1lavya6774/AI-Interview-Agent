import { randomUUID } from "node:crypto";

// In-memory session store keyed by UUID. Sessions live for the life of the
// server process — perfectly fine for local dev and single-instance deploys.
const sessions = new Map();

export function createSession({ resumeText, role, questions, interviewType, difficulty }) {
  const sessionId = randomUUID();
  sessions.set(sessionId, {
    resumeText,
    role,
    interviewType: interviewType || "Mixed",
    difficulty: difficulty || "Mid",
    questions,
    answers: [],
    questionIndex: 0,
    createdAt: Date.now(),
  });
  return sessionId;
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

export function getCurrentQuestion(session) {
  if (!session || session.questionIndex >= session.questions.length) {
    return null;
  }
  return session.questions[session.questionIndex];
}

export function recordAnswer(session, answer) {
  if (!session || session.questionIndex >= session.questions.length) {
    return null;
  }
  session.answers.push({
    question: session.questions[session.questionIndex],
    answer,
  });
  session.questionIndex += 1;
  return session.questionIndex >= session.questions.length;
}

export function getSessionData(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  return {
    resumeText: session.resumeText,
    role: session.role,
    questions: session.questions,
    answers: session.answers,
    questionIndex: session.questionIndex,
  };
}