import mongoose, { Document, Schema } from "mongoose";

export interface ILead extends Document {
  institute: mongoose.Types.ObjectId;
  name: string;
  email: string;
  mobileNumber: string;
  courseInterested?: mongoose.Types.ObjectId; // Optional: If they know what course
  status: "Inquiry" | "Demo Scheduled" | "Initial Payment Paid" | "Converted";
  source: "Website" | "Referral" | "Walk-in" | "Social Media" | "Other";
  assignedTo?: mongoose.Types.ObjectId; // Ref to Employee acting as Counsellor/Sales
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    courseInterested: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    status: {
      type: String,
      enum: ["Inquiry", "Demo Scheduled", "Initial Payment Paid", "Converted"],
      default: "Inquiry",
      required: true,
    },
    source: {
      type: String,
      enum: ["Website", "Referral", "Walk-in", "Social Media", "Other"],
      default: "Other",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    notes: { type: String },
  },
  { timestamps: true },
);

// We don't enforce unique email globally, because theoretically a lead could
// inquire at two different institutes on our platform. 
// However, within ONE institute, we can prevent duplicate leads if needed.
// For now, we will allow multiple inquiries since they might inquire about different courses.

export default mongoose.model<ILead>("Lead", LeadSchema);
