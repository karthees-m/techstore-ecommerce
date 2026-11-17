import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./Wishlist.css";

const Wishlist = () => {
  const { wishlistItems } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="wishlist-page container page-view active">
        <div className="wishlist-header">
          <h2>My Wishlist</h2>
        </div>
        <div className="product-grid" style={{ marginTop: "20px" }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-card">
              <div className="skeleton-img"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line long"></div>
              <div className="skeleton-line medium"></div>
              <div className="skeleton-btn-row">
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="empty-wishlist container page-view active">
        <img
          src="https://cdn-icons-png.flaticon.com/512/833/833472.png"
          alt="Empty Wishlist"
        />
        <h2>Your Wishlist is Empty!</h2>
        <p>Save items you love here and buy them later.</p>
        <Link to="/" className="primary-id-btn primary-btn">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page container page-view active">
      <div className="wishlist-header">
        <h2>
          My Wishlist <span>({wishlistItems.length} items)</span>
        </h2>
      </div>

      <div className="product-grid">
        {wishlistItems.map((product) => (
          <div key={product.id} style={{ display: "flex", height: "100%" }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
