import ai from "./gemini.js";
import {
    evaluateAnswerPrompt,
    generateInterviewPrompt
} from "./ai.promps.js";


// ============================================================
// GEMINI CONFIGURATION
// ============================================================

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// Automatic fallback models.
// You do NOT need to manually change these.
const FALLBACK_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
];

const MAX_RETRIES_PER_MODEL = 3;


// ============================================================
// HELPERS
// ============================================================

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};


const isTemporaryError = (error) => {
    const message = error?.message?.toLowerCase() || "";

    return (
        message.includes("503") ||
        message.includes("unavailable") ||
        message.includes("service unavailable") ||
        message.includes("high demand") ||
        message.includes("429") ||
        message.includes("resource_exhausted") ||
        message.includes("rate limit") ||
        message.includes("too many requests") ||
        message.includes("timeout") ||
        message.includes("deadline exceeded")
    );
};


const getModelsToTry = () => {
    return [
        PRIMARY_MODEL,
        ...FALLBACK_MODELS.filter(
            (model) => model !== PRIMARY_MODEL
        ),
    ];
};


// ============================================================
// GENERIC GEMINI REQUEST
// ============================================================

const generateWithFallback = async (prompt, operationName) => {
    const models = getModelsToTry();

    let lastError = null;

    for (const model of models) {

        console.log("");
        console.log("================================================");
        console.log(`${operationName}`);
        console.log(`Trying Gemini model: ${model}`);
        console.log("================================================");


        for (
            let attempt = 1;
            attempt <= MAX_RETRIES_PER_MODEL;
            attempt++
        ) {
            try {

                const response = await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                    },
                });


                const text = response.text;


                if (!text) {
                    throw new Error(
                        "No response received from Gemini."
                    );
                }


                console.log(
                    `Gemini success using model: ${model}`
                );


                return text;


            } catch (error) {

                lastError = error;


                console.error(
                    `${operationName} - Model: ${model} - Attempt ${attempt}/${MAX_RETRIES_PER_MODEL}`
                );

                console.error(
                    error?.message || error
                );


                const temporaryError =
                    isTemporaryError(error);


                // ------------------------------------------------
                // Permanent error
                // ------------------------------------------------

                if (!temporaryError) {

                    console.error(
                        `Permanent Gemini error on ${model}.`
                    );

                    throw error;
                }


                // ------------------------------------------------
                // Retry same model
                // ------------------------------------------------

                if (attempt < MAX_RETRIES_PER_MODEL) {

                    const baseDelay =
                        2000 * Math.pow(2, attempt - 1);

                    // Small random jitter
                    const jitter =
                        Math.floor(Math.random() * 1000);

                    const delay =
                        baseDelay + jitter;


                    console.log(
                        `Retrying ${model} in ${
                            (delay / 1000).toFixed(1)
                        } seconds...`
                    );


                    await sleep(delay);

                    continue;
                }


                // ------------------------------------------------
                // Current model exhausted
                // ------------------------------------------------

                console.log("");
                console.log(
                    `Model ${model} failed after ${MAX_RETRIES_PER_MODEL} attempts.`
                );

                console.log(
                    "Moving to next fallback model..."
                );

                console.log("");

            }
        }
    }


    throw new Error(
        `All Gemini models are temporarily unavailable. Last error: ${
            lastError?.message || "Unknown Gemini error"
        }`
    );
};


// ============================================================
// GENERATE INTERVIEW QUESTIONS
// ============================================================

export const generateInterviewQuestions = async (data) => {

    try {

        const prompt = generateInterviewPrompt(data);


        console.log("");
        console.log("==============================================");
        console.log("GENERATING INTERVIEW QUESTIONS");
        console.log("==============================================");


        const text = await generateWithFallback(
            prompt,
            "Generate Interview Questions"
        );


        const questions = JSON.parse(text);


        console.log(
            "Interview questions generated successfully."
        );


        return questions;


    } catch (error) {

        console.error(
            "Generate Interview Questions Error:",
            error
        );


        throw new Error(
            `Failed to generate interview questions: ${
                error.message
            }`
        );
    }
};


// ============================================================
// EVALUATE ANSWER
// ============================================================

export const evaluateAnswer = async (data) => {

    try {

        const prompt = evaluateAnswerPrompt(data);


        console.log("");
        console.log("==============================================");
        console.log("EVALUATING ANSWER");
        console.log("==============================================");


        const text = await generateWithFallback(
            prompt,
            "Evaluate Answer"
        );


        console.log("");
        console.log("========== GEMINI RESPONSE ==========");
        console.log(text);


        const result = JSON.parse(text);


        console.log("");
        console.log("========== PARSED EVALUATION ==========");
        console.log(result);


        return result;


    } catch (error) {

        console.error(
            "Evaluate Answer Error:",
            error
        );


        throw new Error(
            `Failed to evaluate answer: ${
                error.message
            }`
        );
    }
};