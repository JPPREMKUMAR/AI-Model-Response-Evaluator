import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trophy,
  FileText,
  Brain,
  Calendar,
  Star,
  Sparkles,
  RefreshCw,
  Bot,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

import API from "../api/axios";

export default function EvaluationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Fetch evaluation details
  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/evaluations/${id}`);

      setEvaluation(response.data.evaluation);
    } catch (err) {
      console.error("Failed to fetch evaluation:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load evaluation details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, [id]);

  // AI evaluation using the provider saved with this evaluation
  const handleAIEvaluation = async () => {
    try {
      setAiLoading(true);
      setAiError("");

      await API.post(`/evaluations/${id}/ai-evaluate`, {
        provider: evaluation.provider || "auto",
      });

      // Refresh evaluation to retrieve saved AI results
      const response = await API.get(`/evaluations/${id}`);

      setEvaluation(response.data.evaluation);
    } catch (err) {
      console.error("AI evaluation failed:", err);

      setAiError(
        err.response?.data?.message ||
          "Failed to evaluate responses using the selected AI provider."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          Loading evaluation...
        </div>
      </div>
    );
  }

  // Error State
  if (error || !evaluation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="max-w-md text-center">
          <AlertCircle
            size={40}
            className="mx-auto mb-4 text-red-400"
          />

          <h1 className="text-xl font-bold">
            Evaluation Not Found
          </h1>

          <p className="mt-2 text-slate-400">
            {error || "Unable to find this evaluation."}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-medium hover:bg-indigo-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = evaluation.status === "completed";

  const highestScore = Math.max(
    ...evaluation.responses.map(
      (response) => response.totalScore || 0
    )
  );

  const aiEvaluation = evaluation.aiEvaluation;

  const aiEvaluations = aiEvaluation?.evaluations || [];

  const aiWinnerIndex =
    aiEvaluation?.recommendedWinnerIndex;

  const aiWinner =
    aiWinnerIndex !== null && aiWinnerIndex !== undefined
      ? evaluation.responses[aiWinnerIndex]
      : null;

  const highestAIScore = Math.max(
    0,
    ...aiEvaluations.map((result) => result.totalScore || 0)
  );

  const criteria = [
    {
      label: "Accuracy",
      key: "accuracy",
      weight: "30%",
    },
    {
      label: "Relevance",
      key: "relevance",
      weight: "20%",
    },
    {
      label: "Completeness",
      key: "completeness",
      weight: "20%",
    },
    {
      label: "Instruction Following",
      key: "instructionFollowing",
      weight: "20%",
    },
    {
      label: "Clarity",
      key: "clarity",
      weight: "10%",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-indigo-400">
              EVALUATION DETAILS
            </p>

            <h1 className="text-3xl font-bold">
              Evaluation Results
            </h1>

            <p className="mt-2 text-slate-400">
              Review and compare AI model responses.
            </p>
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                isCompleted
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 size={16} />
              ) : (
                <Clock size={16} />
              )}

              {isCompleted ? "Completed" : "Pending"}
            </span>
          </div>
        </div>

        {/* Evaluation Information */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Date */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3 text-slate-400">
              <Calendar size={20} />

              <span className="text-sm">
                Created Date
              </span>
            </div>

            <p className="mt-3 font-semibold">
              {formatDate(evaluation.createdAt)}
            </p>
          </div>

          {/* Models */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3 text-slate-400">
              <Brain size={20} />

              <span className="text-sm">
                Models Compared
              </span>
            </div>

            <p className="mt-3 font-semibold">
              {evaluation.responses.length} Models
            </p>
          </div>

          {/* Winner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3 text-slate-400">
              <Trophy size={20} />

              <span className="text-sm">
                Manual Winner
              </span>
            </div>

            <p className="mt-3 font-semibold text-emerald-400">
              {evaluation.winner || "Not evaluated yet"}
            </p>
          </div>
        </div>

        {/* Prompt */}
        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex items-center gap-3">
            <FileText size={20} className="text-indigo-400" />

            <h2 className="text-lg font-semibold">
              Original Prompt
            </h2>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="whitespace-pre-wrap leading-7 text-slate-300">
              {evaluation.prompt}
            </p>
          </div>
        </section>

        {/* Responses */}
        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Model Responses
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Compare the responses submitted for this prompt.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {evaluation.responses.map((response, index) => {
              const isWinner =
                isCompleted &&
                response.model === evaluation.winner;

              const aiResult = aiEvaluations.find(
                (result) => result.responseIndex === index
              );

              const isAIWinner =
                aiWinnerIndex === index;

              return (
                <div
                  key={index}
                  className={`rounded-2xl border bg-slate-900 p-6 ${
                    isWinner
                      ? "border-emerald-500/40"
                      : isAIWinner
                      ? "border-purple-500/40"
                      : "border-slate-800"
                  }`}
                >
                  {/* Response Header */}
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">
                        MODEL {index + 1}
                      </p>

                      <h3 className="mt-1 text-lg font-semibold">
                        {response.model}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isWinner && (
                        <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
                          <Trophy size={14} />
                          Manual Winner
                        </div>
                      )}

                      {isAIWinner && (
                        <div className="flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-400">
                          <Sparkles size={14} />
                          AI Winner
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Response Content */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {response.response}
                    </p>
                  </div>

                  {/* Manual Score */}
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Manual Total Score
                      </span>

                      <span
                        className={`text-2xl font-bold ${
                          isWinner
                            ? "text-emerald-400"
                            : "text-white"
                        }`}
                      >
                        {response.totalScore || 0}

                        <span className="ml-1 text-sm text-slate-500">
                          /10
                        </span>
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isWinner
                            ? "bg-emerald-500"
                            : "bg-indigo-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (response.totalScore || 0) * 10,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Manual Score Breakdown */}
                  {isCompleted && response.scores && (
                    <div className="mt-6 border-t border-slate-800 pt-5">
                      <h4 className="mb-4 text-sm font-semibold">
                        Manual Score Breakdown
                      </h4>

                      <div className="space-y-3">
                        {criteria.map((criterion) => {
                          const score =
                            response.scores[criterion.key];

                          return (
                            <div
                              key={criterion.key}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-slate-400">
                                {criterion.label}
                              </span>

                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                                  <div
                                    className="h-full rounded-full bg-indigo-500"
                                    style={{
                                      width: `${score * 10}%`,
                                    }}
                                  />
                                </div>

                                <span className="w-8 text-right text-sm font-medium">
                                  {score}/10
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* AI Score */}
                  {aiResult && (
                    <div className="mt-6 border-t border-purple-500/20 pt-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-purple-300">
                          <Sparkles size={16} />
                          {aiEvaluation.provider || "AI Provider"} Score
                        </h4>

                        <span className="text-xl font-bold text-purple-400">
                          {aiResult.totalScore?.toFixed(2) || 0}/10
                        </span>
                      </div>

                      <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-purple-500"
                          style={{
                            width: `${Math.min(
                              (aiResult.totalScore || 0) * 10,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="space-y-3">
                        {criteria.map((criterion) => {
                          const score =
                            aiResult[criterion.key];

                          return (
                            <div
                              key={criterion.key}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-slate-400">
                                {criterion.label}
                              </span>

                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                                  <div
                                    className="h-full rounded-full bg-purple-500"
                                    style={{
                                      width: `${score * 10}%`,
                                    }}
                                  />
                                </div>

                                <span className="w-8 text-right text-sm font-medium text-purple-300">
                                  {score}/10
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* AI Explanation */}
                      {aiResult.explanation && (
                        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
                          <h5 className="mb-2 text-sm font-semibold text-slate-300">
                            AI Explanation
                          </h5>

                          <p className="text-sm leading-6 text-slate-400">
                            {aiResult.explanation}
                          </p>
                        </div>
                      )}

                      {/* Strengths */}
                      {aiResult.strengths?.length > 0 && (
                        <div className="mt-4">
                          <h5 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                            <TrendingUp size={15} />
                            Strengths
                          </h5>

                          <ul className="space-y-2">
                            {aiResult.strengths.map(
                              (strength, strengthIndex) => (
                                <li
                                  key={strengthIndex}
                                  className="flex gap-2 text-sm text-slate-400"
                                >
                                  <span className="text-emerald-500">
                                    +
                                  </span>

                                  {strength}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {aiResult.weaknesses?.length > 0 && (
                        <div className="mt-4">
                          <h5 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-400">
                            <AlertCircle size={15} />
                            Areas to Improve
                          </h5>

                          <ul className="space-y-2">
                            {aiResult.weaknesses.map(
                              (weakness, weaknessIndex) => (
                                <li
                                  key={weaknessIndex}
                                  className="flex gap-2 text-sm text-slate-400"
                                >
                                  <span className="text-amber-500">
                                    -
                                  </span>

                                  {weakness}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pending Manual Evaluation */}
                  {!isCompleted && !aiResult && (
                    <div className="mt-5 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 text-sm text-amber-400">
                      This response has not been manually scored.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Evaluation Section */}
        <section className="mb-8 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="text-purple-400" size={22} />

                <h2 className="text-xl font-semibold">
                  AI Evaluation
                </h2>
              </div>

              <p className="text-sm text-slate-400">
                Automatically evaluate responses using your selected AI provider. Gemini is used first in Auto mode, with OpenAI as fallback.
              </p>
            </div>

            <button
              onClick={handleAIEvaluation}
              disabled={aiLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Evaluating...
                </>
              ) : aiEvaluation ? (
                <>
                  <RefreshCw size={18} />
                  Run AI Evaluation Again
                </>
              ) : (
                <>
                  <Bot size={18} />
                  Evaluate with {evaluation.provider === "openai" ? "OpenAI" : evaluation.provider === "gemini" ? "Gemini" : "Auto (Gemini → OpenAI)"}
                </>
              )}
            </button>
          </div>

          {/* AI Error */}
          {aiError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />

              <p className="text-sm">
                {aiError}
              </p>
            </div>
          )}

          {/* AI Loading */}
          {aiLoading && (
            <div className="rounded-xl border border-purple-500/10 bg-slate-950/50 p-6 text-center">
              <Loader2
                size={32}
                className="mx-auto mb-3 animate-spin text-purple-400"
              />

              <p className="font-medium">
                {aiEvaluation?.provider || (evaluation.provider === "openai" ? "OpenAI" : "Gemini")} is analyzing your responses
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Evaluating accuracy, relevance, completeness,
                instruction following, and clarity.
              </p>
            </div>
          )}

          {/* AI Evaluation Summary */}
          {aiEvaluation && !aiLoading && (
            <div className="space-y-6">

              {/* Provider information */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Bot size={18} className="text-purple-400" />
                  <h3 className="font-semibold">AI Evaluation Provider</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-900 p-3">
                    <p className="text-xs text-slate-500">Actual Provider</p>
                    <p className="mt-1 font-semibold text-purple-300">{aiEvaluation.provider || "Unknown"}</p>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-3">
                    <p className="text-xs text-slate-500">Model</p>
                    <p className="mt-1 font-semibold text-slate-200">{aiEvaluation.model || "Unknown"}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Selected: {evaluation.provider || "auto"} | Actual provider reflects the service that completed the evaluation.
                </p>
              </div>

              {/* AI Metadata */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-sm text-purple-300">
                  {aiEvaluation.provider || "Gemini"}
                </span>

                <span className="rounded-full bg-slate-800 px-3 py-1.5 text-sm text-slate-400">
                  {aiEvaluation.model || "AI Model"}
                </span>

                {aiEvaluation.evaluatedAt && (
                  <span className="text-xs text-slate-500">
                    Evaluated{" "}
                    {formatDate(aiEvaluation.evaluatedAt)}
                  </span>
                )}
              </div>

              {/* AI Winner */}
              {aiWinner && (
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="flex items-center gap-2 text-sm text-purple-300">
                        <Trophy size={16} />
                        AI Recommended Winner
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        {aiWinner.model}
                      </h3>
                    </div>

                    <div className="text-3xl font-bold text-purple-400">
                      {highestAIScore.toFixed(2)}
                      <span className="ml-1 text-sm text-slate-500">
                        /10
                      </span>
                    </div>
                  </div>

                  {aiEvaluation.winnerReason && (
                    <p className="mt-4 text-sm leading-6 text-slate-400">
                      {aiEvaluation.winnerReason}
                    </p>
                  )}
                </div>
              )}

              {/* Overall Analysis */}
              {aiEvaluation.overallAnalysis && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <Brain size={18} className="text-purple-400" />
                    Overall AI Analysis
                  </h3>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-400">
                    {aiEvaluation.overallAnalysis}
                  </p>
                </div>
              )}

              {/* AI Trust Notice */}
              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-indigo-400"
                />

                <p className="text-xs leading-5 text-slate-500">
                  AI-generated scores are recommendations and may
                  contain errors. Review the explanations and use
                  human judgment for important evaluations.
                </p>
              </div>
            </div>
          )}

          {/* No AI Evaluation Yet */}
          {!aiEvaluation && !aiLoading && !aiError && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-400">
                No AI evaluation has been performed yet.
                Click the button above to analyze the responses
                with your selected AI provider.
              </p>
            </div>
          )}
        </section>

        {/* Manual Comparison Summary */}
        {isCompleted && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3">
              <Star size={20} className="text-amber-400" />

              <h2 className="text-lg font-semibold">
                Manual Evaluation Summary
              </h2>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    Highest Scoring Model
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-emerald-400">
                    {evaluation.winner}
                  </h3>
                </div>

                <div className="text-3xl font-bold text-emerald-400">
                  {highestScore.toFixed(2)}

                  <span className="ml-1 text-sm text-slate-500">
                    /10
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Manual Score Button */}
        {!isCompleted && (
          <button
            onClick={() => navigate(`/evaluation/${id}/score`)}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-semibold transition hover:bg-indigo-500"
          >
            Evaluate Responses Manually
          </button>
        )}

      </div>
    </div>
  );
}