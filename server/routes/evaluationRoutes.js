
const express = require("express");
const router = express.Router();

const {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  deleteEvaluation,
  scoreEvaluation,
} = require("../controllers/evaluationController");

const {
  evaluateWithAI,
} = require("../controllers/aiEvaluationController");


const { protect } = require("../middleware/authMiddleware");

// All evaluation routes require authentication
router.use(protect);

// Routes
router.post("/", createEvaluation);
router.get("/", getEvaluations);
router.get("/:id", getEvaluationById);
router.delete("/:id", deleteEvaluation);
router.put("/:id/score", scoreEvaluation);
router.post("/:id/ai-evaluate", evaluateWithAI);

module.exports = router;