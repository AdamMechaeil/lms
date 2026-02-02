import "./config/env.js";
import http from "http";

import { Server } from "socket.io";
import { app } from "./app.js";
import { initializeSocket } from "./socketHandler.js";

const port = process.env.PORT || 8000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:3000"], // Specific origin required for credentials
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize Socket Logic
initializeSocket(io);

server.listen(port, () => {
  console.log("Server is running");
});
