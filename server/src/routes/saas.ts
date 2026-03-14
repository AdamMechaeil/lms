import express from "express";
import { createMasterPlan, updateMasterPlan } from "../controllers/saas.js";

const saasRouter = express.Router();

// Note: These routes are entirely detached from the multi-tenant architecture. 
// They require the x-superadmin-secret header instead of a normal user JWT.
saasRouter.post("/plan/create", createMasterPlan);
saasRouter.put("/plan/update/:id", updateMasterPlan);

export default saasRouter;
