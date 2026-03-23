import { Request, Response } from "express";
import PlanModel from "../models/plan.js";
import SubscriptionModel from "../models/subscription.js";
import InstituteModel from "../models/institute.js";

/**
 * SUPER ADMIN ONLY: Create a Master Plan Tier
 */
export const createMasterPlan = async (req: Request, res: Response) => {
  try {
    const { name, description, price, currency, billingCycle, maxStudents, maxStorageGB, customDomain } = req.body;

    // Verify it's actually the super admin (e.g., using a secret key in Headers)
    const superAdminSecret = req.header("x-superadmin-secret");
    if (superAdminSecret !== process.env.SUPER_ADMIN_SECRET) {
        return res.status(403).json({ message: "Forbidden: Super Admin access required." });
    }

    const newPlan = await PlanModel.create({
      name,
      description,
      price,
      currency: currency || "INR",
      billingCycle: billingCycle || "monthly",
      features: {
        maxStudents,
        maxStorageGB,
        customDomain: customDomain || false
      }
    });

    res.status(201).json({ message: "Master Plan created successfully", plan: newPlan });
  } catch (error) {
    console.error("Error creating master plan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * SUPER ADMIN ONLY: Update existing Master Plan
 */
export const updateMasterPlan = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
  
      const superAdminSecret = req.header("x-superadmin-secret");
      if (superAdminSecret !== process.env.SUPER_ADMIN_SECRET) {
          return res.status(403).json({ message: "Forbidden: Super Admin access required." });
      }
  
      const updatedPlan = await PlanModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedPlan) {
          return res.status(404).json({ message: "Plan not found" });
      }
  
      res.status(200).json({ message: "Master Plan updated successfully", plan: updatedPlan });
    } catch (error) {
      console.error("Error updating master plan:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

/**
 * PUBLIC: Fetch all active Master Plans for the pricing page
 */
export const getAllMasterPlans = async (req: Request, res: Response) => {
  try {
    const plans = await PlanModel.find({ isActive: true }).sort({ price: 1 });
    // If you don't have isActive, just find all: await PlanModel.find().sort({ price: 1 })
    res.status(200).json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ADMIN: Activate Subscription
 * Takes a planId and creates the subscription for the Institute encoded in the JWT
 */
export const activateSubscription = async (req: Request, res: Response) => {
  try {
    const { planId } = req.body;
    // user payload comes from adminAuthenticator
    const user = (req as any).user;
    // @ts-ignore
    const instituteId=req.instituteId;
    if (!instituteId) {
       return res.status(401).json({ message: "Unauthorized: Missing institute context." });
    }

    const plan = await PlanModel.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Check if institute already has a subscription
    const institute = await InstituteModel.findById(instituteId);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    if (institute.currentSubscription) {
      // In a real app we might allow upgrade/downgrade here, but for now we block double activation
      // or we handle upgrading replacing the old one. 
      // Let's just create or overwrite.
    }

    // Create the Subscription document based on the Plan
    const subscription = await SubscriptionModel.create({
      institute: instituteId,
      planId: plan._id,
      status: plan.price === 0 ? "active" : "trial", // Free plan is active immediately
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month from now
      limits: {
        maxStudents: plan.features.maxStudents,
        maxStorageGB: plan.features.maxStorageGB,
      },
    });

    // Link it to Institute
    institute.currentSubscription = subscription._id as any;
    await institute.save();

    res.status(200).json({ message: "Subscription activated successfully", subscription });
  } catch (error) {
    console.error("Error activating subscription:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

