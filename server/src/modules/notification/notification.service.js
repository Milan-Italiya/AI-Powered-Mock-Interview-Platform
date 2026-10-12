import Notification from "../../models/notification.model.js";

// Create notification
export const createNotification = async (data) => {
    return await Notification.create(data);
};

// Get all notifications for a user
export const getNotifications = async (userId) => {
    return await Notification.find({
        user: userId,
    }).sort({
        createdAt: -1,
    });
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId) => {
    return await Notification.countDocuments({
        user: userId,
        isRead: false,
    });
};

// Mark one notification as read
export const markNotificationAsRead = async (
    notificationId,
    userId
) => {
    return await Notification.findOneAndUpdate(
        {
            _id: notificationId,
            user: userId,
        },
        {
            isRead: true,
        },
        {
            new: true,
        }
    );
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
    return await Notification.updateMany(
        {
            user: userId,
            isRead: false,
        },
        {
            isRead: true,
        }
    );
};