const {
  evaluateResponsesWithAI,
} = require("./aiEvaluationService");

const {
  evaluateResponsesWithOpenAI,
} = require("./openaiEvaluationService");

const evaluateWithProviders = async (
  prompt,
  responses,
  provider = "auto"
) => {
  // =========================================
  // GEMINI ONLY
  // =========================================
  if (provider === "gemini") {
    console.log("Using Gemini provider...");

    const result = await evaluateResponsesWithAI(
      prompt,
      responses
    );

    return {
      ...result,
      provider: "Gemini",
      model: "gemini-3.8-flash",
    };
  }

  // =========================================
  // OPENAI ONLY
  // =========================================
  if (provider === "openai") {
    console.log("Using OpenAI provider...");

    const result = await evaluateResponsesWithOpenAI(
      prompt,
      responses
    );

    return {
      ...result,
      provider: "OpenAI",
      model: "gpt-4o-mini",
    };
  }

  // =========================================
  // AUTO MODE: GEMINI → OPENAI FALLBACK
  // =========================================
  try {
    console.log("Attempting AI evaluation with Gemini...");

    const result = await evaluateResponsesWithAI(
      prompt,
      responses
    );

    return {
      ...result,
      provider: "Gemini",
      model: "gemini-3.8-flash",
    };
  } catch (geminiError) {
    console.error(
      "Gemini evaluation failed:",
      geminiError.message
    );

    // Fallback to OpenAI
    try {
      console.log("Switching to OpenAI fallback...");

      const result = await evaluateResponsesWithOpenAI(
        prompt,
        responses
      );

      return {
        ...result,
        provider: "OpenAI",
        model: "gpt-4o-mini",
      };
    } catch (openaiError) {
      console.error(
        "OpenAI evaluation failed:",
        openaiError.message
      );

      throw new Error(
        "AI evaluation failed with both Gemini and OpenAI. Please try again later."
      );
    }
  }
};

module.exports = {
  evaluateWithProviders,
};