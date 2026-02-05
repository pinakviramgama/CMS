const Department = require("../model/Department");
const cloudinary = require("../config/cloudinary");
const path = require("path");
const fs = require("fs");

const uploadMaterial = async (req, res) => {
  try {
    const { dept, sem, subjectName } = req.params; // ✅ FIXED
    const { type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!["pyqs", "midsem", "references"].includes(type)) {
      return res.status(400).json({ message: "Invalid material type" });
    }

    const material = {
      title: req.file.originalname,
      fileUrl: req.file.path,
      uploadedAt: new Date(),
    };

    const result = await Department.updateOne(
      { name: dept.toLowerCase(), "semesters.sem": Number(sem) },
      {
        $push: {
          [`semesters.$.subjects.$[sub].materials.${type}`]: material,
        },
      },
      {
        arrayFilters: [{ "sub.name": subjectName }], // ✅ FIXED
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Department / Semester / Subject not found",
      });
    }

    res.json({
      message: "PDF uploaded successfully",
      material,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { dept, sem, subjectName } = req.params;
    const { type, fileUrl } = req.body;

    const department = await Department.findOne({ name: dept.toLowerCase() });
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    const semester = department.semesters.find((s) => s.sem === Number(sem));
    if (!semester)
      return res.status(404).json({ message: "Semester not found" });

    const subject = semester.subjects.find(
      (s) => s.name.toLowerCase() === subjectName.toLowerCase(),
    );
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    const index = subject.materials[type].findIndex(
      (p) => p.fileUrl === fileUrl,
    );
    if (index === -1) return res.status(404).json({ message: "PDF not found" });

    // Remove from DB
    const removed = subject.materials[type].splice(index, 1);
    await department.save();

    // Delete from local server
    if (!fileUrl.startsWith("http")) {
      const filePath = path.join(__dirname, "..", fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // Delete from Cloudinary if URL is Cloudinary
    if (fileUrl.includes("res.cloudinary.com")) {
      // Extract public_id from URL
      const segments = fileUrl.split("/");
      const fileName = segments.pop(); // e.g., "file.pdf"
      const folderPath = segments
        .slice(segments.indexOf("upload") + 1)
        .join("/"); // folder in Cloudinary
      const publicId = folderPath.replace(/\.[^/.]+$/, ""); // remove extension
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ message: "PDF deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};
const getMaterial = async (req, res) => {
  const { dept, sem, subjectName } = req.params; // <-- use subjectName
  try {
    const department = await Department.findOne({ name: dept.toLowerCase() });
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    const semesterObj = department.semesters.find((s) => s.sem === Number(sem));
    if (!semesterObj)
      return res.status(404).json({ message: "Semester not found" });

    const subjectObj = semesterObj.subjects.find(
      (sub) => sub.name.toLowerCase() === subjectName.toLowerCase(), // <-- fixed
    );
    if (!subjectObj)
      return res.status(404).json({ message: "Subject not found" });

    return res.json({
      pyqs: subjectObj.materials.pyqs || [],
      midsem: subjectObj.materials.midsem || [],
      references: subjectObj.materials.references || [],
      links: subjectObj.materials.links || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Express example
const updateSemester = async (req, res) => {
  const { semester } = req.body;
  const userId = req.user._id; // From your auth middleware

  if (!semester || semester < 1 || semester > 8)
    return res.status(400).json({ message: "Invalid semester" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.semester = semester;
    await user.save();

    res
      .status(200)
      .json({ message: "Semester updated", semester: user.semester });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadMaterial,
  getMaterial,
  deleteMaterial,
  updateSemester,
};
