"use client";
import React, { useEffect, useState } from "react";
import { getAllMaterials, deleteMaterial } from "@/app/Services/Materials";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import { Input } from "@/app/Components/ui/input";
import {
  Plus,
  Search,
  Trash2,
  FileText,
  Video,
  Image as ImageIcon,
  Download,
  Loader2,
  Calendar,
  Filter,
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";

const AddMaterialModal = dynamic(() => import("./AddMaterialModal"), {
  ssr: false,
});
const ConfirmationModal = dynamic(() => import("./ConfirmationModal"), {
  ssr: false,
});

interface Material {
  _id: string;
  title: string;
  description: string;
  file: string;
  type: "Video" | "Document" | "Image";
  createdAt?: string;
}

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    materialId: "",
  });

  // Pagination (Client-side filtering for search, but Server-side for basic list if needed)
  // Since we don't have search API, we'll fetch all or paginated and filter locally for search
  // Assuming API supports pagination, let's keep it simple with pagination support
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchMaterials();
  }, [pagination.page, selectedType]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: 12,
      };
      if (selectedType !== "all") params.type = selectedType;

      const data = await getAllMaterials(params);
      setMaterials(data.data);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (error) {
      console.error("Failed to fetch materials:", error);
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMaterial(deleteModal.materialId);
      toast.success("Material deleted successfully");
      fetchMaterials();
    } catch (error) {
      console.error("Failed to delete material", error);
      toast.error("Failed to delete material");
    }
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="w-6 h-6 text-blue-500" />;
      case "Image":
        return <ImageIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <FileText className="w-6 h-6 text-green-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Video":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Image":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
            Study Materials
          </h1>
          <p className="text-neutral-500 mt-1">
            Manage documents, videos, and images.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Upload Material
        </Button>
      </div>

      <GlassCard className="p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Search materials..."
            className="pl-9 bg-white/50 dark:bg-neutral-900/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <Select
            value={selectedType}
            onValueChange={(val) => {
              setSelectedType(val);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <SelectTrigger className="w-[180px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <SelectValue placeholder="Filter Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Document">Documents</SelectItem>
              <SelectItem value="Video">Videos</SelectItem>
              <SelectItem value="Image">Images</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 bg-white/30 dark:bg-neutral-900/30 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          No materials found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMaterials.map((material) => (
            <GlassCard
              key={material._id}
              className="group relative overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Type Badge */}
              <div
                className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium z-10 ${getTypeColor(
                  material.type
                )}`}
              >
                {material.type}
              </div>

              {/* Preview/Icon Area */}
              <div className="h-40 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center mb-4 overflow-hidden relative">
                {material.type === "Image" ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_DEV_BASE_URL}/assets/materials/${material.file}`}
                    alt={material.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="scale-150 transform transition-transform group-hover:scale-125 duration-500">
                    {getIcon(material.type)}
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={`${process.env.NEXT_PUBLIC_DEV_BASE_URL}/assets/materials/${material.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                    title="Download/View"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() =>
                      setDeleteModal({ isOpen: true, materialId: material._id })
                    }
                    className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600/80 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col">
                <h3
                  className="font-bold text-neutral-800 dark:text-neutral-100 line-clamp-1 mb-1"
                  title={material.title}
                >
                  {material.title}
                </h3>
                <p
                  className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-4 flex-1"
                  title={material.description}
                >
                  {material.description}
                </p>

                {/* Footer Info */}
                {/* Assuming createdAt exists, if not we can omit */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 text-xs text-neutral-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Recently Added</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchMaterials}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, materialId: "" })}
        onConfirm={handleConfirmDelete}
        title="Delete Material"
        description="Are you sure you want to delete this material? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
