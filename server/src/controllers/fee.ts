import { Request, Response } from "express";
import FeeStructureModel from "../models/feeStructure.js";
import PaymentRecordModel from "../models/paymentRecord.js";
import CounterModel from "../models/counter.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

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

/**
 * STUDENT API: Get their own financial records using JWT payload
 */
export const getMyFinancials = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.userId;
    const instituteId = (req as any).instituteId;

    const feeStructure = await FeeStructureModel.findOne({ student: studentId, institute: instituteId }).populate('courseReference', 'name');
    
    if (!feeStructure) {
      return res.status(404).json({ message: "No fee structure found for your account" });
    }

    const payments = await PaymentRecordModel.find({ student: studentId, institute: instituteId }).sort({ paymentDate: -1 });
    const totalPaid = payments.reduce((acc, current) => acc + current.amountPaid, 0);
    const remainingBalance = feeStructure.netAmountDue - totalPaid;

    res.status(200).json({
      feeStructure,
      totalPaid,
      remainingBalance,
      payments
    });
  } catch (error) {
    console.error("Error fetching student financials:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * STUDENT API: Create a Razorpay Order for playing EMIs physically
 */
export const createStudentRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const studentId = (req as any).user.userId;
    const instituteId = (req as any).instituteId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    // Verify they have a fee structure and balance remaining
    const feeStructure = await FeeStructureModel.findOne({ student: studentId, institute: instituteId });
    if (!feeStructure) {
      return res.status(404).json({ message: "No fee structure found" });
    }

    const payments = await PaymentRecordModel.find({ student: studentId, institute: instituteId });
    const totalPaid = payments.reduce((acc, current) => acc + current.amountPaid, 0);
    const remainingBalance = feeStructure.netAmountDue - totalPaid;

    if (amount > remainingBalance) {
      return res.status(400).json({ message: `Cannot pay more than remaining balance: ₹${remainingBalance}` });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay credentials not configured for institute" });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `stu_rcpt_${instituteId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      feeStructureId: feeStructure._id
    });
  } catch (error) {
    console.error("Error creating student payment order:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

/**
 * STUDENT API: Verify Razorpay and auto-generate Receipt
 */
export const verifyStudentPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      feeStructureId,
      amountPaid
    } = req.body;
    
    const studentId = (req as any).user.userId;
    const instituteId = (req as any).instituteId;

    // Verify signature cryptographically
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed: Invalid Signature" });
    }

    // Generate valid receipt natively
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
      student: studentId,
      feeStructure: feeStructureId,
      amountPaid,
      paymentMethod: "Razorpay",
      transactionId: razorpay_payment_id,
      notes: "Online EMI payment via Student Dashboard",
      receiptNumber
    });

    res.status(200).json({
      success: true,
      message: "Payment successfully validated and recorded",
      receipt: newPayment
    });

  } catch (error) {
    console.error("Error verifying student payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
