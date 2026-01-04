import mongoose from "mongoose";

export interface Admin extends mongoose.Document {
  name: string;
  email: mongoose.Types.ObjectId;
}

const adminSchema = new mongoose.Schema<Admin>({
  name: { type: String, required: true },
  email: { type: mongoose.Schema.Types.ObjectId, ref: "Email", required: true },
});

const AdminModel = mongoose.model("Admin", adminSchema);

export default AdminModel;
