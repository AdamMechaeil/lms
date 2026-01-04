import express from "express";
import {
  createTrainer,
  deleteTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
} from "../controllers/trainer.js";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.js";

import { upload } from "../middlewares/multer.js";

const trainerRouter = express.Router();

trainerRouter.post(
  "/addTrainer",
  adminAuthenticator,
  upload.single("profilePicture"),
  createTrainer
);
trainerRouter.get("/getAllTrainers", adminAuthenticator, getAllTrainers);
trainerRouter.get("/getTrainerById/:id", adminAuthenticator, getTrainerById);
trainerRouter.put(
  "/updateTrainer/:id",
  adminAuthenticator,
  upload.single("profilePicture"),
  updateTrainer
);
trainerRouter.delete("/deleteTrainer/:id", adminAuthenticator, deleteTrainer);

export default trainerRouter;
