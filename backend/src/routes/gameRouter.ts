import { Router } from "express";
import prisma from "../prisma/client"
import { userMiddleware } from "../middleware/userMiddleware";
import { GameStatus } from "../../prisma/prisma/generated/prisma";


export const gameRouter = Router();

gameRouter.get("/",async (req, res) => {
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


gameRouter.post("/:id/join", userMiddleware, async (req, res) => {
  const { id: gameId } = req.params;
  const { userId } = req.body;

  if (!userId) {
     res.status(400).json({ error: "Missing userId in request body" });
     return
  }

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true }
    });

    if (!game) {
       res.status(404).json({ error: "Game not found" });
       return
    }

    const alreadyJoined = game.players.some(player => player.id === userId);
    if (alreadyJoined) {
       res.status(400).json({ error: "User already joined this game" });
       return
    }

    await prisma.game.update({
      where: { id: gameId },
      data: {
        players: {
          connect: { id: userId }
        }
      }
    });

    res.status(200).json({ message: "User joined the game successfully" });
  } catch (error) {
    console.error("Join game error:", error);
    res.status(500).json({ error: "Failed to join game" });
  }
});

gameRouter.post("/:id/leave", userMiddleware, async (req, res) => {
  const { id: gameId } = req.params;
  const { userId } = req.body;

  if (!userId) {
     res.status(400).json({ error: "Missing userId in request body" });
     return;
  }

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true }
    });

    if (!game) {
       res.status(404).json({ error: "Game not found" });
       return;
    }

    const isPlayer = game.players.some(player => player.id === userId);
    if (!isPlayer) {
       res.status(400).json({ error: "User is not part of this game" });
       return
    }

    await prisma.game.update({
      where: { id: gameId },
      data: {
        players: {
          disconnect: { id: userId }
        }
      }
    });

    res.status(200).json({ message: "User left the game successfully" });
  } catch (error) {
    console.error("Leave game error:", error);
    res.status(500).json({ error: "Failed to leave game" });
  }
});


gameRouter.patch("/:id/status", userMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!Object.values(GameStatus).includes(status)) {
    res.status(400).json({ error: "Invalid status value" });
    return
  }

  try {
    const updatedGame = await prisma.game.update({
      where: { id },
      data: { status },
    });
    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ error: "Failed to update game status" });
  }
});

gameRouter.post("/create",userMiddleware, async (req, res) => {
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

gameRouter.put("/:id",userMiddleware, async (req, res) => {
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

gameRouter.delete("/:id",userMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.game.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete game" });
  }
});
