import {
    getAllNotificationsDatasource,
    getUnreadNotificationCountDatasource,
    markNotificationAsReadDatasource,
    markAllNotificationsAsReadDatasource,
} from "../datasource/notification.datasource.js";

export const getNotifications = async () => {
    return await getAllNotificationsDatasource();
};

export const getUnreadNotificationCount = async () => {
    return await getUnreadNotificationCountDatasource();
};

export const markNotificationAsRead = async (notificationId) => {
    return await markNotificationAsReadDatasource(notificationId);
};

export const markAllNotificationsAsRead = async () => {
    return await markAllNotificationsAsReadDatasource();
};