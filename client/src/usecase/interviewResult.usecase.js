import { getInterviewResultDatasource } from "../datasource/interviewResult.datasource.js";

export const getInterviewResult = async (interviewId) => {
    return await getInterviewResultDatasource(
        interviewId
    );
};