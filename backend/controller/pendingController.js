const PendingMaterial = require("../model/pendingMaterial");
const Department = require("../model/Department");
const PendingLink = require("../model/pendingLink");

/* ========================= MATERIALS ========================= */

// STUDENT: get all uploads (pending + approved + rejected)
const getHistory = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Pending / Rejected
    const pendingRejected = await PendingMaterial.find({
      uploadedBy: userId,
    }).populate("uploadedBy", "name email");

    // Approved: go through all departments -> semesters -> subjects
    const departments = await Department.find({});
    let approved = [];

    departments.forEach((dept) => {
      dept.semesters.forEach((sem) => {
        sem.subjects.forEach((sub) => {
          ["pyqs", "midsem", "references"].forEach((type) => {
            sub.materials[type].forEach((mat) => {
              if (mat.uploadedBy?.toString() === userId) {
                approved.push({
                  _id: mat._id,
                  title: mat.title,
                  type,
                  status: "approved",
                  fileUrl: mat.fileUrl,
                  uploadedAt: mat.uploadedAt,
                  subject: sub.name,
                  dept: dept.name,
                  sem: sem.sem,
                  uploadedBy: {
                    _id: userId,
                    name: req.user.name,
                    email: req.user.email,
                  },
                });
              }
            });
          });
        });
      });
    });

    const allUploads = [...pendingRejected, ...approved].sort(
      (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt),
    );

    res.json(allUploads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch uploads" });
  }
};

// STUDENT: upload PDF for admin approval
const uploadMaterialForApproval = async (req, res) => {
  try {
    const { dept, sem, subjectName } = req.params;
    const { type } = req.body;
    const userId = req.user._id;

    if (!dept || !sem || !subjectName)
      return res
        .status(400)
        .json({ message: "Department, semester, and subject are required" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    if (!["pyqs", "midsem", "references"].includes(type))
      return res.status(400).json({ message: "Invalid type" });

    const pending = new PendingMaterial({
      dept: dept.toLowerCase(),
      sem: Number(sem),
      subject: subjectName.toLowerCase(),
      type,
      title: req.file.originalname,
      fileUrl: req.file.path,
      uploadedBy: userId,
      uploadedAt: new Date(),
      status: "pending",
    });

    await pending.save();
    res.status(201).json({ message: "PDF submitted for admin approval" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// ADMIN: get all pending materials
const getPendingMaterials = async (req, res) => {
  try {
    const pending = await PendingMaterial.find({ status: "pending" }).populate(
      "uploadedBy",
      "name email",
    );
    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pending materials" });
  }
};

// ADMIN: approve pending material
const approvePendingMaterial = async (req, res) => {
  try {
    const pending = await PendingMaterial.findById(req.params.id);
    if (!pending)
      return res.status(404).json({ message: "Pending material not found" });

    const department = await Department.findOne({ name: pending.dept });
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    const semester = department.semesters.find((s) => s.sem === pending.sem);
    if (!semester)
      return res.status(404).json({ message: "Semester not found" });

    const subject = semester.subjects.find(
      (s) => s.name.toLowerCase() === pending.subject.toLowerCase(),
    );
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    subject.materials[pending.type].push({
      title: pending.title,
      fileUrl: pending.fileUrl,
      uploadedAt: pending.uploadedAt || new Date(),
      uploadedBy: pending.uploadedBy,
    });

    await department.save();
    await PendingMaterial.findByIdAndDelete(pending._id);

    res.json({
      message: "Material approved and moved to subject successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
};

/* ========================= LINKS ========================= */

// STUDENT: submit link for admin approval
const submitLinkForApproval = async (req, res) => {
  const { title, url } = req.body;
  const { dept, sem, subjectName } = req.params;
  const userId = req.user._id;

  if (!title || !url)
    return res.status(400).json({ message: "Title and URL required" });

  try {
    const pending = await PendingLink.create({
      dept,
      sem,
      subjectName,
      title,
      url,
      uploadedBy: userId,
      status: "pending",
      createdAt: new Date(),
    });

    res
      .status(201)
      .json({ message: "Link submitted for admin approval", pending });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET pending links
const getPendingLinks = async (req, res) => {
  try {
    const { dept, sem, subjectName } = req.params;

    let filter = {};
    if (dept && sem && subjectName) {
      filter = { dept, sem: Number(sem), subjectName };
    }

    const links = await PendingLink.find(filter)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const approvePendingLink = async (req, res) => {
  try {
    const { id } = req.params;

    const pendingLink = await PendingLink.findById(id);
    if (!pendingLink)
      return res.status(404).json({ message: "Link not found" });

    // ✅ Find Department
    const department = await Department.findOne({
      name: pendingLink.dept.toLowerCase(),
    });

    if (!department)
      return res.status(404).json({ message: "Department not found" });

    // ✅ Find Semester
    const semester = department.semesters.find(
      (s) => s.sem === Number(pendingLink.sem),
    );

    if (!semester)
      return res.status(404).json({ message: "Semester not found" });

    // ✅ Find Subject
    const subject = semester.subjects.find(
      (s) => s.name.toLowerCase() === pendingLink.subjectName.toLowerCase(),
    );

    if (!subject) return res.status(404).json({ message: "Subject not found" });

    // ✅ Push into REAL DB links[]
    subject.materials.links.push({
      title: pendingLink.title,
      url: pendingLink.url,
    });

    await department.save();

    // ✅ Update PendingLink status for HISTORY
    pendingLink.status = "approved";
    pendingLink.rejectionReason = "";

    await pendingLink.save();

    res.json({
      message: "Link approved + added to subject DB + history updated",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approval failed" });
  }
};

const rejectPendingLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ message: "Reason required" });

    const link = await PendingLink.findById(id);
    if (!link) return res.status(404).json({ message: "Link not found" });

    link.status = "rejected";
    link.rejectionReason = reason;

    await link.save();

    res.json({ message: "Link rejected (saved in history)" });
  } catch (err) {
    res.status(500).json({ message: "Reject failed" });
  }
};

const getStudentLinksHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const links = await PendingLink.find({
      uploadedBy: userId,
    }).sort({ createdAt: -1 });

    res.json(links);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

// ADMIN: reject pending material
const rejectPendingMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ message: "Reason required" });

    const material = await PendingMaterial.findById(id);

    if (!material)
      return res.status(404).json({ message: "Pending material not found" });

    material.status = "rejected";
    material.rejectionReason = reason;

    await material.save();

    res.json({ message: "Material rejected (saved in history)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reject failed" });
  }
};

module.exports = {
  uploadMaterialForApproval,
  getPendingMaterials,
  approvePendingMaterial,
  getHistory,
  submitLinkForApproval,
  getPendingLinks,
  approvePendingLink,
  rejectPendingLink,
  getStudentLinksHistory,
  rejectPendingMaterial,
};
