import { Request, Response } from "express";
import BatchModel from "../models/batch.js";
import StudentBatchLinkModel from "../models/studentbatchlink.js";
import TrainerModel from "../models/trainer.js";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "../utils/activityLogger.js";

export const createBatch = async (req: Request, res: Response) => {
  try {
    const batch = await BatchModel.create({
      ...req.body,
    });
    await logActivity({
      action: "BATCH_CREATED",
      description: `New Batch '${batch.title}' created`,
      target: batch._id,
      metadata: { branch: batch.branch, trainer: batch.trainer },
    });
    res.status(201).json(batch);
  } catch (error) {
    console.error(error);
    res.status(500).json("Batch creation has failed! Please Try Again!");
  }
};

export const getAllBatches = async (req: Request, res: Response) => {
  try {
    const { branch, trainer, status, type, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (branch) query.branch = branch;
    if (trainer) query.trainer = trainer;
    if (status) query.status = status;
    if (type) query.type = type;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const batches = await BatchModel.find(query)
      .skip(skip)
      .limit(limitNumber)
      .populate("branch")
      .populate("trainer");

    const total = await BatchModel.countDocuments(query);

    res.status(200).json({
      data: batches,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    res.status(500).json("Batch retrieval has failed! Please Try Again!");
  }
};

export const getBatchById = async (req: Request, res: Response) => {
  try {
    const batch = await BatchModel.findById(req.params.id)
      .populate("branch")
      .populate("trainer");
    if (!batch) {
      return res.status(404).json("Batch not found!");
    }
    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json("Batch retrieval has failed! Please Try Again!");
  }
};

export const updateBatch = async (req: Request, res: Response) => {
  try {
    const batch = await BatchModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!batch) {
      return res.status(404).json("Batch not found!");
    }
    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json("Batch update has failed! Please Try Again!");
  }
};

export const deleteBatch = async (req: Request, res: Response) => {
  try {
    const batch = await BatchModel.findByIdAndDelete(req.params.id);
    if (!batch) {
      return res.status(404).json("Batch not found!");
    }
    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json("Batch deletion has failed! Please Try Again!");
  }
};

import StudentModel from "../models/student.js";

export const assignBatchToStudent = async (req: Request, res: Response) => {
  try {
    const { batchId, studentId } = req.body;

    if (!batchId || !studentId) {
      res.status(400).json({
        error: "Invalid input. batchId and studentId are required.",
      });
      return;
    }

    // Try to find student by custom studentId first
    let student = await StudentModel.findOne({ studentId: studentId });

    // If not found, and it looks like an ID, try by _id (optional, for backward compat)
    if (!student && studentId.match(/^[0-9a-fA-F]{24}$/)) {
      student = await StudentModel.findById(studentId);
    }

    if (!student) {
      return res.status(404).json({ error: "Student not found with that ID!" });
    }

    // Check if already assigned
    const existingLink = await StudentBatchLinkModel.findOne({
      batch: batchId,
      student: student._id,
    });

    if (existingLink) {
      return res
        .status(400)
        .json({ error: "Student is already in this batch!" });
    }

    await StudentBatchLinkModel.create({
      batch: batchId,
      student: student._id,
    });

    // Fetch batch title for better logging
    const batch = await BatchModel.findById(batchId).select("title");
    await logActivity({
      action: "STUDENT_ASSIGNED",
      description: `Student '${student.name}' assigned to batch '${batch?.title || "Unknown"}'`,
      target: student._id,
      metadata: { batchId: batchId },
    });

    res.status(201).send("Batch assigned to student successfully");
  } catch (error) {
    console.error("Error assigning batch to student:", error);
    res.status(500).json({ error: "Failed To Assign Batch To Student" });
  }
};

export async function createBatchMeetLink(req: Request, res: Response) {
  try {
    const { batchId, trainerId } = req.body;
    const batchData = await BatchModel.findById(batchId);

    if (!batchData) {
      return res.status(404).json("Batch not found!");
    }

    const trainerData = await TrainerModel.findById(trainerId).select(
      "+googleRefreshToken",
    );

    let googleMeetLink = "";

    if (trainerData?.googleRefreshToken) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
      );

      oauth2Client.setCredentials({
        refresh_token: trainerData.googleRefreshToken,
      });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const startDateStr = new Date(batchData.startDate)
        .toISOString()
        .split("T")[0];
      const eventStartTime = new Date(
        `${startDateStr}T${batchData.startTime}:00`,
      );
      // Create a 1-hour event (or calculate based on endTime)
      const eventEndTime = new Date(eventStartTime.getTime() + 60 * 60 * 1000);

      // Construct RRULE for recurrence
      // User Requirement: Batch endDate is only for records. Real batches may extend due to holidays/leaves.
      // Solution: Set recurrence to a safe buffer (e.g., 6 months) from start date.
      let recurrence: string[] = [];
      const safeUntilDate = new Date(eventStartTime);
      safeUntilDate.setMonth(safeUntilDate.getMonth() + 6);

      // Format for RRULE: YYYYMMDDTHHMMSSZ (UTC)
      const untilDate =
        safeUntilDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      if (batchData.type === "Weekdays") {
        recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH;UNTIL=${untilDate}`];
      } else if (batchData.type === "Weekends") {
        recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=SA,SU;UNTIL=${untilDate}`];
      }

      const event = {
        summary: batchData.title,
        description: `Batch: ${batchData.title}`,
        start: {
          dateTime: eventStartTime.toISOString(),
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: eventEndTime.toISOString(),
          timeZone: "Asia/Kolkata",
        },
        recurrence: recurrence,
        conferenceData: {
          createRequest: {
            requestId: uuidv4(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      };

      try {
        const response = await calendar.events.insert({
          calendarId: "primary",
          requestBody: event,
          conferenceDataVersion: 1,
        });

        googleMeetLink = response.data.hangoutLink || "";
      } catch (calendarError) {
        console.error("Error creating Google Meet link:", calendarError);
        // Continue without link if fails, or handle as needed
      }
    }

    await BatchModel.findByIdAndUpdate(batchId, {
      googleMeetLink,
    });
    // ... (existing code)
    res.status(201).json("Batch meet link created!");
  } catch (error) {
    console.error("Error creating batch meet link:", error);
    res
      .status(500)
      .json("Batch meet link creation has failed! Please Try Again!");
  }
}

export async function getBatchRecordings(req: Request, res: Response) {
  try {
    const { batchId } = req.params;
    const batch = await BatchModel.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const trainer = await TrainerModel.findById(batch.trainer).select(
      "+googleRefreshToken",
    );
    if (!trainer || !trainer.googleRefreshToken) {
      return res
        .status(401)
        .json({ message: "Trainer not connected to Google" });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      refresh_token: trainer.googleRefreshToken,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Search for video files that contain the batch title in their name
    // Adjust the query as needed. 'video/mp4' covers most Meet recordings.
    // We also treat 'video/webm' just in case.
    const query = `name contains '${batch.title}' and (mimeType = 'video/mp4' or mimeType = 'video/webm') and trashed = false`;

    const response = await drive.files.list({
      q: query,
      fields:
        "files(id, name, webViewLink, webContentLink, createdTime, thumbnailLink)",
      orderBy: "createdTime desc",
      pageSize: 20, // Limit to recent 20
    });

    res.status(200).json({ recordings: response.data.files });
  } catch (error: any) {
    console.error("Error fetching recordings:", error);
    if (
      error.response?.data?.error === "invalid_grant" ||
      error.message?.includes("invalid_grant")
    ) {
      return res.status(401).json({
        message:
          "Google connection expired. Please reconnect your Google account in settings.",
        code: "GOOGLE_TOKEN_EXPIRED",
      });
    }
    res.status(500).json({ message: "Failed to fetch recordings" });
  }
}

export const getBatchesByStudent = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string;
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Resolve student ID if it's a custom ID
    let studentObjId = studentId;
    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
      const student = await StudentModel.findOne({ studentId: studentId });
      if (student) {
        studentObjId = student._id.toString();
      } else {
        console.log(`[DEBUG] Could not resolve Custom ID ${studentId}`);
        return res.status(404).json({ message: "Student not found" });
      }
    } else {
    }

    const batches = await StudentBatchLinkModel.find({ student: studentObjId })
      .populate("batch")
      .populate({
        path: "batch",
        populate: [
          { path: "branch", select: "name" },
          {
            path: "trainer",
            select: "name domain",
            populate: { path: "domain", select: "name" },
          },
        ],
      });

    // Flatten logic
    const formattedBatches = batches
      .map((link: any) => link.batch)
      .filter(Boolean);

    res.status(200).json(formattedBatches);
  } catch (error) {
    console.error("Error fetching student batches:", error);
    res.status(500).json({ message: "Failed to fetch student batches" });
  }
};

export const removeStudentFromBatch = async (req: Request, res: Response) => {
  try {
    const { batchId, studentId } = req.body;

    if (!batchId || !studentId) {
      return res.status(400).json({
        error: "Invalid input. batchId and studentId are required.",
      });
    }

    // Try to find student by custom studentId first
    let student = await StudentModel.findOne({ studentId: studentId });

    // If not found, and it looks like an ID, try by _id
    if (!student && studentId.match(/^[0-9a-fA-F]{24}$/)) {
      student = await StudentModel.findById(studentId);
    }

    if (!student) {
      return res.status(404).json({ error: "Student not found!" });
    }

    const deletedLink = await StudentBatchLinkModel.findOneAndDelete({
      batch: batchId,
      student: student._id,
    });

    if (!deletedLink) {
      return res.status(404).json({ error: "Student not found in this batch" });
    }

    res.status(200).json("Student removed from batch successfully");
  } catch (error) {
    console.error("Error removing student from batch:", error);
    res.status(500).json({ error: "Failed To Remove Student From Batch" });
  }
};
