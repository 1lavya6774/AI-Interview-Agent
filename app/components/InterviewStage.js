"use client";

import { Loader2 } from "lucide-react";

export default function InterviewStage({
  currentQuestion,
  questionIndex,
  questions,
  answers,
  answer,
  setAnswer,
  submitAnswer,
  loading,
  error,
  reset,
}) {
  const isIntro = questionIndex === 0;
  const progress =
    questions.length > 0 ? ((answers.length / questions.length) * 100).toFixed(1) : 0;

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
            <h1 className="text-xl font-semibold text-white">AI Interview Agent</h1>
            <div className="flex items-center gap-2">
              {isIntro ? (
                <span className="rounded-full bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-400">
                  Introduction
                </span>
              ) : (
                <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs font-semibold text-cyan-400">
                  Question {questionIndex + 1} of {questions.length}
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
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-transparent p-px shadow-[0_0_40px_rgba(34,211,238,0.08)]">
          <div className="rounded-[calc(1rem-1px)] bg-[#0a0c1a] p-8">
            {!isIntro && (
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">
                Question {questionIndex + 1}
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