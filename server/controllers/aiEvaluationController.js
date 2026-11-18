const Evaluation = require("../models/Evaluation");

const {
  evaluateWithProviders,
} = require("../services/aiProviderService");

const calculateWeightedScore = (scores) => {
  return (
    scores.accuracy * 0.3 +
    scores.relevance * 0.2 +
    scores.completeness * 0.2 +
    scores.instructionFollowing * 0.2 +
    scores.clarity * 0.1
  );
};

const evaluateWithAI = async (req, res) => {
  try {
    const { id } = req.params;

    // Safely get provider from request body
  const provider =
  req.body?.provider ||
  evaluation.provider ||
  "auto";

    // Validate provider
    const allowedProviders = [
      "auto",
      "gemini",
      "openai",
    ];

    if (!allowedProviders.includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "Invalid AI provider selected.",
        allowedProviders,
      });
    }

    // Find evaluation belonging to authenticated user
    const evaluation = await Evaluation.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found.",
      });
    }

    // Validate responses
    if (
      !evaluation.responses ||
      evaluation.responses.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "At least two responses are required.",
      });
    }

    // Run AI evaluation
    console.log(`Selected AI provider: ${provider}`);

    const aiResult = await evaluateWithProviders(
      evaluation.prompt,
      evaluation.responses,
      provider
    );

    // Validate AI result exists
    if (!aiResult || typeof aiResult !== "object") {
      return res.status(500).json({
        success: false,
        message: "AI provider returned an empty result.",
      });
    }

    // Validate evaluations array
    if (
      !Array.isArray(aiResult.evaluations) ||
      aiResult.evaluations.length !==
        evaluation.responses.length
    ) {
      return res.status(500).json({
        success: false,
        message: "AI returned an invalid evaluation structure.",
      });
    }

    // Validate individual scores
    const processedEvaluations =
      aiResult.evaluations.map((result, index) => {
        const requiredScores = [
          "accuracy",
          "relevance",
          "completeness",
          "instructionFollowing",
          "clarity",
        ];

        const invalidScores = requiredScores.some(
          (key) =>
            typeof result[key] !== "number" ||
            result[key] < 1 ||
            result[key] > 10
        );

        if (invalidScores) {
          throw new Error(
            `AI returned invalid scores for response ${index + 1}.`
          );
        }

        const scores = {
          accuracy: result.accuracy,
          relevance: result.relevance,
          completeness: result.completeness,
          instructionFollowing:
            result.instructionFollowing,
          clarity: result.clarity,
        };

        const totalScore =
          calculateWeightedScore(scores);

        return {
          ...result,
          totalScore: Number(
            totalScore.toFixed(2)
          ),
        };
      });

    // Validate winner index
    const winnerIndex =
      aiResult.recommendedWinnerIndex;

    if (
      !Number.isInteger(winnerIndex) ||
      winnerIndex < 0 ||
      winnerIndex >= evaluation.responses.length
    ) {
      return res.status(500).json({
        success: false,
        message: "AI returned an invalid winner index.",
      });
    }

    // Validate provider information
    if (!aiResult.provider || !aiResult.model) {
      return res.status(500).json({
        success: false,
        message: "AI provider information is missing.",
      });
    }

    // Save AI evaluation to MongoDB
    evaluation.aiEvaluation = {
      provider: aiResult.provider,
      model: aiResult.model,
      evaluations: processedEvaluations,
      overallAnalysis: aiResult.overallAnalysis,
      recommendedWinnerIndex: winnerIndex,
      winnerReason: aiResult.winnerReason,
      evaluatedAt: new Date(),
    };

    await evaluation.save();

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "AI evaluation completed and saved successfully.",
      evaluationId: evaluation._id,
      selectedProvider: provider,
      actualProvider: aiResult.provider,
      aiEvaluation: evaluation.aiEvaluation,
    });
  } catch (error) {
    console.error("AI Evaluation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to evaluate responses using AI.",
      error: error.message,
    });
  }
};

module.exports = {
  evaluateWithAI,
};