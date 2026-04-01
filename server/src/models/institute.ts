import mongoose, { Document, Schema } from "mongoose";

export interface IInstitute extends Document {
  name: string;
  subdomain: string; // e.g., 'acme'.lms-saas.com
  adminName: string;
  adminEmail: string;
  contactNumber?: string;
  address?: string;

  // Branding
  logoUrl?: string;
  primaryColor?: string;

  // Link to their current active subscription
  currentSubscription?: mongoose.Types.ObjectId;

  isActive: boolean; // Master switch to disable the institute
  createdAt: Date;
  updatedAt: Date;
}

const InstituteSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true, unique: true },
    contactNumber: { type: String },
    address: { type: String },
    logoUrl: { type: String },
    primaryColor: { type: String, default: "#3b82f6" },

    currentSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<IInstitute>("Institute", InstituteSchema);
