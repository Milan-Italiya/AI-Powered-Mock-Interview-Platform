import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        interview: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
            required: true,
        },

        question: {
            type: String,
            required: true,
            trim: true,
        },

        answer: {
            type: String,
            default: ""
        },

        feedback: {
            type: String,
            default: "",
        },

        strengths: {
            type: [String],
            default: [],
        },

        weakTopics: {
            type: [String],
            default: [],
        },

        score: {
            type: Number,
            default: 0,
            min: 0,
            max: 10,
        },

        order: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Answered",
                "Evaluated"
            ],
            default: "Pending"
        },
    },

    {
        timestamps: true,
        versionKey: false,
    }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;