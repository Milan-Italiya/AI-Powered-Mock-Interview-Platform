import api from "../lib/axios.js";

// Get all notifications
export const getAllNotificationsDatasource = async () => {
    const token = localStorage.getItem("token");

    const response = await api.get(
        "/api/v1/notifications",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

// Get unread notification count
export const getUnreadNotificationCountDatasource = async () => {
    const token = localStorage.getItem("token");

    const response = await api.get(
        "/api/v1/notifications/unread-count",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

// Mark one notification as read
export const markNotificationAsReadDatasource = async (notificationId) => {
    const token = localStorage.getItem("token");

    const response = await api.patch(
        `/api/v1/notifications/${notificationId}/read`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsReadDatasource = async () => {
    const token = localStorage.getItem("token");

    const response = await api.patch(
        "/api/v1/notifications/read-all",
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};