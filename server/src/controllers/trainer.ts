import { Request, Response } from "express";
import mongoose from "mongoose";
import TrainerModel from "../models/trainer.js";
import EmailModel from "../models/email.js";
import { deleteFromS3 } from "../utils/s3.js";
import { logActivity } from "../utils/activityLogger.js";

export async function createTrainer(req: Request, res: Response) {
  try {
    const { name, email, branch, domain, mobileNumber, designation, gender } =
      req.body;
    // S3 returns the full URL in .location, fallback to .filename if using disk storage for some reason, though .location is preferred for S3
    const profilePicture = req.file
      ? (req.file as any).location || req.file.filename
      : undefined;
    const addedEmail = await EmailModel.create({
      role: "Trainer",
      email,
    });
    const trainer = await TrainerModel.create({
      name,
      email: addedEmail._id,
      branch,
      domain,
      mobileNumber,
      designation,
      gender,
      profilePicture,
    });

    await logActivity({
      action: "TRAINER_JOINED",
      description: `New Trainer ${name} joined`,
      target: trainer._id,
      metadata: { branch, domain },
    });

    res.status(201).json(trainer);
  } catch (error) {
    console.error(error);
    if (req.file) {
      // Use the deleteFromS3 utility
      const fileKey = (req.file as any).key || req.file.filename;
      await deleteFromS3(fileKey);
    }
    res.status(500).json({ error: "Failed to create trainer" });
  }
}

export async function getAllTrainers(req: Request, res: Response) {
  try {
    const { branch, domain, page = 1, limit = 10 } = req.query;

    const pipeline: any[] = [];

    // Match stage
    const matchStage: any = {};
    if (branch)
      matchStage.branch = new mongoose.Types.ObjectId(branch as string);
    if (domain)
      matchStage.domain = new mongoose.Types.ObjectId(domain as string);

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Lookup and Unwind stages
    pipeline.push(
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$branch" },
      {
        $lookup: {
          from: "domains",
          localField: "domain",
          foreignField: "_id",
          as: "domain",
        },
      },
      { $unwind: "$domain" },
      {
        $lookup: {
          from: "emails",
          localField: "email",
          foreignField: "_id",
          as: "email",
        },
      },
      { $unwind: "$email" },
    );

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Facet for pagination and total count
    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limitNumber },
          {
            $project: {
              name: 1,
              email: 1,
              branch: 1,
              domain: 1,
              mobileNumber: 1,
              designation: 1,
              profilePicture: 1,
              gender: 1,
              firstLogin: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    const result = await TrainerModel.aggregate(pipeline);

    const trainers = result[0].data;
    const total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

    res.status(200).json({
      data: trainers,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get trainers" });
  }
}

export async function getTrainerById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const trainer = await TrainerModel.findById(id)
      .populate("branch")
      .populate("domain")
      .populate("email");
    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }
    res.status(200).json(trainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get trainer" });
  }
}

export async function updateTrainer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { email, ...otherData } = req.body; // Extract email string
    const updateData: any = { ...otherData };

    if (req.file) {
      updateData.profilePicture =
        (req.file as any).location || req.file.filename;
    }

    // Find the trainer to get the Email ID
    const existingTrainer = await TrainerModel.findById(id);
    if (!existingTrainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    // Update Email document if email is provided
    if (email) {
      await EmailModel.findByIdAndUpdate(existingTrainer.email, { email });
    }

    // Update Trainer document (excluding email)
    const trainer = await TrainerModel.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("email")
      .populate("branch")
      .populate("domain");

    res.status(200).json(trainer);
  } catch (error) {
    console.error("Update Trainer Error:", error);
    res.status(500).json({ error: "Failed to update trainer", details: error });
  }
}

export async function deleteTrainer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const trainer = await TrainerModel.findById(id);
    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    // Delete profile picture from S3 if it exists
    if (trainer.profilePicture) {
      await deleteFromS3(trainer.profilePicture);
    }

    await TrainerModel.findByIdAndDelete(id);
    await EmailModel.findByIdAndDelete(trainer.email);

    res.status(200).json(trainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete trainer" });
  }
}
