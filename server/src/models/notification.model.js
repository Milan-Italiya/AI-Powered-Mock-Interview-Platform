import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300
        },
        type: {
            type: String,
            enum: [
                "interview",
                "evaluation",
                "result",
                "profile",
                "system",
            ],
            default: "system",
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;