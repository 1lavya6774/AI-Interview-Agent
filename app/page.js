"use client";

import { useState } from "react";
import {
  Briefcase,
  FileText,
  Loader2,
  RefreshCw,
  Check,
} from "lucide-react";

const SAMPLE_RESUME = `Jane Doe
Frontend Engineer | 3 years experience

SUMMARY
Frontend engineer with 3 years of experience building responsive, accessible web applications using React, Next.js, and TypeScript. Strong focus on performance optimization and clean component architecture.

EXPERIENCE
Senior Frontend Developer — TechCorp (2023–Present)
- Led migration of legacy jQuery app to React + TypeScript, improving load time by 40%
- Built reusable component library used across 5 product teams
- Implemented CI/CD pipeline with automated testing

Frontend Developer — StartupHub (2021–2023)
- Developed customer-facing dashboard with real-time data visualization
- Integrated REST APIs and implemented state management with Redux Toolkit
- Collaborated with designers to ship pixel-perfect, responsive UIs

SKILLS
React, Next.js, TypeScript, JavaScript, Tailwind CSS, Redux, Node.js, GraphQL, Jest, Git`;

const INTERVIEW_TYPES = ["Technical", "Behavioral", "Mixed"];
const DIFFICULTIES = ["Entry", "Mid", "Senior"];

