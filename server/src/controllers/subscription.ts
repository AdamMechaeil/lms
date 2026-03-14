import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import PlanModel from "../models/plan.js";
import SubscriptionModel from "../models/subscription.js";
import InstituteModel from "../models/institute.js";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function getPlans(req: Request, res: Response) {
  try {
    const plans = await PlanModel.find({ isActive: true }).select("-__v");
    res.status(200).json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    const { planId } = req.body;
    const instituteId = (req as any).instituteId; // Populated by tenantMiddleware

    const plan = await PlanModel.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay credentials not configured" });
    }

    // Amount is in paise (1 INR = 100 paise)
    const options = {
      amount: plan.price * 100, 
      currency: plan.currency || "INR",
      receipt: `rcpt_${instituteId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      plan,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = req.body;
    const instituteId = (req as any).instituteId;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Fetch the plan they bought to get the new limits
    const plan = await PlanModel.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Find the institute's current subscription
    const currentSubscription = await SubscriptionModel.findOne({ institute: instituteId, status: "active" });
    
    // We can either update the current one, or cancel it and create a new one.
    // For simplicity and audit trails, we'll create a NEW active subscription and mark the old one as canceled.
    
    if (currentSubscription) {
        currentSubscription.status = "canceled";
        currentSubscription.canceledAt = new Date();
        await currentSubscription.save();
    }

    // Calculate End Date
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (plan.billingCycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create New Record
    const newSubscription = await SubscriptionModel.create({
      institute: instituteId,
      planId: plan._id,
      status: "active",
      razorpayOrderId: razorpay_order_id,
      amountPaid: plan.price,
      currency: plan.currency,
      startDate,
      endDate,
      limits: plan.features, // <--- GRANDFATHERING: Snapshot exact limits right now
    });

    // Update Institute
    await InstituteModel.findByIdAndUpdate(instituteId, {
      currentSubscription: newSubscription._id
    });

    res.status(200).json({
      success: true,
      message: "Subscription upgraded successfully",
      subscription: newSubscription
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
