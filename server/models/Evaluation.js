
const mongoose = require("mongoose");

// Individual AI response schema
const responseSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
    trim: true,
  },

  response: {
    type: String,
    required: true,
  },

  scores: {
    accuracy: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    completeness: { type: Number, default: 0 },
    instructionFollowing: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
  },

  totalScore: {
    type: Number,
    default: 0,
  },
});

// AI-generated evaluation for individual responses
const aiResponseEvaluationSchema = new mongoose.Schema(
  {
    responseIndex: {
      type: Number,
      required: true,
    },

    accuracy: {
      type: Number,
      required: true,
    },

    relevance: {
      type: Number,
      required: true,
    },

    completeness: {
      type: Number,
      required: true,
    },

    instructionFollowing: {
      type: Number,
      required: true,
    },

    clarity: {
      type: Number,
      required: true,
    },

    totalScore: {
      type: Number,
      default: 0,
    },

    explanation: {
      type: String,
      default: "",
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

// Complete AI evaluation schema
const aiEvaluationSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["Gemini", "OpenAI"],
      default: "Gemini",
    },

    model: {
      type: String,
      default: "",
    },

    evaluations: {
      type: [aiResponseEvaluationSchema],
      default: [],
    },

    overallAnalysis: {
      type: String,
      default: "",
    },

    recommendedWinnerIndex: {
      type: Number,
      default: null,
    },

    winnerReason: {
      type: String,
      default: "",
    },

    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Main evaluation schema
const evaluationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    prompt: {
      type: String,
      required: true,
      trim: true,
    },

    // Selected AI provider
    provider: {
      type: String,
      enum: ["auto", "gemini", "openai"],
      default: "auto",
    },

    responses: {
      type: [responseSchema],
      validate: {
        validator: (responses) => responses.length >= 2,
        message: "At least two AI responses are required.",
      },
    },

    winner: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    aiEvaluation: {
      type: aiEvaluationSchema,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evaluation", evaluationSchema);
