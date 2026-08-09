"use client";

import useInterview from "./hooks/useInterview";
import SetupStage from "./components/SetupStage";
import InterviewStage from "./components/InterviewStage";
import GradingStage from "./components/GradingStage";
import ResultsStage from "./components/ResultsStage";

export default function Home() {
  const flow = useInterview();

  return (
    <>
      {flow.stage === "setup" && <SetupStage {...flow} />}
      {flow.stage === "interview" && <InterviewStage {...flow} />}
      {flow.stage === "grading" && <GradingStage {...flow} />}
      {flow.stage === "results" && flow.grade && <ResultsStage {...flow} />}
    </>
  );
}