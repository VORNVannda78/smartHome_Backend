const express = require("express");
const Room = require("../models/Room");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes require auth
router.use(protect);

// ── GET /api/rooms ────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({ landlordId: req.user._id }).sort({ floor: 1, roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/rooms ───────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { roomNumber, floor, monthlyRent, status } = req.body;

    if (!roomNumber || !floor || !monthlyRent) {
      return res.status(400).json({ message: "roomNumber, floor, monthlyRent ត្រូវការ" });
    }

    const room = await Room.create({
      landlordId: req.user._id,
      roomNumber,
      floor,
      monthlyRent,
      status: status || "Available",
    });

    res.status(201).json(room);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: `លេខបន្ទប់ ${req.body.roomNumber} មានរួចហើយ` });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PUT /api/rooms/:id ────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, landlordId: req.user._id });
    if (!room) return res.status(404).json({ message: "រកមិនឃើញបន្ទប់" });

    const { roomNumber, floor, monthlyRent, status } = req.body;
    if (roomNumber) room.roomNumber = roomNumber;
    if (floor) room.floor = floor;
    if (monthlyRent !== undefined) room.monthlyRent = monthlyRent;
    if (status) room.status = status;

    await room.save();
    res.json(room);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: `លេខបន្ទប់ ${req.body.roomNumber} មានរួចហើយ` });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── DELETE /api/rooms/:id ─────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ _id: req.params.id, landlordId: req.user._id });
    if (!room) return res.status(404).json({ message: "រកមិនឃើញបន្ទប់" });
    res.json({ message: "លុបបន្ទប់បានជោគជ័យ" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
