const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  platform: { type: String, required: true },   // "Amazon" or "Flipkart"
  items: [
    {
      productId: String,
      name: String,
      category: String,
      size: String,
      color: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  deliveryAddress: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["placed", "shipped", "delivered", "cancelled"],
    default: "placed",
  },
  orderedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);