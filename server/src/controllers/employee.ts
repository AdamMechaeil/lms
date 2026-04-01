import { Request, Response } from "express";
import EmployeeModel from "../models/employee.js";
import EmailModel from "../models/email.js";

// Add Employee
export async function addEmployee(req: Request, res: Response) {
  try {
    const { name, email, role, contactNumber } = req.body;
    const instituteId = (req as any).instituteId;

    // Check if email already registered for this institute
    const existingEmail = await EmailModel.findOne({ email, institute: instituteId });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered for this institute." });
    }

    const emailRecord = await EmailModel.create({
      email,
      role: "Employee",
      institute: instituteId
    });

    const newEmployee = await EmployeeModel.create({
      name,
      email: emailRecord._id,
      role, // The custom role ObjectId
      contactNumber,
      institute: instituteId
    });

    return res.status(201).json({ message: "Employee successfully added.", employee: newEmployee });
  } catch (error) {
    console.error("Add Employee Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get All Employees
export async function getEmployees(req: Request, res: Response) {
  try {
    const instituteId = (req as any).instituteId;
    const employees = await EmployeeModel.find({ institute: instituteId })
      .populate("email", "email")
      .populate("role", "name permissions");
    
    return res.status(200).json({ employees });
  } catch (error) {
    console.error("Get Employees Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Update Employee
export async function updateEmployee(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const instituteId = (req as any).instituteId;
    const { name, role, contactNumber, isActive } = req.body;

    const employee = await EmployeeModel.findOneAndUpdate(
      { _id: id, institute: instituteId },
      { name, role, contactNumber, isActive },
      { new: true }
    )
      .populate("email", "email")
      .populate("role", "name permissions");

    if (!employee) return res.status(404).json({ message: "Employee not found." });

    return res.status(200).json({ message: "Employee updated successfully.", employee });
  } catch (error) {
    console.error("Update Employee Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete Employee
export async function deleteEmployee(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const instituteId = (req as any).instituteId;
    
    // Explicitly bypass tenant filter so it deletes globally if necessary, or just rely on the plugin
    const employee = await EmployeeModel.findOneAndDelete({ _id: id, institute: instituteId });
    if (!employee) return res.status(404).json({ message: "Employee not found." });

    await EmailModel.findByIdAndDelete(employee.email);

    return res.status(200).json({ message: "Employee deleted successfully." });
  } catch (error) {
    console.error("Delete Employee Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
