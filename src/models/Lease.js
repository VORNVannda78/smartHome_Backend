const mongoose = require("mongoose");

const leaseSchema = new mongoose.Schema(
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
    startDate: {
      type: String, // "YYYY-MM-DD"
      required: [true, "Start date is required"],
    },
    endDate: {
      type: String, // "YYYY-MM-DD"
      required: [true, "End date is required"],
    },
    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
    },
    depositPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    terms: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Expiring Soon", "Expired"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lease", leaseSchema);
