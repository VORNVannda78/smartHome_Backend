const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    month: {
      type: String, // "YYYY-MM" format
      required: [true, "Month is required"],
    },
    rent: {
      type: Number,
      required: true,
      min: 0,
    },
    // Water
    oldWater: { type: Number, default: 0 },
    newWater: { type: Number, default: 0 },
    waterUsage: { type: Number, default: 0 },
    waterCost: { type: Number, default: 0 },
    // Electricity
    oldElectric: { type: Number, default: 0 },
    newElectric: { type: Number, default: 0 },
    electricUsage: { type: Number, default: 0 },
    electricCost: { type: Number, default: 0 },
    // Other
    trash: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Overdue"],
      default: "Pending",
    },
    createdAt: {
      type: String, // "YYYY-MM-DD" to match frontend
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
