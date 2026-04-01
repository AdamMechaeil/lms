import mongoose, { Document, Schema } from "mongoose";

export interface IEmployee extends Document {
  institute: mongoose.Types.ObjectId;
  email: mongoose.Types.ObjectId; // Refers to the Email model for login credentials
  role: mongoose.Types.ObjectId; // Refers to their custom Role
  
  name: string;
  contactNumber?: string;
  profilePicture?: string;
  
  isActive: boolean; // Can their login be temporarily disabled?
  
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    email: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Email",
      required: true,
      unique: true // One email record maps to one employee record
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    name: { type: String, required: true },
    contactNumber: { type: String },
    profilePicture: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<IEmployee>("Employee", EmployeeSchema);
