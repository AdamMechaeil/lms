import { Request, Response } from "express";
import FeeStructureModel from "../models/feeStructure.js";
import PaymentRecordModel from "../models/paymentRecord.js";
import CounterModel from "../models/counter.js";

/**
 * Step 1: Initialize the Master Fee Structure for a Student
 */
export const initializeFeeStructure = async (req: Request, res: Response) => {
  try {
    const { student, courseReference, totalPackageCost, upfrontDiscount, paymentModeOptions, numberOfEmiTarget } = req.body;
    const instituteId = (req as any).instituteId;

    const netAmountDue = totalPackageCost - (upfrontDiscount || 0);

    const feeStructure = await FeeStructureModel.create({
      institute: instituteId,
      student,
      courseReference,
      totalPackageCost,
      upfrontDiscount,
      netAmountDue,
      paymentModeOptions,
      numberOfEmiTarget
    });

    res.status(201).json({ message: "Fee structure initialized successfully", feeStructure });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Student already has a fee structure initialized." });
    }
    console.error("Error initializing fee structure:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Step 2: Record an EMI/Cash Payment
 */
export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { student, feeStructureId, amountPaid, paymentMethod, transactionId, notes } = req.body;
    const instituteId = (req as any).instituteId;
    
    // employeeId from middleware, assuming employee who collected the payment
    const collectedBy = (req as any).user.role === 'Employee' ? (req as any).user.userId : undefined;

    const feeStructure = await FeeStructureModel.findById(feeStructureId);
    if (!feeStructure || feeStructure.institute.toString() !== instituteId.toString()) {
      return res.status(404).json({ message: "Fee Structure not found" });
    }

    // Generate Receipt Number safely using per-tenant counter
    const year = new Date().getFullYear();
    const prefix = `RCPT${year}`;
    const counter = await CounterModel.findOneAndUpdate(
      { id: "receiptNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const receiptNumber = `${prefix}${counter.seq.toString().padStart(5, "0")}`;

    const newPayment = await PaymentRecordModel.create({
      institute: instituteId,
      student,
      feeStructure: feeStructure._id,
      amountPaid,
      paymentMethod,
      transactionId,
      notes,
      collectedBy,
      receiptNumber
    });

    res.status(201).json({ message: "Payment recorded successfully", receipt: newPayment });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Step 3: Get Financial Summary for a Student
 */
export const getStudentFinancials = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const instituteId = (req as any).instituteId;

    const feeStructure = await FeeStructureModel.findOne({ student: studentId, institute: instituteId }).populate('courseReference', 'name');
    
    if (!feeStructure) {
      return res.status(404).json({ message: "No fee structure found for this student" });
    }

    const payments = await PaymentRecordModel.find({ student: studentId, institute: instituteId }).sort({ paymentDate: -1 }).populate('collectedBy', 'name');

    // Calculate sum of all payments
    const totalPaid = payments.reduce((acc, current) => acc + current.amountPaid, 0);
    const remainingBalance = feeStructure.netAmountDue - totalPaid;

    res.status(200).json({
      feeStructure,
      totalPaid,
      remainingBalance,
      payments
    });

  } catch (error) {
    console.error("Error fetching financial summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
