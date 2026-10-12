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

    const appendField = (key, value) => {
        if (value === undefined || value === null) return;

        if (key === "profilePicture") {
            if (value instanceof File) {
                formData.append(key, value);
            }
            return;
        }

        if (key === "skills" || key === "learningGoals") {
            formData.append(
                key,
                typeof value === "string"
                    ? value
                    : JSON.stringify(value)
            );
            return;
        }

        formData.append(key, String(value));
    };

    Object.entries(data).forEach(([key, value]) => {
        appendField(key, value);
    });

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