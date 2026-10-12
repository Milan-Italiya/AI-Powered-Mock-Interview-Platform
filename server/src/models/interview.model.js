import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            required: true,
        },

        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Medium"
        },

        interviewType: {
            type: String,
            enum: ["Technical", "HR", "Behavioral", "Mixed"],
            default: "Mixed"
        },

        experienceLevel: {
            type: String,
            required: true,
        },

        technologies: {
            type: [String],
            default: [],
        },

        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending",
        },

        score: {
            type: Number,
            default: 0,
        },

        feedback: {
            type: String,
            default: "",
        },

        weakTopics:{
            type:[String],
            default:[],
        },

        strongTopics:{
            type:[String],
            default:[],
        },
    },
    {
        timestamps:true,
        versionKey:false,
    }
)

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;