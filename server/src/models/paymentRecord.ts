import mongoose, { Document, Schema } from "mongoose";

export interface IPaymentRecord extends Document {
  institute: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  feeStructure: mongoose.Types.ObjectId;
  
  amountPaid: number;
  paymentDate: Date;
  
  paymentMethod: "Cash" | "Bank Transfer" | "UPI" | "Razorpay" | "Cheque";
  transactionId?: string; // e.g. Razorpay Payment ID or UPI Ref No.
  
  collectedBy?: mongoose.Types.ObjectId; // Ref to Employee who collected cash
  
  receiptNumber: string;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentRecordSchema: Schema = new Schema(
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
    },
    feeStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "UPI", "Razorpay", "Cheque"],
      required: true,
    },
    transactionId: { type: String },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    receiptNumber: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

// Ensure receipt numbers are unique per institute so we don't have duplicates
PaymentRecordSchema.index({ institute: 1, receiptNumber: 1 }, { unique: true });

export default mongoose.model<IPaymentRecord>("PaymentRecord", PaymentRecordSchema);
