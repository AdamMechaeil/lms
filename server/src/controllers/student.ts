import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";
import { sendWelcomeEmail } from "../utils/Email.js";
import StudentModel from "../models/student.js";
import CounterModel from "../models/counter.js";
import { deleteFromS3 } from "../utils/s3.js";
import { logActivity } from "../utils/activityLogger.js";
export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const year = new Date().getFullYear();
    const prefix = `STU${year}`;
    const counter = await CounterModel.findOneAndUpdate(
      { id: "studentId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    const serialString = counter.seq.toString().padStart(4, "0");
    const studentId = `${prefix}${serialString}`;
    const plainPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const profilePicture = req.file
      ? (req.file as any).location || req.file.filename
      : undefined;

    const student = await StudentModel.create({
      ...req.body,
      studentId: studentId,
      password: hashedPassword,
      firstLogin: true,
      profilePicture,
    });

    await logActivity({
      action: "STUDENT_REGISTERED",
      description: `New student ${name} joined`,
      target: student._id,
      metadata: { studentId: student.studentId },
    });

    sendWelcomeEmail(email, name, plainPassword);

    res.status(201).send("Added Student Successfully");
  } catch (error) {
    console.error("Error creating student:", error);
    if (req.file) {
      const fileKey = (req.file as any).key || req.file.filename;
      await deleteFromS3(fileKey);
    }
    res.status(500).send("Internal Server Error");
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const { branch, batch, course, search, trainer } = req.query;

    const pipeline: any[] = [];
    const matchStage: any = {};

    if (branch) {
      matchStage.branch = new mongoose.Types.ObjectId(branch as string);
    }

    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ];
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    if (batch) {
      pipeline.push({
        $lookup: {
          from: "studentbatchlinks",
          localField: "_id",
          foreignField: "student",
          as: "batchLinks",
        },
      });
      pipeline.push({
        $match: {
          "batchLinks.batch": new mongoose.Types.ObjectId(batch as string),
        },
      });
    }

    if (course) {
      pipeline.push({
        $lookup: {
          from: "coursestudentlinks",
          localField: "_id",
          foreignField: "student",
          as: "courseLinks",
        },
      });
      pipeline.push({
        $match: {
          "courseLinks.course": new mongoose.Types.ObjectId(course as string),
        },
      });
    }

    if (trainer) {
      pipeline.push(
        {
          $lookup: {
            from: "studentbatchlinks",
            localField: "_id",
            foreignField: "student",
            as: "trainerBatchLinks",
          },
        },
        {
          $lookup: {
            from: "batches",
            localField: "trainerBatchLinks.batch",
            foreignField: "_id",
            as: "trainerBatches",
          },
        },
        {
          $match: {
            "trainerBatches.trainer": new mongoose.Types.ObjectId(
              trainer as string,
            ),
          },
        },
      );
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const facetStage = {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              batchLinks: 0,
              courseLinks: 0,
              trainerBatchLinks: 0,
              trainerBatches: 0,
              password: 0,
              __v: 0,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    };

    pipeline.push(facetStage);

    const result = await StudentModel.aggregate(pipeline);
    const data = result[0].data;
    const total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

    res.status(200).json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error getting students:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await StudentModel.findById(req.params.id).populate(
      "branch",
    );
    res.status(200).send(student);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profilePicture =
        (req.file as any).location || req.file.filename;
    }
    const student = await StudentModel.findByIdAndUpdate(
      req.params.id,
      updateData,
    );
    res.status(200).send("Updated Student Successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await StudentModel.findById(req.params.id);
    if (!student) {
      return res.status(404).send("Student not found");
    }

    if (student.profilePicture) {
      await deleteFromS3(student.profilePicture);
    }

    await StudentModel.findByIdAndDelete(req.params.id);
    res.status(200).send("Deleted Student Successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Security: Ensure student can only update their own profile
    // valid for Admin/Trainer too if they use this route, but primarily for Student
    // (req as any).user is populated by commonAuthenticator
    const requestUser = (req as any).user;
    if (
      requestUser.role === "student" &&
      requestUser.userId !== req.params.id
    ) {
      return res.status(403).send("Unauthorized to update this profile");
    }

    // Find student to get old profile picture
    const student = await StudentModel.findById(req.params.id);
    if (!student) {
      return res.status(404).send("Student not found");
    }

    // Delete old picture if it exists
    if (student.profilePicture) {
      await deleteFromS3(student.profilePicture);
    }

    const updateData = {
      profilePicture: (req.file as any).location || req.file.filename,
    };

    await StudentModel.findByIdAndUpdate(req.params.id, updateData);

    res.status(200).send("Profile picture updated successfully");
  } catch (error) {
    if (req.file) {
      const fileKey = (req.file as any).key || req.file.filename;
      await deleteFromS3(fileKey);
    }
    console.error("Error updating profile picture:", error);
    res.status(500).send("Internal Server Error");
  }
};
