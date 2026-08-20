export type GeneratedOption = {
  option: string;
  isCorrect: boolean;
};

export type GeneratedQuestion = {
  question: string;
  explanation: string;
  options: GeneratedOption[];
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b";
const MIN_QUESTIONS = 1;
const MAX_QUESTIONS = 15;

export function clampQuestionCount(count: number) {
  if (!Number.isInteger(count) || count < MIN_QUESTIONS || count > MAX_QUESTIONS) {
    throw new Error(`Number of questions must be an integer between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}`);
  }
  return count;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("The model did not return valid JSON");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function messageText(message: {
  content?: string | null | Array<{ text?: string; content?: string }>;
  reasoning?: string | null;
}): string {
  const { content, reasoning } = message;
  if (typeof content === "string" && content.trim()) {
    return content;
  }
  if (Array.isArray(content)) {
    const joined = content
      .map((part) => (typeof part === "string" ? part : part.text || part.content || ""))
      .join("")
      .trim();
    if (joined) {
      return joined;
    }
  }
  if (typeof reasoning === "string" && reasoning.includes("{")) {
    return reasoning;
  }
  return "";
}

function normalizeQuestions(raw: unknown): GeneratedQuestion[] {
  const payload = raw as { questions?: unknown };
  if (!payload || !Array.isArray(payload.questions)) {
    throw new Error("The model response was missing a questions array");
  }

  const questions = payload.questions.map((item, index) => {
    const q = item as {
      question?: unknown;
      explanation?: unknown;
      options?: unknown;
      correctIndex?: unknown;
    };

    const questionText = typeof q.question === "string" ? q.question.trim() : "";
    const explanation = typeof q.explanation === "string" ? q.explanation.trim() : "";
    if (!questionText) {
      throw new Error(`Question ${index + 1} is missing text`);
    }

    let options: GeneratedOption[] = [];
    if (Array.isArray(q.options)) {
      options = q.options.map((opt, optIndex) => {
        if (typeof opt === "string") {
          return { option: opt.trim(), isCorrect: false };
        }
        const option = opt as { option?: unknown; isCorrect?: unknown };
        return {
          option: typeof option.option === "string" ? option.option.trim() : "",
          isCorrect: Boolean(option.isCorrect),
        };
      }).filter((opt) => opt.option);

      if (typeof q.correctIndex === "number" && options[q.correctIndex]) {
        options = options.map((opt, i) => ({ ...opt, isCorrect: i === q.correctIndex }));
      }
    }

    if (options.length < 2) {
      throw new Error(`Question ${index + 1} needs at least 2 options`);
    }

    const correctCount = options.filter((opt) => opt.isCorrect).length;
    if (correctCount === 0) {
      options[0].isCorrect = true;
    } else if (correctCount > 1) {
      let kept = false;
      options = options.map((opt) => {
        if (opt.isCorrect && !kept) {
          kept = true;
          return opt;
        }
        return { ...opt, isCorrect: false };
      });
    }

    return {
      question: questionText,
      explanation: explanation || "Review the topic notes to understand this answer.",
      options,
    };
  });

  if (questions.length === 0) {
    throw new Error("The model did not generate any questions");
  }

  return questions;
}

export async function generateQuestionsFromTopic(topic: string, count: number): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const questionCount = clampQuestionCount(count);
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  // Free-tier TPM is 8000. Keep max_tokens under that after prompt tokens,
  // but high enough for gpt-oss reasoning + JSON output.
  const body: Record<string, unknown> = {
    model,
    temperature: 0.3,
    max_tokens: 6000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'Return JSON only: {"questions":[{"question":"","explanation":"","options":[{"option":"","isCorrect":true},{"option":"","isCorrect":false},{"option":"","isCorrect":false},{"option":"","isCorrect":false}]}]}. Exactly 4 options and 1 correct answer per question.',
      },
      {
        role: "user",
        content: `Create ${questionCount} unique multiple-choice questions about: ${topic}. Cover different subtopics when possible.`,
      },
    ],
  };

  if (model.includes("gpt-oss")) {
    body.reasoning_effort = "low";
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Groq question generation failed:", response.status, errorBody);
    let detail = "Failed to generate questions from the language model";
    try {
      const parsed = JSON.parse(errorBody) as { error?: { message?: string; code?: string } };
      if (parsed.error?.code === "rate_limit_exceeded") {
        detail = "The AI rate limit was hit. Wait a few seconds and try fewer questions.";
      } else if (parsed.error?.message) {
        detail = parsed.error.message;
      }
    } catch {
      // keep default message
    }
    throw new Error(detail);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null | Array<{ text?: string; content?: string }>;
        reasoning?: string | null;
      };
    }>;
  };
  const content = data.choices?.[0]?.message ? messageText(data.choices[0].message) : "";
  if (!content) {
    throw new Error("The language model returned an empty response. Try again with fewer questions.");
  }

  return normalizeQuestions(extractJson(content)).slice(0, questionCount);
}
