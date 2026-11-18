
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Trophy,
  CheckCircle2,
  Save,
} from "lucide-react";

import API from "../api/axios";

const criteria = [
  {
    key: "accuracy",
    label: "Accuracy",
    description: "Is the information factually correct?",
    weight: 30,
  },
  {
    key: "relevance",
    label: "Relevance",
    description: "Does the response address the prompt?",
    weight: 20,
  },
  {
    key: "completeness",
    label: "Completeness",
    description: "Does it cover all required information?",
    weight: 20,
  },
  {
    key: "instructionFollowing",
    label: "Instruction Following",
    description: "Does it follow all user instructions?",
    weight: 20,
  },
  {
    key: "clarity",
    label: "Clarity",
    description: "Is the response easy to understand?",
    weight: 10,
  },
];

export default function ScoreEvaluation() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [evaluation, setEvaluation] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch evaluation
  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await API.get(`/evaluations/${id}`);

        const data = response.data.evaluation;

        setEvaluation(data);

        setScores(
          data.responses.map((response) => ({
            accuracy: response.scores?.accuracy || 0,
            relevance: response.scores?.relevance || 0,
            completeness: response.scores?.completeness || 0,
            instructionFollowing:
              response.scores?.instructionFollowing || 0,
            clarity: response.scores?.clarity || 0,
          }))
        );
      } catch (err) {
        console.error(err);

        setError("Failed to load evaluation.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [id]);

  // Update score
  const updateScore = (responseIndex, criterion, value) => {
    setScores((current) =>
      current.map((item, index) =>
        index === responseIndex
          ? {
              ...item,
              [criterion]: Number(value),
            }
          : item
      )
    );
  };

  // Calculate weighted score
  const calculateTotal = (responseScores) => {
    return criteria.reduce(
      (total, criterion) =>
        total +
        responseScores[criterion.key] *
          (criterion.weight / 100),
      0
    );
  };

  // Submit scores
  const handleSubmit = async () => {
    setError("");

    const incomplete = scores.some((responseScores) =>
      criteria.some(
        (criterion) =>
          responseScores[criterion.key] < 1 ||
          responseScores[criterion.key] > 10
      )
    );

    if (incomplete) {
      setError("Please score every criterion from 1 to 10.");
      return;
    }

    try {
      setSaving(true);

      const response = await API.put(
        `/evaluations/${id}/score`,
        {
          scores,
        }
      );

      if (response.data.success) {
        navigate(`/evaluation/${id}`);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to save evaluation scores."
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  // Error
  if (error && !evaluation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="text-center">
          <AlertCircle
            size={36}
            className="mx-auto mb-4 text-red-400"
          />

          <p>{error}</p>

          <button
            onClick={() => navigate("/")}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          onClick={() => navigate(`/evaluation/${id}`)}
          className="mb-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Evaluation
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-indigo-400">
            MANUAL EVALUATION
          </p>

          <h1 className="text-3xl font-bold">
            Score Model Responses
          </h1>

          <p className="mt-2 text-slate-400">
            Evaluate each response using the five scoring criteria.
          </p>
        </div>

        {/* Prompt */}
        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-3 font-semibold">
            Evaluation Prompt
          </h2>

          <p className="whitespace-pre-wrap leading-7 text-slate-300">
            {evaluation.prompt}
          </p>

        </section>

        {/* Scoring Criteria */}
        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Scoring Criteria
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

            {criteria.map((criterion) => (
              <div
                key={criterion.key}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >

                <h3 className="font-medium">
                  {criterion.label}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {criterion.description}
                </p>

                <div className="mt-3 text-sm font-semibold text-indigo-400">
                  Weight: {criterion.weight}%
                </div>

              </div>
            ))}

          </div>

        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            <AlertCircle size={20} />

            <p>{error}</p>
          </div>
        )}

        {/* Responses */}
        <div className="space-y-8">

          {evaluation.responses.map((response, responseIndex) => (

            <section
              key={responseIndex}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >

              {/* Header */}
              <div className="mb-6 flex items-center justify-between">

                <div>
                  <p className="text-xs text-slate-500">
                    RESPONSE {responseIndex + 1}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {response.model}
                  </h2>
                </div>

                <div className="rounded-xl bg-indigo-500/10 px-4 py-3 text-center">

                  <p className="text-xs text-slate-400">
                    Weighted Score
                  </p>

                  <p className="mt-1 text-xl font-bold text-indigo-400">
                    {calculateTotal(scores[responseIndex]).toFixed(2)}
                    <span className="ml-1 text-sm text-slate-500">
                      /10
                    </span>
                  </p>

                </div>

              </div>

              {/* Response */}
              <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950 p-5">

                <h3 className="mb-3 text-sm font-medium text-slate-400">
                  AI Response
                </h3>

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {response.response}
                </p>

              </div>

              {/* Criteria */}
              <div className="space-y-6">

                {criteria.map((criterion) => (

                  <div key={criterion.key}>

                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <h3 className="font-medium">
                          {criterion.label}
                        </h3>

                        <p className="text-xs text-slate-500">
                          {criterion.description}
                        </p>
                      </div>

                      <div className="text-sm text-indigo-400">
                        Weight: {criterion.weight}%
                      </div>

                    </div>

                    {/* Score Buttons */}
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">

                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                        (number) => {

                          const selected =
                            scores[responseIndex][criterion.key] ===
                            number;

                          return (
                            <button
                              key={number}
                              type="button"
                              onClick={() =>
                                updateScore(
                                  responseIndex,
                                  criterion.key,
                                  number
                                )
                              }
                              className={`rounded-lg border py-3 text-sm font-medium transition ${
                                selected
                                  ? "border-indigo-500 bg-indigo-600 text-white"
                                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-indigo-500 hover:text-white"
                              }`}
                            >
                              {number}
                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                ))}

              </div>

            </section>

          ))}

        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >

          {saving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving Scores...
            </>
          ) : (
            <>
              <Save size={20} />
              Submit Evaluation Scores
            </>
          )}

        </button>

      </div>
    </div>
  );
}
