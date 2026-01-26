import express from "express";
import {
  markBatchAttendance,
  getBatchAttendance,
  getStudentAttendance,
  getTrainerAttendanceHistory,
} from "../controllers/attendance.js";
import { admintrainerAuthenticator } from "../middlewares/admintrainerAuthenticator.js";

import { commonAuthenticator } from "../middlewares/commonAuthenticator.js";

const attendanceRouter = express.Router();

// Apply authenticator to specific routes
attendanceRouter.post(
  "/markBatchAttendance",
  admintrainerAuthenticator,
  markBatchAttendance,
);
attendanceRouter.get(
  "/getBatchAttendance",
  admintrainerAuthenticator,
  getBatchAttendance,
);
attendanceRouter.get(
  "/getStudentAttendance",
  commonAuthenticator,
  getStudentAttendance,
);
attendanceRouter.get(
  "/getTrainerAttendanceHistory",
  admintrainerAuthenticator,
  getTrainerAttendanceHistory,
); // New Route

export default attendanceRouter;
