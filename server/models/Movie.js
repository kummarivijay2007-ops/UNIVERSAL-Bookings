const mongoose = require("mongoose");

const movieBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movie: { type: String, required: true },
  cinema: { type: String, required: true },
  city: { type: String, required: true },
  date: { type: String, required: true },
  showtime: { type: String, required: true },
  seats: [{ type: String }],        // e.g. ["D4", "D5", "D6"]
  seatCategory: { type: String },   // "Recliner", "Premium", "Standard"
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed",
  },
  bookedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MovieBooking", movieBookingSchema);