"use client";
import React, { useEffect, useState } from "react";
import { getAllStudents, deleteStudent } from "@/app/Services/Student";
import { getAllBranches } from "@/app/Services/Branch"; // Import Branch Service
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Input } from "@/app/Components/ui/input";
import { Button } from "@/app/Components/ui/button";
import {
  Search,
  Plus,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/Components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Dynamic Imports
const AddStudentModal = dynamic(() => import("./AddStudentModal"), {
  ssr: false,
});
const ConfirmationModal = dynamic(() => import("./ConfirmationModal"), {
  ssr: false,
});

export default function Students() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Branch Filter State
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchStudents();
  }, [pagination.page, debouncedSearch, selectedBranch]); // Trigger fetch on filter change

  const fetchBranches = async () => {
    try {
      // Assuming getAllBranches returns an array or object with data
      // Based on previous fixes, we should handle both
      const response = await getAllBranches();
      const branchData = Array.isArray(response)
        ? response
        : response.data || [];
      setBranches(branchData);
    } catch (error) {
      console.error("Failed to fetch branches", error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
      };

      if (selectedBranch && selectedBranch !== "all") {
        params.branch = selectedBranch;
      }

      const data = await getAllStudents(params);
      setStudents(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      console.error("Failed to fetch students", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: any) => {
    setSelectedStudent(student);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(studentToDelete);
      toast.success("Student deleted successfully");
      fetchStudents();
    } catch (error) {
      console.error("Failed to delete student", error);
      toast.error("Failed to delete student");
    } finally {
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search students by name or ID..."
              className="pl-9 bg-white dark:bg-neutral-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Branch Filter */}
          <div className="w-[200px]">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <Filter className="w-4 h-4 mr-2 text-neutral-500" />
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={() => {
            setSelectedStudent(null);
            setIsAddModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Student
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 bg-white/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          No students found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map((student) => (
            <GlassCard
              key={student._id}
              className="relative group p-0 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6 flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 shadow-lg">
                    {student.profilePicture ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_DEV_BASE_URL}/assets/profilePicture/${student.profilePicture}`}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {student.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 ${
                      student.status === "Active"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  ></div>
                </div>

                {/* Info */}
                <div className="space-y-1 w-full">
                  <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 truncate">
                    {student.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full inline-block">
                    {student.studentId}
                  </p>
                </div>

                {/* Details */}
                <div className="w-full space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center gap-2 justify-center">
                    <Mail className="w-3 h-3 text-neutral-400" />
                    <span className="truncate max-w-[150px]">
                      {student.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Phone className="w-3 h-3 text-neutral-400" />
                    <span>{student.mobileNumber}</span>
                  </div>
                </div>

                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                      >
                        <MoreVertical className="w-4 h-4 text-neutral-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/Dashboard/admin/students/${student._id}`
                          )
                        }
                      >
                        <User className="w-4 h-4 mr-2" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(student)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(student._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Button
                  variant="ghost"
                  className="w-full mt-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() =>
                    router.push(`/Dashboard/admin/students/${student._id}`)
                  }
                >
                  View Details <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && students.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedStudent(null);
        }}
        onSuccess={fetchStudents}
        initialData={selectedStudent}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Student"
        description="Are you sure you want to delete this student? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
