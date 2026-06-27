const express = require("express");
const Lease = require("../models/Lease");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// ── GET /api/leases ───────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const filter = { landlordId: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const leases = await Lease.find(filter)
      .populate("tenantId", "fullName phone")
      .populate("roomId", "roomNumber floor")
      .sort({ startDate: -1 });

    res.json(leases);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/leases/:id ───────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const lease = await Lease.findOne({ _id: req.params.id, landlordId: req.user._id })
      .populate("tenantId", "fullName phone email nationalId")
      .populate("roomId", "roomNumber floor monthlyRent");
    if (!lease) return res.status(404).json({ message: "រកមិនឃើញកិច្ចសន្យា" });
    res.json(lease);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/leases ──────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { tenantId, roomId, startDate, endDate, monthlyRent, depositPaid, terms, status } = req.body;

    if (!tenantId || !roomId || !startDate || !endDate || !monthlyRent) {
      return res.status(400).json({ message: "tenantId, roomId, startDate, endDate, monthlyRent ត្រូវការ" });
    }

    const lease = await Lease.create({
      landlordId: req.user._id,
      tenantId,
      roomId,
      startDate,
      endDate,
      monthlyRent,
      depositPaid: depositPaid || 0,
      terms: terms || "",
      status: status || "Active",
    });

    res.status(201).json(lease);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PUT /api/leases/:id ───────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const lease = await Lease.findOne({ _id: req.params.id, landlordId: req.user._id });
    if (!lease) return res.status(404).json({ message: "រកមិនឃើញកិច្ចសន្យា" });

    const fields = ["tenantId", "roomId", "startDate", "endDate", "monthlyRent", "depositPaid", "terms", "status"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) lease[f] = req.body[f];
    });

    await lease.save();
    res.json(lease);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── DELETE /api/leases/:id ────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const lease = await Lease.findOneAndDelete({ _id: req.params.id, landlordId: req.user._id });
    if (!lease) return res.status(404).json({ message: "រកមិនឃើញកិច្ចសន្យា" });
    res.json({ message: "លុបកិច្ចសន្យាបានជោគជ័យ" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
