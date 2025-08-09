import { Router } from "express";
import authenticationRouter from "./authenticationRoutes";
import postRouter from "./postRoutes";

const router = Router();
router.use("/authentication", authenticationRouter);
router.use("/posts", postRouter);
export default router;
