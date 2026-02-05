const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["cse", "aids", "ec", "ic", "civil", "electrical", "mechanical"],
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
