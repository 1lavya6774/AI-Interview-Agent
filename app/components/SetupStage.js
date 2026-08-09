"use client";

import { useRef, useState } from "react";
import { Briefcase, Check, FileText, Loader2, RefreshCw, Upload } from "lucide-react";
import { INTERVIEW_TYPES, DIFFICULTIES } from "../lib/constants";

export default function SetupStage({
  resumeText,
  setResumeText,
  role,
  setRole,
  interviewType,
  setInterviewType,
  difficulty,
  setDifficulty,
  questionCount,
  setQuestionCount,
  startInterview,
  setError,
  loading,
  error,
  resumeError,
  setResumeError,
  shake,
  fillExample,
}) {
  const wordCount = resumeText.trim()
    ? resumeText.trim().split(/\s+/).length
    : 0;
  const charCount = resumeText.length;

  // ---- Resume file upload (.pdf / .docx / .txt) ----
  const fileInputRef = useRef(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    setFileLoading(true);
    setFileError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not extract text from that file");
      }
      setResumeText(data.text);
      setResumeError(false);
    } catch (err) {
      setFileError(err.message);
    } finally {
      setFileLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

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
          <h1 className="text-2xl font-bold text-white">AI Interview Agent</h1>
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
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Target Role
                </label>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="role"
                    type="text"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      if (e.target.value.trim()) setError("");
                    }}
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

                {/* File upload dropzone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Upload className="h-4 w-4 shrink-0 text-cyan-400" />
                    <p className="truncate text-xs text-zinc-400">
                      {fileLoading ? (
                        <span className="flex items-center gap-2 text-cyan-400">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Extracting text…
                        </span>
                      ) : (
                        <span>
                          Drop your resume here —{" "}
                          <span className="font-medium text-zinc-300">.pdf</span>,{" "}
                          <span className="font-medium text-zinc-300">.docx</span>,{" "}
                          <span className="font-medium text-zinc-300">.txt</span>
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={fileLoading}
                    className="shrink-0 rounded-md bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/25 disabled:opacity-50"
                  >
                    Browse
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      handleFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </div>
                {fileError && (
                  <p className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400">
                    {fileError}
                  </p>
                )}

                {/* Textarea */}
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
                  <p className="mt-1.5 text-xs text-red-400">Resume is required</p>
                )}
              </div>

              {/* Error banner */}
                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold leading-snug text-red-300">
                          Couldn&apos;t generate your interview.
                        </p>
                        <p className="mt-0.5 break-words text-xs text-red-400/90">
                          {error}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={startInterview}
                        className="flex shrink-0 items-center gap-1.5 rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/30"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry
                      </button>
                    </div>
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