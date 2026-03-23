import express from "express";
import { createMasterPlan, updateMasterPlan, getAllMasterPlans, activateSubscription } from "../controllers/saas.js";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.js";

const saasRouter = express.Router();

// Public route to fetch all active plans for the Pricing page
saasRouter.get("/plans", getAllMasterPlans);

// Admin route to activate a chosen plan after registration
saasRouter.post("/subscription/activate", adminAuthenticator, activateSubscription);

// Note: These routes are entirely detached from the multi-tenant architecture. 
// They require the x-superadmin-secret header instead of a normal user JWT.
saasRouter.post("/plan/create", createMasterPlan);
saasRouter.put("/plan/update/:id", updateMasterPlan);

export default saasRouter;
