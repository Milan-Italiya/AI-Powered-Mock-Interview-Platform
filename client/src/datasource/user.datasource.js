import api from "../lib/axios.js";

export const getProfileDatasource = async () => {
    const token = localStorage.getItem("token");

    const response = await api.get(
        "/api/v1/users/profile",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const updateProfileDatasource = async (data) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    // Only append fields that are actually provided
    if (data.fullName !== undefined) {
        formData.append("fullName", data.fullName);
    }

    if (data.bio !== undefined) {
        formData.append("bio", data.bio);
    }

    if (data.selectedRole !== undefined) {
        formData.append("selectedRole", data.selectedRole);
    }

    if (data.experienceLevel !== undefined) {
        formData.append(
            "experienceLevel",
            data.experienceLevel
        );
    }

    if (data.targetCompany !== undefined) {
        formData.append(
            "targetCompany",
            data.targetCompany
        );
    }

    if (data.skills !== undefined) {
        formData.append(
            "skills",
            JSON.stringify(data.skills)
        );
    }

    if (data.learningGoals !== undefined) {
        formData.append(
            "learningGoals",
            JSON.stringify(data.learningGoals)
        );
    }

    if (data.preferredDifficulty !== undefined) {
        formData.append(
            "preferredDifficulty",
            data.preferredDifficulty
        );
    }

    if (data.preferredInterviewType !== undefined) {
        formData.append(
            "preferredInterviewType",
            data.preferredInterviewType
        );
    }

    if (data.profilePicture) {
        formData.append(
            "profilePicture",
            data.profilePicture
        );
    }

    const response = await api.put(
        "/api/v1/users/profile",
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const removeProfilePictureDatasource = async () => {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/v1/users/profile/picture",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    )
    return response.data
}