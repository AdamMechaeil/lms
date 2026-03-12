import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
  institute: mongoose.Types.ObjectId; // Which institute owns this subscription
  planId: mongoose.Types.ObjectId; // Reference to a master 'Plan' table

  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";

  // Razorpay Specific Fields
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  razorpayOrderId?: string;

  // Pricing
  amountPaid: number; // Stored in INR
  currency: string; // 'INR'

  // Timeline
  startDate: Date;
  endDate: Date;
  trialEndsAt?: Date;
  canceledAt?: Date;

  // Feature Limits snapshot for this specific billing cycle (Grandfathering)
  limits: {
    maxStudents: number;
    maxStorageGB: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "trialing", "past_due", "canceled", "incomplete"],
      default: "trialing",
    },

    // Razorpay Integration Data
    razorpaySubscriptionId: { type: String },
    razorpayCustomerId: { type: String },
    razorpayOrderId: { type: String },

    amountPaid: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "INR" },

    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    trialEndsAt: { type: Date },
    canceledAt: { type: Date },

    limits: {
      maxStudents: { type: Number, required: true },
      maxStorageGB: { type: Number, required: true },
    },
  },
  { timestamps: true },
);

export default mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema,
);
