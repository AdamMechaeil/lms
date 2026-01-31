import { Request, Response } from "express";
import MaterialModel from "../models/materials.js";
import { deleteFromS3 } from "../utils/s3.js";
import MaterialBatchLinkModel from "../models/materialbatchlink.js";
export const createMaterial = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const createdMaterials = await Promise.all(
      files.map(async (file) => {
        return await MaterialModel.create({
          ...req.body,
          file: (file as any).location || file.filename,
        });
      }),
    );

    res.status(201).json(createdMaterials);
  } catch (error) {
    console.error("Error creating material:", error);
    //@ts-ignore
    const files = req.files as Express.Multer.File[];
    if (files) {
      for (const file of files) {
        const fileKey = (file as any).key || file.filename;
        await deleteFromS3(fileKey);
      }
    }
    res.status(500).json({ error: "Failed to create material" });
  }
};

export const getAllMaterials = async (req: Request, res: Response) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (type) query.type = type;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const materials = await MaterialModel.find(query)
      .skip(skip)
      .limit(limitNumber);

    const total = await MaterialModel.countDocuments(query);

    res.status(200).json({
      data: materials,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    console.error("Error getting materials:", error);
    res.status(500).json({ error: "Failed to get materials" });
  }
};

export const getMaterialById = async (req: Request, res: Response) => {
  try {
    const material = await MaterialModel.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.status(200).json(material);
  } catch (error) {
    console.error("Error getting material:", error);
    res.status(500).json({ error: "Failed to get material" });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const material = await MaterialModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.status(200).json(material);
  } catch (error) {
    console.error("Error updating material:", error);
    res.status(500).json({ error: "Failed to update material" });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const material = await MaterialModel.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    if (material.file) {
      await deleteFromS3(material.file);
    }

    await MaterialModel.findByIdAndDelete(req.params.id);
    res.status(200).json(material);
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ error: "Failed to delete material" });
  }
};

export const assignMaterialsToBatch = async (req: Request, res: Response) => {
  try {
    const { batchId, materials } = req.body;
    await Promise.all(
      materials.map(async (materialId: string) => {
        // Prevent duplicates
        return await MaterialBatchLinkModel.findOneAndUpdate(
          { batch: batchId, material: materialId },
          { batch: batchId, material: materialId },
          { upsert: true, new: true },
        );
      }),
    );
    res
      .status(200)
      .json({ message: "Materials assigned to batch successfully" });
  } catch (error) {
    console.error("Error assigning materials to batch:", error);
    res.status(500).json({ error: "Failed to assign materials to batch" });
  }
};

export const getMaterialsByBatch = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const links = await MaterialBatchLinkModel.find({
      batch: batchId,
    }).populate("material");
    const materials = links
      .map((link: any) => link.material)
      .filter((m: any) => m !== null); // Filter out any nulls if material was deleted
    res.status(200).json(materials);
  } catch (error) {
    console.error("Error fetching batch materials:", error);
    res.status(500).json({ error: "Failed to fetch batch materials" });
  }
};
