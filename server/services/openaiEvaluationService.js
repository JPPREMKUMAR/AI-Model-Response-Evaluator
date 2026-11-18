const openai = require("../config/openai");

const MODEL_NAME = "gpt-4o-mini";

const evaluateResponsesWithOpenAI = async (prompt, responses) => {
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
- Return valid JSON only.
`;

  const response = await openai.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      {
        role: "system",
        content:
          "You are an impartial AI response evaluation expert. Return only valid JSON.",
      },
      {
        role: "user",
        content: evaluationPrompt,
      },
    ],
    response_format: {
      type: "json_object",
    },
    temperature: 0.2,
  });

  const responseText = response.choices[0]?.message?.content;

  if (!responseText) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsedResult = JSON.parse(responseText);

  return parsedResult;
};

module.exports = {
  evaluateResponsesWithOpenAI,
};