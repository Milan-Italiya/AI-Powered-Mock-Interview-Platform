import api from "../lib/axios.js";

export const getAllInterviewDatasource = async () => {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/v1/interviews",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
    return response.data
}

export const createInterviewDatasource = async (interviewData) => {
    const token = localStorage.getItem("token");

    const response = await api.post(
        "/api/v1/interviews",
        interviewData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data
}

export const deleteInterviewDatasource = async (interviewId) => {
    const token = localStorage.getItem("token");

    const response = await api.delete(`/api/v1/interviews/${interviewId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    )

    return response.data;
}

export const getInterviewByIdDatasource = async (interviewId) => {
    const token = localStorage.getItem("token");

    const response = await api.get(
        `/api/v1/interviews/${interviewId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const evaluateAnswerDatasource = async (
    questionId,
    answer
) => {
    const token = localStorage.getItem("token");

    const response = await api.patch(
        `/api/v1/questions/${questionId}/answer`,
        {
            answer,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};