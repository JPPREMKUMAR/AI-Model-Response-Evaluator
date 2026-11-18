const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const evaluationRoutes = require("./routes/evaluationRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Model Response Evaluator API is running!",
  });
});

// Routes
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/auth", authRoutes);

// Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
};

startServer();