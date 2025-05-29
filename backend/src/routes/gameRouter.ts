import { Router } from "express";
import prisma from "../prisma/client";
import { userMiddleware } from "../middleware/userMiddleware";
import pusher from "../utils/pusher";

export const gameRouter = Router();

gameRouter.get("/", async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        user: true
      }
    });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

gameRouter.post("/create", userMiddleware, async (req, res) => {
  const { game, userId } = req.body;

  if (!game || !userId) {
     res.status(400).json({ error: "Missing game name or userId" });
     return;
  }

  try {
    const newGame = await prisma.game.create({
      data: {
        game,
        userId
      },
      include: {
        user: true,
        players: true,
      },
    });

    await pusher.trigger("games", "new-game", {
      id: newGame.id,
      game: newGame.game,
      creator: newGame.user.username,
      status: newGame.status,
      createdAt: new Date(),
    });

     res.status(201).json(newGame);
     return;
  } catch (error) {
    console.error("Error creating game:", error);
     res.status(500).json({ error: "Failed to create game" });
     return
  }
});

gameRouter.post("/join-request", userMiddleware, async (req, res) => {
  const { gameId, userId } = req.body;

  if (!gameId || !userId) {
     res.status(400).json({ error: "Missing gameId or userId" });
     return
  }

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { user: true },
    });

    if (!game) {
       res.status(404).json({ error: "Game not found" });
       return
    }
    if (game.userId === userId) {
      res.status(403).json({ error: "Owner cannot join the game as a player" });
      return
    }

    await pusher.trigger(`game-${gameId}`, "join-request", {
      gameId: game.id,
      requesterId: userId
    });

     res.status(200).json({ message: "Join request sent to the game owner" });
     return
  } catch (error) {
    console.error("Join request error:", error);
     res.status(500).json({ error: "Internal server error" });
     return
  }
});

gameRouter.post("/accept-request", userMiddleware, async (req, res) => {
  const { gameId, requesterId } = req.body;

  if (!gameId || !requesterId) {
       res.status(400).json({ error: "Missing gameId or requesterId" });
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

    if (req.body.userId !== game.userId) {
       res.status(403).json({ error: "Only the game owner can accept join requests" });
       return
    }

    const existingPlayer = await prisma.player.findFirst({
      where: {
        gameId: gameId,
        userId: requesterId,
      },
    });

    if (existingPlayer) {
       res.status(400).json({ error: "User is already a player in this game" });
       return
    }

    await prisma.player.create({
      data: {
        gameId: gameId,
        userId: requesterId,
      },
    });
    await pusher.trigger(`user-${requesterId}`, "join-accepted", {
      gameId: gameId,
    });

     res.status(200).json({ message: "User successfully added to game" });
     return
  } catch (error) {
    console.error("Accept request error:", error);
    res.status(500).json({ error: "Internal server error" });
    return
  }
});

gameRouter.post("/my-games", userMiddleware, async (req, res) => {
  try {
    const userId = req.body.userId;

    const myGames = await prisma.game.findMany({
      where: {
        userId, 
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        questions: {
          select: {
            id: true,
            question: true,
          },
        },
        answers: {
          select: {
            id: true,
            userId: true,
            questionId: true,
            optionId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ games: myGames });
  } catch (error) {
    console.error("Error fetching my games:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

gameRouter.delete("/delete/:gameId", userMiddleware, async (req, res) => {
  const gameId = req.params.gameId;
  const userId = req.body.userId; 

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

    if (game.userId !== userId) {
       res.status(403).json({ error: "Only the game creator can delete this game" });
       return
    }


    await prisma.player.deleteMany({ where: { gameId } });
    await prisma.userAnswer.deleteMany({ where: { gameId } });
    await prisma.question.deleteMany({ where: { gameId } });

    await prisma.game.delete({
      where: { id: gameId },
    });

    await pusher.trigger("games", "game-deleted", { gameId });

     res.status(200).json({ message: "Game deleted successfully" });
     return
  } catch (error) {
    console.error("Error deleting game:", error);
     res.status(500).json({ error: "Internal server error" });
     return
  }
});