export default function Home() {
  const [stage, setStage] = useState("setup"); // setup | interview | results
  const [resumeText, setResumeText] = useState("");
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Mid");
  const [questionCount, setQuestionCount] = useState(10);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [grade, setGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeError, setResumeError] = useState(false);
  const [shake, setShake] = useState(false);

  const wordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0;
  const charCount = resumeText.length;

  const startInterview = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setResumeError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (!role.trim()) {
      setError("Please provide a target role.");
      return;
    }

    setLoading(true);
    setError("");
    setResumeError(false);
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          role,
          interviewType,
          difficulty,
          questionCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start interview");

      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setCurrentQuestion(data.currentQuestion);
      setQuestionIndex(0);
      setAnswers([]);
      setStage("interview");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim() || loading) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit answer");

      setAnswers((prev) => [...prev, answer]);
      setAnswer("");

      if (data.done) {
        gradeInterview();
      } else {
        setCurrentQuestion(data.nextQuestion);
        setQuestionIndex((i) => i + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const gradeInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grade interview");

      setGrade(data);
      setStage("results");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage("setup");
    setResumeText("");
    setRole("");
    setInterviewType("Mixed");
    setDifficulty("Mid");
    setQuestionCount(10);
    setSessionId(null);
    setQuestions([]);
    setCurrentQuestion("");
    setAnswer("");
    setQuestionIndex(0);
    setAnswers([]);
    setGrade(null);
    setError("");
    setResumeError(false);
  };

  const fillExample = () => {
    setResumeText(SAMPLE_RESUME);
    setResumeError(false);
  };

  // ---- Setup Stage ----
  if (stage === "setup") {
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#05060f]">
        {/* Radial gradient background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.15), rgba(168,85,247,0.08) 40%, transparent 70%)",
          }}
        />
        <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10">
          {/* Header */}
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">
              AI Interview Agent
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Practice with a personalized AI interviewer
            </p>
          </header>

          {/* Progress stepper */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-white">
                  <Check className="h-4 w-4" />
                </div>
                <span className="mt-1.5 text-xs font-medium text-cyan-400">
                  Setup
                </span>
              </div>
              <div className="mx-2 h-0.5 w-12 bg-zinc-700" />
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-600 text-zinc-500">
                  <span className="text-xs font-semibold">2</span>
                </div>
                <span className="mt-1.5 text-xs text-zinc-500">Interview</span>
              </div>
              <div className="mx-2 h-0.5 w-12 bg-zinc-700" />
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-600 text-zinc-500">
                  <span className="text-xs font-semibold">3</span>
                </div>
                <span className="mt-1.5 text-xs text-zinc-500">Feedback</span>
              </div>
            </div>
          </div>

          {/* Card with gradient border glow */}
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-transparent p-px shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <div className="rounded-[calc(1rem-1px)] bg-[#0a0c1a] p-8">
              <form onSubmit={startInterview} className="space-y-5">
                {/* Target Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="mb-1.5 block text-sm font-medium text-zinc-300"
                  >
                    Target Role
                  </label>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full rounded-lg border border-zinc-700 bg-[#0d1020] py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                {/* Interview type chips */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Interview Type
                  </label>
                  <div className="flex gap-2">
                    {INTERVIEW_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setInterviewType(type)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          interviewType === type
                            ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                            : "border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty + Question count */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                      Difficulty
                    </label>
                    <div className="flex rounded-lg border border-zinc-700 p-0.5">
                      {DIFFICULTIES.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                            difficulty === d
                              ? "bg-cyan-500/20 text-cyan-300"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-300">
                        Questions
                      </label>
                      <span className="text-sm font-semibold text-cyan-400">
                        {questionCount}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="15"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                {/* Resume/Background */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="resume"
                      className="flex items-center gap-1.5 text-sm font-medium text-zinc-300"
                    >
                      <FileText className="h-4 w-4 text-zinc-500" />
                      Resume / Background
                    </label>
                    <button
                      type="button"
                      onClick={fillExample}
                      className="text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
                    >
                      Try with example
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      id="resume"
                      value={resumeText}
                      onChange={(e) => {
                        setResumeText(e.target.value);
                        if (e.target.value.trim()) setResumeError(false);
                      }}
                      placeholder="Paste your resume text here, including projects, skills, and experience..."
                      rows={8}
                      className={`w-full resize-y rounded-lg border bg-[#0d1020] px-4 py-2.5 pr-4 pb-8 text-sm text-white placeholder-zinc-500 outline-none transition focus:ring-2 ${
                        resumeError
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                          : "border-zinc-700 focus:border-cyan-500 focus:ring-cyan-500/50"
                      } ${shake ? "animate-shake" : ""}`}
                    />
                    <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-zinc-500">
                      {wordCount} words · {charCount} chars
                    </span>
                  </div>
                  {resumeError && (
                    <p className="mt-1.5 text-xs text-red-400">
                      Resume is required
                    </p>
                  )}
                </div>

                {/* Error banner */}
                {error && (
                  <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                    <p className="text-sm text-red-300">
                      Something went wrong generating questions.
                    </p>
                    <button
                      type="button"
                      onClick={startInterview}
                      className="flex items-center gap-1.5 rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/30"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Retry
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || (!resumeText.trim() && !resumeError)}
                  className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating questions...
                    </span>
                  ) : (
                    "Start Interview"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Results Stage ----
  if (stage === "results" && grade) {
    const verdictColor =
      grade.verdict === "Strong Hire"
        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
        : grade.verdict === "Hire"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
        : grade.verdict === "Borderline"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";

    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#05060f]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.15), rgba(168,85,247,0.08) 40%, transparent 70%)",
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 py-10">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">AI Interview Agent</h1>
          </header>

          <div className="rounded-2xl bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-transparent p-px shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <div className="rounded-[calc(1rem-1px)] bg-[#0a0c1a] p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Interview Results
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">Role: {role}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-cyan-400">
                    {grade.overallScore}
                    <span className="text-lg text-zinc-500">/100</span>
                  </div>
                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${verdictColor}`}
                  >
                    {grade.verdict}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-zinc-800/50 p-5 text-sm leading-relaxed text-zinc-300">
                {grade.feedback}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-transparent p-px shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <div className="rounded-[calc(1rem-1px)] bg-[#0a0c1a] p-8">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Per-Question Breakdown
              </h3>
              <div className="space-y-4">
                {grade.perQuestion?.map((item, i) => (
                  <div
                    key={item.questionNumber || i}
                    className="rounded-xl border border-zinc-700 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex-1 text-sm font-medium text-zinc-200">
                        Q{item.questionNumber || i + 1}:{" "}
                        {questions[item.questionNumber - 1] ||
                          `Question ${i + 1}`}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.score >= 8
                            ? "bg-green-900/40 text-green-400"
                            : item.score >= 5
                            ? "bg-yellow-900/40 text-yellow-400"
                            : "bg-red-900/40 text-red-400"
                        }`}
                      >
                        {item.score}/10
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={reset}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:brightness-110"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  // ---- Interview Stage ----
  const isIntro = questionIndex === 0;
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#05060f]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.15), rgba(168,85,247,0.08) 40%, transparent 70%)",
        }}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">
              AI Interview Agent
            </h1>
            <div className="flex items-center gap-2">
              {isIntro ? (
                <span className="rounded-full bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-400">
                  Introduction
                </span>
              ) : (
                <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs font-semibold text-cyan-400">
                  Question {questionIndex} of 9
                </span>
              )}
              <button
                onClick={reset}
                className="rounded-full px-3 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
              >
                End
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(answers.length / 10) * 100}%` }}
            />
          </div>
        </header>

        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-transparent p-px shadow-[0_0_40px_rgba(34,211,238,0.08)]">
          <div className="rounded-[calc(1rem-1px)] bg-[#0a0c1a] p-8">
            {!isIntro && (
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">
                Question {questionIndex}
              </p>
            )}
            <h2
              className={`mt-2 text-xl font-semibold leading-relaxed text-white ${
                isIntro ? "mt-0" : ""
              }`}
            >
              {currentQuestion}
            </h2>
          </div>
        </div>

        <form
          onSubmit={submitAnswer}
          className="mt-6 rounded-2xl bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-transparent p-px shadow-[0_0_40px_rgba(34,211,238,0.08)]"
        >
          <div className="rounded-[calc(1rem-1px)] bg-[#0a0c1a] p-8">
            <label
              htmlFor="answer"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Your Answer
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              disabled={loading}
              className="w-full resize-y rounded-lg border border-zinc-700 bg-[#0d1020] px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
            />
            {error && (
              <p className="mt-3 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !answer.trim()}
              className="mt-4 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Answer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}