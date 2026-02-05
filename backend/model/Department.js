// models/Department.js
const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  title: String,
  fileUrl: String,
  uploadedAt: Date,
});

const linkSchema = new mongoose.Schema({
  title: String,
  url: String,
  rejectionReason: { type: String, default: "" },
});

const subjectSchema = new mongoose.Schema({
  name: String,
  materials: {
    pyqs: [materialSchema],
    midsem: [materialSchema],
    references: [materialSchema],
    links: [linkSchema],
  },
});

const semesterSchema = new mongoose.Schema({
  sem: Number,
  subjects: [subjectSchema],
});

const departmentSchema = new mongoose.Schema({
  name: String,
  semesters: [semesterSchema],
});

module.exports = mongoose.model("Department", departmentSchema);
