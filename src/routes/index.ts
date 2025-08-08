import { Router } from "express";
import authenticationRouter from "./authenticationRoutes";

const router = Router();
router.use("/authentication", authenticationRouter);
export default router;
