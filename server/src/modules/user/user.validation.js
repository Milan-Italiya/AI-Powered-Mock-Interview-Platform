import { z } from "zod";

export const updateProfileSchema = z.object({
    fullName: z
        .string()
        .min(3, "Full name must be at least 3 characters")
        .max(50, "Full name cannot exceed 50 characters")
        .trim()
        .optional(),

    bio: z
        .string()
        .max(300, "Bio cannot exceed 300 characters")
        .trim()
        .optional(),

    profilePicture: z
        .string()
        .trim()
        .optional(),

    selectedRole: z
        .enum([
            "Frontend Developer",
            "Backend Developer",
            "Full Stack Developer",
            "Java Developer",
            "Python Developer",
            "Data Analyst",
            "DevOps Engineer",
            "UI/UX Designer",
        ])
        .optional(),

    experienceLevel: z
        .enum([
            "Student",
            "Fresher",
            "1-2 Years",
            "3-5 Years",
            "5+ Years",
        ])
        .optional(),

    targetCompany: z
        .string()
        .trim()
        .optional(),

    skills: z
        .array(z.string().trim())
        .optional(),

    learningGoals: z
        .array(z.string().trim())
        .optional(),

    preferredDifficulty: z
        .enum([
            "Easy",
            "Medium",
            "Hard",
        ])
        .optional(),

    preferredInterviewType: z
        .enum([
            "Technical",
            "HR",
            "Behavioral",
            "Mixed",
        ])
        .optional(),
});