import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
// import './Cart.css'; // Uncomment this if you have a Cart.css file

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  // 🔥 SAFE CALCULATION: Prevents crash if price or quantity is undefined/corrupted
  const totalAmount = cartItems.reduce((total, item) => {
    const safePrice = Number(item.price) || 0;
    const safeQty = Number(item.quantity) || 1;
    return total + safePrice * safeQty;
  }, 0);

  if (cartItems.length === 0) {
    return (
      <div
        className="empty-cart container page-view active"
        style={{
          padding: "80px 20px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png"
          alt="Empty Cart"
          style={{ width: "130px", marginBottom: "24px", opacity: 0.8 }}
        />
        <h2
          style={{ fontSize: "26px", color: "#0f172a", marginBottom: "10px" }}
        >
          Your Cart is Empty!
        </h2>
        <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "15px" }}>
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/"
          className="primary-btn"
          style={{ display: "inline-block" }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page container page-view active">
      <h2 style={{ marginBottom: "24px", color: "#0f172a" }}>
        Shopping Cart{" "}
        <span style={{ color: "#64748b", fontSize: "16px" }}>
          ({cartItems.length} items)
        </span>
      </h2>

      <div
        className="cart-grid"
        style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}
      >
        {/* Cart Items List */}
        <div className="cart-items-list" style={{ flex: "1 1 60%" }}>
          {cartItems.map((item) => {
            // 🔥 SAFE FALLBACKS FOR EACH ITEM
            const safePrice = Number(item.price) || 0;
            const safeQty = Number(item.quantity) || 1;
            const itemTotal = safePrice * safeQty;

            return (
              <div
                key={item.id}
                className="cart-item-card"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "20px",
                  padding: "24px",
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "16px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                }}
              >
                <img
                  src={item.image || "https://via.placeholder.com/150"}
                  alt={item.name}
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "contain",
                    background: "#f8fafc",
                    padding: "10px",
                    borderRadius: "12px",
                  }}
                />

                <div
                  className="cart-item-details"
                  style={{ flex: 1, minWidth: "200px" }}
                >
                  <Link
                    to={`/product/${item.id}`}
                    style={{ textDecoration: "none", color: "#0f172a" }}
                  >
                    <h3
                      style={{
                        fontSize: "16px",
                        margin: "0 0 8px 0",
                        lineHeight: "1.4",
                      }}
                    >
                      {item.name}
                    </h3>
                  </Link>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {item.brand}
                  </p>
                  <h4
                    style={{
                      fontSize: "18px",
                      color: "#0f172a",
                      fontWeight: "800",
                      margin: "0 0 16px 0",
                    }}
                  >
                    ₹{safePrice.toLocaleString("en-IN")}
                  </h4>

                  <div
                    className="cart-actions"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "24px",
                    }}
                  >
                    <div
                      className="qty-controls"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, safeQty - 1)}
                        style={{
                          padding: "8px 14px",
                          background: "#f8fafc",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "bold",
                          color: "#334155",
                        }}
                      >
                        -
                      </button>
                      <span
                        style={{
                          padding: "8px 16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          borderLeft: "1px solid #cbd5e1",
                          borderRight: "1px solid #cbd5e1",
                          color: "#0f172a",
                        }}
                      >
                        {safeQty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, safeQty + 1)}
                        style={{
                          padding: "8px 14px",
                          background: "#f8fafc",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "bold",
                          color: "#334155",
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        color: "#ef4444",
                        background: "none",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>

                <div
                  className="cart-item-total"
                  style={{
                    fontWeight: "800",
                    fontSize: "18px",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  ₹{itemTotal.toLocaleString("en-IN")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Panel */}
        <div
          className="cart-summary"
          style={{
            flex: "1 1 300px",
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            height: "fit-content",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <h3
            style={{ margin: "0 0 24px 0", fontSize: "18px", color: "#0f172a" }}
          >
            Order Summary
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
              color: "#475569",
              fontSize: "15px",
            }}
          >
            <span>Subtotal ({cartItems.length} items)</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>
              ₹{totalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
              color: "#475569",
              fontSize: "15px",
            }}
          >
            <span>Shipping Fee</span>
            <span style={{ color: "#16a34a", fontWeight: "800" }}>FREE</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "20px",
              borderTop: "2px dashed #e2e8f0",
              fontWeight: "900",
              fontSize: "22px",
              color: "#0f172a",
              marginBottom: "24px",
            }}
          >
            <span>Total</span>
            <span>₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/checkout")}
            style={{
              width: "100%",
              textAlign: "center",
              padding: "16px",
              fontSize: "15px",
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
