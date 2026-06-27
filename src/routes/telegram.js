const express = require("express");
const TelegramMessage = require("../models/TelegramMessage");
const PaymentProof = require("../models/PaymentProof");
const Tenant = require("../models/Tenant");
const Invoice = require("../models/Invoice");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// ── GET /api/telegram/messages ────────────────────────────────────────────────
router.get("/messages", async (req, res) => {
  try {
    const messages = await TelegramMessage.find({ landlordId: req.user._id })
      .populate("tenantId", "fullName")
      .populate("invoiceId", "month total")
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/telegram/send-invoice ──────────────────────────────────────────
// Send invoice notification via Telegram (simulated)
router.post("/send-invoice", async (req, res) => {
  try {
    const { tenantId, invoiceId, preview } = req.body;

    if (!tenantId || !invoiceId || !preview) {
      return res.status(400).json({ message: "tenantId, invoiceId, preview ត្រូវការ" });
    }

    // Check tenant is linked to Telegram
    const tenant = await Tenant.findOne({ _id: tenantId, landlordId: req.user._id });
    if (!tenant) return res.status(404).json({ message: "រកមិនឃើញអ្នកជួល" });
    if (!tenant.telegramLinked) {
      return res.status(400).json({ message: "អ្នកជួលនេះមិនទាន់ភ្ជាប់ Telegram" });
    }

    const message = await TelegramMessage.create({
      landlordId: req.user._id,
      tenantId,
      invoiceId,
      type: "invoice",
      status: "sent",
      preview,
      sentAt: new Date().toLocaleString("km-KH"),
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/telegram/send-reminder ─────────────────────────────────────────
router.post("/send-reminder", async (req, res) => {
  try {
    const { tenantId, invoiceId, preview } = req.body;
    if (!tenantId || !preview) {
      return res.status(400).json({ message: "tenantId, preview ត្រូវការ" });
    }

    const tenant = await Tenant.findOne({ _id: tenantId, landlordId: req.user._id });
    if (!tenant) return res.status(404).json({ message: "រកមិនឃើញអ្នកជួល" });
    if (!tenant.telegramLinked) {
      return res.status(400).json({ message: "អ្នកជួលនេះមិនទាន់ភ្ជាប់ Telegram" });
    }

    const message = await TelegramMessage.create({
      landlordId: req.user._id,
      tenantId,
      invoiceId: invoiceId || null,
      type: "reminder",
      status: "sent",
      preview,
      sentAt: new Date().toLocaleString("km-KH"),
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/telegram/payment-proofs ─────────────────────────────────────────
router.get("/payment-proofs", async (req, res) => {
  try {
    const filter = { landlordId: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const proofs = await PaymentProof.find(filter)
      .populate("tenantId", "fullName phone")
      .populate("invoiceId", "month total")
      .sort({ createdAt: -1 });

    res.json(proofs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/telegram/payment-proof ─────────────────────────────────────────
// Simulate a tenant submitting a payment screenshot
router.post("/payment-proof", async (req, res) => {
  try {
    const { tenantId, invoiceId, note } = req.body;

    if (!tenantId || !invoiceId) {
      return res.status(400).json({ message: "tenantId, invoiceId ត្រូវការ" });
    }

    const proof = await PaymentProof.create({
      landlordId: req.user._id,
      tenantId,
      invoiceId,
      note: note || "",
      status: "pending_review",
      submittedAt: new Date().toLocaleString("km-KH"),
    });

    res.status(201).json(proof);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PATCH /api/telegram/payment-proof/:id/approve ────────────────────────────
router.patch("/payment-proof/:id/approve", async (req, res) => {
  try {
    const proof = await PaymentProof.findOneAndUpdate(
      { _id: req.params.id, landlordId: req.user._id },
      { status: "approved" },
      { new: true }
    );
    if (!proof) return res.status(404).json({ message: "រកមិនឃើញ Payment Proof" });
    res.json(proof);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PATCH /api/telegram/payment-proof/:id/reject ─────────────────────────────
router.patch("/payment-proof/:id/reject", async (req, res) => {
  try {
    const proof = await PaymentProof.findOneAndUpdate(
      { _id: req.params.id, landlordId: req.user._id },
      { status: "rejected" },
      { new: true }
    );
    if (!proof) return res.status(404).json({ message: "រកមិនឃើញ Payment Proof" });
    res.json(proof);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
