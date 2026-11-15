import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart, wishlistItems, toggleWishlist } = useCart();
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );
  const isWishlisted = wishlistItems?.some((item) => item.id === product.id);

  // Check if Out of Stock
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <article
      className={`product-card ${isOutOfStock ? "out-of-stock-card" : ""}`}
    >
      <div className="product-image">
        <Link
          to={`/product/${product.id}`}
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={isOutOfStock ? "dim-image" : ""}
          />
          {isOutOfStock && <div className="oos-overlay">OUT OF STOCK</div>}
        </Link>

        {/* 🔥 EMOJIS REMOVED: PREMIUM SVG HEART ICON FOR WISHLIST */}
        <button
          className={`wishlist-button ${isWishlisted ? "active" : ""}`}
          title="Add to Wishlist"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
        >
          {isWishlisted ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          )}
        </button>
      </div>

      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <h3>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        {/* 🔥 NEW: DESCRIPTION SNIPPET (Will be clamped to 2 lines via CSS) */}
        <p className="product-desc-snippet">{product.description}</p>

        <div className="product-price">
          ₹{Number(product.price).toLocaleString("en-IN")}
          <span className="original-price">
            ₹{Number(product.originalPrice).toLocaleString("en-IN")}
          </span>
          <span className="discount-tag">{discount}% off</span>
        </div>

        <div className="product-actions">
          <Link to={`/product/${product.id}`} className="details-btn">
            Details
          </Link>
          <button
            className="cart-btn"
            disabled={isOutOfStock}
            style={{
              opacity: isOutOfStock ? 0.5 : 1,
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              background: isOutOfStock ? "#64748b" : "#2563eb",
            }}
            onClick={(e) => {
              if (!isOutOfStock) {
                e.stopPropagation();
                addToCart(product);
              }
            }}
          >
            {isOutOfStock ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
