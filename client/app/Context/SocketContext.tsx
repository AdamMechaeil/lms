"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./Authcontext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Connect if user exists (ALL roles: Student, Trainer, Admin)
    if (user) {
      const socketInstance = io(
        process.env.NEXT_PUBLIC_DEV_BASE_URL || "http://localhost:8000",
        {
          withCredentials: true, // Important for cookies/session
        },
      );

      socketInstance.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected:", socketInstance.id);

        socketInstance.emit("join_notifications", {
          userId: user.userId,
          role: user.role,
        });

        // 3. Trainer Specific: Join session for tracking
        if (user.role.toLowerCase() === "trainer") {
          socketInstance.emit("join_session", { trainerId: user.userId });
        }
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected");
      });

      setSocket(socketInstance);

      // 3. Heartbeat interval (Only for Trainers)
      const heartbeatInterval = setInterval(() => {
        if (socketInstance.connected && user.role.toLowerCase() === "trainer") {
          socketInstance.emit("heartbeat", { trainerId: user.userId });
        }
      }, 30000); // 30 seconds

      return () => {
        clearInterval(heartbeatInterval);
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // If user logs out, ensure socket is closed
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user?.userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
