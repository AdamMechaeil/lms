import express from "express";
import {
  adminGoogleLogin,
  trainerGoogleLogin,
  connectGoogle,
  studentLogin,
  updateStudentPassword,
  verifyToken,
  logout,
} from "../controllers/auth.js";

const authRouter = express.Router();

authRouter.post("/admin/signin", adminGoogleLogin);

authRouter.post("/trainer/signin", trainerGoogleLogin);

authRouter.post("/connect-google", connectGoogle);

authRouter.post("/student/login", studentLogin);

authRouter.post("/student/update-password", updateStudentPassword);

authRouter.post("/verify-token", verifyToken);

authRouter.post("/logout", logout);

export default authRouter;
