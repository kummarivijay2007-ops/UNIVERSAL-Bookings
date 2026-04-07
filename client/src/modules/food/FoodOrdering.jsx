import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

// ─── Step 1: Area Search Form ─────────────────────────────────────────────────
function AreaForm({ onSearch, loading }) {
  const [area, setArea] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (area.trim()) onSearch(area.trim());
  };

  return (
    <div style={s.formCard}>
      <div style={s.formIcon}>🍔</div>
      <h2 style={s.formTitle}>Order Food</h2>
      <p style={s.formSub}>Enter your area to see restaurants near you</p>
      <div style={s.inputRow}>
        <span style={s.inputIcon}>📍</span>
        <input
          style={s.input}
          placeholder="Enter your area (e.g. Madhapur, Banjara Hills)"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          required
        />
      </div>
      <button
        style={{ ...s.searchBtn, opacity: loading ? 0.7 : 1 }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Finding restaurants..." : "Find Restaurants 🔍"}
      </button>
    </div>
  );
}

// ─── Restaurant Card ──────────────────────────────────────────────────────────
function RestaurantCard({ restaurant, provider, onSelect, isSelected }) {
  return (
    <div
      style={{
        ...s.restCard,
        border: isSelected ? "2px solid #e23744" : "2px solid #e8f0f8",
        boxShadow: isSelected
          ? "0 8px 24px rgba(226,55,68,0.15)"
          : "0 2px 12px rgba(0,0,0,0.06)",
      }}
      onClick={() => onSelect(restaurant, provider)}
    >
      <div style={s.restTop}>
        <div style={s.restName}>{restaurant.name}</div>
        <div style={s.restRating}>⭐ {restaurant.rating}</div>
      </div>
      <div style={s.restCuisine}>{restaurant.cuisine}</div>
      <div style={s.restMeta}>
        <span>🕐 {restaurant.deliveryTime}</span>
        <span>{restaurant.deliveryFee === 0 ? "🆓 Free delivery" : `🛵 ₹${restaurant.deliveryFee} delivery`}</span>
      </div>
      <div style={s.restMin}>Min order: ₹{restaurant.minOrder}</div>
    </div>
  );
}

