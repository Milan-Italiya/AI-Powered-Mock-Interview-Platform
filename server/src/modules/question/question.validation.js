import { z } from "zod"

export const answerSchema = z.object({
    answer: z
        .string()
        .min(10, "Answer must contain at least 10 characters")
        .max(3000, "Answer is too long.")
})