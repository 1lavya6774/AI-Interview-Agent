// ---------------------------------------------------------------------------
// Prompt factory — turns the UI's resume/role/type/difficulty choices into the
// interview brief. Kept server-side (never shipped to the client).
// ---------------------------------------------------------------------------

export const INTERVIEW_TYPES = ["Technical", "Behavioral", "Mixed"];
export const DIFFICULTIES = ["Entry", "Mid", "Senior"];

export function normalizeChoice(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

const INTERVIEW_TYPE_GUIDANCE = {
  Technical:
    "Focus on the candidate's technical craft: hands-on coding, the implementation details of their projects, their stack, and how they solve real technical problems.",
  Behavioral:
    "Focus on behavioral and situational questions (e.g. \u201ctell me about a time\u2026\u201d, how they handled conflict, missed deadlines, or led an effort). Look for clear structure, ownership, and honest reflection.",
  Mixed:
    "Blend technical depth with behavioral and situational questions so the interview feels balanced and authentic.",
};

const DIFFICULTY_GUIDANCE = {
  Entry:
    "Keep expectations attainable and encouraging: ground questions in fundamentals, and let the candidate show enthusiasm, communication, and learning ability.",
  Mid:
    "Expect solid working knowledge of their stack and real project experience. Probing questions should check for depth, trade-offs, and honest reasoning.",
  Senior:
    "Demand real depth: architecture decisions, trade-offs, scalability, and mentoring experience. Keep questions conversational and fair for a first interview.",
};

export function buildInterviewPrompt({
  resumeText,
  role,
  questionCount,
  interviewType,
  difficulty,
}) {
  const probingSpine = {
    Entry:
      "Keep them attainable and encouraging — probe comprehension and enthusiasm, never demand senior-level experience.",
    Mid:
      "Push for real depth: trade-offs, honest reasoning, and how they would approach unfamiliar territory.",
    Senior:
      "Demand architecture-level thinking: trade-offs, scalability, design decisions. Keep it conversational, not an interrogation.",
  }[difficulty];

  const styleSpine = {
    Technical:
      "Every probing question MUST dig into technical craft — how they built things, their stack, their code, and the trade-offs they made.",
    Behavioral:
      'Every probing question MUST be situational ("tell me about a time…", "how did you handle…") — never a how-to or knowledge-check question.',
    Mixed:
      "Balance technical depth with situational questions so the interview feels authentic.",
  }[interviewType];

  const personality = INTERVIEW_TYPE_GUIDANCE[interviewType];
  const level = DIFFICULTY_GUIDANCE[difficulty];

  return `You are an expert interviewer for the role of "${role}".

Interview style: ${interviewType} — ${personality}
Target level: ${difficulty} — ${level}

Based on the following resume, generate exactly ${questionCount} interview questions.

Resume:
${resumeText}

Question map (scales naturally to ${questionCount} questions):
- questions[0] — introduction: the interviewer introduces themselves with a name (e.g. "Hi, I'm Silvine, and I'll be your interviewer today."), then a warm, easy opening question asking the candidate to introduce themselves.
- Early questions — the next few (roughly the first third): beginner-level, low-pressure questions about background, resume basics, and general interest. Keep the tone encouraging.
- Middle questions — where they exist: moderate difficulty tied to the candidate's actual resume (projects, skills, role requirements).
- Final stretch — at minimum the last question, growing to the last 2–3 for longer interviews: the most probing questions. ${styleSpine} ${probingSpine}

Rules:
- Every question must be personalized to the resume, the target role, and the ${interviewType} / ${difficulty} style described above.
- Question difficulty must climb through the interview, but the whole thing stays conversational and appropriate for a first interview.
- Return ONLY a JSON object with a "questions" array of exactly ${questionCount} strings.
- Each entry must be a single, focused message/question.`;
}

export function buildGradePrompt(session) {
  const qaPairs = session.answers
    .map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`)
    .join("\n\n");

  const contextBits = [
    `Role: ${session.role}`,
    `Interview type: ${session.interviewType ?? "Mixed"}`,
    `Difficulty: ${session.difficulty ?? "Mid"}`,
  ].join(" \u00b7 ");

  return `You are an expert interviewer grading a candidate for ${contextBits}.

Here are the ${session.questions.length} Q&A pairs from the interview:

${qaPairs}

Return ONLY a JSON object with this exact structure:
{
  "perQuestion": [
    { "questionNumber": 1, "score": 0-10, "reason": "one-line reason" },
    ... (${session.questions.length} items)
  ],
  "overallScore": 0-100,
  "verdict": "Strong Hire | Hire | Borderline | No Hire",
  "feedback": "A detailed paragraph of feedback"
}`;
}