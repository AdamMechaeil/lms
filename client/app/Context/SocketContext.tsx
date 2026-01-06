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
    // 1. Only connect if user exists AND is a trainer
    if (user && user.role.toLowerCase() === "trainer") {
      const socketInstance = io(
        process.env.NEXT_PUBLIC_DEV_BASE_URL || "http://localhost:8000",
        {
          withCredentials: true, // Important for cookies/session
        }
      );

      socketInstance.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected:", socketInstance.id);

        // 2. Immediately join session with trainerId
        socketInstance.emit("join_session", { trainerId: user.userId });
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected");
      });

      setSocket(socketInstance);

      // 3. Heartbeat interval
      const heartbeatInterval = setInterval(() => {
        if (socketInstance.connected) {
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
      // If user logs out or is not trainer, ensure socket is closed
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user]); // Re-run when user changes (login/logout)

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
