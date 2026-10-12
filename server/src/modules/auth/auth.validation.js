import { z } from "zod"

// ? Creteria for Authentication
//! Password must contain:
//! - At least 8 characters
//! - One uppercase letter
//! - One lowercase letter
//! - One number
//! - One special character

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;


//* Register Validation Schema
export const registerSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(3, "Full name must be at least 3 characters")
        .max(50, "Full name cannot exceed 50 characters"),

    email: z
        .string()
        .trim()
        .lowercase()
        .email("Please enter valid email address"),

    password: z
        .string()
        .regex(
            passwordRegex,
            "Password must be at least 8 characters and include uppercase,lowercase,number, and special character."
        ),
});


//* Login Validation Schema
export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});