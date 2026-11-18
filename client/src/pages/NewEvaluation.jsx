import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Brain,
} from "lucide-react";
import API from "../api/axios";

export default function NewEvaluation() {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");

  const [aiProvider, setAiProvider] = useState("auto");

  const [responses, setResponses] = useState([
    { model: "GPT-4", response: "" },
    { model: "Gemini", response: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add another model response
  const addResponse = () => {
    setResponses((current) => [
      ...current,
      { model: "", response: "" },
    ]);
  };

  // Remove model response
  const removeResponse = (index) => {
    setResponses((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  // Update model name or response
  const updateResponse = (index, field, value) => {
    setResponses((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  // Submit evaluation to backend
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    // Validate prompt
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    // Validate minimum responses
    if (responses.length < 2) {
      setError("At least two model responses are required.");
      return;
    }

    // Validate model names and responses
    const invalidResponse = responses.some(
      (item) => !item.model.trim() || !item.response.trim()
    );

    if (invalidResponse) {
      setError(
        "Please complete all model names and responses."
      );
      return;
    }

    try {
      setLoading(true);

      const evaluationData = {
        prompt: prompt.trim(),
        responses: responses.map((item) => ({
          model: item.model.trim(),
          response: item.response.trim(),
        })),
        provider: aiProvider,
      };

      const response = await API.post(
        "/evaluations",
        evaluationData
      );

      if (response.data.success) {
        setSuccess("Evaluation created successfully!");

        navigate("/", {
          state: {
            evaluationCreated: true,
            message: "Evaluation created successfully!",
          },
        });
      }
    } catch (err) {
      console.error("Evaluation creation failed:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "The server rejected the request."
        );
      } else if (err.request) {
        setError(
          "Cannot connect to the backend. Make sure your server is running on port 5000."
        );
      } else {
        setError(
          "Something went wrong while creating the evaluation."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-4xl">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          type="button"
          disabled={loading}
          className="mb-8 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-indigo-400">
            AI EVALUATION
          </p>

          <h1 className="text-3xl font-bold">
            New Evaluation
          </h1>

          <p className="mt-2 text-slate-400">
            Enter a prompt and add responses from different AI models.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            <AlertCircle
              size={20}
              className="mt-0.5 flex-shrink-0"
            />

            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
            <CheckCircle2
              size={20}
              className="mt-0.5 flex-shrink-0"
            />

            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-7"
        >

          {/* Prompt Section */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-4 text-lg font-semibold">
              Your Prompt
            </h2>

            <textarea
              required
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError("");
              }}
              placeholder="Enter the question or instruction you want to evaluate..."
              rows={5}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm outline-none placeholder:text-slate-500 focus:border-indigo-500 disabled:opacity-50"
            />

          </section>

          {/* AI Provider Section */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <Brain size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  AI Evaluation Provider
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Select the AI model that will evaluate your responses.
                </p>
              </div>
            </div>

            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="auto">
                Auto — Gemini with OpenAI Fallback
              </option>

              <option value="gemini">
                Google Gemini
              </option>

              <option value="openai">
                OpenAI
              </option>
            </select>

            {/* Provider Description */}
            <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">

              {aiProvider === "auto" && (
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-indigo-400">
                    Automatic mode:
                  </span>{" "}
                  Gemini will be used first. If it fails,
                  the system automatically switches to OpenAI.
                </p>
              )}

              {aiProvider === "gemini" && (
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-indigo-400">
                    Gemini mode:
                  </span>{" "}
                  Evaluations will be performed exclusively
                  using Google Gemini.
                </p>
              )}

              {aiProvider === "openai" && (
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-indigo-400">
                    OpenAI mode:
                  </span>{" "}
                  Evaluations will be performed exclusively
                  using OpenAI.
                </p>
              )}

            </div>

          </section>

          {/* Responses Section */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            {/* Header */}
            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold">
                  Model Responses
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Add at least two responses to compare.
                </p>
              </div>

              <button
                type="button"
                onClick={addResponse}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={16} />
                Add Model
              </button>

            </div>

            {/* Response Cards */}
            <div className="space-y-5">

              {responses.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >

                  {/* Card Header */}
                  <div className="mb-4 flex items-center justify-between">

                    <h3 className="font-medium">
                      Response {index + 1}
                    </h3>

                    {responses.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeResponse(index)}
                        disabled={loading}
                        className="text-slate-500 transition hover:text-red-400 disabled:opacity-50"
                        aria-label={`Remove response ${index + 1}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    )}

                  </div>

                  {/* Model Name */}
                  <input
                    required
                    value={item.model}
                    onChange={(e) =>
                      updateResponse(
                        index,
                        "model",
                        e.target.value
                      )
                    }
                    placeholder="Model name (e.g. GPT-4, Gemini)"
                    disabled={loading}
                    className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
                  />

                  {/* Model Response */}
                  <textarea
                    required
                    value={item.response}
                    onChange={(e) =>
                      updateResponse(
                        index,
                        "response",
                        e.target.value
                      )
                    }
                    placeholder="Paste the AI model response here..."
                    rows={5}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
                  />

                </div>
              ))}

            </div>

          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >

            {loading ? (
              <>
                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Saving Evaluation...
              </>
            ) : (
              "Create Evaluation"
            )}

          </button>

        </form>

      </div>
    </div>
  );
}