import { Request, Response } from "express";
import PlanModel from "../models/plan.js";

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
