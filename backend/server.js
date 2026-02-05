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

const allowedOrigins = [
  "http://localhost:5173",
  "https://cms-4-74hb.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// ✅ Proper Preflight Fix
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/admin", adminRouter);
app.use("/", pendingRoutes);

// ✅ Serve frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// ✅ SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
