import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateProfilePicture,
} from "../controllers/student.js";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.js";
import { admintrainerAuthenticator } from "../middlewares/admintrainerAuthenticator.js";
import { commonAuthenticator } from "../middlewares/commonAuthenticator.js";
import { requireStudentLimit } from "../middlewares/requireStudentLimit.js";
import { upload } from "../middlewares/multer.js";
import { restoreTenantContext } from "../middlewares/tenantMiddleware.js";

const studentRouter = express.Router();

studentRouter.post(
  "/createStudent",
  adminAuthenticator,
  requireStudentLimit,
  upload.single("profilePicture"),
  restoreTenantContext,
  createStudent,
);
studentRouter.get("/getAllStudents", admintrainerAuthenticator, getAllStudents);
studentRouter.get("/getStudentById/:id", commonAuthenticator, getStudentById);
studentRouter.put(
  "/updateStudent/:id",
  adminAuthenticator,
  upload.single("profilePicture"),
  restoreTenantContext,
  updateStudent,
);
studentRouter.delete("/deleteStudent/:id", adminAuthenticator, deleteStudent);

studentRouter.put(
  "/updateProfilePicture/:id",
  commonAuthenticator,
  upload.single("profilePicture"),
  restoreTenantContext,
  updateProfilePicture,
);

export default studentRouter;
