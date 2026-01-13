import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";
import { sendWelcomeEmail } from "../utils/Email.js";
import StudentModel from "../models/student.js";
import fs from "fs";
export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const year = new Date().getFullYear();
    const prefix = `STU${year}`;
    const lastStudent = await StudentModel.findOne({
      studentId: { $regex: `^${prefix}` },
    }).sort({ studentId: -1 });

    let newSerial = 1;
    if (lastStudent && lastStudent.studentId) {
      const lastSerial = parseInt(lastStudent.studentId.replace(prefix, ""));
      if (!isNaN(lastSerial)) {
        newSerial = lastSerial + 1;
      }
    }

    const serialString = newSerial.toString().padStart(4, "0");
    const studentId = `${prefix}${serialString}`;
    const plainPassword = crypto.randomBytes(4).toString("hex"); // 8 chars hex
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const profilePicture = req.file ? req.file.filename : undefined;

    const student = await StudentModel.create({
      ...req.body,
      studentId: studentId,
      password: hashedPassword,
      firstLogin: true,
      profilePicture,
    });

    sendWelcomeEmail(email, name, plainPassword);

    res.status(201).send("Added Student Successfully");
  } catch (error) {
    console.error("Error creating student:", error);
    if (req.file) {
      fs.unlinkSync(
        `${process.cwd()}/assets/profilePicture/${req.file.filename as string}`
      );
    }
    res.status(500).send("Internal Server Error");
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const { branch, batch, course, search } = req.query;

    const pipeline: any[] = [];
    const matchStage: any = {};

    // 1. Direct Filters (Branch & Search)
    if (branch) {
      matchStage.branch = new mongoose.Types.ObjectId(branch as string);
    }

    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ];
    }

    // Apply match stage if not empty
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // 2. Filter by Batch (Requires Lookup)
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

    // 3. Filter by Course (Requires Lookup)
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

    // 4. Pagination and Facet
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
      "branch"
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
      updateData.profilePicture = req.file.filename;
    }
    const student = await StudentModel.findByIdAndUpdate(
      req.params.id,
      updateData
    );
    res.status(200).send("Updated Student Successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await StudentModel.findByIdAndDelete(req.params.id);
    res.status(200).send("Deleted Student Successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};
