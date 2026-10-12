import { evaluateAnswer, getQuestionById, submitAnswer } from "./question.service.js";
import { answerSchema } from "./question.validation.js"

export const submitAnswerController = async (req, res) => {
    try {
        const { answer } = answerSchema.parse(req.body);

        const question = await submitAnswer(
            req.params.questionId,
            answer
        );

        return res.status(200).json({
            success: true,
            message: "Answer evaluated Successfully",
            data: {
                question,
            },
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

export const getQuestionByIdController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { questionId } = req.params;

        const question = await getQuestionById(userId, questionId);

        return res.status(200).json({
            success: true,
            message: "Question fetched successfully.",
            data: {
                question,
            },
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const evaluateAnswerController = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { answer } = req.body;

        console.log("========== EVALUATE ANSWER ==========");
        console.log("Question ID:", questionId);
        console.log("Answer:", answer);
        console.log("User:", req.user);

        if (!answer || !answer.trim()) {
            return res.status(400).json({
                success: false,
                message: "Answer is required.",
            });
        }

        const question = await evaluateAnswer(
            req.user.id,
            questionId,
            answer.trim()
        );

        console.log("========== EVALUATED QUESTION ==========");
        console.log(question);

        return res.status(200).json({
            success: true,
            message: "Answer evaluated successfully.",
            data: {
                question,
            },
        });

    } catch (error) {
        console.error("========== EVALUATE ANSWER ERROR ==========");
        console.error(error);

        return res.status(400).json({
            success: false,
            message: "Failed to evaluate the answer",
            error: error.message,
        });
    }
};