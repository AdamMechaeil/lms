import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { initializeSocket } from "./socketHandler.js";

const port = process.env.PORT || 8000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development, refine for production
    methods: ["GET", "POST"],
  },
});

// Initialize Socket Logic
initializeSocket(io);

server.listen(port, () => {
  console.log("Server is running");
});
