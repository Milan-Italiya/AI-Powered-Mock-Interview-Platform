import Interview from "../../models/interview.model.js"
import Question from "../../models/question.model.js"
import { evaluateAnswer as evaluateAnswerAI } from "../ai/ai.service.js"
import { createNotification } from "../notification/notification.service.js"

export const createQuestions = async (interviewId, questions) => {
    const questionDocs = questions.map((item, index) => ({
        interview: interviewId,
        question: item.question,
        order: index + 1,
    }))

    return await Question.insertMany(questionDocs)
}

export const submitAnswer = async (questionId, answer) => {

    console.log("Question ID:", questionId);
    const question = await Question.findById(questionId);
    console.log("Question:", question);
    if (!question) {
        throw new Error("Question not found.")
    }

    console.log("Interview ID from Question:", question.interview);
    const interview = await Interview.findById(question.interview);
    console.log("Interview:", interview);
    if (!interview) {
        throw new Error("Interview not found.");
    }

    const evaluation = await evaluateAnswer({
        question: question.question,
        answer,
        role: interview.role,
        difficulty: interview.difficulty,
    })

    question.answer = answer;
    question.feedback = evaluation.feedback;
    question.score = evaluation.score;
    question.strengths = evaluation.strengths;
    question.weakTopics = evaluation.weakTopics;
    question.status = "Evaluated";

    await question.save();

    return question;
}

export const getQuestionById = async (userId, questionId) => {
    console.log("Logged-in User ID:", userId);
    const question = await Question.findById(questionId);
    console.log("Question:", question);

    if (!question) {
        throw new Error("Question not found.")
    }

    const interview = await Interview.findById(question.interview);

    console.log("Interview:", interview);

    if (!interview) {
        throw new Error("Interview not found.");
    }

    if (interview.user.toString() !== userId.toString()) {
        throw new Error("Unauthorized access.");
    }

    return question
}

export const evaluateAnswer = async (
    userId,
    questionId,
    answer
) => {
    const question = await Question.findById(questionId);

    if (!question) {
        throw new Error("Question not found.");
    }

    const interview = await Interview.findById(question.interview);

    if (!interview) {
        throw new Error("Interview not found.");
    }

    // Check ownership
    if (interview.user.toString() !== userId.toString()) {
        throw new Error("Unauthorized access.");
    }

    // Evaluate answer using AI
    const evaluation = await evaluateAnswerAI({
        question: question.question,
        answer,
        role: interview.role,
        difficulty: interview.difficulty,
    });

    // Save evaluation
    question.answer = answer;
    question.score = evaluation.score;
    question.feedback = evaluation.feedback;
    question.strengths = evaluation.strengths || [];
    question.weakTopics = evaluation.weakTopics || [];
    question.status = "Evaluated";

    await question.save();

    // Check whether all questions are evaluated
    const totalQuestions = await Question.countDocuments({
        interview: interview._id,
    });

    const evaluatedQuestions = await Question.countDocuments({
        interview: interview._id,
        status: "Evaluated",
    });

    // Create evaluation notification
    try {
        await createNotification({
            user: userId,
            title: "Answer Evaluated",
            message: `Your answer for "${interview.title}" has been evaluated.`,
            type: "evaluation",
            relatedId: interview._id,
        });
    } catch (notificationError) {
        console.error(
            "Create Evaluation Notification Error:",
            notificationError
        );
    }

    // If all questions are evaluated, complete the interview
    if (
        totalQuestions > 0 &&
        evaluatedQuestions === totalQuestions
    ) {
        interview.status = "Completed";

        await interview.save();

        console.log(
            `Interview ${interview._id} marked as Completed.`
        );

        // Create result notification
        try {
            await createNotification({
                user: userId,
                title: "Interview Completed",
                message: `Your ${interview.title} interview is complete. Your results are ready.`,
                type: "result",
                relatedId: interview._id,
            });
        } catch (notificationError) {
            console.error(
                "Create Result Notification Error:",
                notificationError
            );
        }
    }

    return question;
};