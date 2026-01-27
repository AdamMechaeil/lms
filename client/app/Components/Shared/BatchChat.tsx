"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "@/app/Context/SocketContext";
import { useAuth } from "@/app/Context/Authcontext";
import { getBatchMessages, uploadChatMedia } from "@/app/Services/Chat";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Send,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderModel: "Student" | "Trainer" | "Admin";
  content: string;
  type: "text" | "image" | "file" | "video" | "audio";
  fileUrl?: string; // If simplified
  createdAt: string;
}

interface BatchChatProps {
  batchId: string;
  className?: string;
}

export default function BatchChat({ batchId, className }: BatchChatProps) {
  const { socket, isConnected } = useSocket() || {};
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !batchId) return;

    // Optional: Check size/type
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size limit is 100MB");
      return;
    }

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("chatMedia", file);

      const data = await uploadChatMedia(formData);

      if (data.success) {
        // Send socket message
        socket?.emit("send_message", {
          batchId,
          content: "", // or filename
          senderId: user.userId,
          senderName: user.name || user.email || "Unknown",
          senderModel:
            user.role.charAt(0).toUpperCase() +
            user.role.slice(1).toLowerCase(),
          type: data.type,
          fileUrl: data.fileUrl,
        });
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload file");
    } finally {
      setSending(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Initial Load
  useEffect(() => {
    if (batchId) {
      fetchHistory();
    }
  }, [batchId]);

  // Auto-scroll on messages update
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages, loading]);

  // Socket Events
  useEffect(() => {
    if (!socket || !isConnected || !batchId || !user) return;

    // Join Room
    socket.emit("join_chat", { batchId, user });

    // Listen for new messages
    const handleReceiveMessage = (message: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, isConnected, batchId, user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getBatchMessages(batchId, 1, 500);
      // Data returns newest first usually, so we reverse for chat display
      const history = data.data; // Server already returns [old -> new]
      setMessages(history);
    } catch (error) {
      console.error("Failed to load chat history", error);
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected || !user) return;

    try {
      setSending(true);
      const content = newMessage.trim();

      // Emit to socket
      socket.emit("send_message", {
        batchId,
        content,
        senderId: user.userId,
        senderName: user.name || user.email || "Unknown",
        // Map user role to backend Expected Model Enum
        senderModel:
          user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase(),
        type: "text",
      });

      // Optimistic update? Or wait for socket echo?
      // Waiting for echo is safer for ID consistency, but slower UI.
      // Let's wait for echo since local network is fast.
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-[600px] bg-neutral-50/50 dark:bg-black/20 rounded-xl overflow-hidden border border-neutral-200 dark:border-white/5 ${className || ""}`}
    >
      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth min-h-0"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <User className="w-12 h-12 mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe =
              msg.senderId === (user as any)?._id ||
              msg.senderId === (user as any)?.userId ||
              msg.senderId === (user as any)?.id ||
              msg.senderId === user?.email ||
              (user?.name && msg.senderName === user.name) || // Name match fallback
              (user?.email && msg.senderName === user.email); // Email name match fallback

            const showHeader =
              index === 0 || messages[index - 1].senderId !== msg.senderId;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg._id || index}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                {showHeader && (
                  <span className="text-xs text-muted-foreground mb-1 ml-1 mr-1">
                    {msg.senderName}
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-white dark:bg-white/10 border border-neutral-200 dark:border-white/5 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.type === "image" && msg.fileUrl ? (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <img
                        src={msg.fileUrl}
                        alt="Shared image"
                        className="max-w-full h-auto object-cover max-h-[200px]"
                      />
                    </div>
                  ) : msg.type === "video" && msg.fileUrl ? (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <video
                        src={msg.fileUrl}
                        controls
                        className="max-w-full max-h-[200px]"
                      />
                    </div>
                  ) : msg.type === "audio" && msg.fileUrl ? (
                    <div className="mb-2">
                      <audio
                        src={msg.fileUrl}
                        controls
                        className="max-w-full"
                      />
                    </div>
                  ) : msg.type === "file" && msg.fileUrl ? (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-black/10 dark:bg-white/10 rounded-md">
                      <Paperclip className="w-4 h-4" />
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline truncate max-w-[150px]"
                      >
                        Attachment
                      </a>
                    </div>
                  ) : null}
                  {msg.content && <p>{msg.content}</p>}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-black/40 border-t border-neutral-200 dark:border-white/5">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          {/* File Uploads */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,application/pdf,text/plain"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-muted-foreground shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || sending}
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-neutral-200 dark:border-white/10"
            disabled={!isConnected}
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={!newMessage.trim() || !isConnected}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2 text-center">
            Disconnected from chat server. Reconnecting...
          </p>
        )}
      </div>
    </div>
  );
}
