"use client";

import { Loader2, RefreshCw } from "lucide-react";

const GRADING_STEPS = [
  "Reading your answers…",
  "Scoring each response…",
  "Balancing depth and clarity…",
  "Writing your personalized feedback…",
  "Summing up your verdict…",
];

export default function GradingStage({
  gradeInterview,
  error,
  loading,
  gradingStep,
  answers,
  questions,
  role,
}) {
  const step = GRADING_STEPS[gradingStep % GRADING_STEPS.length];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#05060f] px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.15), rgba(168,85,247,0.08) 40%, transparent 70%)",
        }}
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {error ? (
          <div className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
            <p className="text-sm font-semibold text-red-300">Grading failed</p>
            <p className="mt-1.5 break-words text-sm text-red-400/90">{error}</p>
            <button
              onClick={gradeInterview}
              disabled={loading}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/30 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Retry grading
            </button>
          </div>
        ) : (
          <>
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,#22d3ee_0%,#a855f7_45%,transparent_70%)]" />
              <div className="absolute inset-[6px] rounded-full bg-[#0a0c1a]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-white">
              Grading your interview
            </h2>
            <p
              key={gradingStep}
              className="mt-3 animate-fade-in-up text-sm text-zinc-400"
            >
              {step}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-cyan-900/40 px-3 py-1 text-xs font-semibold text-cyan-400">
                {answers.length} of {questions.length} answered
              </span>
              <span className="rounded-full bg-purple-900/40 px-3 py-1 text-xs font-semibold text-purple-400">
                {role}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}