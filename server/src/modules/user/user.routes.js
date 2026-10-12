import express from "express"
import authMiddleware from "../../middlewares/auth.middleware.js";
import { getMe, getProfileController, removeProfilePictureController, updateProfileController } from "./user.controller.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router()

// Protected Route
router.put("/profile", authMiddleware,upload.single("profilePicture"), updateProfileController)
router.delete("/profile/picture",authMiddleware,removeProfilePictureController);
router.get("/profile", authMiddleware, getProfileController)
router.get("/me", authMiddleware, getMe);

export default router;