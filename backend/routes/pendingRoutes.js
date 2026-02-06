const express = require("express");
const router = express.Router();
const {
  getPendingMaterials,
  uploadMaterialForApproval,
  approvePendingMaterial,
  getHistory,
  submitLinkForApproval,
  rejectPendingLink,
  approvePendingLink,
  getPendingLinks,
  getStudentLinksHistory,
  rejectPendingMaterial,
} = require("../controller/pendingController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload"); // multer

/* ===== MATERIAL ROUTES ===== */
router.get("/pending-materials", protect, getPendingMaterials);
router.post(
  "/pending-material/upload/:dept/:sem/:subjectName",
  protect,
  upload.single("file"),
  uploadMaterialForApproval,
);
router.post("/pending-materials/:id/approve", protect, approvePendingMaterial);
// ${API}/pending-materials/${id}/reject
router.post("/pending-materials/:id/reject", protect, rejectPendingMaterial);
router.get("/student/uploads", protect, getHistory);

/* ===== LINK ROUTES ===== */
// STUDENT submits link
router.post(
  "/student/pending-link/:dept/:sem/:subjectName",
  protect,
  submitLinkForApproval,
);

// STUDENT: get pending links
router.get(
  "/student/pending-links/:dept/:sem/:subjectName",
  protect,
  getPendingLinks,
);

// ADMIN: get all pending links
router.get("/pending-links", protect, getPendingLinks);

// ADMIN approve/reject
router.post("/pending-links/:id/approve", protect, approvePendingLink);
router.post("/pending-links/:id/reject", protect, rejectPendingLink);
router.get("/student/link-history", protect, getStudentLinksHistory);

module.exports = router;
