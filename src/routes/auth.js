const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Helper: sign JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, buildingName } = req.body;

    if (!name || !email || !password || !buildingName) {
      return res.status(400).json({ message: "សូមបំពេញព័ត៌មានទាំងអស់" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "អ៊ីម៉ែលនេះមានគណនីរួចហើយ" });
    }

    const user = await User.create({ name, email, password, buildingName });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        landlordId: user._id, // landlordId == _id for simplicity
        name: user.name,
        email: user.email,
        buildingName: user.buildingName,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "សូមបំពេញ Email និង Password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "អ៊ីម៉ែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ" });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        landlordId: user._id,
        name: user.name,
        email: user.email,
        buildingName: user.buildingName,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  res.json({
    id: req.user._id,
    landlordId: req.user._id,
    name: req.user.name,
    email: req.user.email,
    buildingName: req.user.buildingName,
    plan: req.user.plan,
  });
});

// ── PUT /api/auth/settings ───────────────────────────────────────────────────
// Update building name or plan
router.put("/settings", protect, async (req, res) => {
  try {
    const { buildingName, plan } = req.body;
    const updates = {};
    if (buildingName) updates.buildingName = buildingName;
    if (plan && ["free", "pro", "business"].includes(plan)) updates.plan = plan;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({
      id: user._id,
      landlordId: user._id,
      name: user.name,
      email: user.email,
      buildingName: user.buildingName,
      plan: user.plan,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PUT /api/auth/change-password ─────────────────────────────────────────────
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "ត្រូវការ currentPassword និង newPassword" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៦ អក្សរ" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: "ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវ" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "ប្ដូរពាក្យសម្ងាត់បានជោគជ័យ" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
