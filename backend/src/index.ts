import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from 'express';
import { userRouter } from './routes/userRouter';
import { gameRouter } from "./routes/gameRouter";
import { questionRouter } from "./routes/questionRouter";
import { optionRouter } from "./routes/optionRouter";
import { playerRouter } from "./routes/playerRouter";
import { playerRequestRouter } from "./routes/playerRequest";

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://mcq-battle-app.vercel.app",
  credentials: true
}));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/games", gameRouter);
app.use("/api/v1/questions", questionRouter);
app.use("/api/v1/options", optionRouter);
app.use("/api/v1/players", playerRouter);
app.use("/api/v1/playerRequest", playerRequestRouter);

app.get("/health", (req, res) => {
  res
    .set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS"
    })
    .status(200)
    .json({ status: "ok" });
});

function main() {
  const port = Number(process.env.PORT) || 3001;
  const server = app.listen(port);
  server.on("listening", () => {
    console.log(`Server is running on port ${port}`);
  });
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the other process or set PORT.`);
    } else {
      console.error(`Failed to start server on port ${port}:`, err.message);
    }
    process.exit(1);
  });
}

main();
