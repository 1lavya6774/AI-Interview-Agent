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
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#05060f] px-4 py-8">
      {/* Radial gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.15), rgba(16885,247,0.08) 40%, transparent 70%)",
        }}
      />

      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0),
            radial(circle at 1px 1px, rgba(34,211,238,0.3) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Floating animated elements */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 h-2 w-2 rounded-full bg-cyan-400 opacity-20 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-float-pulse" />
      <div className="pointer-events-none absolute top-3/4 right-1/4 h-2.5 w-2.5 rounded-full bg-purple-400 opacity-20 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-float-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="pointer-events-none absolute top-1/3 right-1/3 h-1.5 w-1.5 rounded-full bg-pink-400 opacity-20 shadow-[0_0_15px_rgba(232,72,159,0.5)] animate-float-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-text mb-1">
            AI Interview Agent
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Practice real interviews with a personalized AI interviewer — paste your resume, pick a role, and get scored.
          </p>
        </header>

        {/* How it works mini-section */}
        <div className="mb-6 grid grid-cols-3 gap-1 text-center">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
              <Upload className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs text-zinc-400">Paste resume</span>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs text-zinc-400">Pick role + style</span>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-pink-500/20 text-pink-400">
              <Check className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs text-zinc-400">Get scored</span>
          </div>
        </div>

        {/* Card with gradient border glow */}
        <div className="animate-border-glow rounded-2xl bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-transparent p-0.5 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
          <div className="rounded-[calc(1rem-2px)] bg-[#0a0c1a] p-5">
            <form onSubmit={startInterview} className="space-y-3.5">
              {/* Target Role */}
              <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <label htmlFor="role" className="mb-1 block text-xs font-medium text-zinc-300">
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
                    className="w-full rounded-lg border border-zinc-700 bg-[#0d1020] py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
              </div>

              {/* Interview type chips + Difficulty */}
              <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <label className="mb-1 block text-xs font-medium text-zinc-300">
                  Interview Type
                </label>
                <div className="flex gap-1.5">
                  {INTERVIEW_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterviewType(type)}
                      className={`flex-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                        interviewType === type
                          ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                          : "border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <label className="mb-1 block text-xs font-medium text-zinc-300">
                  Difficulty
                </label>
                <div className="flex rounded-lg border border-zinc-700 p-0.5">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-200 ${
                        difficulty === d
                          ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question count slider */}
              <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">
                    Number of Questions
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
                  className="w-full cursor-pointer accent-cyan-400"
                />
                <div className="mt-1 flex justify-between text-xs text-zinc-500">
                  <span>5</span>
                  <span>15</span>
                </div>
              </div>

              {/* Resume/Background */}
              <div className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="resume"
                    className="flex items-center gap-1 text-xs font-medium text-zinc-300"
                  >
                    <FileText className="h-3.5 w-3.5 text-zinc-500" />
                    Resume / Background
                  </label>
                  <button
                    type="button"
                    onClick={fillExample}
                    className="text-xs font-medium text-cyan-400 transition-colors duration-200 hover:text-cyan-300"
                  >
                    Try with example
                  </button>
                </div>

                {/* File upload dropzone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40 px-3 py-2 transition-colors duration-200 hover:border-cyan-500/40"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Upload className="h-4 w-4 shrink-0 text-cyan-400" />
                    <p className="truncate text-xs text-zinc-400">
                      {fileLoading ? (
                        <span className="flex items-center gap-1.5 text-cyan-400">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Extracting…
                        </span>
                      ) : (
                        <span>
                          Drag & drop — .pdf, .docx, .txt
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={fileLoading}
                    className="shrink-0 rounded-md bg-cyan-500/15 px-2.5 py-1 text-xs font-medium text-cyan-300 transition-colors duration-200 hover:bg-cyan-500/25 disabled:opacity-50"
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
                  <p className="mb-2 rounded-md bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400">
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
                    placeholder="Paste your resume, projects, skills, and experience…"
                    rows={6}
                    className={`w-full resize-y rounded-lg border bg-[#0d1020] px-3 py-2 pr-3 pb-7 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:ring-2 ${
                      resumeError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-zinc-700 focus:border-cyan-400 focus:ring-cyan-500/40"
                    } ${shake ? "animate-shake" : ""}`}
                  />
                  <span className="pointer-events-none absolute bottom-1.5 right-2.5 text-xs text-zinc-500">
                    {wordCount} words · {charCount} chars
                  </span>
                </div>
                {resumeError && (
                  <p className="mt-1 text-xs text-red-400">Resume is required</p>
                )}
              </div>

              {/* Error banner */}
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-red-300">
                        Couldn&apos;t generate your interview.
                      </p>
                      <p className="mt-0.5 break-words text-xs text-red-400/90">
                        {error}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startInterview}
                      className="flex shrink-0 items-center gap-1 rounded-md bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-300 transition-colors duration-200 hover:bg-red-500/30"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading || (!resumeText.trim() && !resumeError)}
                  className="group w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating questions…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Briefcase className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      Start Interview
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-zinc-500">
          Powered by OpenRouter · Your resume stays local and is never stored
        </p>
      </div>
    </div>
  );
}