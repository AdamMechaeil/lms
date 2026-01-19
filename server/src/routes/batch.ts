import express from "express";
import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  assignBatchToStudent,
  createBatchMeetLink,
  getBatchRecordings,
  getBatchesByStudent,
  removeStudentFromBatch,
} from "../controllers/batch.js";
import { admintrainerAuthenticator } from "../middlewares/admintrainerAuthenticator.js";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.js";

const batchRouter = express.Router();

batchRouter.post("/createBatch", admintrainerAuthenticator, createBatch);
batchRouter.get("/getAllBatches", admintrainerAuthenticator, getAllBatches);
batchRouter.get("/getBatchById/:id", admintrainerAuthenticator, getBatchById);
batchRouter.put("/updateBatch/:id", admintrainerAuthenticator, updateBatch);
batchRouter.delete("/deleteBatch/:id", adminAuthenticator, deleteBatch);
batchRouter.post(
  "/assignBatchToStudent",
  admintrainerAuthenticator,
  assignBatchToStudent
);

batchRouter.post(
  "/createBatchMeetLink",
  admintrainerAuthenticator,
  createBatchMeetLink
);

batchRouter.get(
  "/getBatchRecordings/:batchId",
  admintrainerAuthenticator,
  getBatchRecordings
);

batchRouter.get(
  "/getBatchesByStudent/:studentId",
  admintrainerAuthenticator,
  getBatchesByStudent
);

batchRouter.delete(
  "/removeStudentFromBatch",
  admintrainerAuthenticator,
  removeStudentFromBatch
);

export default batchRouter;
