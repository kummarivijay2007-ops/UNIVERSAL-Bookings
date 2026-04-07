const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Not logged in." });
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

// ─── Product catalogue ────────────────────────────────────────────────────────
const PRODUCTS = [
  // Men's T-Shirts
  { id: "p1", name: "Classic Cotton Crew Tee", category: "Men's T-Shirts", image: "👕", colors: ["White", "Black", "Navy"], sizes: ["S", "M", "L", "XL"], amazon: { price: 499, rating: 4.3, delivery: "2 days" }, flipkart: { price: 449, rating: 4.1, delivery: "3 days" } },
  { id: "p2", name: "Oversized Graphic Tee", category: "Men's T-Shirts", image: "🎨", colors: ["Black", "Grey", "Olive"], sizes: ["M", "L", "XL", "XXL"], amazon: { price: 699, rating: 4.5, delivery: "1 day" }, flipkart: { price: 649, rating: 4.4, delivery: "2 days" } },
  { id: "p3", name: "Polo Collar T-Shirt", category: "Men's T-Shirts", image: "👔", colors: ["White", "Blue", "Green"], sizes: ["S", "M", "L", "XL"], amazon: { price: 899, rating: 4.2, delivery: "2 days" }, flipkart: { price: 849, rating: 4.0, delivery: "3 days" } },
  { id: "p4", name: "Striped Half Sleeve Tee", category: "Men's T-Shirts", image: "🦓", colors: ["Blue/White", "Black/Grey"], sizes: ["S", "M", "L"], amazon: { price: 549, rating: 4.1, delivery: "2 days" }, flipkart: { price: 499, rating: 4.3, delivery: "2 days" } },

  // Men's Jeans
  { id: "p5", name: "Slim Fit Stretch Jeans", category: "Men's Jeans", image: "👖", colors: ["Dark Blue", "Black", "Light Blue"], sizes: ["28", "30", "32", "34", "36"], amazon: { price: 1299, rating: 4.4, delivery: "2 days" }, flipkart: { price: 1199, rating: 4.2, delivery: "3 days" } },
  { id: "p6", name: "Regular Fit Denim", category: "Men's Jeans", image: "🦋", colors: ["Medium Wash", "Dark Wash"], sizes: ["30", "32", "34", "36", "38"], amazon: { price: 1099, rating: 4.1, delivery: "3 days" }, flipkart: { price: 999, rating: 4.3, delivery: "2 days" } },
  { id: "p7", name: "Jogger Fit Jeans", category: "Men's Jeans", image: "🏃", colors: ["Black", "Navy"], sizes: ["28", "30", "32", "34"], amazon: { price: 1499, rating: 4.5, delivery: "1 day" }, flipkart: { price: 1399, rating: 4.4, delivery: "2 days" } },

  // Women's Dresses
  { id: "p8", name: "Floral Wrap Dress", category: "Women's Dresses", image: "🌸", colors: ["Pink", "Yellow", "Blue"], sizes: ["XS", "S", "M", "L"], amazon: { price: 1199, rating: 4.6, delivery: "1 day" }, flipkart: { price: 1099, rating: 4.4, delivery: "2 days" } },
  { id: "p9", name: "Solid Midi Dress", category: "Women's Dresses", image: "👗", colors: ["Black", "White", "Red", "Navy"], sizes: ["S", "M", "L", "XL"], amazon: { price: 999, rating: 4.3, delivery: "2 days" }, flipkart: { price: 899, rating: 4.2, delivery: "3 days" } },
  { id: "p10", name: "Ethnic Printed Kurti", category: "Women's Dresses", image: "🪷", colors: ["Orange", "Purple", "Teal"], sizes: ["S", "M", "L", "XL", "XXL"], amazon: { price: 799, rating: 4.5, delivery: "2 days" }, flipkart: { price: 749, rating: 4.6, delivery: "1 day" } },
  { id: "p11", name: "Denim Shirt Dress", category: "Women's Dresses", image: "💙", colors: ["Light Blue", "Dark Blue"], sizes: ["XS", "S", "M", "L"], amazon: { price: 1399, rating: 4.2, delivery: "2 days" }, flipkart: { price: 1299, rating: 4.1, delivery: "3 days" } },

  // Women's Tops
  { id: "p12", name: "Crop Top", category: "Women's Tops", image: "✨", colors: ["White", "Black", "Pink", "Yellow"], sizes: ["XS", "S", "M", "L"], amazon: { price: 499, rating: 4.4, delivery: "1 day" }, flipkart: { price: 449, rating: 4.3, delivery: "2 days" } },
  { id: "p13", name: "Chiffon Blouse", category: "Women's Tops", image: "🦋", colors: ["Peach", "Mint", "Lavender"], sizes: ["S", "M", "L", "XL"], amazon: { price: 699, rating: 4.2, delivery: "2 days" }, flipkart: { price: 649, rating: 4.3, delivery: "2 days" } },
  { id: "p14", name: "Striped Puff Sleeve Top", category: "Women's Tops", image: "🫧", colors: ["Blue/White", "Pink/White"], sizes: ["S", "M", "L"], amazon: { price: 599, rating: 4.5, delivery: "1 day" }, flipkart: { price: 549, rating: 4.4, delivery: "2 days" } },

  // Footwear
  { id: "p15", name: "Running Sneakers", category: "Footwear", image: "👟", colors: ["White", "Black", "Blue"], sizes: ["6", "7", "8", "9", "10", "11"], amazon: { price: 2499, rating: 4.5, delivery: "1 day" }, flipkart: { price: 2299, rating: 4.3, delivery: "2 days" } },
  { id: "p16", name: "Casual Canvas Shoes", category: "Footwear", image: "👞", colors: ["White", "Navy", "Olive"], sizes: ["6", "7", "8", "9", "10"], amazon: { price: 1299, rating: 4.3, delivery: "2 days" }, flipkart: { price: 1199, rating: 4.4, delivery: "2 days" } },
  { id: "p17", name: "Block Heel Sandals", category: "Footwear", image: "👡", colors: ["Tan", "Black", "White"], sizes: ["5", "6", "7", "8", "9"], amazon: { price: 1499, rating: 4.4, delivery: "2 days" }, flipkart: { price: 1399, rating: 4.2, delivery: "3 days" } },
  { id: "p18", name: "Ethnic Kolhapuri Chappal", category: "Footwear", image: "🪖", colors: ["Tan", "Brown"], sizes: ["6", "7", "8", "9", "10"], amazon: { price: 699, rating: 4.6, delivery: "3 days" }, flipkart: { price: 649, rating: 4.5, delivery: "2 days" } },

  // Accessories
  { id: "p19", name: "Leather Belt", category: "Accessories", image: "🪢", colors: ["Black", "Brown", "Tan"], sizes: ["28-32", "32-36", "36-40"], amazon: { price: 499, rating: 4.3, delivery: "2 days" }, flipkart: { price: 449, rating: 4.2, delivery: "3 days" } },
  { id: "p20", name: "Solid Color Scarf", category: "Accessories", image: "🧣", colors: ["Red", "Blue", "Beige", "Black"], sizes: ["Free Size"], amazon: { price: 299, rating: 4.4, delivery: "2 days" }, flipkart: { price: 249, rating: 4.3, delivery: "3 days" } },
  { id: "p21", name: "Tote Bag", category: "Accessories", image: "👜", colors: ["Beige", "Black", "Olive"], sizes: ["One Size"], amazon: { price: 799, rating: 4.5, delivery: "1 day" }, flipkart: { price: 749, rating: 4.4, delivery: "2 days" } },
  { id: "p22", name: "Aviator Sunglasses", category: "Accessories", image: "🕶️", colors: ["Gold/Brown", "Silver/Black"], sizes: ["Free Size"], amazon: { price: 599, rating: 4.2, delivery: "2 days" }, flipkart: { price: 549, rating: 4.3, delivery: "2 days" } },
];

const CATEGORIES = ["All", "Men's T-Shirts", "Men's Jeans", "Women's Dresses", "Women's Tops", "Footwear", "Accessories"];

// ─── GET /api/shop/products ───────────────────────────────────────────────────
router.get("/products", protect, (req, res) => {
  const { category, search } = req.query;
  let products = [...PRODUCTS];

  if (category && category !== "All") {
    products = products.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, data: products, categories: CATEGORIES });
});

// ─── POST /api/shop/order ─────────────────────────────────────────────────────
router.post("/order", protect, async (req, res) => {
  try {
    const { platform, items, deliveryAddress, totalAmount } = req.body;

    if (!platform || !items?.length || !deliveryAddress || !totalAmount)
      return res.status(400).json({ error: "All fields are required" });

    const order = await Order.create({
      userId: req.userId,
      platform, items, deliveryAddress, totalAmount,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/shop/history ────────────────────────────────────────────────────
router.get("/history", protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ orderedAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;