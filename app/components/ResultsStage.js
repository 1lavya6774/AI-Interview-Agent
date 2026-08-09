"use client";

export default function ResultsStage({ grade, role, questions, reset }) {
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
              <div className="flex flex-col items-end">
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
                      {questions[item.questionNumber - 1] || `Question ${i + 1}`}
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