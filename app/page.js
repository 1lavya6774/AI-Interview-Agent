"use client";

import { useState } from "react";

export default function Home() {
  const [stage, setStage] = useState("setup"); // setup | interview | results
  const [resumeText, setResumeText] = useState("");
  const [role, setRole] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [grade, setGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startInterview = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !role.trim()) {
      setError("Please provide both your resume and target role.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      console.log("[FRONTEND] Sending /api/start with resumeText:", resumeText);
      console.log("[FRONTEND] Sending /api/start with role:", role);
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, role }),
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
    setSessionId(null);
    setQuestions([]);
    setCurrentQuestion("");
    setAnswer("");
    setQuestionIndex(0);
    setAnswers([]);
    setGrade(null);
    setError("");
  };

  // ---- Setup Stage ----
  if (stage === "setup") {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            AI Interview Agent
          </h1>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <form
            onSubmit={startInterview}
            className="w-full max-w-xl space-y-5 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900 dark:shadow-none"
          >
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Start Your Interview
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Paste your resume and target role. The AI will generate 10
                personalized questions.
              </p>
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Target Role
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="resume"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Resume / Background
              </label>
              <textarea
                id="resume"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here, including projects, skills, and experience..."
                rows={8}
                className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating Questions..." : "Start Interview"}
            </button>
          </form>
        </main>
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
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            AI Interview Agent
          </h1>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10">
          <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Interview Results
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Role: {role}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {grade.overallScore}
                  <span className="text-lg text-zinc-400">/100</span>
                </div>
                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${verdictColor}`}
                >
                  {grade.verdict}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-zinc-50 p-5 text-sm leading-relaxed text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
              {grade.feedback}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Per-Question Breakdown
            </h3>
            <div className="space-y-4">
              {grade.perQuestion?.map((item, i) => (
                <div
                  key={item.questionNumber || i}
                  className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      Q{item.questionNumber || i + 1}:{" "}
                      {questions[item.questionNumber - 1] || `Question ${i + 1}`}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.score >= 8
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : item.score >= 5
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      }`}
                    >
                      {item.score}/10
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Start New Interview
          </button>
        </main>
      </div>
    );
  }

  // ---- Interview Stage ----
  const isIntro = questionIndex === 0;
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            AI Interview Agent
          </h1>
          <div className="flex items-center gap-2">
            {isIntro ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                Introduction
              </span>
            ) : (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                Question {questionIndex} of 9
              </span>
            )}
            <button
              onClick={reset}
              className="rounded-full px-3 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              End
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(answers.length / 10) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          {!isIntro && (
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Question {questionIndex}
            </p>
          )}
          <h2 className={`mt-2 text-xl font-semibold leading-relaxed text-zinc-900 dark:text-zinc-50 ${isIntro ? "mt-0" : ""}`}>
            {currentQuestion}
          </h2>
        </div>

        <form
          onSubmit={submitAnswer}
          className="mt-6 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900"
        >
          <label
            htmlFor="answer"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
            className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !answer.trim()}
            className="mt-4 w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        </form>
      </main>
    </div>
  );
}