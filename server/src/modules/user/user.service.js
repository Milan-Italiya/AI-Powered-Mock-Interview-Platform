import cloudinary from "../../config/cloudinary.js";
import User from "../../models/user.model.js";

export const getCurrentUser = async (user) => {
    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export const getProfile = async (userId) => {
    const user = await User.findById(userId).select("-password")

    if (!user) {
        throw new Error("User not found.");
    }

    return user;
}

export const updateProfile = async (userId, updatedData, profilePicture) => {
    console.log("Received User ID:", userId);
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    // update only provided fields
    Object.assign(user, updatedData);

    if (profilePicture) {
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "synthex-ai/profile-pictures",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(result)
                    }
                }
            );

            stream.end(profilePicture.buffer);
        })
        user.profilePicture = uploadResult.secure_url;
    }
    await user.save();

    return user;
}

// Remove Profile Picture
export const removeProfilePicture = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    if (!user.profilePicture || typeof user.profilePicture !== "string") {
        user.profilePicture = "";
        await user.save();
        return user;
    }

    const url = user.profilePicture;

    const uploadIndex = url.indexOf("/upload/");

    if (uploadIndex !== -1) {
        let publicId = url.substring(uploadIndex + 8);

        publicId = publicId.replace(/^v\d+\//, "");
        publicId = publicId.replace(/\.[^/.]+$/, "");

        await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
            type: "upload",
        });
    }

    user.profilePicture = "";

    await user.save();

    return user;
};