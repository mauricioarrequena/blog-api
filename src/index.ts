import express, { Request, Response } from "express";
import dotnev from "dotenv";
import { AppDatasource } from "./dataSource";
import router from "./routes/index";
dotnev.config();

export const app = express();
app.use(express.json());
app.use("/api", router);

async function main() {
  const PORT: number = parseInt(process.env.PORT as string);
  await AppDatasource.initialize();
  app.listen(PORT, () => console.log(`running at http://localhost:${PORT}`));
}

main().catch(console.error);
