import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://universal-bookings-server.onrender.com/api";

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onView }) {
  const [hovered, setHovered] = useState(false);
  const cheaperOn = product.amazon.price <= product.flipkart.price ? "Amazon" : "Flipkart";
  const lowestPrice = Math.min(product.amazon.price, product.flipkart.price);

  return (
    <div
      style={{
        ...s.productCard,
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 12px 32px rgba(255,100,150,0.15)" : "0 2px 12px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onView(product)}
    >
      {/* Image placeholder */}
      <div style={s.productImageBox}>
        <span style={s.productEmoji}>{product.image}</span>
        <div style={{ ...s.cheaperBadge, background: cheaperOn === "Amazon" ? "#FF9900" : "#2874f0" }}>
          Best on {cheaperOn}
        </div>
      </div>

      <div style={s.productInfo}>
        <div style={s.productCategory}>{product.category}</div>
        <div style={s.productName}>{product.name}</div>

        {/* Price comparison row */}
        <div style={s.priceRow}>
          <div style={s.platformPrice}>
            <span style={s.platformDot("amazon")} />
            <span style={s.platformLabel}>Amazon</span>
            <span style={{ ...s.priceTag, color: product.amazon.price === lowestPrice ? "#e44d26" : "#aaa" }}>
              ₹{product.amazon.price}
            </span>
          </div>
          <div style={s.platformPrice}>
            <span style={s.platformDot("flipkart")} />
            <span style={s.platformLabel}>Flipkart</span>
            <span style={{ ...s.priceTag, color: product.flipkart.price === lowestPrice ? "#e44d26" : "#aaa" }}>
              ₹{product.flipkart.price}
            </span>
          </div>
        </div>

        <div style={s.colorDots}>
          {product.colors.slice(0, 4).map((c) => (
            <span key={c} style={s.colorLabel}>{c}</span>
          ))}
        </div>

        <button style={s.viewBtn}>View & Compare →</button>
      </div>
    </div>
  );
}

// ─── Product Detail + Compare ─────────────────────────────────────────────────
function ProductDetail({ product, onAddToCart, onBack }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedPlatform, setSelectedPlatform] = useState(
    product.amazon.price <= product.flipkart.price ? "amazon" : "flipkart"
  );

  const platformData = selectedPlatform === "amazon" ? product.amazon : product.flipkart;

  return (
    <div style={s.detailPage}>
      <button style={s.backLink} onClick={onBack}>← Back to products</button>

      <div style={s.detailLayout}>
        {/* Left: Image */}
        <div style={s.detailImageBox}>
          <span style={s.detailEmoji}>{product.image}</span>
          <div style={s.detailCategory}>{product.category}</div>
        </div>

        {/* Right: Info */}
        <div style={s.detailInfo}>
          <h2 style={s.detailName}>{product.name}</h2>

          {/* Platform comparison cards */}
          <div style={s.compareTitle}>🔍 Compare Prices</div>
          <div style={s.compareGrid}>
            {[
              { key: "amazon", label: "Amazon", logo: "📦", color: "#FF9900", data: product.amazon },
              { key: "flipkart", label: "Flipkart", logo: "🛒", color: "#2874f0", data: product.flipkart },
            ].map((p) => (
              <div
                key={p.key}
                style={{
                  ...s.compareCard,
                  border: selectedPlatform === p.key ? `2px solid ${p.color}` : "2px solid #f0f0f0",
                  background: selectedPlatform === p.key ? `${p.color}10` : "white",
                }}
                onClick={() => setSelectedPlatform(p.key)}
              >
                <div style={s.compareHeader}>
                  <span style={{ fontSize: 22 }}>{p.logo}</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: p.color }}>{p.label}</span>
                  {selectedPlatform === p.key && <span style={{ ...s.selectedTag, background: p.color }}>✓ Selected</span>}
                </div>
                <div style={s.comparePrice}>₹{p.data.price}</div>
                <div style={s.compareMeta}>⭐ {p.data.rating} · 🚚 {p.data.delivery}</div>
              </div>
            ))}
          </div>

          {/* Color */}
          <div style={s.optionBlock}>
            <div style={s.optionLabel}>Color: <span style={{ color: "#ff6b9d", fontWeight: 700 }}>{selectedColor}</span></div>
            <div style={s.optionRow}>
              {product.colors.map((c) => (
                <button
                  key={c}
                  style={{ ...s.colorBtn, ...(selectedColor === c ? s.colorBtnActive : {}) }}
                  onClick={() => setSelectedColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div style={s.optionBlock}>
            <div style={s.optionLabel}>Size: <span style={{ color: "#ff6b9d", fontWeight: 700 }}>{selectedSize}</span></div>
            <div style={s.optionRow}>
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  style={{ ...s.sizeBtn, ...(selectedSize === sz ? s.sizeBtnActive : {}) }}
                  onClick={() => setSelectedSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <div style={s.addToCartRow}>
            <div style={s.finalPrice}>₹{platformData.price}</div>
            <button
              style={s.addToCartBtn}
              onClick={() => onAddToCart({
                productId: product.id,
                name: product.name,
                category: product.category,
                image: product.image,
                color: selectedColor,
                size: selectedSize,
                platform: selectedPlatform,
                price: platformData.price,
                quantity: 1,
              })}
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer({ cart, onUpdate, onRemove, onCheckout, onClose }) {
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Group by platform
  const platforms = [...new Set(cart.map((i) => i.platform))];

  return (
    <div style={s.drawerOverlay} onClick={onClose}>
      <div style={s.drawer} onClick={(e) => e.stopPropagation()}>
        <div style={s.drawerHeader}>
          <span style={s.drawerTitle}>🛒 Your Cart ({cart.length})</span>
          <button style={s.drawerClose} onClick={onClose}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div style={s.emptyCart}>
            <div style={{ fontSize: 48 }}>🛒</div>
            <p style={{ color: "#aaa", marginTop: 12 }}>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div style={s.cartItems}>
              {cart.map((item) => (
                <div key={`${item.productId}-${item.color}-${item.size}-${item.platform}`} style={s.cartItem}>
                  <span style={{ fontSize: 32 }}>{item.image}</span>
                  <div style={s.cartItemInfo}>
                    <div style={s.cartItemName}>{item.name}</div>
                    <div style={s.cartItemMeta}>{item.color} · {item.size} · {item.platform === "amazon" ? "Amazon" : "Flipkart"}</div>
                    <div style={s.cartItemPrice}>₹{item.price}</div>
                  </div>
                  <div style={s.cartQtyRow}>
                    <button style={s.qtyBtn} onClick={() => item.quantity === 1 ? onRemove(item) : onUpdate(item, item.quantity - 1)}>−</button>
                    <span style={s.qtyNum}>{item.quantity}</span>
                    <button style={s.qtyBtn} onClick={() => onUpdate(item, item.quantity + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Platform split notice */}
            {platforms.length > 1 && (
              <div style={s.splitNotice}>
                ⚠️ Your cart has items from multiple platforms. They'll be placed as separate orders.
              </div>
            )}

            <div style={s.cartFooter}>
              <div style={s.cartTotal}>
                <span style={{ color: "#888" }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 20, color: "#ff6b9d" }}>₹{total}</span>
              </div>
              <button style={s.checkoutBtn} onClick={onCheckout}>
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
function Checkout({ cart, onPlaceOrder, onBack, loading }) {
  const [address, setAddress] = useState("");
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div style={s.checkoutBox}>
      <button style={s.backLink} onClick={onBack}>← Back to cart</button>
      <h2 style={s.checkoutTitle}>Checkout</h2>

      {/* Order summary */}
      <div style={s.orderSummary}>
        <div style={s.summaryTitle}>Order Summary</div>
        {cart.map((item) => (
          <div key={`${item.productId}-${item.color}-${item.size}`} style={s.summaryItem}>
            <span>{item.image} {item.name} ({item.color}, {item.size}) ×{item.quantity}</span>
            <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div style={s.summaryTotal}>
          <span>Total</span>
          <span style={{ color: "#ff6b9d", fontWeight: 900 }}>₹{total}</span>
        </div>
      </div>

      {/* Delivery address */}
      <div style={s.addressBlock}>
        <div style={s.optionLabel}>📍 Delivery Address</div>
        <textarea
          style={s.addressInput}
          placeholder="Enter your full delivery address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
        />
      </div>

      <button
        style={{ ...s.placeOrderBtn, opacity: (!address.trim() || loading) ? 0.6 : 1 }}
        disabled={!address.trim() || loading}
        onClick={() => onPlaceOrder(address, total)}
      >
        {loading ? "Placing Order..." : `Place Order · ₹${total}`}
      </button>
    </div>
  );
}

// ─── Order Confirmed ──────────────────────────────────────────────────────────
function OrderConfirmed({ order, onShopAgain }) {
  const orderId = order._id?.slice(-8).toUpperCase();
  return (
    <div style={s.confirmedBox}>
      <div style={{ fontSize: 56 }}>🎉</div>
      <h2 style={s.confirmedTitle}>Order Placed!</h2>
      <p style={{ color: "#aaa", marginBottom: 24, fontSize: 14 }}>
        Your items are on their way
      </p>

      <div style={s.orderCard}>
        <div style={s.orderCardTop}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>
            {order.platform === "amazon" ? "📦 Amazon" : "🛒 Flipkart"} Order
          </span>
          <span style={{ background: "#fff0f7", color: "#ff6b9d", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
            Placed
          </span>
        </div>
        <div style={s.orderCardBody}>
          {order.items.map((item, i) => (
            <div key={i} style={s.confirmedItem}>
              <span style={{ fontSize: 24 }}>{item.image}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "#aaa" }}>{item.color} · {item.size} · ×{item.quantity}</div>
              </div>
              <div style={{ fontWeight: 700, color: "#ff6b9d", marginLeft: "auto" }}>₹{item.price * item.quantity}</div>
            </div>
          ))}
          <div style={s.orderDivider} />
          {[
            { label: "Delivery to", value: order.deliveryAddress },
            { label: "Total Paid", value: `₹${order.totalAmount}`, highlight: true },
            { label: "Order ID", value: orderId, mono: true },
            { label: "Est. Delivery", value: "3–5 business days" },
          ].map((row) => (
            <div key={row.label} style={s.orderRow}>
              <span style={s.orderLabel}>{row.label}</span>
              <span style={{
                ...s.orderValue,
                ...(row.highlight ? { color: "#ff6b9d", fontWeight: 900, fontSize: 16 } : {}),
                ...(row.mono ? { fontFamily: "monospace", color: "#ff6b9d", letterSpacing: 2 } : {}),
              }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <button style={s.shopAgainBtn} onClick={onShopAgain}>Continue Shopping</button>
    </div>
  );
}

// ─── Main Shopping Page ───────────────────────────────────────────────────────
export default function Shopping() {
  const navigate = useNavigate();
  const [step, setStep] = useState("browse");  // browse | detail | checkout | confirmed
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => { fetchProducts(); }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedCategory !== "All") q.set("category", selectedCategory);
      if (searchQuery) q.set("search", searchQuery);
      const res = await fetch(`${API}/shop/products?${q}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setProducts(data.data); setCategories(data.categories); }
    } catch { setError("Cannot reach server."); }
    setLoading(false);
  };

  const handleAddToCart = (item) => {
    const key = `${item.productId}-${item.color}-${item.size}-${item.platform}`;
    setCart((prev) => {
      const exists = prev.find((i) => `${i.productId}-${i.color}-${i.size}-${i.platform}` === key);
      if (exists) return prev.map((i) => `${i.productId}-${i.color}-${i.size}-${i.platform}` === key ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, item];
    });
    setShowCart(true);
    setStep("browse");
  };

  const handleUpdateCart = (item, qty) => {
    const key = `${item.productId}-${item.color}-${item.size}-${item.platform}`;
    setCart((prev) => prev.map((i) => `${i.productId}-${i.color}-${i.size}-${i.platform}` === key ? { ...i, quantity: qty } : i));
  };

  const handleRemoveFromCart = (item) => {
    const key = `${item.productId}-${item.color}-${item.size}-${item.platform}`;
    setCart((prev) => prev.filter((i) => `${i.productId}-${i.color}-${i.size}-${i.platform}` !== key));
  };

  const handlePlaceOrder = async (address, total) => {
    setOrderLoading(true); setError("");
    // Determine dominant platform
    const platformCounts = cart.reduce((acc, i) => { acc[i.platform] = (acc[i.platform] || 0) + 1; return acc; }, {});
    const platform = Object.keys(platformCounts).sort((a, b) => platformCounts[b] - platformCounts[a])[0];
    try {
      const res = await fetch(`${API}/shop/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          platform,
          items: cart.map((i) => ({ productId: i.productId, name: i.name, category: i.category, size: i.size, color: i.color, price: i.price, quantity: i.quantity, image: i.image })),
          deliveryAddress: address,
          totalAmount: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setOrderLoading(false); return; }
      setOrder(data.data);
      setCart([]);
      setStep("confirmed");
    } catch { setError("Order failed. Please try again."); }
    setOrderLoading(false);
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={s.navInner}>
          <button style={s.backBtn} onClick={() => step !== "browse" ? setStep("browse") : navigate("/")}>
            {step !== "browse" ? "← Back" : "← Home"}
          </button>
          <span style={s.navTitle}>👗 Fashion Store</span>
          <div style={s.navRight}>
            <span style={s.navSub}>Amazon · Flipkart</span>
            {step === "browse" && (
              <button style={s.cartBtn} onClick={() => setShowCart(true)}>
                🛒 {cartCount > 0 && <span style={s.cartBadge}>{cartCount}</span>}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div style={s.container}>

        {/* Browse */}
        {step === "browse" && (
          <>
            {/* Search bar */}
            <div style={s.searchBar}>
              <span style={s.searchIcon}>🔍</span>
              <input
                style={s.searchInput}
                placeholder="Search for clothes, shoes, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button style={s.clearBtn} onClick={() => setSearchQuery("")}>✕</button>
              )}
            </div>

            {/* Categories */}
            <div style={s.categoryRow}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  style={{ ...s.catBtn, ...(selectedCategory === cat ? s.catBtnActive : {}) }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results count */}
            <div style={s.resultsInfo}>
              {loading ? "Loading..." : `${products.length} products found`}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {searchQuery && ` for "${searchQuery}"`}
            </div>

            {/* Products grid */}
            {loading ? (
              <div style={s.loadingBox}>
                <div style={s.spinner} />
                <p style={{ color: "#aaa" }}>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={s.emptyState}>
                <div style={{ fontSize: 48 }}>🔍</div>
                <p style={{ color: "#aaa", marginTop: 12 }}>No products found. Try a different search.</p>
              </div>
            ) : (
              <div style={s.productsGrid}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onView={(p) => { setSelectedProduct(p); setStep("detail"); }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Product Detail */}
        {step === "detail" && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onBack={() => setStep("browse")}
          />
        )}

        {/* Checkout */}
        {step === "checkout" && (
          <Checkout
            cart={cart}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => setShowCart(true)}
            loading={orderLoading}
          />
        )}

        {/* Confirmed */}
        {step === "confirmed" && order && (
          <OrderConfirmed
            order={order}
            onShopAgain={() => { setStep("browse"); setOrder(null); setError(""); }}
          />
        )}

        {error && <div style={s.errorBox}>⚠️ {error}</div>}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <CartDrawer
          cart={cart}
          onUpdate={handleUpdateCart}
          onRemove={handleRemoveFromCart}
          onCheckout={() => { setShowCart(false); setStep("checkout"); }}
          onClose={() => setShowCart(false)}
        />
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#fff5f9", fontFamily: "'Segoe UI', sans-serif", width: "100%" },
  navbar: { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #ffd6e7", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 },
  backBtn: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #ff6b9d", background: "transparent", color: "#ff6b9d", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  navTitle: { fontWeight: 800, fontSize: "clamp(15px, 2.5vw, 18px)", color: "#0d2137" },
  navRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 },
  navSub: { fontSize: 12, color: "#aaa" },
  cartBtn: { position: "relative", padding: "8px 14px", borderRadius: 10, border: "1.5px solid #ff6b9d", background: "white", fontSize: 16, cursor: "pointer" },
  cartBadge: { position: "absolute", top: -6, right: -6, background: "#ff6b9d", color: "white", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 },
  container: { maxWidth: 1200, margin: "0 auto", padding: "clamp(20px, 3vw, 32px) clamp(16px, 3vw, 24px)", paddingBottom: 40 },

  // Search
  searchBar: { display: "flex", alignItems: "center", gap: 10, background: "white", borderRadius: 14, padding: "12px 18px", marginBottom: 20, boxShadow: "0 2px 12px rgba(255,107,157,0.1)", border: "1.5px solid #ffd6e7" },
  searchIcon: { fontSize: 18, flexShrink: 0 },
  searchInput: { flex: 1, border: "none", outline: "none", fontSize: 15, color: "#0d2137", background: "transparent" },
  clearBtn: { background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 14 },

  // Categories
  categoryRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  catBtn: { padding: "8px 16px", borderRadius: 20, border: "1.5px solid #ffd6e7", background: "white", color: "#888", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  catBtnActive: { background: "#ff6b9d", color: "white", border: "1.5px solid #ff6b9d" },
  resultsInfo: { fontSize: 13, color: "#aaa", marginBottom: 16 },

  // Products grid
  productsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))", gap: "clamp(14px, 2vw, 20px)" },
  productCard: { background: "white", borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all 0.2s", border: "1px solid #ffd6e7" },
  productImageBox: { background: "linear-gradient(135deg, #fff5f9, #ffe4f0)", height: "clamp(140px, 20vw, 200px)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  productEmoji: { fontSize: "clamp(48px, 8vw, 72px)" },
  cheaperBadge: { position: "absolute", top: 10, right: 10, color: "white", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 8 },
  productInfo: { padding: "clamp(12px, 2vw, 16px)" },
  productCategory: { fontSize: 11, color: "#ff6b9d", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  productName: { fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 15px)", color: "#0d2137", marginBottom: 10 },
  priceRow: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 },
  platformPrice: { display: "flex", alignItems: "center", gap: 6 },
  platformDot: (p) => ({ width: 8, height: 8, borderRadius: "50%", background: p === "amazon" ? "#FF9900" : "#2874f0", flexShrink: 0 }),
  platformLabel: { fontSize: 11, color: "#aaa", width: 44 },
  priceTag: { fontWeight: 700, fontSize: 14 },
  colorDots: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 },
  colorLabel: { fontSize: 10, background: "#fff5f9", color: "#ff6b9d", padding: "2px 6px", borderRadius: 4, border: "1px solid #ffd6e7" },
  viewBtn: { width: "100%", padding: "9px", background: "#ff6b9d", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" },

  // Detail
  detailPage: { maxWidth: 900, margin: "0 auto" },
  backLink: { display: "inline-block", marginBottom: 20, padding: "8px 16px", border: "1px solid #ffd6e7", borderRadius: 8, background: "transparent", color: "#ff6b9d", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  detailLayout: { display: "grid", gridTemplateColumns: "clamp(200px, 35%, 300px) 1fr", gap: "clamp(20px, 3vw, 40px)", alignItems: "start" },
  detailImageBox: { background: "linear-gradient(135deg, #fff5f9, #ffe4f0)", borderRadius: 20, height: "clamp(240px, 35vw, 360px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, position: "sticky", top: 80 },
  detailEmoji: { fontSize: "clamp(72px, 12vw, 120px)" },
  detailCategory: { fontSize: 12, color: "#ff6b9d", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 },
  detailInfo: {},
  detailName: { fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 900, color: "#0d2137", margin: "0 0 20px" },
  compareTitle: { fontWeight: 700, fontSize: 14, color: "#0d2137", marginBottom: 12 },
  compareGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 },
  compareCard: { borderRadius: 12, padding: "clamp(12px, 2vw, 16px)", cursor: "pointer", transition: "all 0.15s" },
  compareHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  selectedTag: { fontSize: 10, color: "white", padding: "2px 6px", borderRadius: 6, fontWeight: 700, marginLeft: "auto" },
  comparePrice: { fontWeight: 900, fontSize: "clamp(18px, 2.5vw, 24px)", color: "#0d2137", marginBottom: 4 },
  compareMeta: { fontSize: 12, color: "#888" },
  optionBlock: { marginBottom: 20 },
  optionLabel: { fontWeight: 700, fontSize: 14, color: "#0d2137", marginBottom: 10 },
  optionRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  colorBtn: { padding: "7px 14px", borderRadius: 20, border: "1.5px solid #ffd6e7", background: "white", fontSize: 12, cursor: "pointer", color: "#888" },
  colorBtnActive: { background: "#ff6b9d", color: "white", border: "1.5px solid #ff6b9d" },
  sizeBtn: { width: "clamp(36px, 5vw, 48px)", height: "clamp(36px, 5vw, 48px)", borderRadius: 10, border: "1.5px solid #ffd6e7", background: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#888", display: "flex", alignItems: "center", justifyContent: "center" },
  sizeBtnActive: { background: "#ff6b9d", color: "white", border: "1.5px solid #ff6b9d" },
  addToCartRow: { display: "flex", alignItems: "center", gap: 16, marginTop: 24 },
  finalPrice: { fontWeight: 900, fontSize: "clamp(22px, 3vw, 30px)", color: "#ff6b9d" },
  addToCartBtn: { flex: 1, padding: "clamp(12px, 2vw, 16px)", background: "#ff6b9d", color: "white", border: "none", borderRadius: 12, fontWeight: 800, fontSize: "clamp(14px, 2vw, 16px)", cursor: "pointer" },

  // Cart drawer
  drawerOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500, display: "flex", justifyContent: "flex-end" },
  drawer: { background: "white", width: "clamp(300px, 90%, 420px)", height: "100vh", display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)" },
  drawerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #ffd6e7" },
  drawerTitle: { fontWeight: 800, fontSize: 16, color: "#0d2137" },
  drawerClose: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#aaa" },
  cartItems: { flex: 1, overflowY: "auto", padding: "16px 24px" },
  cartItem: { display: "flex", gap: 12, alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #ffd6e7" },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontWeight: 700, fontSize: 14, color: "#0d2137" },
  cartItemMeta: { fontSize: 12, color: "#aaa", marginTop: 2 },
  cartItemPrice: { fontWeight: 700, color: "#ff6b9d", marginTop: 4 },
  cartQtyRow: { display: "flex", alignItems: "center", gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, border: "1.5px solid #ffd6e7", background: "white", color: "#ff6b9d", fontWeight: 800, fontSize: 16, cursor: "pointer" },
  qtyNum: { fontWeight: 800, fontSize: 14, color: "#0d2137", minWidth: 16, textAlign: "center" },
  emptyCart: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  splitNotice: { margin: "0 24px", padding: "10px 14px", background: "#fff9e6", border: "1px solid #ffe4a0", borderRadius: 8, fontSize: 12, color: "#b45309" },
  cartFooter: { padding: "16px 24px", borderTop: "1px solid #ffd6e7" },
  cartTotal: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  checkoutBtn: { width: "100%", padding: "14px", background: "#ff6b9d", color: "white", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer" },

  // Checkout
  checkoutBox: { maxWidth: 560, margin: "0 auto" },
  checkoutTitle: { fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900, color: "#0d2137", marginBottom: 24 },
  orderSummary: { background: "white", borderRadius: 16, padding: "clamp(16px, 2.5vw, 24px)", marginBottom: 20, boxShadow: "0 2px 12px rgba(255,107,157,0.08)", border: "1px solid #ffd6e7" },
  summaryTitle: { fontWeight: 800, fontSize: 15, color: "#0d2137", marginBottom: 14 },
  summaryItem: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#444", padding: "8px 0", borderBottom: "1px solid #ffd6e7", gap: 10 },
  summaryTotal: { display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, paddingTop: 12, marginTop: 4 },
  addressBlock: { background: "white", borderRadius: 16, padding: "clamp(16px, 2.5vw, 24px)", marginBottom: 20, border: "1px solid #ffd6e7" },
  addressInput: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #ffd6e7", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", color: "#0d2137", marginTop: 10 },
  placeOrderBtn: { width: "100%", padding: "clamp(12px, 2vw, 16px)", background: "#ff6b9d", color: "white", border: "none", borderRadius: 12, fontWeight: 800, fontSize: "clamp(14px, 2vw, 16px)", cursor: "pointer" },

  // Confirmed
  confirmedBox: { maxWidth: 520, margin: "0 auto", textAlign: "center" },
  confirmedTitle: { fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 900, color: "#0d2137", margin: "8px 0 4px" },
  orderCard: { background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(255,107,157,0.12)", marginBottom: 20, textAlign: "left", border: "1px solid #ffd6e7" },
  orderCardTop: { background: "linear-gradient(135deg, #ff6b9d, #ff9bbe)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  orderCardBody: { padding: "16px 20px" },
  confirmedItem: { display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #fff5f9" },
  orderDivider: { height: 1, background: "#ffd6e7", margin: "12px 0" },
  orderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #fff5f9" },
  orderLabel: { fontSize: 13, color: "#aaa" },
  orderValue: { fontSize: 14, fontWeight: 600, color: "#0d2137", textAlign: "right", maxWidth: "60%" },
  shopAgainBtn: { width: "100%", padding: "14px", background: "#ff6b9d", color: "white", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer" },

  // Loading / error
  loadingBox: { textAlign: "center", padding: "60px 0" },
  spinner: { width: 40, height: 40, borderRadius: "50%", border: "4px solid #ffd6e7", borderTop: "4px solid #ff6b9d", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" },
  emptyState: { textAlign: "center", padding: "60px 0" },
  errorBox: { background: "#fff5f9", border: "1px solid #ffd6e7", borderRadius: 10, padding: "12px 16px", color: "#ff6b9d", fontSize: 14, marginTop: 16 },
};
