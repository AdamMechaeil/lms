import DomainModel from "../models/domain.js";
import { Request, Response } from "express";

export const createDomain = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const domain = await DomainModel.create({ name, description });
    res.status(201).json(domain);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const updateDomain = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const domain = await DomainModel.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    res.status(200).json(domain);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const deleteDomain = async (req: Request, res: Response) => {
  try {
    const domain = await DomainModel.findByIdAndDelete(req.params.id);
    res.status(200).json(domain);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const getAllDomains = async (req: Request, res: Response) => {
  try {
    const domains = await DomainModel.find();
    res.status(200).json(domains);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const getDomainById = async (req: Request, res: Response) => {
  try {
    const domain = await DomainModel.findById(req.params.id);
    res.status(200).json(domain);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};
