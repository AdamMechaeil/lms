import { Request, Response } from "express";
import RoleModel from "../models/role.js";

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body;
    const instituteId = (req as any).instituteId;

    if (!instituteId) {
      return res.status(401).json({ message: "Unauthorized: Missing context" });
    }

    const newRole = await RoleModel.create({
      institute: instituteId,
      name,
      description,
      permissions: permissions || [],
      isSystemDefault: false
    });

    res.status(201).json({ message: "Role created successfully", role: newRole });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A role with this name already exists in your institute." });
    }
    console.error("Error creating role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await RoleModel.find(); // tenantPlugin automatically filters by institute
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
