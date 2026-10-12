export const generateInterviewPrompt = ({
    role,
    experienceLevel,
    difficulty,
    interviewType,
    technologies
}) => {
    return `
        You are an expert technical interviewer.

        Generate exactly 5 interview questions.

        Candidate Role:
        ${role}

        Experience:
        ${experienceLevel}

        Difficulty:
        ${difficulty}

        Interview Type:
        ${interviewType}

        technologies:
        ${technologies.join(", ")}

        IMPORTANT RULES

        1. Return ONLY valid json.
        2. Do NOT use markdown.
        3. Do NOT explain anything.
        4. Do NOT wrap inside \`\`\`.
        5. Return exactly 5 questions.

        Format:

        [
            {
                "question":"..."
            }
        ]
    `;
}

export const evaluateAnswerPrompt = ({
    question,
    answer,
    role,
    difficulty,
}) => {
    return `
You are an expert technical interviewer.

Evaluate the candidate's answer objectively.

Candidate Role:
${role}

Interview Difficulty:
${difficulty}

Question:
${question}

Candidate Answer:
${answer}

Return ONLY valid JSON.

Required format:

{
    "score": 8,
    "feedback": "The candidate demonstrates a good understanding of the concept and explains the main idea clearly. The answer could be improved by providing a more practical example.",
    "strengths": [
        "JavaScript",
        "React.js"
    ],
    "weakTopics": [
        "Error Handling",
        "DOM Manipulation"
    ]
}

IMPORTANT DEFINITIONS:

- "feedback" = A short explanation of how well the candidate answered the question.
- "strengths" = ONLY technical topics or concepts that the candidate demonstrated strong knowledge of.
- "weakTopics" = ONLY technical topics or concepts where the candidate showed missing, weak, or incomplete knowledge.

Rules:

1. Score must be a number from 0 to 10.
2. Feedback must be under 120 words.
3. strengths must contain ONLY short technical topic names.
4. weakTopics must contain ONLY short technical topic names.
5. Do NOT put explanations or sentences inside strengths.
6. Do NOT put explanations or sentences inside weakTopics.
7. Each topic should normally be 1-5 words.
8. Use specific technical concepts when possible.
9. Only include topics relevant to the question and candidate's answer.
10. If there are no clear strengths, return an empty array.
11. If there are no clear weaknesses, return an empty array.
12. Do not invent weaknesses that are not supported by the candidate's answer.
13. Return JSON only.
14. Do not use markdown.
15. Do not wrap JSON inside \`\`\`.

Examples of VALID strengths:

[
    "JavaScript",
    "React Hooks",
    "CSS Flexbox",
    "MongoDB Queries"
]

Examples of VALID weakTopics:

[
    "Error Handling",
    "JavaScript Hoisting",
    "DOM Manipulation",
    "Authentication"
]

Examples of INVALID strengths:

[
    "Excellent technical accuracy and attention to detail",
    "Good explanation",
    "Clearly understands the concept"
]

Examples of INVALID weakTopics:

[
    "Could improve error handling knowledge",
    "Needs to explain the concept better",
    "Should provide more examples"
]
`;
};