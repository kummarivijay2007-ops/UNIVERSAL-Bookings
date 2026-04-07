const mongoose = require("mongoose");

const busBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  operator: { type: String, required: true },
  busType: { type: String, required: true },   // "Sleeper", "Semi-Sleeper", "Seater"
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: String, required: true },
  departure: { type: String, required: true },
  arrival: { type: String, required: true },
  duration: { type: String, required: true },
  seats: [{ type: String }],                   // ["L1", "U3", "S5"]
  boardingPoint: { type: String, required: true },
  passengers: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed",
  },
  bookedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BusBooking", busBookingSchema);