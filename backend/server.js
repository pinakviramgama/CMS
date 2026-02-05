const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const adminRouter = require("./routes/admin");
const pendingRoutes = require("./routes/pendingRoutes");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/admin", adminRouter);
app.use("/", pendingRoutes);

// Serve Vite frontend build
app.use(express.static(path.join(__dirname, "../frontend/vite-project/dist")));

// SPA wildcard route (after API routes!)
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/vite-project/dist/index.html"),
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend/vite-project/dist")));

// SPA wildcard route
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/vite-project/dist/index.html"),
  );
});
