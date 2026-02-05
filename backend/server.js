const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const adminRouter = require("./routes/admin");
const pendingRoutes = require("./routes/pendingRoutes");
const connectDB = require("./config/db");

connectDB();

const app = express();

// ✅ Simple CORS (PERMANENT FIX)
app.use(cors());

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/admin", adminRouter);
app.use("/", pendingRoutes);

app.use(express.static(path.join(__dirname, "../fronted/vite-project/dist")));

app.get("*", (req, res) => {
  res.sendFile(
    path.resolve(__dirname, "../fronted/vite-project/dist/index.html"),
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
