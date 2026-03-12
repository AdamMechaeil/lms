import mongoose, { Document, Schema } from "mongoose";

export interface IPlan extends Document {
  name: string; // e.g., 'Free Tier', 'Pro Plan', 'Enterprise'
  description: string;

  // Pricing Details
  price: number; // Stored in INR
  currency: string; // Default 'INR'
  billingCycle: "monthly" | "yearly";
  razorpayPlanId?: string; // If you create subscription plans in Razorpay dashboard

  // Master Feature Limits (These get copied to the Subscription on checkout)
  features: {
    maxStudents: number;
    maxStorageGB: number;
    customDomain: boolean;
  };

  isActive: boolean; // Can we still sell this plan? (Set false to retire old plans)
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    price: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    razorpayPlanId: { type: String },

    features: {
      maxStudents: { type: Number, required: true },
      maxStorageGB: { type: Number, required: true },
      customDomain: { type: Boolean, default: false },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<IPlan>("Plan", PlanSchema);
