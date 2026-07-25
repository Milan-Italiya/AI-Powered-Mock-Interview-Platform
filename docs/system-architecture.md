# System Architecture

## Overview

Synthex AI follows a three-tier architecture consisting of the Presentation Layer, Application Layer, and Data Layer. The application integrates Google's Gemini AI API to generate interview questions, evaluate responses, detect weaknesses, and provide personalized learning recommendations.

---

# Architecture Diagram

```text
                    +-----------------------+
                    |       User            |
                    +----------+------------+
                               |
                               v
                    +-----------------------+
                    |   React.js Frontend   |
                    | (Vite + Tailwind CSS) |
                    +----------+------------+
                               |
                      REST API (Axios)
                               |
                               v
                    +-----------------------+
                    | Express.js Backend    |
                    |      (Node.js)        |
                    +----------+------------+
                               |
             +-----------------+-----------------+
             |                                   |
             v                                   v
   +--------------------+             +----------------------+
   | Google Gemini API  |             |     MongoDB Atlas    |
   | AI Processing       |             | User & Interview Data|
   +--------------------+             +----------------------+
```

---

# Layers

## 1. Presentation Layer

Responsible for user interaction.

### Components

- Login Page
- Register Page
- Dashboard
- Interview Screen
- Result Screen
- Weakness Analysis
- Learning Recommendations
- Profile

Technology:
- React.js
- Tailwind CSS
- React Router

---

## 2. Application Layer

Handles all business logic.

### Responsibilities

- User Authentication
- Interview Management
- AI Communication
- Response Evaluation
- Weakness Detection
- Recommendation Generation
- Progress Tracking

Technology:
- Node.js
- Express.js
- JWT
- Axios

---

## 3. Data Layer

Stores application data.

### Collections

- Users
- Interviews
- Questions
- Responses
- Weakness Reports
- Recommendations

Technology:
- MongoDB
- Mongoose

---

# AI Workflow

1. User selects interview role.
2. Backend requests interview questions from Gemini AI.
3. AI generates questions.
4. User submits answers.
5. Backend sends answers to Gemini AI.
6. AI evaluates responses.
7. AI identifies weak topics.
8. Learning recommendations are generated.
9. Results are stored in MongoDB.
10. Dashboard displays updated progress.

---

# Security

- JWT Authentication
- Password Hashing (bcrypt)
- Protected API Routes
- Environment Variables
- Input Validation
- CORS Protection

---

# Scalability

The architecture is modular, allowing future features such as:

- Voice Interviews
- Video Interviews
- Coding Challenges
- Resume Analysis
- ATS Resume Checker
- AI Career Guidance
- Company-Specific Interview Preparation

---

# Conclusion

The three-tier architecture ensures that Synthex AI is scalable, maintainable, secure, and capable of integrating advanced AI features while keeping the frontend, backend, and database independent.