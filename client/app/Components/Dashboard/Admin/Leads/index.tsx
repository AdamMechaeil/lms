"use client";
import React, { useEffect, useState } from "react";
import AddLeadModal from "@/app/Components/Dashboard/Admin/Leads/AddLeadModal";
import ConvertLeadModal from "@/app/Components/Dashboard/Admin/Leads/ConvertLeadModal";
import { getLeads, updateLead } from "@/app/Services/Lead";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import {
  Plus,
  Loader2,
  Mail,
  Phone,
  Target,
  Edit,
  ArrowRightCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  "Inquiry": "bg-yellow-500",
  "Demo Scheduled": "bg-blue-500",
  "Initial Payment Paid": "bg-orange-500",
  "Converted": "bg-green-500",
};

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Convert Modal State
  const [convertModal, setConvertModal] = useState({ isOpen: false, leadId: "" });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error("Failed to fetch leads", error);
      toast.error("Failed to load admissions data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateLead(id, { status: newStatus });
      toast.success("Lead status updated securely");
      fetchLeads();
    } catch (error) {
      console.error("Failed to update lead", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-8">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Log Inquiry
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 bg-white/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          No prospective students found. Log an inquiry to start tracking!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {leads.map((lead) => (
            <GlassCard
              key={lead._id}
              className="relative group p-0 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {/* Top Accent Strip */}
              <div className={`absolute top-0 left-0 w-full h-1 ${STATUS_COLORS[lead.status] || "bg-neutral-500"}`} />

              <div className="p-5 flex-grow space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 line-clamp-1">
                      {lead.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      Source: {lead.source}
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full text-white ${STATUS_COLORS[lead.status] || "bg-neutral-500"}`}>
                    {lead.status}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-400" />
                    <span>{lead.mobileNumber}</span>
                  </div>
                  {lead.courseInterested && (
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-2">
                      <Target className="w-4 h-4 text-orange-400" />
                      <span className="truncate italic">Course: {lead.courseInterested.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between gap-2">
                {lead.status === "Converted" ? (
                  <div className="w-full text-center text-sm font-semibold text-green-600 dark:text-green-400">
                    Officially Enrolled
                  </div>
                ) : (
                  <>
                    <Select
                      value={lead.status}
                      onValueChange={(val) => handleStatusChange(lead._id, val)}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs bg-white dark:bg-neutral-900">
                        <SelectValue placeholder="Update Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inquiry">Inquiry</SelectItem>
                        <SelectItem value="Demo Scheduled">Demo Scheduled</SelectItem>
                        <SelectItem value="Initial Payment Paid">Initial Payment</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      size="sm"
                      onClick={() => setConvertModal({ isOpen: true, leadId: lead._id })}
                      className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs px-3 shadow-md shadow-green-500/20"
                    >
                      Convert <ArrowRightCircle className="w-3 h-3 ml-1" />
                    </Button>
                  </>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchLeads}
      />

      <ConvertLeadModal
        isOpen={convertModal.isOpen}
        leadId={convertModal.leadId}
        onClose={() => setConvertModal({ isOpen: false, leadId: "" })}
        onSuccess={fetchLeads}
      />
    </div>
  );
}
