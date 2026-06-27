require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const connectDB = require("./src/config/db");

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes     = require("./src/routes/auth");
const roomRoutes     = require("./src/routes/rooms");
const tenantRoutes   = require("./src/routes/tenants");
const invoiceRoutes  = require("./src/routes/invoices");
const expenseRoutes  = require("./src/routes/expenses");
const leaseRoutes    = require("./src/routes/leases");
const telegramRoutes = require("./src/routes/telegram");
const reportRoutes   = require("./src/routes/reports");

const app = express();

// ── Connect MongoDB ───────────────────────────────────────────────────────────
connectDB();

// ── CORS — allow local dev + production frontend ──────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,          // e.g. https://roomrentkh.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow server-to-server / curl (no origin header)
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Security headers (light-weight, no helmet dep needed) ─────────────────────
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/rooms",    roomRoutes);
app.use("/api/tenants",  tenantRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/leases",   leaseRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/reports",  reportRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "RoomRentKH API is running 🏠",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} រកមិនឃើញ` });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  const isDev = process.env.NODE_ENV !== "production";
  res.status(err.status || 500).json({
    message: isDev ? err.message : "Internal server error",
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  RoomRentKH API  →  http://localhost:${PORT}`);
  console.log(`🌍  Env             →  ${process.env.NODE_ENV || "development"}`);
  console.log(`✅  Health check    →  http://localhost:${PORT}/api/health\n`);
});
