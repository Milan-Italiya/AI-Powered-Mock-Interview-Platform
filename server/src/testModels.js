import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

try {
    const models = await ai.models.list();

    console.log("\n========== AVAILABLE GEMINI MODELS ==========\n");

    for await (const model of models) {
        console.log(model.name);
    }

    console.log("\n=============================================\n");
} catch (error) {
    console.error("Failed to list Gemini models:");
    console.error(error);
}