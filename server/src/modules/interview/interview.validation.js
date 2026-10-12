import { z } from "zod";

export const createInterviewSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be atleast 3 characters")
        .max(100, "Title cannot exceed 100 characters"),

    role: z.enum([
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Java Developer",
        "Python Developer",
        "Data Analyst",
        "DevOps Engineer",
        "UI/UX Designer",
        "Machine Learning Engineer",
        "Software Engineer"
    ]),

    difficulty: z.enum([
        "Easy",
        "Medium",
        "Hard",
    ]),

    interviewType: z.enum([
        "Technical",
        "HR",
        "Behavioral",
        "Mixed",
    ]),

    experienceLevel: z.enum([
        "Student",
        "Fresher",
        "1-2 years",
        "3-5 years",
        "5+ years"
    ]),

    technologies: z
        .array(z.string())
        .min(1, "At least one technology required")
        .max(10, "Maximum 10 technologies allowed")
});
