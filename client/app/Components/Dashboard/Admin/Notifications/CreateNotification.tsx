import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { GlassCard } from "../../../ui/glass-card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Label } from "../../../ui/label";
import { sendNotification } from "../../../../Services/Notification";
import { getAllBatches } from "../../../../Services/Batch";
import { toast } from "sonner";

interface Batch {
  _id: string;
  title: string;
}

const CreateNotification = () => {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<string>("All");
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

  // Fetch Batches if needed
  useEffect(() => {
    if (recipientType === "Batch") {
      fetchBatches();
    }
  }, [recipientType]);

  const fetchBatches = async () => {
    try {
      const response = await getAllBatches();
      if (response.success) {
        setBatches(response.batches);
      }
    } catch (error) {
      console.error("Failed to fetch batches", error);
      toast.error("Failed to fetch batches");
    }
  };

  const handleBatchSelect = (batchId: string) => {
    if (selectedBatches.includes(batchId)) {
      setSelectedBatches(selectedBatches.filter((id) => id !== batchId));
    } else {
      setSelectedBatches([...selectedBatches, batchId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (recipientType === "Batch" && selectedBatches.length === 0) {
        toast.error("Please select at least one batch");
        return;
      }

      const payload = {
        title,
        message,
        recipientType,
        recipientIds: recipientType === "Batch" ? selectedBatches : [],
      };

      await sendNotification(payload);

      // Reset Form
      setTitle("");
      setMessage("");
      setRecipientType("All");
      setSelectedBatches([]);
      toast.success("Notification Sent Successfully!", {
        description: `Sent to ${recipientType}`,
      });
    } catch (error) {
      console.error("Error sending notification", error);
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="p-8 relative overflow-hidden">
          {/* Ambient Background Effect */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6 flex items-center gap-2">
              <Send className="w-6 h-6 text-indigo-400" />
              Create Notification
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter notification title"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                {/* Recipient Type */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Target Audience</Label>
                  <Select
                    value={recipientType}
                    onValueChange={(val) => setRecipientType(val)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                      <SelectItem value="All">Everyone</SelectItem>
                      <SelectItem value="AllTrainers">All Trainers</SelectItem>
                      <SelectItem value="AllStudents">All Students</SelectItem>
                      <SelectItem value="Batch">Specific Batches</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Batch Selector - Animated Reveal */}
              <AnimatePresence>
                {recipientType === "Batch" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label className="text-gray-300">Select Batches</Label>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 min-h-[100px] max-h-[200px] overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
                      {batches.map((batch) => (
                        <div
                          key={batch._id}
                          onClick={() => handleBatchSelect(batch._id)}
                          className={`
                            cursor-pointer px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center justify-between group
                            ${
                              selectedBatches.includes(batch._id)
                                ? "bg-indigo-500/30 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white"
                            }
                          `}
                        >
                          <span className="truncate">{batch.title}</span>
                          {selectedBatches.includes(batch._id) && (
                            <CheckCircle className="w-4 h-4 text-indigo-400" />
                          )}
                        </div>
                      ))}
                      {batches.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 py-4">
                          No batches found.
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Selected: {selectedBatches.length} batches
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-gray-300">Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[120px] focus:border-indigo-500/50 focus:ring-indigo-500/20"
                  required
                />
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">
                    {message.length} chars
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 px-8 py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CreateNotification;
