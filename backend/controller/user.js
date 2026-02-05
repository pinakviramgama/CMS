const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const signup = async (req, res) => {
  try {
    const { name, email, password, department, semester } = req.body;

    if (!name || !email || !password || !department || !semester) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department: department.toLowerCase(),
      semester: semester,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" },
    );

    res.status(201).json({ message: "Signup successful", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      token,
      id: user._id,
      name: user.name,
      department: user.department,
      sem: user.semester,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const updateSemester = async (req, res) => {
  try {
    const { semester } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Not logged in ❌" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { semester },
      { new: true },
    );

    res.json({
      message: "Semester updated successfully ✅",
      semester: user.semester,
    });
  } catch (err) {
    console.log("Semester update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      sem: req.user.semester,
      department: req.user.department,
    },
  });
};

module.exports = { signup, login, getMe, updateSemester };
