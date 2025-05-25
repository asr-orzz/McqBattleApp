import { Router } from "express";
import prisma from "../prisma/client";
import { userMiddleware } from "../middleware/userMiddleware";
import pusher from "../utils/pusher";

export const playerRouter = Router();


playerRouter.post("/player-answer", userMiddleware, async (req, res) => {
  const { gameId, userId, questionId, optionId } = req.body;

  if (!gameId || !userId || !questionId || !optionId) {
     res.status(400).json({ error: "Missing required fields" });
     return
  }

  try {
    const player = await prisma.player.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
    });

    if (!player) {
       res.status(403).json({ error: "User is not a player in this game" });
       return
    }
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game || game.status !== "STARTED") {
         res.status(403).json({ error: "Game is not currently active" });
         return
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!question || question.gameId !== gameId) {
       res.status(400).json({ error: "Invalid question for this game" });
       return
    }

    const selectedOption = question.options.find(opt => opt.id === optionId);
    if (!selectedOption) {
       res.status(400).json({ error: "Invalid option for this question" });
       return
    }

    const existingAnswer = await prisma.userAnswer.findFirst({
      where: {
        userId,
        questionId,
      },
    });

    if (existingAnswer) {
       res.status(400).json({ error: "User already answered this question" });
       return
    }

    await prisma.userAnswer.create({
      data: {
        userId,
        gameId,
        questionId,
        optionId,
      },
    });

    let updatedScore = player.score;
    let isCorrect = selectedOption.isCorrect;

    if (isCorrect) {
      const updatedPlayer = await prisma.player.update({
        where: {
          userId_gameId: { userId, gameId },
        },
        data: {
          score: {
            increment: 1,
          },
        },
      });
      updatedScore = updatedPlayer.score;
    }

    await pusher.trigger(`game-${gameId}`, "player-answered", {
      userId,
      questionId,
      isCorrect,
      newScore: updatedScore,
    });

     res.status(200).json({
      message: "Answer recorded",
      isCorrect,
      newScore: updatedScore,
    });
    return
  } catch (error) {
    console.error("Error in player-answer:", error);
     res.status(500).json({ error: "Internal server error" });
     return
  }
});

playerRouter.post("/player-leave", userMiddleware, async (req, res) => {
  const { gameId, userId } = req.body;

  if (!gameId || !userId) {
     res.status(400).json({ error: "Missing gameId or userId" });
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

    if (game.userId === userId) {
       res.status(403).json({ error: "Game owner cannot leave the game" });
       return
    }

    const player = await prisma.player.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
    });

    if (!player) {
       res.status(400).json({ error: "User is not a player in this game" });
       return
    }

    await prisma.player.delete({
      where: {
        userId_gameId: { userId, gameId },
      },
    });

    await pusher.trigger(`game-${gameId}`, "player-left", {
      userId,
      gameId,
    });

     res.status(200).json({ message: "Player left the game" });
     return
  } catch (error) {
    console.error("Leave game error:", error);
     res.status(500).json({ error: "Internal server error" });
     return
  }
});
