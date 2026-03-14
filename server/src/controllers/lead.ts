import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import LeadModel from "../models/lead.js";
import StudentModel from "../models/student.js";
import CounterModel from "../models/counter.js";
import { sendWelcomeEmail } from "../utils/Email.js";

export const createLead = async (req: Request, res: Response) => {
  try {
    const { name, email, mobileNumber, courseInterested, source, notes } = req.body;
    
    // The permissionMiddleware and tenantPlugin ensure this is scoped to the right institute
    const instituteId = (req as any).instituteId; 

    // assignedTo can be assigned manually or leave it empty for an admin to assign later
    const assignedTo = req.body.assignedTo;

    const newLead = await LeadModel.create({
      institute: instituteId,
      name,
      email,
      mobileNumber,
      courseInterested,
      source,
      notes,
      assignedTo,
    });

    res.status(201).json({ message: "Lead created successfully", lead: newLead });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLeads = async (req: Request, res: Response) => {
  try {
    const { status, source, search } = req.query;
    
    // The tenantPlugin handles the institute isolation automatically!
    const query: any = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await LeadModel.find(query)
        .populate("courseInterested", "name")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedLead = await LeadModel.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Lead updated successfully", lead: updatedLead });
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const convertLeadToStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { branch, gender, type } = req.body; // Additional required fields to make a Student record

    if (!branch || !gender || !type) {
      return res.status(400).json({ message: "Branch, gender, and type are required to convert a lead to a student." });
    }

    const lead = await LeadModel.findById(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (lead.status === "Converted") {
      return res.status(400).json({ message: "This lead has already been converted." });
    }

    // 1. Generate new Student ID
    const year = new Date().getFullYear();
    const prefix = `STU${year}`;
    
    // Note: Because of tenantPlugin, this Counter query is automatically isolated per Institute!
    const counter = await CounterModel.findOneAndUpdate(
      { id: "studentId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const serialString = counter.seq.toString().padStart(4, "0");
    const studentId = `${prefix}${serialString}`;
    
    // 2. Generate Random Password
    const plainPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 3. Create the Student Model Document
    const newStudent = await StudentModel.create({
      name: lead.name,
      email: lead.email,
      mobileNumber: lead.mobileNumber,
      institute: lead.institute,
      studentId: studentId,
      password: hashedPassword,
      branch: branch,
      gender: gender,
      type: type,
      firstLogin: true,
      status: "Active",
    });

    // 4. Send Welcome Email
    try {
        await sendWelcomeEmail(lead.email, lead.name, plainPassword);
    } catch (emailError) {
        console.error("Failed to send welcome email, but student was created:", emailError);
    }

    // 5. Update the Lead status to Converted
    lead.status = "Converted";
    await lead.save();

    res.status(201).json({
      message: "Lead successfully converted to Student!",
      student: newStudent,
    });

  } catch (error) {
    console.error("Error converting lead:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
