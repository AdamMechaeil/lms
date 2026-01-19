import express from "express";
import {
  createBranch,
  deleteBranch,
  getAllBranches,
  updateBranch,
} from "../controllers/branch.js";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.js";
import { admintrainerAuthenticator } from "../middlewares/admintrainerAuthenticator.js";
const branchRouter = express.Router();

branchRouter.post("/createBranch", adminAuthenticator, createBranch);
branchRouter.get("/getAllBranches", admintrainerAuthenticator, getAllBranches);
branchRouter.put("/updateBranch/:id", adminAuthenticator, updateBranch);
branchRouter.delete("/deleteBranch/:id", adminAuthenticator, deleteBranch);

export default branchRouter;
