import { Router } from "express";
import prisma from "../prisma/client";
import { userMiddleware } from "../middleware/userMiddleware";

export const optionRouter = Router();

optionRouter.use(userMiddleware);

optionRouter.post("/create", async (req, res) => {
  const { option, isCorrect, questionId } = req.body;

  try {
    const newOption = await prisma.option.create({
      data: {
        option,
        isCorrect,
        questionId,
      },
    });

    res.status(201).json(newOption);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create option" });
  }
});

optionRouter.get("/", async (req, res) => {
  const { questionId } = req.query;

  try {
    const options = await prisma.option.findMany({
      where: questionId ? { questionId: String(questionId) } : {},
    });

    res.json(options);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch options" });
  }
});

optionRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const option = await prisma.option.findUnique({
      where: { id },
    });

    if (!option) {
       res.status(404).json({ error: "Option not found" });
       return
    }

    res.json(option);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch option" });
  }
});

optionRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { option, isCorrect } = req.body;

  try {
    const updatedOption = await prisma.option.update({
      where: { id },
      data: {
        option,
        isCorrect,
      },
    });

    res.json(updatedOption);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update option" });
  }
});

optionRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.option.delete({
      where: { id },
    });

    res.json({ message: "Option deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete option" });
  }
});


