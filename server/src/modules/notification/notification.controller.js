import { getNotifications, getUnreadNotificationCount, markAllNotificationsAsRead, markNotificationAsRead } from "./notification.service.js";

// Get all notifications
export const getNotificationController = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await getNotifications(userId)

        return res.status(200).json({
            success: true,
            message: "Notifications fetched successfully.",
            data: notifications
        })
    } catch (error) {
        console.error("Get Notification Error: ", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetched notifications."
        })
    }
}

// Get unread notification count
export const getUnreadNotificationCountController = async (req, res) => {
    try {
        const userId = req.user._id;
        const count = await getUnreadNotificationCount(userId);

        return res.status(200).json({
            success: true,
            message: "Unread notification count fetched successfully.",
            data: {
                count,
            }
        })
    } catch (error) {
        console.error("Get Unread Notification Count Error: ", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch unread notification count.",
        })
    }
}

// Mark one notification as read
export const markNotificationAsReadController = async (req,res) => {
    try {
        const userId = req.user._id;
        const {notificationId} = req.params;

        const notification = await markNotificationAsRead(notificationId,userId);

        if (!notification) {
            return res.status(404).json({
                success:false,
                message:"Notification not found."
            })
        }

        return res.status(200).json({
            success:true,
            message:"Notification marked as read.",
            data:notification,
        })
    } catch (error) {
        console.error("Mark Notification As Read Error.",error);
        return res.status(500).json({
            success:false,
            message:"Failed to mark notification as read."
        })
    }
}

// Mark all notifications as read

export const markAllNotificationsAsReadController = async (req,res) => {
    try {
        const userId = req.user._id;

        await markAllNotificationsAsRead(userId);

        return res.status(200).json({
            success:true,
            message:"All notifications marked as read.",
        })
    } catch (error) {
        console.error("Mark All Notifications As Read Error: ",error);
        return res.status(500).json({
            success:false,
            message:"Failed to mark all notifications as read.",
        })
    }
}