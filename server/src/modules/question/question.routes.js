import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { evaluateAnswerController, getQuestionByIdController, submitAnswerController } from "./question.controller.js";

const router = express.Router();

router.post("/:questionId/answer", authMiddleware, submitAnswerController);
router.get("/:questionId", authMiddleware, getQuestionByIdController);
router.patch("/:questionId/answer",authMiddleware,evaluateAnswerController)

export default router;