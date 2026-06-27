const express = require("express");
const Invoice = require("../models/Invoice");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// ── GET /api/invoices ─────────────────────────────────────────────────────────
// Optional query: ?tenantId=xxx&month=2024-06&status=Pending
router.get("/", async (req, res) => {
  try {
    const filter = { landlordId: req.user._id };
    if (req.query.tenantId) filter.tenantId = req.query.tenantId;
    if (req.query.month) filter.month = req.query.month;
    if (req.query.status) filter.status = req.query.status;

    const invoices = await Invoice.find(filter)
      .populate("tenantId", "fullName phone")
      .populate("roomId", "roomNumber floor")
      .sort({ month: -1, createdAt: -1 });

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/invoices/:id ─────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, landlordId: req.user._id })
      .populate("tenantId", "fullName phone email")
      .populate("roomId", "roomNumber floor");
    if (!invoice) return res.status(404).json({ message: "រកមិនឃើញវិក្កយបត្រ" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/invoices ────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      tenantId, roomId, month, rent,
      oldWater, newWater, waterUsage, waterCost,
      oldElectric, newElectric, electricUsage, electricCost,
      trash, total, status,
    } = req.body;

    if (!tenantId || !roomId || !month || rent === undefined || total === undefined) {
      return res.status(400).json({ message: "tenantId, roomId, month, rent, total ត្រូវការ" });
    }

    const invoice = await Invoice.create({
      landlordId: req.user._id,
      tenantId,
      roomId,
      month,
      rent,
      oldWater: oldWater || 0,
      newWater: newWater || 0,
      waterUsage: waterUsage || 0,
      waterCost: waterCost || 0,
      oldElectric: oldElectric || 0,
      newElectric: newElectric || 0,
      electricUsage: electricUsage || 0,
      electricCost: electricCost || 0,
      trash: trash || 0,
      total,
      status: status || "Pending",
      createdAt: new Date().toISOString().slice(0, 10),
    });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PATCH /api/invoices/:id/status ───────────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Paid", "Pending", "Overdue"].includes(status)) {
      return res.status(400).json({ message: "status ត្រូវជា Paid, Pending, ឬ Overdue" });
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, landlordId: req.user._id },
      { status },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: "រកមិនឃើញវិក្កយបត្រ" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── DELETE /api/invoices/:id ──────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, landlordId: req.user._id });
    if (!invoice) return res.status(404).json({ message: "រកមិនឃើញវិក្កយបត្រ" });
    res.json({ message: "លុបវិក្កយបត្របានជោគជ័យ" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
