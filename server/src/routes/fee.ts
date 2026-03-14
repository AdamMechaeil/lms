import express from "express";
import {
  initializeFeeStructure,
  recordPayment,
  getStudentFinancials
} from "../controllers/fee.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import { commonAuthenticator } from "../middlewares/commonAuthenticator.js";

const feeRouter = express.Router();

// Apply authentication middleware
feeRouter.use(commonAuthenticator);

// We secure these routes with custom "manage_fees" permission
feeRouter.post("/structure/init", requirePermission("manage_fees"), initializeFeeStructure);
feeRouter.post("/payment/record", requirePermission("manage_fees"), recordPayment);
feeRouter.get("/student/:studentId", requirePermission("manage_fees"), getStudentFinancials);

export default feeRouter;
