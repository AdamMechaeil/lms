import { Request, Response } from "express";
import MessageModel from "../models/Message.js";

export const getJobHistory = async (
  req: Request,
  res: Response
): Promise<any> => {
  // This seems to be a copy-paste error in my thought process, keeping function name generic or specific
};

export const getBatchMessages = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { batchId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await MessageModel.find({ batchId })
      .sort({ createdAt: -1 }) // Get newest first (for chat pagination usually we want reversed on UI, or get last 50)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Reverse to show oldest to newest in the list if preferred, but usually UI handles it.
    // Let's return as is (newest first) so UI can prepend easily.

    // We also need total count for pagination
    const total = await MessageModel.countDocuments({ batchId });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Actually, usually we want [old, ..., new] for the initial load
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const uploadChatMedia = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/assets/chat/${
      req.file.filename
    }`;

    let type = "file";
    if (req.file.mimetype.startsWith("image/")) {
      type = "image";
    } else if (req.file.mimetype.startsWith("video/")) {
      type = "video";
    } else if (req.file.mimetype.startsWith("audio/")) {
      type = "audio";
    }

    res.status(200).json({
      success: true,
      fileUrl,
      type,
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
