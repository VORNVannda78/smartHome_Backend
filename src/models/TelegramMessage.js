const mongoose = require("mongoose");

const telegramMessageSchema = new mongoose.Schema(
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
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    type: {
      type: String,
      enum: ["invoice", "reminder", "welcome", "payment_confirm"],
      required: true,
    },
    sentAt: {
      type: String,
      default: () => new Date().toLocaleString("km-KH"),
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "sent",
    },
    preview: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TelegramMessage", telegramMessageSchema);
