import { Router } from "express";
import prisma from "../prisma/client";
import { userMiddleware } from "../middleware/userMiddleware";

export const questionRouter = Router();

questionRouter.use(userMiddleware);

questionRouter.post("/create", async (req, res) => {
  const { question, explanation, gameId } = req.body;

  try {
    const newQuestion = await prisma.question.create({
      data: {
        question,
        explanation,
        gameId,
      },
    });

    res.status(201).json(newQuestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create question" });
  }
});

questionRouter.get("/", async (req, res) => {
  const { gameId } = req.query;

  try {
    const questions = await prisma.question.findMany({
      where: gameId ? { gameId: String(gameId) } : {},
    });

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

questionRouter.get("/:id", async (req, res) => {

  const { id } = req.params;

  try {
    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
         res.status(404).json({ error: "Question not found" });
         return
    }

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

questionRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { question, explanation } = req.body;

  try {
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        question,
        explanation,
      },
    });

    res.json(updatedQuestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update question" });
  }
});

questionRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.question.delete({
      where: { id },
    });

    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete question" });
  }
});
