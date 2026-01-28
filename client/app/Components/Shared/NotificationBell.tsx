"use client";

import React, { useEffect, useState } from "react";
import { Bell, Check, Info, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useSocket } from "@/app/Context/SocketContext";
import { useAuth } from "@/app/Context/Authcontext";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "@/app/Services/Notification";
import { toast } from "sonner";
import { cn } from "@/app/Utils/cn";
import moment from "moment";

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  readBy: string[];
  recipientType: string;
}

const NotificationBell = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        updateUnreadCount(res.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const updateUnreadCount = (list: Notification[]) => {
    if (!user) return;
    const count = list.filter((n) => !n.readBy.includes(user.userId)).length;
    setUnreadCount(count);
  };

  // Socket Listener
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotification: Notification) => {
      // Play sound? (Optional)
      // Display Toast
      toast(newNotification.title, {
        description: newNotification.message,
        action: {
          label: "View",
          onClick: () => {}, // Maybe scroll to it?
        },
      });

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("receive_notification", handleNewNotification);

    return () => {
      socket.off("receive_notification", handleNewNotification);
    };
  }, [socket]);

  const handleMarkAsRead = async (id: string) => {
    try {
      if (!user) return;
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, readBy: [...n.readBy, user.userId] } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative outline-none">
        <div className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10">
          <Bell className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 md:w-96 p-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-white/20 shadow-2xl max-h-[80vh] overflow-y-auto"
      >
        <DropdownMenuLabel className="p-4 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md z-10 border-b border-white/10">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs font-normal text-indigo-400">
              {unreadCount} unread
            </span>
          )}
        </DropdownMenuLabel>

        <div className="flex flex-col">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = user && n.readBy.includes(user.userId);
              return (
                <DropdownMenuItem
                  key={n._id}
                  className={cn(
                    "p-4 cursor-pointer focus:bg-white/10 border-b border-white/5 flex gap-3 items-start",
                    !isRead ? "bg-indigo-500/5" : "opacity-70",
                  )}
                  onClick={() => !isRead && handleMarkAsRead(n._id)}
                >
                  <div
                    className={cn(
                      "mt-1 p-2 rounded-full",
                      n.recipientType === "Batch"
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-blue-500/10 text-blue-400",
                    )}
                  >
                    {n.recipientType === "Batch" ? (
                      <Calendar className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p
                        className={cn(
                          "text-sm font-medium leading-none",
                          !isRead && "text-indigo-400",
                        )}
                      >
                        {n.title}
                      </p>
                      {!isRead && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {moment(n.createdAt).fromNow()}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
