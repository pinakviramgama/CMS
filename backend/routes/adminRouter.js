import express from "express";
import { verify } from "jsonwebtoken";
import { uploadMaterial } from "../controller/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  // `${API}/${dept}/sem/${sem}/subject/${subjectName}/upload`,
  "/:dept/sem/:sem/subject/:subjectName/upload",
  protect,
  verify,
  upload.single("pdf"),
  uploadMaterial,
);

export default router;