// ─── Menu + Cart ──────────────────────────────────────────────────────────────
function MenuAndCart({ restaurant, provider, cart, onUpdateCart, onBack }) {
  // Group items by category
  const categories = [...new Set(restaurant.items.map((i) => i.category))];

  const getQty = (itemId) => cart.find((c) => c.id === itemId)?.quantity || 0;

  const handleAdd = (item) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      onUpdateCart(cart.map((c) =>
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      onUpdateCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const handleRemove = (itemId) => {
    const existing = cart.find((c) => c.id === itemId);
    if (existing.quantity === 1) {
      onUpdateCart(cart.filter((c) => c.id !== itemId));
    } else {
      onUpdateCart(cart.map((c) =>
        c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
      ));
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div style={s.menuLayout}>
      {/* Menu */}
      <div style={s.menuSection}>
        <div style={s.menuHeader}>
          <button style={s.backLink} onClick={onBack}>← Back</button>
          <div>
            <div style={s.menuRestName}>{restaurant.name}</div>
            <div style={s.menuProvider}>via {provider.provider} {provider.logo}</div>
          </div>
        </div>

        {categories.map((cat) => (
          <div key={cat} style={s.categoryBlock}>
            <div style={s.categoryTitle}>{cat}</div>
            {restaurant.items
              .filter((i) => i.category === cat)
              .map((item) => (
                <div key={item.id} style={s.menuItem}>
                  <div style={s.menuItemInfo}>
                    <div style={s.menuItemName}>{item.name}</div>
                    <div style={s.menuItemPrice}>₹{item.price}</div>
                  </div>
                  <div style={s.qtyControls}>
                    {getQty(item.id) > 0 ? (
                      <>
                        <button style={s.qtyBtn} onClick={() => handleRemove(item.id)}>−</button>
                        <span style={s.qtyNum}>{getQty(item.id)}</span>
                        <button style={s.qtyBtn} onClick={() => handleAdd(item)}>+</button>
                      </>
                    ) : (
                      <button style={s.addBtn} onClick={() => handleAdd(item)}>ADD</button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Cart */}
      <div style={s.cartSection}>
        <div style={s.cartTitle}>🛒 Your Cart</div>
        {cart.length === 0 ? (
          <div style={s.cartEmpty}>
            <div style={{ fontSize: 32 }}>🛒</div>
            <p style={{ color: "#aaa", fontSize: 13, margin: "8px 0 0" }}>Add items to cart</p>
          </div>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} style={s.cartItem}>
                <div style={s.cartItemName}>{item.name} × {item.quantity}</div>
                <div style={s.cartItemPrice}>₹{item.price * item.quantity}</div>
              </div>
            ))}
            <div style={s.cartDivider} />
            <div style={s.cartRow}>
              <span style={s.cartLabel}>Subtotal</span>
              <span style={s.cartValue}>₹{cartTotal}</span>
            </div>
            <div style={s.cartRow}>
              <span style={s.cartLabel}>Delivery</span>
              <span style={s.cartValue}>
                {restaurant.deliveryFee === 0 ? "FREE" : `₹${restaurant.deliveryFee}`}
              </span>
            </div>
            <div style={{ ...s.cartRow, fontWeight: 800, fontSize: 16 }}>
              <span>Total</span>
              <span style={{ color: "#e23744" }}>
                ₹{cartTotal + restaurant.deliveryFee}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Checkout Form ────────────────────────────────────────────────────────────
function CheckoutBar({ cart, restaurant, provider, onPlaceOrder, loading }) {
  const [address, setAddress] = useState("");
  const [showAddress, setShowAddress] = useState(false);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = cartTotal + restaurant.deliveryFee;
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (cart.length === 0) return null;

  return (
    <div style={s.checkoutBar}>
      {showAddress ? (
        <div style={s.addressRow}>
          <input
            style={s.addressInput}
            placeholder="Enter delivery address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button
            style={{
              ...s.placeOrderBtn,
              opacity: (!address.trim() || loading) ? 0.6 : 1,
            }}
            onClick={() => address.trim() && onPlaceOrder(address, total)}
            disabled={!address.trim() || loading}
          >
            {loading ? "Placing..." : "Place Order"}
          </button>
        </div>
      ) : (
        <div style={s.checkoutRow}>
          <div>
            <div style={s.checkoutCount}>{cartCount} items · ₹{total}</div>
            <div style={s.checkoutSub}>Incl. delivery charges</div>
          </div>
          <button style={s.proceedBtn} onClick={() => setShowAddress(true)}>
            Proceed to Checkout →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Order Confirmed ──────────────────────────────────────────────────────────
function OrderConfirmed({ order, onOrderAgain }) {
  return (
    <div style={s.confirmedBox}>
      <div style={{ fontSize: 56 }}>🎉</div>
      <h2 style={s.confirmedTitle}>Order Placed!</h2>
      <p style={s.confirmedSub}>Your food is being prepared</p>

      <div style={s.confirmedDetails}>
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Restaurant</span>
          <span style={s.detailValue}>{order.restaurant}</span>
        </div>
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Provider</span>
          <span style={s.detailValue}>{order.provider}</span>
        </div>
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Items</span>
          <span style={s.detailValue}>
            {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
          </span>
        </div>
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Delivery to</span>
          <span style={s.detailValue}>{order.deliveryAddress}</span>
        </div>
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Total Paid</span>
          <span style={{ ...s.detailValue, color: "#e23744", fontWeight: 800 }}>
            ₹{order.totalAmount}
          </span>
        </div>
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Status</span>
          <span style={{ ...s.detailValue, color: "#22c55e", fontWeight: 700 }}>
            🍳 Preparing
          </span>
        </div>
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Order ID</span>
          <span style={{ ...s.detailValue, fontSize: 11, color: "#aaa" }}>{order._id}</span>
        </div>
      </div>

      <button style={s.orderAgainBtn} onClick={onOrderAgain}>
        Order Again
      </button>
    </div>
  );
}

// ─── Main FoodOrdering Page ───────────────────────────────────────────────────
export default function FoodOrdering() {
  const navigate = useNavigate();

  const [step, setStep] = useState("search"); // search | restaurants | menu | confirmed
  const [area, setArea] = useState("");
  const [providers, setProviders] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleSearch = async (searchArea) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/food/restaurants?area=${encodeURIComponent(searchArea)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setProviders(data.data);
      setArea(searchArea);
      setStep("restaurants");
    } catch {
      setError("Cannot reach server. Make sure backend is running.");
    }
    setLoading(false);
  };

  const handleSelectRestaurant = (restaurant, provider) => {
    setSelectedRestaurant(restaurant);
    setSelectedProvider(provider);
    setCart([]);
    setStep("menu");
  };

  const handlePlaceOrder = async (address, total) => {
    setOrderLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/food/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: selectedProvider.provider,
          restaurant: selectedRestaurant.name,
          items: cart.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
          deliveryAddress: address,
          totalAmount: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setOrderLoading(false); return; }
      setOrder(data.data);
      setStep("confirmed");
    } catch {
      setError("Order failed. Please try again.");
    }
    setOrderLoading(false);
  };

  const handleOrderAgain = () => {
    setStep("search");
    setCart([]);
    setOrder(null);
    setSelectedRestaurant(null);
    setSelectedProvider(null);
    setError("");
  };

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.navbar}>
        <button style={s.backBtn} onClick={() => navigate("/")}>← Home</button>
        <span style={s.navTitle}>🍔 Food Ordering</span>
        <span style={s.navSub}>Swiggy · Zomato</span>
      </nav>

      <div style={s.container}>
        {step === "search" && (
          <AreaForm onSearch={handleSearch} loading={loading} />
        )}

        {step === "restaurants" && (
          <>
            <div style={s.areaBar}>
              <span>📍 Showing restaurants in <b>{area}</b></span>
              <button style={s.changeBtn} onClick={() => setStep("search")}>Change</button>
            </div>

            {providers.map((provider) => (
              <div key={provider.provider} style={s.providerSection}>
                <div style={{ ...s.providerBadge, background: provider.color }}>
                  {provider.logo} {provider.provider}
                </div>
                <div style={s.restGrid}>
                  {provider.places.map((rest) => (
                    <RestaurantCard
                      key={rest.id}
                      restaurant={rest}
                      provider={provider}
                      isSelected={selectedRestaurant?.id === rest.id}
                      onSelect={handleSelectRestaurant}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {step === "menu" && selectedRestaurant && (
          <>
            <MenuAndCart
              restaurant={selectedRestaurant}
              provider={selectedProvider}
              cart={cart}
              onUpdateCart={setCart}
              onBack={() => setStep("restaurants")}
            />
            <CheckoutBar
              cart={cart}
              restaurant={selectedRestaurant}
              provider={selectedProvider}
              onPlaceOrder={handlePlaceOrder}
              loading={orderLoading}
            />
          </>
        )}

        {step === "confirmed" && order && (
          <OrderConfirmed order={order} onOrderAgain={handleOrderAgain} />
        )}

        {error && <div style={s.errorBox}>⚠️ {error}</div>}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#FFF8F5", fontFamily: "'Segoe UI', sans-serif" },
  navbar: {
    display: "flex", alignItems: "center", gap: 16, padding: "16px 32px",
    background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid #ffe0d0", position: "sticky", top: 0, zIndex: 100,
  },
  backBtn: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #e23744", background: "transparent", color: "#e23744", fontWeight: 600, fontSize: 13, cursor: "pointer" },
  navTitle: { fontWeight: 800, fontSize: 18, color: "#0d2137" },
  navSub: { fontSize: 13, color: "#aaa", marginLeft: "auto" },
  container: { maxWidth: 960, margin: "0 auto", padding: "32px 24px", paddingBottom: 100 },

  // Search form
  formCard: { background: "white", borderRadius: 20, padding: "48px 36px", maxWidth: 520, margin: "0 auto", textAlign: "center", boxShadow: "0 4px 24px rgba(226,55,68,0.1)" },
  formIcon: { fontSize: 52, marginBottom: 12 },
  formTitle: { fontSize: 24, fontWeight: 900, color: "#0d2137", margin: "0 0 8px" },
  formSub: { color: "#aaa", fontSize: 15, margin: "0 0 28px" },
  inputRow: { display: "flex", alignItems: "center", gap: 10, background: "#fff5f5", borderRadius: 12, padding: "12px 16px", marginBottom: 16 },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, border: "none", outline: "none", fontSize: 15, background: "transparent", color: "#0d2137" },
  searchBtn: { width: "100%", padding: "15px", background: "#e23744", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(226,55,68,0.3)" },

  // Area bar
  areaBar: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", borderRadius: 12, padding: "14px 20px", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontSize: 14, color: "#444" },
  changeBtn: { padding: "6px 14px", border: "1.5px solid #e23744", borderRadius: 8, background: "transparent", color: "#e23744", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  // Provider section
  providerSection: { marginBottom: 32 },
  providerBadge: { display: "inline-flex", alignItems: "center", gap: 6, color: "white", fontWeight: 800, fontSize: 15, padding: "8px 18px", borderRadius: 20, marginBottom: 16 },
  restGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 },

  // Restaurant card
  restCard: { background: "white", borderRadius: 14, padding: "18px", cursor: "pointer", transition: "all 0.2s" },
  restTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  restName: { fontWeight: 800, fontSize: 15, color: "#0d2137" },
  restRating: { fontSize: 13, fontWeight: 600, color: "#f59e0b" },
  restCuisine: { fontSize: 12, color: "#aaa", marginBottom: 10 },
  restMeta: { display: "flex", gap: 12, fontSize: 12, color: "#666", marginBottom: 6 },
  restMin: { fontSize: 12, color: "#aaa" },

  // Menu layout
  menuLayout: { display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" },
  menuSection: { background: "white", borderRadius: 16, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  menuHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" },
  backLink: { padding: "6px 12px", border: "1px solid #ddd", borderRadius: 8, background: "transparent", fontSize: 13, cursor: "pointer", color: "#666" },
  menuRestName: { fontWeight: 800, fontSize: 16, color: "#0d2137" },
  menuProvider: { fontSize: 12, color: "#aaa", marginTop: 2 },
  categoryBlock: { marginBottom: 20 },
  categoryTitle: { fontWeight: 700, fontSize: 13, color: "#e23744", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 },
  menuItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f8f8f8" },
  menuItemInfo: {},
  menuItemName: { fontWeight: 600, fontSize: 14, color: "#0d2137" },
  menuItemPrice: { fontSize: 13, color: "#666", marginTop: 2 },
  qtyControls: { display: "flex", alignItems: "center", gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, border: "1.5px solid #e23744", background: "white", color: "#e23744", fontWeight: 800, fontSize: 16, cursor: "pointer" },
  qtyNum: { fontWeight: 700, fontSize: 14, color: "#0d2137", minWidth: 16, textAlign: "center" },
  addBtn: { padding: "6px 16px", border: "1.5px solid #e23744", borderRadius: 8, background: "white", color: "#e23744", fontWeight: 700, fontSize: 13, cursor: "pointer" },

  // Cart
  cartSection: { background: "white", borderRadius: 16, padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 80 },
  cartTitle: { fontWeight: 800, fontSize: 16, color: "#0d2137", marginBottom: 16 },
  cartEmpty: { textAlign: "center", padding: "24px 0" },
  cartItem: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  cartItemName: { fontSize: 13, color: "#444", fontWeight: 500 },
  cartItemPrice: { fontSize: 13, fontWeight: 700, color: "#0d2137" },
  cartDivider: { height: 1, background: "#f0f0f0", margin: "12px 0" },
  cartRow: { display: "flex", justifyContent: "space-between", fontSize: 14, color: "#444", marginBottom: 8 },
  cartLabel: { color: "#888" },
  cartValue: { fontWeight: 600 },

  // Checkout bar
  checkoutBar: { position: "fixed", bottom: 0, left: 0, right: 0, background: "white", padding: "16px 32px", boxShadow: "0 -4px 24px rgba(0,0,0,0.1)", zIndex: 200 },
  checkoutRow: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 960, margin: "0 auto" },
  checkoutCount: { fontWeight: 800, fontSize: 16, color: "#0d2137" },
  checkoutSub: { fontSize: 12, color: "#aaa", marginTop: 2 },
  proceedBtn: { padding: "14px 28px", background: "#e23744", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" },
  addressRow: { display: "flex", gap: 12, alignItems: "center", maxWidth: 960, margin: "0 auto" },
  addressInput: { flex: 1, padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none" },
  placeOrderBtn: { padding: "12px 24px", background: "#e23744", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" },

  // Confirmed
  confirmedBox: { background: "white", borderRadius: 20, padding: "48px 32px", textAlign: "center", maxWidth: 480, margin: "0 auto", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  confirmedTitle: { fontSize: 26, fontWeight: 900, color: "#0d2137", margin: "8px 0 4px" },
  confirmedSub: { color: "#aaa", marginBottom: 24 },
  confirmedDetails: { background: "#fff8f5", borderRadius: 12, padding: "20px", marginBottom: 24, textAlign: "left" },
  detailRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f0e8e4" },
  detailLabel: { fontSize: 13, color: "#aaa", fontWeight: 500 },
  detailValue: { fontSize: 14, color: "#0d2137", fontWeight: 600, textAlign: "right", maxWidth: "60%" },
  orderAgainBtn: { width: "100%", padding: "14px", background: "#e23744", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" },

  errorBox: { background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 10, padding: "12px 16px", color: "#cc0000", fontSize: 14, marginTop: 16 },
};