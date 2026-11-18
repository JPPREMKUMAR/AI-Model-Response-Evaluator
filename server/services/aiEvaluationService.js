const ai = require("../config/gemini");

const MODEL_NAME = "gemini-3.5-flash-lite";

const evaluationSchema = {
  type: "OBJECT",
  properties: {
    evaluations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          responseIndex: { type: "INTEGER" },
          accuracy: { type: "INTEGER" },
          relevance: { type: "INTEGER" },
          completeness: { type: "INTEGER" },
          instructionFollowing: { type: "INTEGER" },
          clarity: { type: "INTEGER" },
          explanation: { type: "STRING" },
          strengths: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          weaknesses: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: [
          "responseIndex",
          "accuracy",
          "relevance",
          "completeness",
          "instructionFollowing",
          "clarity",
          "explanation",
          "strengths",
          "weaknesses",
        ],
      },
    },
    overallAnalysis: { type: "STRING" },
    recommendedWinnerIndex: { type: "INTEGER" },
    winnerReason: { type: "STRING" },
  },
  required: [
    "evaluations",
    "overallAnalysis",
    "recommendedWinnerIndex",
    "winnerReason",
  ],
};

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const evaluateResponsesWithAI = async (prompt, responses) => {
  const formattedResponses = responses
    .map(
      (response, index) => `
RESPONSE ${index + 1}
Model: ${response.model}

Content:
${response.response}
`
    )
    .join("\n");

  const evaluationPrompt = `
You are an expert AI response evaluator.

Evaluate the AI responses based on the original user prompt.

ORIGINAL PROMPT:
${prompt}

RESPONSES:
${formattedResponses}

SCORING CRITERIA:

1. Accuracy: 1-10
   Evaluate factual correctness and reliability.

2. Relevance: 1-10
   Evaluate how directly the response answers the prompt.

3. Completeness: 1-10
   Evaluate whether the response covers all important aspects.

4. Instruction Following: 1-10
   Evaluate whether the response follows the user's instructions.

5. Clarity: 1-10
   Evaluate readability, organization, and understandable language.

IMPORTANT RULES:

- Score every criterion from 1 to 10.
- Do not favor a response because of its model name.
- Evaluate responses independently.
- Be fair and objective.
- Do not invent facts.
- Explain the reasoning for each response.
- Identify specific strengths and weaknesses.
- responseIndex must be zero-based.
- recommendedWinnerIndex must be zero-based.
- If responses are equally strong, choose the response that best fulfills the prompt.
- Return only valid JSON matching the requested schema.
`;

  let result;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: evaluationPrompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: evaluationSchema,
          temperature: 0.2,
        },
      });

      // Successful request: exit retry loop
      break;
    } catch (error) {
      const isTemporaryError = [
        429, // Rate limit
        500, // Internal server error
        503, // Service unavailable
      ].includes(error.status);

      // Don't retry permanent errors
      if (!isTemporaryError || attempt === maxAttempts) {
        throw error;
      }

      const delay = attempt * 3000;

      console.warn(
        `Gemini API temporarily unavailable. Attempt ${attempt}/${maxAttempts}. Retrying in ${delay / 1000} seconds...`
      );

      await sleep(delay);
    }
  }

  const responseText = result?.text;

  if (!responseText) {
    throw new Error("Gemini returned an empty response.");
  }

  let parsedResult;

  try {
    parsedResult = JSON.parse(responseText);
  } catch (error) {
    throw new Error("Gemini returned invalid JSON.");
  }

  return parsedResult;
};

module.exports = {
  evaluateResponsesWithAI,
};