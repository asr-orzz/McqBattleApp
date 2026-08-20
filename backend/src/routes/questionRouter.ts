import { Router } from "express";
import prisma from "../prisma/client";
import { userMiddleware } from "../middleware/userMiddleware";
import { generateQuestionsFromTopic } from "../utils/generateQuestions";

export const questionRouter = Router();

questionRouter.use(userMiddleware);

questionRouter.post("/generate", async (req, res) => {
  const { topic, count } = req.body as { topic?: unknown; count?: unknown };

  if (typeof topic !== "string" || !topic.trim()) {
    res.status(400).json({ error: "Topic is required" });
    return;
  }

  const questionCount = Number(count);
  if (!Number.isInteger(questionCount)) {
    res.status(400).json({ error: "Number of questions must be a whole number between 1 and 15" });
    return;
  }

  try {
    const questions = await generateQuestionsFromTopic(topic.trim(), questionCount);
    res.status(200).json({ questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate questions";
    const status =
      message.includes("GROQ_API_KEY") || message.includes("not configured")
        ? 503
        : message.includes("must be an integer")
          ? 400
          : 500;
    console.error("Question generation failed:", message);
    res.status(status).json({ error: message });
  }
});

questionRouter.post("/create", async (req, res) => {
  const { question, explanation, gameId } = req.body;
  const userId = req.body.userId;

  if (!question || !explanation || !gameId) {
     res.status(400).json({ error: "Missing required fields" });
     return
  }

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
       res.status(404).json({ error: "Game not found" });
       return
    }

    if (game.userId !== userId) {
       res.status(403).json({ error: "Only the game creator can add questions" });
       return
    }

    const newQuestion = await prisma.question.create({
      data: {
        question,
        explanation,
        gameId,
      },
    });

     res.status(201).json(newQuestion);
     return
  } catch (err) {
    console.error(err);
     res.status(500).json({ error: "Failed to create question" });
     return
  }
});

questionRouter.get("/", async (req, res) => {
  const gameId = req.query.gameId as string;
  const userId = req.body.userId;

  if (!gameId) {
     res.status(400).json({ error: "Missing gameId" });
     return
  }

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
       res.status(404).json({ error: "Game not found" });
       return
    }

    if (game.userId !== userId) {
       res.status(403).json({ error: "Only the game owner can view the questions" });
       return
    }

    const questions = await prisma.question.findMany({
      where: { gameId: gameId },
    });

     res.json(questions);
     return
  } catch (err) {
    console.error(err);
     res.status(500).json({ error: "Failed to fetch questions" });
     return
  }
});

questionRouter.put("/:id", userMiddleware, async (req, res) => {
  const id = req.params.id as string;
  const { question, explanation } = req.body;
  const userId = req.body.userId;

  try {
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        game: true,
      },
    });

    if (!existingQuestion) {
       res.status(404).json({ error: "Question not found" });
       return
    }

    if (existingQuestion.game.userId !== userId) {
         res.status(403).json({ error: "Only the game owner can update the question" });
         return
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        question,
        explanation,
      },
    });

     res.json(updatedQuestion);
     return
  } catch (err) {
    console.error(err);
     res.status(500).json({ error: "Failed to update question" });
     return
  }
});

questionRouter.post("/delete/:id", userMiddleware, async (req, res) => {
  const id = req.params.id as string;
  const userId = req.body.userId;

  try {
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        game: true,
      },
    });

    if (!existingQuestion) {
       res.status(404).json({ error: "Question not found" });
       return
    }

    if (existingQuestion.game.userId !== userId) {
       res.status(403).json({ error: "Only the game owner can delete the question" });
       return
    }

    await prisma.question.delete({
      where: { id },
    });

     res.json({ message: "Question deleted successfully" });
     return
  } catch (err) {
    console.error(err);
     res.status(500).json({ error: "Failed to delete question" });
     return
  }
});
