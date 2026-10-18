import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"

import authRoutes from "./modules/auth/auth.routes.js"
import userRoutes from "./modules/user/user.routes.js"
import interviewRoutes from "./modules/interview/interview.routes.js"
import questionRoutes from "./modules/question/question.routes.js"
import notificationRoutes from "./modules/notification/notification.route.js"

import errorMiddleware from "./middlewares/error.middleware.js"

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://ai-powered-mock-interview-platform-neon.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without an Origin header,
            // such as certain server-to-server requests.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())
app.use(morgan("dev"))

// Routes
app.use(`/api/v1/auth`, authRoutes);
app.use(`/api/v1/users`, userRoutes);
app.use(`/api/v1/interviews`, interviewRoutes);
app.use(`/api/v1/questions`, questionRoutes);
app.use(`/api/v1/notifications`, notificationRoutes);

// Global Error Handler
app.use(errorMiddleware);

// Health Check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Synthex AI API"
    })
})

export default app;