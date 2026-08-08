import express from "express";
import cors from "cors";
import { chat } from "./openrouter.js";
import {
  createSession,
  getSession,
  getCurrentQuestion,
  recordAnswer,
} from "./sessions.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// POST /api/start — generate 10 questions from resume + role
app.post("/api/start", async (req, res) => {
  try {
    const { resumeText, role } = req.body;

    console.log("[BACKEND] /api/start received resumeText:", resumeText);
    console.log("[BACKEND] /api/start received role:", role);
    console.log(
      "[BACKEND] resumeText length:",
      resumeText ? resumeText.length : 0,
      "| first 50 chars:",
      resumeText ? JSON.stringify(resumeText.slice(0, 50)) : "N/A"
    );

    if (!resumeText || !role) {
      return res.status(400).json({ error: "resumeText and role are required" });
    }

    const prompt = `You are an expert technical interviewer. Based on the following resume and target role, generate exactly 10 interview questions.

Resume:
${resumeText}

Target Role: ${role}

Requirements:
- questions[0] must be a short interviewer introduction — the interviewer introduces themselves with a name (e.g. "Hi, I'm Silvine, and I'll be your interviewer today.") — followed by a warm, easy opening question asking the candidate to introduce themselves or summarize their background.
- questions[1] through questions[3] must be beginner-level: simple, low-pressure questions about the candidate's experience, resume basics, or general interest in the role.
- questions[4] through questions[6] must be moderate difficulty: more specific questions tied to the candidate's actual resume details (projects, skills, role requirements).
- questions[7] through questions[9] must be the most probing questions, but NOT expert/production-architecture level — keep the ceiling appropriate to a first interview, not a senior-level grilling.
- All 10 questions must be personalized to the resume and target role.
- Return ONLY a JSON object with a "questions" array of exactly 10 strings.
- Each entry must be a single, focused message/question.`;

    const systemMessage = {
      role: "system",
      content:
        "You are an expert interviewer. Always respond with valid JSON only.",
    };
    const userMessage = { role: "user", content: prompt };

    console.log("[BACKEND] Full system message:", JSON.stringify(systemMessage));
    console.log("[BACKEND] Full user prompt:", JSON.stringify(userMessage));

    const raw = await chat(
      [systemMessage, userMessage],
      { json: true }
    );

    let questions;
    try {
      const parsed = JSON.parse(raw);
      questions = parsed.questions;
    } catch {
      return res.status(500).json({ error: "Failed to parse questions from AI" });
    }

    if (!Array.isArray(questions) || questions.length !== 10) {
      return res
        .status(500)
        .json({ error: "AI did not return exactly 10 questions" });
    }

    const sessionId = createSession({ resumeText, role, questions });
    res.json({ sessionId, questions, currentQuestion: questions[0] });
  } catch (error) {
    console.error("Start error:", error);
    res.status(500).json({ error: "Failed to start interview" });
  }
});

// POST /api/answer — store answer, advance index, return next question or done
app.post("/api/answer", (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({ error: "sessionId and answer are required" });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const isDone = recordAnswer(session, answer);

    if (isDone) {
      return res.json({ done: true });
    }

    const nextQuestion = getCurrentQuestion(session);
    res.json({ done: false, nextQuestion });
  } catch (error) {
    console.error("Answer error:", error);
    res.status(500).json({ error: "Failed to record answer" });
  }
});

// POST /api/grade — grade all Q&A pairs
app.post("/api/grade", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.answers.length !== 10) {
      return res
        .status(400)
        .json({ error: "All 10 questions must be answered before grading" });
    }

    const qaPairs = session.answers
      .map(
        (a, i) =>
          `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`
      )
      .join("\n\n");

    const prompt = `You are an expert interviewer grading a candidate for the role of ${session.role}.

Here are the 10 Q&A pairs from the interview:

${qaPairs}

Return ONLY a JSON object with this exact structure:
{
  "perQuestion": [
    { "questionNumber": 1, "score": 0-10, "reason": "one-line reason" },
    ... (10 items)
  ],
  "overallScore": 0-100,
  "verdict": "Strong Hire | Hire | Borderline | No Hire",
  "feedback": "A detailed paragraph of feedback"
}`;

    const raw = await chat(
      [
        {
          role: "system",
          content:
            "You are an expert interviewer. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      { json: true }
    );

    let grade;
    try {
      grade = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Failed to parse grade from AI" });
    }

    res.json(grade);
  } catch (error) {
    console.error("Grade error:", error);
    res.status(500).json({ error: "Failed to grade interview" });
  }
});

app.listen(PORT, () => {
  console.log(`Interview API server running on http://localhost:${PORT}`);
});