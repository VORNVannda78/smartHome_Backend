const express = require("express");
const Expense = require("../models/Expense");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// ── GET /api/expenses ─────────────────────────────────────────────────────────
// Optional query: ?category=Repair&month=2024-06
router.get("/", async (req, res) => {
  try {
    const filter = { landlordId: req.user._id };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.month) filter.date = { $regex: `^${req.query.month}` };

    const expenses = await Expense.find(filter)
      .populate("roomId", "roomNumber")
      .sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/expenses ────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { date, category, description, amount, roomId } = req.body;

    if (!date || !category || !description || amount === undefined) {
      return res.status(400).json({ message: "date, category, description, amount ត្រូវការ" });
    }

    const expense = await Expense.create({
      landlordId: req.user._id,
      date,
      category,
      description,
      amount,
      roomId: roomId || null,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PUT /api/expenses/:id ─────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, landlordId: req.user._id });
    if (!expense) return res.status(404).json({ message: "រកមិនឃើញការចំណាយ" });

    const fields = ["date", "category", "description", "amount", "roomId"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) expense[f] = req.body[f];
    });

    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── DELETE /api/expenses/:id ──────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, landlordId: req.user._id });
    if (!expense) return res.status(404).json({ message: "រកមិនឃើញការចំណាយ" });
    res.json({ message: "លុបការចំណាយបានជោគជ័យ" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
