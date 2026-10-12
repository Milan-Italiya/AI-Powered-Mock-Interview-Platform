import dotenv from "dotenv"
import { generateInterviewQuestions } from "./modules/ai/ai.services.js"
dotenv.config()

async function testAI() {
    try {
        const questions = await generateInterviewQuestions({
            role: "Full Stack Developer",
            experienceLevel: "Fresher",
            difficulty: "Medium",
            interviewType: "Technical",
            technologies: [
                "React.js",
                "Node.js",
                "MongoDB"
            ]
        })
        console.log(questions)
    } catch (error) {
        console.error(error)
    }
}

testAI()