import express from "express"
import authMiddleware from "../../middlewares/auth.middleware.js";
import { createInterviewController, deleteInterviewController, getAllInterviewsController, getInterviewByIdController, getInterviewResultController } from "./interview.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createInterviewController);
router.get("/", authMiddleware, getAllInterviewsController)
router.get("/:interviewId", authMiddleware, getInterviewByIdController);
router.get("/:interviewId/result",authMiddleware, getInterviewResultController);
router.delete("/:interviewId", authMiddleware, deleteInterviewController)

export default router;