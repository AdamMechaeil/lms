import mongoose from "mongoose";

export interface Branch extends mongoose.Document {
  name: string;
  address: string;
}

const branchSchema = new mongoose.Schema<Branch>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

const BranchModel = mongoose.model("Branch", branchSchema);

export default BranchModel;
