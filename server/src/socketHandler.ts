import { Server as SocketIOServer, Socket } from "socket.io";
import MessageModel from "./models/Message.js";
import TrainerSessionModel from "./models/trainerSession.js";
import StudentBatchLinkModel from "./models/studentbatchlink.js";

// In-memory mapping of SocketID -> SessionID (Single-Server solution)
const activeSessions = new Map<string, string>();

let ioInstance: SocketIOServer;

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized!");
  }
  return ioInstance;
};

export const initializeSocket = (io: SocketIOServer) => {
  ioInstance = io;
  io.on("connection", (socket: Socket) => {
    console.log("New client connected:", socket.id);

    // --- SESSION TRACKING LOGIC ---
    socket.on("join_session", async (data: { trainerId: string }) => {
      const { trainerId } = data;
      if (!trainerId) return;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find existing Active session for today (handling reconnects)
        let session = await TrainerSessionModel.findOne({
          trainerId,
          date: today,
          status: "Active",
        });

        const now = new Date();

        if (session) {
          // Just update lastActive
          session.lastActiveAt = now;
          await session.save();
        } else {
          // Create new session
          session = await TrainerSessionModel.create({
            trainerId,
            date: today,
            startTime: now,
            lastActiveAt: now,
            status: "Active",
            ipAddress: socket.handshake.address,
            device: socket.handshake.headers["user-agent"] || "Unknown",
          });
        }

        // Map socket to this session ID
        activeSessions.set(socket.id, session._id.toString());
        console.log(
          `Session Active for Trainer ${trainerId} (Socket: ${socket.id})`,
        );
      } catch (error) {
        console.error("Error handling join_session:", error);
      }
    });

    // --- NOTIFICATION LOGIC ---
    // --- NOTIFICATION LOGIC ---
    socket.on(
      "join_notifications",
      async (data: { userId: string; role: string }) => {
        const { userId, role } = data;
        if (!userId) return;

        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined notification room user_${userId}`);

        if (role) {
          socket.join(`role_${role}`);
        }

        // If Student, join their batch rooms to receive Batch Notifications
        if (role && role.toLowerCase() === "student") {
          try {
            // We need to use dynamic import or ensure Model is loaded if ESM issues arise,
            // but since we imported it at top level, it should be fine.
            const links = await StudentBatchLinkModel.find({ student: userId });
            links.forEach((link) => {
              socket.join(`batch_${link.batch}`);
              console.log(`Student ${userId} joined batch_${link.batch}`);
            });
          } catch (error) {
            console.error("Error joining batch rooms for student:", error);
          }
        }
      },
    );

    // --- CHAT LOGIC ---
    socket.on("join_chat", (data: { batchId: string; user: any }) => {
      const { batchId, user } = data;
      if (!batchId) return;

      socket.join(`batch_${batchId}`);
      console.log(`User ${user?.name || socket.id} joined batch_${batchId}`);
    });

    socket.on(
      "send_message",
      async (data: {
        batchId: string;
        content: string;
        senderId: string;
        senderModel: "Student" | "Trainer" | "Admin";
        senderName: string;
        type?: "text" | "image" | "file";
        fileUrl?: string;
      }) => {
        try {
          const {
            batchId,
            content,
            senderId,
            senderModel,
            senderName,
            type,
            fileUrl,
          } = data;

          // Save to MongoDB
          const newMessage = await MessageModel.create({
            batchId,
            content,
            senderId,
            senderModel,
            senderName,
            type: type || "text",
            fileUrl,
          });

          // Broadcast to everyone in the room
          io.in(`batch_${batchId}`).emit("receive_message", newMessage);
        } catch (error) {
          console.error("Error sending message:", error);
        }
      },
    );

    // --- HEARTBEAT ---
    socket.on("heartbeat", async (data: { trainerId: string }) => {
      const { trainerId } = data;
      const sessionId = activeSessions.get(socket.id);

      if (sessionId) {
        await TrainerSessionModel.findByIdAndUpdate(sessionId, {
          lastActiveAt: new Date(),
        });
      } else if (trainerId) {
        // Fallback: try to find active session
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const session = await TrainerSessionModel.findOne({
          trainerId,
          date: today,
          status: "Active",
        });
        if (session) {
          session.lastActiveAt = new Date();
          await session.save();
          activeSessions.set(socket.id, session._id.toString());
        }
      }
    });

    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);
      activeSessions.delete(socket.id);
      // We do NOT close the session here.
      // If it's a refresh, they will reconnect and resume.
      // If it's a close tab, the Scheduler will auto-close it after timeout.
    });
  });
};
