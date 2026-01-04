import mongoose from "mongoose";

export interface Material extends mongoose.Document {
  title: string;
  description: string;
  file: string;
  type: "Video" | "Document" | "Image";
}

const materialSchema = new mongoose.Schema<Material>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Video", "Document", "Image"],
    required: true,
  },
});

const MaterialModel = mongoose.model("Material", materialSchema);

export default MaterialModel;
