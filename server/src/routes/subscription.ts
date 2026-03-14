import express from "express";
import {
  getPlans,
  createOrder,
  verifyPayment,
} from "../controllers/subscription.js";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.js";

const subscriptionRouter = express.Router();

// Only an Institute Admin can view plans and checkout
subscriptionRouter.use(adminAuthenticator);

subscriptionRouter.get("/plans", getPlans);
subscriptionRouter.post("/create-order", createOrder);
subscriptionRouter.post("/verify", verifyPayment);

export default subscriptionRouter;
