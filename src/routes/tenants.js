const express = require("express");
const Tenant = require("../models/Tenant");
const TelegramMessage = require("../models/TelegramMessage");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// ── GET /api/tenants ──────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const tenants = await Tenant.find({ landlordId: req.user._id })
      .populate("roomId", "roomNumber floor monthlyRent status")
      .sort({ createdAt: -1 });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/tenants/:id ──────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, landlordId: req.user._id })
      .populate("roomId", "roomNumber floor monthlyRent status");
    if (!tenant) return res.status(404).json({ message: "រកមិនឃើញអ្នកជួល" });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/tenants ─────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { fullName, phone, email, nationalId, roomId, deposit, moveInDate } = req.body;

    if (!fullName || !phone || !roomId || !moveInDate) {
      return res.status(400).json({ message: "fullName, phone, roomId, moveInDate ត្រូវការ" });
    }

    const tenant = await Tenant.create({
      landlordId: req.user._id,
      fullName,
      phone,
      email: email || "",
      nationalId: nationalId || "",
      roomId,
      deposit: deposit || 0,
      moveInDate,
    });

    res.status(201).json(tenant);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PUT /api/tenants/:id ──────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, landlordId: req.user._id });
    if (!tenant) return res.status(404).json({ message: "រកមិនឃើញអ្នកជួល" });

    const fields = ["fullName", "phone", "email", "nationalId", "roomId", "deposit", "moveInDate"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) tenant[f] = req.body[f];
    });

    await tenant.save();
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── DELETE /api/tenants/:id ───────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const tenant = await Tenant.findOneAndDelete({ _id: req.params.id, landlordId: req.user._id });
    if (!tenant) return res.status(404).json({ message: "រកមិនឃើញអ្នកជួល" });
    res.json({ message: "លុបអ្នកជួលបានជោគជ័យ" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PATCH /api/tenants/:id/telegram/link ─────────────────────────────────────
router.patch("/:id/telegram/link", async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ message: "chatId ត្រូវការ" });

    const tenant = await Tenant.findOneAndUpdate(
      { _id: req.params.id, landlordId: req.user._id },
      { telegramChatId: chatId, telegramLinked: true },
      { new: true }
    );
    if (!tenant) return res.status(404).json({ message: "រកមិនឃើញអ្នកជួល" });

    // Create welcome telegram message
    await TelegramMessage.create({
      landlordId: req.user._id,
      tenantId: tenant._id,
      type: "welcome",
      status: "sent",
      preview: `🏠 សូមស្វាគមន៍មកកាន់ RoomRentKH! ${tenant.fullName} ត្រូវបានភ្ជាប់ជាមួយ Bot ដោយជោគជ័យ។`,
    });

    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PATCH /api/tenants/:id/telegram/unlink ───────────────────────────────────
router.patch("/:id/telegram/unlink", async (req, res) => {
  try {
    const tenant = await Tenant.findOneAndUpdate(
      { _id: req.params.id, landlordId: req.user._id },
      { telegramChatId: null, telegramLinked: false },
      { new: true }
    );
    if (!tenant) return res.status(404).json({ message: "រកមិនឃើញអ្នកជួល" });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
