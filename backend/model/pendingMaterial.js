const mongoose = require("mongoose");

const pendingMaterialSchema = new mongoose.Schema({
  dept: String,
  sem: Number,
  subject: String,
  type: {
    type: String,
    enum: ["pyqs", "midsem", "references"],
  },
  title: String,
  fileUrl: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: { type: String, default: "" },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PendingMaterial", pendingMaterialSchema);
