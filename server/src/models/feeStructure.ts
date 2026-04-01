import mongoose, { Document, Schema } from "mongoose";

export interface IFeeStructure extends Document {
  institute: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  
  courseReference?: mongoose.Types.ObjectId; // E.g. "Full Stack MERN"
  
  totalPackageCost: number;     // e.g. 50000
  upfrontDiscount: number;      // e.g. 5000
  netAmountDue: number;         // Automatically calculated: 45000
  
  paymentModeOptions: "Upfront" | "EMI";
  numberOfEmiTarget?: number;    // e.g., 3 months
  
  createdAt: Date;
  updatedAt: Date;
}

const FeeStructureSchema: Schema = new Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true // A student has ONE master fee structure
    },
    courseReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    totalPackageCost: { type: Number, required: true },
    upfrontDiscount: { type: Number, default: 0 },
    netAmountDue: { type: Number, required: true },
    paymentModeOptions: { 
      type: String, 
      enum: ["Upfront", "EMI"], 
      default: "EMI" 
    },
    numberOfEmiTarget: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.model<IFeeStructure>("FeeStructure", FeeStructureSchema);
