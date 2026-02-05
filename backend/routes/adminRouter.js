import express from "express";
import { verify } from "jsonwebtoken";
import { uploadMaterial } from "../controller/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/:dept/sem/:sem/subject/:subjectName/upload",
  upload.single("pdf"),
  uploadMaterial,
  protect,
  verify,
);

export default router;
