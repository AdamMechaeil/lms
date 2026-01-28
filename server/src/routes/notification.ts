import express from "express";
import {
  sendNotification,
  getNotifications,
  markAsRead,
} from "../controllers/notificationController.js";
import { commonAuthenticator as isAuthenticated } from "../middlewares/commonAuthenticator.js";
import { adminAuthenticator as isAdmin } from "../middlewares/adminAuthenticator.js";

const router = express.Router();

// Get my notifications (All authenticated users)
router.get("/", isAuthenticated, getNotifications);

// Send Notification (Admin only)
router.post("/send", isAuthenticated, isAdmin, sendNotification);

// Mark as Read
router.put("/:id/read", isAuthenticated, markAsRead);

export default router;
