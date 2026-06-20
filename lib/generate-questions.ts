import OpenAI from "openai";
import { LEVEL_PROMPTS } from "@/lib/constants";
import type { GeneratedQuestion, Level } from "@/lib/types";

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function validateQuestions(data: unknown, count: number): GeneratedQuestion[] {
  if (!Array.isArray(data)) {
    throw new Error("Response is not an array");
  }

  if (data.length !== count) {
    throw new Error(`Expected ${count} questions, got ${data.length}`);
  }

  return data.map((item, i) => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.question !== "string" ||
      !Array.isArray(item.options) ||
      item.options.length !== 4 ||
      !item.options.every((o: unknown) => typeof o === "string") ||
      typeof item.correctIndex !== "number" ||
      item.correctIndex < 0 ||
      item.correctIndex > 3 ||
      typeof item.explanation !== "string"
    ) {
      throw new Error(`Invalid question at index ${i}`);
    }

    return {
      question: item.question,
      options: item.options,
      correctIndex: item.correctIndex,
      explanation: item.explanation,
    };
  });
}

export async function generateQuestions(
  topic: string,
  level: Level,
  count: number,
  avoid: string[] = []
): Promise<GeneratedQuestion[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  const levelGuidance = LEVEL_PROMPTS[level] ?? LEVEL_PROMPTS.adult;
  const avoidText = avoid.length > 0 ? avoid.join("; ") : "none";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";

  const prompt = `You are setting questions for a family quiz. Write ${count} multiple-choice questions on the topic "${topic}" at the "${level}" difficulty level (${levelGuidance}). Each question has exactly four options and exactly one unambiguously correct answer. The other three options must be clearly wrong but plausible. Keep questions and options short. Add a one-sentence explanation for each that states why the answer is correct, so the quiz master can verify it. Use British English. Only use well-established, verifiable facts. Prefer facts that do not change over time over facts that go out of date. For political or current-affairs topics, stick to settled historical facts and avoid anything that may have changed recently. Do not repeat any of these already-used questions: ${avoidText}. Return JSON only with shape {"questions":[{"question":"string","options":["string","string","string","string"],"correctIndex":0,"explanation":"string"}]}. No other text.`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model,
    max_tokens: 4000,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No text response from model");
  }

  const cleaned = stripMarkdownFences(content);
  const parsed = JSON.parse(cleaned) as { questions?: unknown };
  return validateQuestions(parsed.questions, count);
}
