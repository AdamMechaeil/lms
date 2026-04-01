import express from "express";
import {
  getBatchMessages,
  uploadChatMedia,
} from "../controllers/chatController.js";
import { upload } from "../middlewares/multer.js";
import { restoreTenantContext } from "../middlewares/tenantMiddleware.js";

const chatRouter = express.Router();

// GET /api/chat/:batchId/messages
chatRouter.get("/:batchId/messages", getBatchMessages);

// POST /api/chat/upload
chatRouter.post("/upload", upload.single("chatMedia"), restoreTenantContext, uploadChatMedia);

export default chatRouter;
