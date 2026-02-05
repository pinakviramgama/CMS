const mongoose = require("mongoose");

const pendingLinkSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
    dept: String,
    sem: Number,
    subjectName: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "pending" },
    rejectionReason: { type: String, default: "" },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PendingLink", pendingLinkSchema);
