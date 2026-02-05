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

// Serve Vite frontend build
app.use(express.static(path.join(__dirname, "../frontend/vite-project/dist")));

app.get("*", (req, res) => {
  res.sendFile(
    path.resolve(__dirname, "../frontend/vite-project/dist/index.html"),
  );
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/admin", adminRouter);
app.use("/", pendingRoutes);

// Test route (optional)
app.get("/test", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
