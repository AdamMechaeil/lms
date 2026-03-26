import express from "express";
import {
  initializeFeeStructure,
  recordPayment,
  getStudentFinancials,
  getMyFinancials,
  createStudentRazorpayOrder,
  verifyStudentPayment
} from "../controllers/fee.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import { commonAuthenticator } from "../middlewares/commonAuthenticator.js";

const feeRouter = express.Router();

// Apply authentication middleware
feeRouter.use(commonAuthenticator);

// Student Self-Service Routes (No special permissions needed, just Student JWT payload)
feeRouter.get("/my-financials", getMyFinancials);
feeRouter.post("/student/create-order", createStudentRazorpayOrder);
feeRouter.post("/student/verify", verifyStudentPayment);

// Admin-Only Routes
feeRouter.post("/structure/init", requirePermission("manage_fees"), initializeFeeStructure);
feeRouter.post("/payment/record", requirePermission("manage_fees"), recordPayment);
feeRouter.get("/student/:studentId", requirePermission("manage_fees"), getStudentFinancials);

export default feeRouter;
