import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Footer.css";

const Footer = () => {
  const [storeInfo, setStoreInfo] = useState({
    address: "",
    phone: "",
    timing: "",
  });

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const metaSnap = await getDoc(doc(db, "store_metadata", "config"));
        if (metaSnap.exists() && metaSnap.data().storeInfo) {
          setStoreInfo(metaSnap.data().storeInfo);
        }
      } catch (error) {
        console.error("Error fetching footer store info:", error);
      }
    };
    fetchStoreInfo();
  }, []);

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="logo" style={{ marginBottom: "16px" }}>
            <span className="logo-main" style={{ fontSize: "22px" }}>
              TECHSTORE
            </span>
            <span className="logo-sub">E-COMMERCE</span>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.6" }}>
            Your premier destination for high-performance laptops, gaming rigs,
            and IT solutions.
          </p>
        </div>

        <div className="footer-col">
          <h4>Store Headquarters</h4>
          <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.6" }}>
            {storeInfo.address}
          </p>
          <p
            style={{
              color: "#38bdf8",
              fontSize: "13px",
              fontWeight: "700",
              marginTop: "8px",
            }}
          >
            Phone: {storeInfo.phone}
          </p>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
            {storeInfo.timing}
          </p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/#products">Products</Link>
          <Link to="/cart">Shopping Cart</Link>
          <Link to="/my-orders">My Orders</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2026 TechStore E-Commerce. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
