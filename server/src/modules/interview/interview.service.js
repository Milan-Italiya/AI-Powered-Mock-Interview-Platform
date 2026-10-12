import Interview from "../../models/interview.model.js";
import Question from "../../models/question.model.js";
import { generateInterviewQuestions } from "../ai/ai.service.js";
import { createQuestions } from "../question/question.service.js";

import { createNotification } from "../notification/notification.service.js";

export const createInterview = async (userId, data) => {
    try {
        // 1. Generate AI questions FIRST
        const questions = await generateInterviewQuestions(data);

        // 2. Validate AI response
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error(
                "AI did not generate valid interview questions."
            );
        }

        // 3. Create interview only after AI succeeds
        const interview = await Interview.create({
            user: userId,
            ...data,
        });

        // 4. Save generated questions
        await createQuestions(interview._id, questions);

        // 5. Create notification
        try {
            await createNotification({
                user: userId,
                title: "Interview Created",
                message: `Your ${interview.title} interview has been created successfully.`,
                type: "interview",
                relatedId: interview._id,
            });
        } catch (notificationError) {
            console.error(
                "Create Interview Notification Error:",
                notificationError
            );
        }

        // 6. Return interview
        return interview;

    } catch (error) {
        console.error(
            "Create Interview Service Error:",
            error
        );

        throw error;
    }
};

export const getInterviewById = async (interviewId) => {
    console.log("Interview ID:", interviewId);

    const interview = await Interview.findById(interviewId);

    console.log("Interview:", interview);

    if (!interview) {
        throw new Error("Interview not found.");
    }

    const questions = await Question.find({
        interview: interviewId,
    }).sort({ order: 1 });

    return {
        interview,
        questions,
    };
};

export const getAllInterviews = async (userId) => {
    console.log("Logged in User ID:", userId);

    const interviews = await Interview.find({
        user: userId,
    }).sort({ createdAt: -1 });

    console.log("interviews:", interviews);

    return interviews;
};

export const deleteInterview = async (userId, interviewId) => {
    const interview = await Interview.findOne({
        _id: interviewId,
        user: userId,
    });

    if (!interview) {
        throw new Error("Interview not found.");
    }

    await Interview.findByIdAndDelete(interviewId);

    await Question.deleteMany({
        interview: interviewId,
    });

    return;
};

export const getInterviewResult = async (userId, interviewId) => {
    // 1. Find interview belonging to logged-in user
    const interview = await Interview.findOne({
        _id: interviewId,
        user: userId,
    });

    if (!interview) {
        throw new Error("Interview not found.");
    }

    // 2. Get all questions
    const questions = await Question.find({
        interview: interviewId,
    }).sort({ order: 1 });

    if (!questions.length) {
        throw new Error("No questions found for this interview.");
    }

    // 3. Get only evaluated questions
    const evaluatedQuestions = questions.filter(
        (question) => question.status === "Evaluated"
    );

    // 4. Calculate total score
    const totalScore = evaluatedQuestions.reduce(
        (total, question) => total + (Number(question.score) || 0),
        0
    );

    // 5. Calculate average score
    const averageScore =
        evaluatedQuestions.length > 0
            ? Number(
                (
                    totalScore / evaluatedQuestions.length
                ).toFixed(1)
            )
            : 0;

    // 6. Collect strengths
    const strengths = [
        ...new Set(
            evaluatedQuestions.flatMap(
                (question) =>
                    Array.isArray(question.strengths)
                        ? question.strengths
                        : []
            )
        ),
    ];

    // 7. Collect weak topics
    const weakTopics = [
        ...new Set(
            evaluatedQuestions.flatMap(
                (question) =>
                    Array.isArray(question.weakTopics)
                        ? question.weakTopics
                        : []
            )
        ),
    ];

    // 8. Return result
    return {
        interview,
        totalQuestions: questions.length,
        answeredQuestions: evaluatedQuestions.length,
        totalScore,
        averageScore,
        strengths,
        weakTopics,
        questions: evaluatedQuestions,
    };
};