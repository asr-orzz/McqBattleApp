import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import { userRouter } from './routes/user';
import { gameRouter } from "./routes/game";
const app = express();
app.use(express.json());

app.use("/api/v1/user",userRouter);
app.use("/api/v1/user/games",gameRouter);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
