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

import { upload } from "../middlewares/multer.js";

const studentRouter = express.Router();

studentRouter.post(
  "/createStudent",
  adminAuthenticator,
  upload.single("profilePicture"),
  createStudent,
);
studentRouter.get("/getAllStudents", admintrainerAuthenticator, getAllStudents);
studentRouter.get("/getStudentById/:id", commonAuthenticator, getStudentById);
studentRouter.put(
  "/updateStudent/:id",
  adminAuthenticator,
  upload.single("profilePicture"),
  updateStudent,
);
studentRouter.delete("/deleteStudent/:id", adminAuthenticator, deleteStudent);

studentRouter.put(
  "/updateProfilePicture/:id",
  commonAuthenticator,
  upload.single("profilePicture"),
  updateProfilePicture,
);

export default studentRouter;
