"use client";
import React, { useEffect, useState } from "react";
import { getAllRoles } from "@/app/Services/Role";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import { Plus, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const AddRoleModal = dynamic(() => import("./AddRoleModal"), { ssr: false });

export default function Roles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles", error);
      toast.error("Failed to load custom roles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-8">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Role
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 bg-white/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          No custom roles defined yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {roles.map((role) => (
            <GlassCard key={role._id} className="relative p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-inner">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-neutral-800 dark:text-neutral-100">{role.name}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{role.description || "Custom Staff Role"}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Enabled Permissions</p>
                {role.permissions?.length > 0 ? (
                  role.permissions.map((perm: string) => (
                    <div key={perm} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-800/80">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="font-mono text-xs truncate">{perm}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-neutral-500 italic">No specific permissions assigned.</div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <AddRoleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchRoles}
      />
    </div>
  );
}
