import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { db } from "../../services/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import "./Checkout.css";

const Checkout = ({ currentUser }) => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists() && docSnap.data().addresses) {
          const addrs = docSnap.data().addresses;
          setSavedAddresses(addrs);
          if (addrs.length > 0) setSelectedAddress(addrs[0]); // Select first by default
        }
      } catch (error) {
        console.error("Error fetching addresses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [currentUser]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("Cart is empty!");
    if (!selectedAddress) return alert("Please select a delivery address.");

    try {
      const orderData = {
        customerName: selectedAddress.name,
        customerEmail: currentUser.email,
        customerPhone: selectedAddress.phone,
        shippingAddress: `${selectedAddress.address}, ${selectedAddress.city} - ${selectedAddress.pincode} (${selectedAddress.type})`,
        items: cartItems.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        totalAmount: cartTotal,
        status: "Processing",
        date: new Date().toLocaleString(),
      };

      await addDoc(collection(db, "orders"), orderData);
      clearCart();
      alert("🎉 Order Confirmed! Redirecting to My Orders...");
      navigate("/my-orders");
    } catch (error) {
      alert("Error placing order. Please try again.");
    }
  };

  if (loading)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Loading Checkout...
      </div>
    );

  return (
    <div className="checkout-page container page-view active">
      <h2>Secure Checkout</h2>
      <div className="checkout-grid">
        <div className="checkout-form-section">
          <h3>Select Delivery Address</h3>

          {savedAddresses.length === 0 ? (
            <div className="no-address-warning">
              <p>You don't have any saved addresses.</p>
              <Link
                to="/profile"
                className="primary-btn"
                style={{ display: "inline-block", marginTop: "10px" }}
              >
                Add Address in Profile
              </Link>
            </div>
          ) : (
            <div className="address-selector-grid">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`selectable-address-card ${selectedAddress?.id === addr.id ? "selected" : ""}`}
                  onClick={() => setSelectedAddress(addr)}
                >
                  <span className="addr-tag">{addr.type}</span>
                  <h4>{addr.name}</h4>
                  <p className="addr-phone">Ph: {addr.phone}</p>
                  <p className="addr-text">
                    {addr.address}, <br />
                    {addr.city} - {addr.pincode}
                  </p>

                  {selectedAddress?.id === addr.id && (
                    <div className="check-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: "30px" }}>
            <button
              className="primary-btn place-order-btn"
              onClick={handlePlaceOrder}
              disabled={savedAddresses.length === 0}
            >
              CONFIRM & PLACE ORDER
            </button>
          </div>
        </div>

        <div className="checkout-summary-section">
          <div className="summary-card">
            <h3>Items in Order</h3>
            <div className="checkout-items">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <img src={item.image} alt={item.name} />
                  <div className="ci-info">
                    <p>{item.name}</p>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <strong>
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </strong>
                </div>
              ))}
            </div>
            <div className="summary-row total-row">
              <span>Total Payable</span>
              <span style={{ color: "#2563eb" }}>
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
