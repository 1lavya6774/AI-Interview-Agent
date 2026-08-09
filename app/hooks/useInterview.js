"use client";

import { useCallback, useEffect, useState } from "react";
import { SAMPLE_RESUME } from "../lib/constants";

// All interview state + API orchestration lives here; the page and stage
// components stay purely presentational.
export default function useInterview() {
  const [stage, setStage] = useState("setup"); // setup | interview | grading | results
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
  const [gradingStep, setGradingStep] = useState(0);

  // Cycles the status messages on the "Grading…" screen while the API works.
  useEffect(() => {
    if (stage !== "grading" || error) return;
    const timer = setInterval(() => setGradingStep((s) => s + 1), 1800);
    return () => clearInterval(timer);
  }, [stage, error]);

  const startInterview = useCallback(
    async (e) => {
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
    },
    [resumeText, role, interviewType, difficulty, questionCount]
  );

  const gradeInterview = useCallback(async () => {
    setLoading(true);
    setError("");
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
  }, [sessionId]);

  const submitAnswer = useCallback(
    async (e) => {
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
          setStage("grading");
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
    },
    [answer, sessionId, loading, gradeInterview]
  );

  const reset = useCallback(() => {
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
  }, []);

  const fillExample = useCallback(() => {
    setResumeText(SAMPLE_RESUME);
    setResumeError(false);
  }, []);

  return {
    stage,
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
    sessionId,
    questions,
    currentQuestion,
    answer,
    setAnswer,
    questionIndex,
    answers,
    grade,
    loading,
    error,
    setError,
    resumeError,
    setResumeError,
    shake,
    gradingStep,
    startInterview,
    submitAnswer,
    gradeInterview,
    reset,
    fillExample,
  };
}