import { createInterviewDatasource, deleteInterviewDatasource, evaluateAnswerDatasource, getAllInterviewDatasource, getInterviewByIdDatasource } from "../datasource/interview.datasource.js"

export const getAllInterviews = async () => {
    return await getAllInterviewDatasource();
}

export const createInterview = async (interviewData) => {
    if (!interviewData) {
        throw new Error("interview data is missing.");
    }

    return await createInterviewDatasource(interviewData);
}

export const deleteInterview = async (interviewId) => {
    if (!interviewId) {
        throw new Error("Interview ID is required.")
    }

    return await deleteInterviewDatasource(interviewId);
}

export const getInterviewById = async (interviewId) => {
    return await getInterviewByIdDatasource(interviewId)
}

export const evaluateAnswer = async (questionId, answer) => {
    return await evaluateAnswerDatasource(questionId, answer)
}