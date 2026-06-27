const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    nationalId: {
      type: String,
      trim: true,
      default: "",
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room assignment is required"],
    },
    deposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    moveInDate: {
      type: String, // stored as "YYYY-MM-DD" to match frontend
      required: [true, "Move-in date is required"],
    },
    telegramChatId: {
      type: String,
      default: null,
    },
    telegramLinked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", tenantSchema);
