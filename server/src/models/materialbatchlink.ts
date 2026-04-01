import mongoose from "mongoose";

export interface MaterialBatchLink extends mongoose.Document {
  material: mongoose.Types.ObjectId;
  batch: mongoose.Types.ObjectId;
  institute: mongoose.Types.ObjectId;
}

const materialBatchLinkSchema = new mongoose.Schema<MaterialBatchLink>({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material",
    required: true,
  },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
    required: true,
  },
});

const MaterialBatchLinkModel = mongoose.model(
  "MaterialBatchLink",
  materialBatchLinkSchema,
);

export default MaterialBatchLinkModel;
