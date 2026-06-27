const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, "Floor is required"],
      min: 1,
    },
    monthlyRent: {
      type: Number,
      required: [true, "Monthly rent is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance"],
      default: "Available",
    },
  },
  { timestamps: true }
);

// Compound index: room number unique per landlord
roomSchema.index({ landlordId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);
