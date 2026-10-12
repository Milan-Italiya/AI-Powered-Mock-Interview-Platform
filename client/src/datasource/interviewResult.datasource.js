import api from "../lib/axios.js";

export const getInterviewResultDatasource = async (interviewId) => {
    const token = localStorage.getItem("token");

    const response = await api.get(
        `/api/v1/interviews/${interviewId}/result`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};