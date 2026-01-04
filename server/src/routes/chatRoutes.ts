import express from "express";
import {
  getBatchMessages,
  uploadChatMedia,
} from "../controllers/chatController.js";
import { upload } from "../middlewares/multer.js";
// import { isAuth } from "../middlewares/auth"; // Optional: Add auth if needed, strict for production

const chatRouter = express.Router();

// GET /api/chat/:batchId/messages
chatRouter.get("/:batchId/messages", getBatchMessages);

// POST /api/chat/upload
chatRouter.post("/upload", upload.single("chatMedia"), uploadChatMedia);

export default chatRouter;
