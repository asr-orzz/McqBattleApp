import { Router } from "express";
import prisma from "../prisma/client"

export const gameRouter = Router();

gameRouter.get("/", async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        user: true,
        questions: {
          include: {
            options: true
          }
        }
      }
    });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

gameRouter.post("/create", async (req, res) => {
  const { game, userId } = req.body;

  if (!game || !userId) {
     res.status(400).json({ error: "Missing game name or userId" });
     return
  }

  try {
    const newGame = await prisma.game.create({
      data: {
        game,
        userId
      }
    });
    res.status(201).json(newGame);
  } catch (error) {
    res.status(500).json({ error: "Failed to create game" });
  }
});

gameRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { game } = req.body;

  try {
    const updatedGame = await prisma.game.update({
      where: { id },
      data: { game }
    });
    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ error: "Failed to update game" });
  }
});

gameRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.game.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete game" });
  }
});
