import express, { Request, Response } from "express";
import { AppDatasource } from "./dataSource";
import router from "./routes/index";

export const app = express();
app.use(express.json());
app.use("/api", router);

async function main() {
  const PORT = 3000;
  await AppDatasource.initialize();
  app.listen(PORT, () => console.log(`running at http://localhost:${PORT}`));
}

main().catch(console.error);
