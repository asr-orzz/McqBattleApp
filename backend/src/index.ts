import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import { userRouter } from './routes/userRouter';
import { gameRouter } from "./routes/gameRouter";
import { questionRouter } from "./routes/questionRouter";
import { optionRouter } from "./routes/optionRouter";

const app = express();
app.use(express.json());

app.use("/api/v1/users",userRouter);
app.use("/api/v1/games",gameRouter);
app.use("/api/v1/questions",questionRouter);
app.use("/api/v1/options",optionRouter);

function main(){
  app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
  });
}

main();