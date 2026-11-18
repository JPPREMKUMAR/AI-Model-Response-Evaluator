
const Evaluation = require("../models/Evaluation");

// Create a new evaluation
const createEvaluation = async (req, res) => {
  try {
    const { prompt, responses, provider } = req.body;

    // Validate prompt
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid prompt is required.",
      });
    }

    // Validate responses
    if (!Array.isArray(responses) || responses.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least two responses are required.",
      });
    }

    // Validate AI provider
    const allowedProviders = ["auto", "gemini", "openai"];

    const selectedProvider = provider || "auto";

    if (!allowedProviders.includes(selectedProvider)) {
      return res.status(400).json({
        success: false,
        message: "Invalid AI provider selected.",
        allowedProviders,
      });
    }

    // Create evaluation
    const evaluation = await Evaluation.create({
      user: req.user._id,
      prompt: prompt.trim(),
      responses,
      provider: selectedProvider,
    });

    return res.status(201).json({
      success: true,
      message: "Evaluation created successfully!",
      evaluation,
    });
  } catch (error) {
    console.error("Create Evaluation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create evaluation.",
      error: error.message,
    });
  }
};

// Get all evaluations belonging to the logged-in user
const getEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: evaluations.length,
      evaluations,
    });
  } catch (error) {
    console.error("Get Evaluations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch evaluations.",
      error: error.message,
    });
  }
};

// Get a single evaluation belonging to the logged-in user
const getEvaluationById = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("Get Evaluation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch evaluation.",
      error: error.message,
    });
  }
};

// Delete an evaluation belonging to the logged-in user
const deleteEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Evaluation deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Evaluation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete evaluation.",
      error: error.message,
    });
  }
};

// Score an evaluation belonging to the logged-in user
const scoreEvaluation = async (req, res) => {
  try {
    const { scores } = req.body;

    const evaluation = await Evaluation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found.",
      });
    }

    // Validate scores array
    if (!Array.isArray(scores)) {
      return res.status(400).json({
        success: false,
        message: "Scores must be provided as an array.",
      });
    }

    // Ensure score count matches response count
    if (scores.length !== evaluation.responses.length) {
      return res.status(400).json({
        success: false,
        message: "Scores must match the number of responses.",
      });
    }

    // Evaluation criteria and weights
    const weights = {
      accuracy: 0.30,
      relevance: 0.20,
      completeness: 0.20,
      instructionFollowing: 0.20,
      clarity: 0.10,
    };

    const criteria = Object.keys(weights);

    // Calculate weighted scores
    for (let i = 0; i < evaluation.responses.length; i++) {
      const responseScores = scores[i];

      if (
        !responseScores ||
        typeof responseScores !== "object"
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid scores for response ${i + 1}.`,
        });
      }

      let totalScore = 0;

      for (const criterion of criteria) {
        const score = responseScores[criterion];

        // Validate score
        if (
          typeof score !== "number" ||
          !Number.isFinite(score) ||
          score < 1 ||
          score > 10
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid score for ${criterion}. Score must be between 1 and 10.`,
          });
        }

        totalScore += score * weights[criterion];
      }

      // Save individual criterion scores
      evaluation.responses[i].scores = responseScores;

      // Save weighted total
      evaluation.responses[i].totalScore = Number(
        totalScore.toFixed(2)
      );
    }

    // Determine winner
    const winnerResponse = evaluation.responses.reduce(
      (best, current) =>
        current.totalScore > best.totalScore
          ? current
          : best
    );

    evaluation.winner = winnerResponse.model;
    evaluation.status = "completed";

    // Save to MongoDB
    await evaluation.save();

    return res.status(200).json({
      success: true,
      message: "Evaluation scored successfully!",
      evaluation,
    });
  } catch (error) {
    console.error("Score Evaluation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to score evaluation.",
      error: error.message,
    });
  }
};

module.exports = {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  deleteEvaluation,
  scoreEvaluation,
};
