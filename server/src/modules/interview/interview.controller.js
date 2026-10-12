import { createInterview, deleteInterview, getAllInterviews, getInterviewById, getInterviewResult } from "./interview.service.js";
import { createInterviewSchema } from "./interview.validation.js"

export const createInterviewController = async (req, res) => {
    try {
        const validatedData = createInterviewSchema.parse(req.body);

        const interview = await createInterview(
            req.user._id,
            validatedData
        );

        return res.status(201).json({
            success: true,
            message: "Interview Created Successfully.",
            data: {
                interview
            },
        })
    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

export const getInterviewByIdController = async (req, res) => {
    try {
        const data = await getInterviewById(req.params.interviewId);

        return res.json({
            success: true,
            message: "Interview fetched Successfully.",
            data: {
                interview: data.interview,
                questions: data.questions,
            },
        })
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        })
    }
}

export const getAllInterviewsController = async (req, res) => {
    try {
        const userId = req.user._id;

        const interviews = await getAllInterviews(userId);

        return res.status(200).json({
            success: true,
            message: "Interviews fetched successfully.",
            data: {
                interviews
            },
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

export const deleteInterviewController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { interviewId } = req.params;

        await deleteInterview(userId, interviewId)

        res.status(200).json({
            success: true,
            message: "Interview deleted Successfully.",
            data: null
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

}

export const getInterviewResultController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { interviewId } = req.params;

        console.log("user id in result controller: ", userId)

        const result = await getInterviewResult(userId, interviewId);

        return res.status(200).json({
            success: true,
            message: "Interview result fetched successfully.",
            data: result,
        })
    } catch (error) {
        console.error("Get Interview Result Error: ", error)

        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}