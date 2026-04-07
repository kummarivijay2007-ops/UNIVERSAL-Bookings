const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const FoodOrder = require("../models/Food");

// ─── Auth Middleware (same as rides) ─────────────────────────────────────────
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not logged in. Please login first." });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

// ─── GET /api/food/restaurants ────────────────────────────────────────────────
// Returns mock restaurants from Swiggy and Zomato for a given area
router.get("/restaurants", protect, (req, res) => {
  const { area } = req.query;

  if (!area) {
    return res.status(400).json({ error: "Area is required" });
  }

  // Mock restaurant data — in real app you'd call Swiggy/Zomato APIs
  const restaurants = [
    {
      provider: "Swiggy",
      logo: "🧡",
      color: "#FF6B00",
      places: [
        {
          id: "sw1",
          name: "Burger King",
          cuisine: "Burgers, Fast Food",
          rating: 4.2,
          deliveryTime: "25-30 mins",
          deliveryFee: 30,
          minOrder: 100,
          items: [
            { id: "i1", name: "Whopper Burger", price: 199, category: "Burgers" },
            { id: "i2", name: "Crispy Chicken", price: 149, category: "Burgers" },
            { id: "i3", name: "Veggie Burger", price: 119, category: "Burgers" },
            { id: "i4", name: "Loaded Fries", price: 99, category: "Sides" },
            { id: "i5", name: "Coke 500ml", price: 60, category: "Drinks" },
          ],
        },
        {
          id: "sw2",
          name: "Pizza Hut",
          cuisine: "Pizza, Italian",
          rating: 4.0,
          deliveryTime: "30-40 mins",
          deliveryFee: 40,
          minOrder: 200,
          items: [
            { id: "i6", name: "Margherita Pizza", price: 249, category: "Pizza" },
            { id: "i7", name: "Pepperoni Pizza", price: 349, category: "Pizza" },
            { id: "i8", name: "BBQ Chicken Pizza", price: 399, category: "Pizza" },
            { id: "i9", name: "Garlic Bread", price: 99, category: "Sides" },
            { id: "i10", name: "Pasta Arabiata", price: 179, category: "Pasta" },
          ],
        },
        {
          id: "sw3",
          name: "Domino's",
          cuisine: "Pizza, Desserts",
          rating: 4.3,
          deliveryTime: "20-30 mins",
          deliveryFee: 0,
          minOrder: 150,
          items: [
            { id: "i11", name: "Farm House Pizza", price: 299, category: "Pizza" },
            { id: "i12", name: "Chicken Dominator", price: 449, category: "Pizza" },
            { id: "i13", name: "Garlic Breadsticks", price: 89, category: "Sides" },
            { id: "i14", name: "Choco Lava Cake", price: 89, category: "Desserts" },
            { id: "i15", name: "Pepsi 500ml", price: 55, category: "Drinks" },
          ],
        },
      ],
    },
    {
      provider: "Zomato",
      logo: "❤️",
      color: "#E23744",
      places: [
        {
          id: "zm1",
          name: "KFC",
          cuisine: "Chicken, Fast Food",
          rating: 4.1,
          deliveryTime: "25-35 mins",
          deliveryFee: 25,
          minOrder: 100,
          items: [
            { id: "i16", name: "Zinger Burger", price: 189, category: "Burgers" },
            { id: "i17", name: "Popcorn Chicken", price: 149, category: "Snacks" },
            { id: "i18", name: "Hot & Crispy (2pc)", price: 219, category: "Chicken" },
            { id: "i19", name: "Coleslaw", price: 49, category: "Sides" },
            { id: "i20", name: "Pepsi 500ml", price: 60, category: "Drinks" },
          ],
        },
        {
          id: "zm2",
          name: "Subway",
          cuisine: "Sandwiches, Healthy",
          rating: 4.4,
          deliveryTime: "20-25 mins",
          deliveryFee: 20,
          minOrder: 150,
          items: [
            { id: "i21", name: "Veggie Delite Sub", price: 189, category: "Subs" },
            { id: "i22", name: "Chicken Teriyaki", price: 249, category: "Subs" },
            { id: "i23", name: "Tuna Sub", price: 259, category: "Subs" },
            { id: "i24", name: "Cookies (3pcs)", price: 99, category: "Desserts" },
            { id: "i25", name: "Fountain Drink", price: 55, category: "Drinks" },
          ],
        },
        {
          id: "zm3",
          name: "Biryani Blues",
          cuisine: "Biryani, North Indian",
          rating: 4.5,
          deliveryTime: "35-45 mins",
          deliveryFee: 0,
          minOrder: 200,
          items: [
            { id: "i26", name: "Chicken Biryani", price: 299, category: "Biryani" },
            { id: "i27", name: "Mutton Biryani", price: 379, category: "Biryani" },
            { id: "i28", name: "Veg Biryani", price: 199, category: "Biryani" },
            { id: "i29", name: "Raita", price: 49, category: "Sides" },
            { id: "i30", name: "Gulab Jamun", price: 79, category: "Desserts" },
          ],
        },
      ],
    },
  ];

  res.json({ success: true, data: restaurants });
});

// ─── POST /api/food/order ─────────────────────────────────────────────────────
// Places a food order and saves to MongoDB
router.post("/order", protect, async (req, res) => {
  try {
    const { provider, restaurant, items, deliveryAddress, totalAmount } = req.body;

    if (!provider || !restaurant || !items || !deliveryAddress || !totalAmount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (items.length === 0) {
      return res.status(400).json({ error: "Add at least one item to order" });
    }

    const order = await FoodOrder.create({
      userId: req.userId,
      provider,
      restaurant,
      items,
      deliveryAddress,
      totalAmount,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/food/history ────────────────────────────────────────────────────
// Returns all food orders by the logged-in user
router.get("/history", protect, async (req, res) => {
  try {
    const orders = await FoodOrder.find({ userId: req.userId }).sort({ orderedAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;