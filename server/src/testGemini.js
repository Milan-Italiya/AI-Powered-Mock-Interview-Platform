import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
    try {
        console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);
        console.log(
            "API KEY LENGTH:",
            process.env.GEMINI_API_KEY?.length
        );

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: "Say hello in one sentence.",
        });

        console.log("Gemini response:");
        console.log(response.text);
    } catch (error) {
        console.error("GEMINI ERROR:");
        console.error(error);
    }
}

testGemini();