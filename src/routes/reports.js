const express = require("express");
const Invoice = require("../models/Invoice");
const Expense = require("../models/Expense");
const Room = require("../models/Room");
const Tenant = require("../models/Tenant");
const Lease = require("../models/Lease");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// ── GET /api/reports/dashboard ────────────────────────────────────────────────
// Summary stats for Dashboard view
router.get("/dashboard", async (req, res) => {
  try {
    const lid = req.user._id;

    const [rooms, tenants, invoices, expenses, leases] = await Promise.all([
      Room.find({ landlordId: lid }),
      Tenant.find({ landlordId: lid }),
      Invoice.find({ landlordId: lid }),
      Expense.find({ landlordId: lid }),
      Lease.find({ landlordId: lid }),
    ]);

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;
    const availableRooms = rooms.filter((r) => r.status === "Available").length;
    const maintenanceRooms = rooms.filter((r) => r.status === "Maintenance").length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const totalRevenue = invoices
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + i.total, 0);
    const pendingRevenue = invoices
      .filter((i) => i.status === "Pending" || i.status === "Overdue")
      .reduce((sum, i) => sum + i.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const activeLeases = leases.filter((l) => l.status === "Active").length;
    const expiringSoon = leases.filter((l) => l.status === "Expiring Soon").length;
    const overdueInvoices = invoices.filter((i) => i.status === "Overdue").length;

    res.json({
      rooms: { total: totalRooms, occupied: occupiedRooms, available: availableRooms, maintenance: maintenanceRooms, occupancyRate },
      tenants: { total: tenants.length },
      finance: { totalRevenue, pendingRevenue, totalExpenses, netIncome: totalRevenue - totalExpenses },
      leases: { active: activeLeases, expiringSoon },
      invoices: { overdue: overdueInvoices },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/reports/monthly-revenue ─────────────────────────────────────────
// Monthly revenue vs expense for chart (last 12 months)
router.get("/monthly-revenue", async (req, res) => {
  try {
    const lid = req.user._id;

    const invoices = await Invoice.find({ landlordId: lid, status: "Paid" });
    const expenses = await Expense.find({ landlordId: lid });

    // Build map: month -> { revenue, expenses }
    const map = {};

    invoices.forEach((inv) => {
      if (!inv.month) return;
      if (!map[inv.month]) map[inv.month] = { revenue: 0, expenses: 0 };
      map[inv.month].revenue += inv.total;
    });

    expenses.forEach((exp) => {
      if (!exp.date) return;
      const month = exp.date.slice(0, 7); // "YYYY-MM"
      if (!map[month]) map[month] = { revenue: 0, expenses: 0 };
      map[month].expenses += exp.amount;
    });

    // Sort by month and return last 12
    const result = Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100,
      }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/reports/income-by-room ──────────────────────────────────────────
router.get("/income-by-room", async (req, res) => {
  try {
    const invoices = await Invoice.find({ landlordId: req.user._id, status: "Paid" })
      .populate("roomId", "roomNumber");

    const map = {};
    invoices.forEach((inv) => {
      const key = inv.roomId?.roomNumber || "Unknown";
      if (!map[key]) map[key] = 0;
      map[key] += inv.total;
    });

    const result = Object.entries(map)
      .map(([room, total]) => ({ room, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/reports/expenses-by-category ────────────────────────────────────
router.get("/expenses-by-category", async (req, res) => {
  try {
    const expenses = await Expense.find({ landlordId: req.user._id });

    const map = {};
    expenses.forEach((e) => {
      if (!map[e.category]) map[e.category] = 0;
      map[e.category] += e.amount;
    });

    const result = Object.entries(map).map(([category, total]) => ({
      category,
      total: Math.round(total * 100) / 100,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
