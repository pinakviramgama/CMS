const express = require("express");
const upload = require("../middleware/upload");

const {
  uploadMaterial,
  getMaterial,
  deleteMaterial,
} = require("../controller/adminController");

const {
  createDepartment,
  addSemester,
  addSubject,
  fetchSubjects,
  addLink,
  deleteLink,
} = require("../controller/department");

const { protect } = require("../middleware/authMiddleware");
const { updateSemester } = require("../controller/user");

const router = express.Router();

/* ===== SUBJECT / MATERIAL ===== */
// `http://localhost:3000/admin/dept/${dept}/sem/${sem}/subject/${subjectName}
router.get("/:dept/sem/:sem/subject/:subjectName", protect, getMaterial);

router.post(
  // `http://localhost:3000/admin/${dept}/sem/${sem}/subject/${subjectName}/upload`,
  "/:dept/sem/:sem/subject/:subjectName/upload",
  protect,
  upload.single("file"),
  uploadMaterial,
);

/* ===== DEPARTMENT / SEMESTER ===== */
router.post("/dept", protect, createDepartment);

router.post("/dept/:deptName/add-semester", protect, addSemester);

router.post("/dept/:dept/sem/:sem/add-subject", protect, addSubject);

/* ===== STUDENT + ADMIN (READ ONLY) ===== */
router.get("/dept/:dept/sem/:sem/get-subjects", fetchSubjects);

/* ===== ADMIN ONLY ===== */
router.post(
  // `http://localhost:3000/${dept}/sem/${sem}/subject/${subjectName}/add-link`,
  "/dept/:dept/sem/:sem/subject/:subjectName/add-link",
  protect,
  addLink,
);

router.delete(
  "/dept/:dept/sem/:sem/subject/:subjectName/links/:linkId",
  protect,
  deleteLink,
);

router.delete(
  "/dept/:dept/sem/:sem/subject/:subjectName/delete-material",
  protect,
  deleteMaterial,
);

router.put("/update-semester", updateSemester);
module.exports = router;
