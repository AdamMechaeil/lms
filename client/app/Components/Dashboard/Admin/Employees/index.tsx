"use client";
import React, { useEffect, useState } from "react";
import { getAllEmployees, deleteEmployee } from "@/app/Services/Employee";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import {
  Plus,
  Loader2,
  Trash2,
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import ConfirmationModal from "../Students/ConfirmationModal";

const AddEmployeeModal = dynamic(() => import("./AddEmployeeModal"), {
  ssr: false,
});

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, employeeId: "" });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getAllEmployees();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, employeeId: id });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEmployee(deleteModal.employeeId);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      console.error("Failed to delete employee:", error);
      toast.error("Failed to delete employee");
    } finally {
      setDeleteModal({ isOpen: false, employeeId: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-8">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Invite Employee
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 bg-white/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          No employees added yet. Invite your staff to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map((employee) => (
            <GlassCard
              key={employee._id}
              className="relative group p-0 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-6 flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 shadow-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <span className="text-white text-3xl font-bold">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 ${
                      employee.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                </div>

                {/* Info */}
                <div className="space-y-1 w-full">
                  <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 truncate">
                    {employee.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Shield className="w-3 h-3 text-indigo-500" />
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {employee.role?.name || "No Role Assigned"}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="w-full space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center gap-2 justify-center">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <span className="truncate max-w-[180px]">
                      {employee.email?.email || "No Email"}
                    </span>
                  </div>
                  {employee.contactNumber && (
                    <div className="flex items-center gap-2 justify-center">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      <span>{employee.contactNumber}</span>
                    </div>
                  )}
                </div>

                {/* Actions Overlay */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(employee._id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchEmployees}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, employeeId: "" })}
        onConfirm={handleConfirmDelete}
        title="Revoke Employee Access"
        description="Are you sure you want to completely remove this employee? Their dashboard access will be immediately revoked."
        confirmText="Revoke Access"
        variant="danger"
      />
    </div>
  );
}
