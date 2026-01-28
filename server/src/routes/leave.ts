import express from "express";
import {
  applyLeave,
  updateLeaveStatus,
  getAllLeaves,
  getMyLeaves,
} from "../controllers/leaveController.js";
import { commonAuthenticator as isAuthenticated } from "../middlewares/commonAuthenticator.js";
import { adminAuthenticator as isAdmin } from "../middlewares/adminAuthenticator.js";
import { admintrainerAuthenticator as isTrainer } from "../middlewares/admintrainerAuthenticator.js";

const router = express.Router();

// Apply for Leave (Trainer Only)
router.post("/apply", isAuthenticated, isTrainer, applyLeave);

// Get My Leaves (Trainer Only)
router.get("/my-leaves", isAuthenticated, isTrainer, getMyLeaves);

// Get All Leaves (Admin Only)
router.get("/all", isAuthenticated, isAdmin, getAllLeaves);

// Approve/Reject Leave (Admin Only)
router.put("/:leaveId/status", isAuthenticated, isAdmin, updateLeaveStatus);

export default router;
