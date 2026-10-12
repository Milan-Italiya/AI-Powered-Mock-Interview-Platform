import express from "express"
import authMiddleware from "../../middlewares/auth.middleware.js";
import { getNotificationController, getUnreadNotificationCountController, markAllNotificationsAsReadController, markNotificationAsReadController } from "./notification.controller.js";

const router = express.Router();

// Get all notifications
router.get("/", authMiddleware, getNotificationController);

// Get unread notification count
router.get("/unread-count", authMiddleware, getUnreadNotificationCountController);

// mark one notification as read
router.patch("/:notificationId/read", authMiddleware, markNotificationAsReadController)

// mark all notification as read
router.patch("/read-all", authMiddleware, markAllNotificationsAsReadController);

export default router;