import mongoose from "mongoose";

export interface Branch extends mongoose.Document {
  name: string;
  address: string;
  institute: mongoose.Types.ObjectId;
}

const branchSchema = new mongoose.Schema<Branch>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  { timestamps: true },
);

const BranchModel = mongoose.model("Branch", branchSchema);

export default BranchModel;
