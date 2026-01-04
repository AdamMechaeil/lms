import { Request, Response } from "express";
import BranchModel from "../models/branch.js";

export async function createBranch(req: Request, res: Response) {
  try {
    await BranchModel.create({
      ...req.body,
    });
    res.status(201).send("Branch Added Successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

export async function getAllBranches(req: Request, res: Response) {
  try {
    const branches = await BranchModel.find();
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

export async function updateBranch(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await BranchModel.findByIdAndUpdate(id, req.body);
    res.status(200).send("Branch Updated Successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

export async function deleteBranch(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await BranchModel.findByIdAndDelete(id);
    res.status(200).send("Branch Deleted Successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}
