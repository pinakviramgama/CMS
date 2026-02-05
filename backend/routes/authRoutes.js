const express = require("express");
const { signup, login, updateSemester } = require("../controller/user");
const { protect } = require("../middleware/authMiddleware");
const { getMe } = require("../controller/user");
const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/update-semester", protect, updateSemester);

module.exports = router;
