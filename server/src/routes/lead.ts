import express from "express";
import {
  createLead,
  getLeads,
  updateLead,
  convertLeadToStudent
} from "../controllers/lead.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import { requireStudentLimit } from "../middlewares/requireStudentLimit.js";
import { commonAuthenticator } from "../middlewares/commonAuthenticator.js";

const leadRouter = express.Router();

// Apply authentication middleware to all routes
leadRouter.use(commonAuthenticator);

// Assuming only Admins and Employees with specific permissions should access these CRM routes.
// We pass 'manage_leads' as the required permission string. (Top-Level Admins implicitly bypass this).
leadRouter.post("/create", requirePermission("manage_leads"), createLead);
leadRouter.get("/all", requirePermission("manage_leads"), getLeads);
leadRouter.put("/update/:id", requirePermission("manage_leads"), updateLead);
leadRouter.post("/:id/convert", requirePermission("manage_leads"), requireStudentLimit, convertLeadToStudent);

export default leadRouter;
