import {
    getCurrentUser,
    getProfile,
    removeProfilePicture,
    updateProfile,
} from "./user.service.js";


import { updateProfileSchema } from "./user.validation.js";

export const getMe = async (req, res) => {
    try {
        const user = await getCurrentUser(req.user);

        return res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getProfileController = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await getProfile(userId);

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully.",
            data: { user },
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};


export const updateProfileController = async (req, res) => {
    try {
        const userId = req.user._id;

        console.log("User ID in controller:", userId);
        console.log("Request body:", req.body);
        console.log("Uploaded file:", req.file);

        // Copy body
        const body = {
            ...req.body,
        };

        // Remove profilePicture from body completely.
        // The actual image is available through req.file.
        delete body.profilePicture;

        // Convert JSON strings back into arrays
        if (typeof body.skills === "string") {
            body.skills = JSON.parse(body.skills);
        }

        if (typeof body.learningGoals === "string") {
            body.learningGoals = JSON.parse(body.learningGoals);
        }

        // Validate only normal profile fields
        const validatedData = updateProfileSchema.parse(body);

        // Send the actual uploaded file separately
        const user = await updateProfile(
            userId,
            validatedData,
            req.file
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: { user },
        });
    } catch (error) {
        console.error("Update Profile Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const removeProfilePictureController = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await removeProfilePicture(userId)

        return res.status(200).json({
            success: true,
            message: "Profile picture removed successfully.",
            data: { user },
        })
    } catch (error) {
        console.error("Remove profile Picture Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}