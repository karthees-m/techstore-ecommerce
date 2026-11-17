import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../services/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./ProductDetail.css";

const ProductDetail = ({ currentUser }) => {
  const { id } = useParams();
  const { addToCart, wishlistItems, toggleWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        let currentProductData = null;
        if (docSnap.exists()) {
          currentProductData = { id: docSnap.id, ...docSnap.data() };
          setProduct(currentProductData);
        }

        const qR = query(
          collection(db, "products", id, "reviews"),
          orderBy("date", "desc"),
        );
        const reviewSnap = await getDocs(qR);
        setReviews(reviewSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        if (currentProductData) {
          const allProductsSnap = await getDocs(collection(db, "products"));
          const allProds = allProductsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setSimilarProducts(
            allProds
              .filter(
                (p) =>
                  p.category === currentProductData.category &&
                  p.id !== docSnap.id,
              )
              .slice(0, 4),
          );
        }

        if (currentUser && currentProductData) {
          const qOrders = query(
            collection(db, "orders"),
            where("customerEmail", "==", currentUser.email),
          );
          const oSnap = await getDocs(qOrders);
          let verified = false;
          oSnap.forEach((d) => {
            const order = d.data();
            if (
              order.status === "Delivered" &&
              order.items.some(
                (item) =>
                  item.id === id || item.name === currentProductData.name,
              )
            ) {
              verified = true;
            }
          });
          setIsVerifiedBuyer(verified);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
    window.scrollTo(0, 0);
  }, [id, currentUser]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return alert("Please write a comment.");
    setSubmittingReview(true);
    try {
      if (editingReviewId) {
        await updateDoc(doc(db, "products", id, "reviews", editingReviewId), {
          rating: Number(rating),
          comment,
          date: new Date().toISOString(),
        });
        setReviews(
          reviews.map((r) =>
            r.id === editingReviewId
              ? { ...r, rating: Number(rating), comment }
              : r,
          ),
        );
        setEditingReviewId(null);
        alert("Review updated successfully!");
      } else {
        const newReview = {
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email.split("@")[0],
          userPhoto: currentUser.photoURL || "",
          rating: Number(rating),
          comment,
          date: new Date().toISOString(),
        };
        const addedRef = await addDoc(
          collection(db, "products", id, "reviews"),
          newReview,
        );
        setReviews([{ id: addedRef.id, ...newReview }, ...reviews]);
        alert("Review submitted successfully!");
      }
      setComment("");
    } catch (error) {
      alert("Failed to save review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      try {
        await deleteDoc(doc(db, "products", id, "reviews", reviewId));
        setReviews(reviews.filter((r) => r.id !== reviewId));
        alert("Review deleted.");
      } catch (error) {
        alert("Failed to delete review.");
      }
    }
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment);
  };

  if (loading)
    return (
      <div style={{ padding: "100px", textAlign: "center", fontSize: "20px" }}>
        Loading Product Info...
      </div>
    );
  if (!product)
    return (
      <div style={{ padding: "100px", textAlign: "center", fontSize: "20px" }}>
        Product Not Found!
      </div>
    );

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );
  const isWishlisted = wishlistItems?.some((item) => item.id === product.id);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
      : "No Reviews";
  const isOutOfStock = product.stockQuantity <= 0;
  const myReview = currentUser
    ? reviews.find((r) => r.userId === currentUser.uid)
    : null;

  const StarIcon = ({ filled }) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "#eab308" : "none"}
      stroke={filled ? "#eab308" : "#94a3b8"}
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );

  return (
    <div className="page-view active">
      <div className="container" style={{ padding: "40px 0" }}>
        <div className="breadcrumb">
          <Link to="/">Home</Link> &gt; <span>{product.category}</span> &gt;{" "}
          <span>{product.brand}</span>
        </div>

        <div className="full-detail-card">
          <div className="full-detail-img-box">
            <img
              src={product.image}
              alt={product.name}
              style={{ opacity: isOutOfStock ? 0.4 : 1 }}
            />
            {isOutOfStock && <div className="oos-overlay">SOLD OUT</div>}

            <button
              className={`pd-wishlist-btn ${isWishlisted ? "active" : ""}`}
              onClick={() => toggleWishlist(product)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {isWishlisted ? " Added to Wishlist" : " Add to Wishlist"}
            </button>
          </div>
          <div className="full-detail-content">
            <span className="product-brand">{product.brand}</span>
            <h2>{product.name}</h2>
            <div className="pd-rating-row">
              <span className="rating-badge">
                <StarIcon filled={true} /> {avgRating}
              </span>
              <span className="store-location-text">
                ({reviews.length} Ratings & Reviews)
              </span>
              <span
                style={{
                  marginLeft: "15px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  background: isOutOfStock ? "#fee2e2" : "#dcfce7",
                  color: isOutOfStock ? "#dc2626" : "#166534",
                }}
              >
                {isOutOfStock ? "Currently Unavailable" : "In Stock"}
              </span>
            </div>
            <div className="fk-price-row">
              <span className="fk-current-price">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
              <span className="fk-original-price">
                ₹{Number(product.originalPrice).toLocaleString("en-IN")}
              </span>
              <span className="fk-offer-tag">{discount}% Off</span>
            </div>
            <div className="fk-highlights-box">
              <h4>Product Description</h4>
              <p>{product.description}</p>
            </div>
            <div className="fk-action-buttons">
              <button
                className="primary-btn"
                disabled={isOutOfStock}
                style={{
                  opacity: isOutOfStock ? 0.5 : 1,
                  background: isOutOfStock ? "#64748b" : "",
                }}
                onClick={() => addToCart(product)}
              >
                {isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
              </button>
              <button
                className="primary-btn buy-now"
                disabled={isOutOfStock}
                style={{
                  opacity: isOutOfStock ? 0.5 : 1,
                  background: isOutOfStock ? "#475569" : "",
                }}
                onClick={() => {
                  addToCart(product);
                  window.location.href = "/cart";
                }}
              >
                {isOutOfStock ? "SOLD OUT" : "BUY NOW"}
              </button>
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="similar-products-section">
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "800",
                margin: "40px 0 20px",
                color: "#0f172a",
              }}
            >
              You Might Also Like
            </h3>
            <div className="product-grid" style={{ marginBottom: "20px" }}>
              {similarProducts.map((p) => (
                <div key={p.id} style={{ display: "flex", height: "100%" }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div id="reviews" className="reviews-section">
          <div className="reviews-header">
            <h3>Customer Reviews & Ratings</h3>
            <div className="overall-rating">
              <h2>{avgRating !== "No Reviews" ? avgRating : "0"}</h2>
              <p>Overall Rating</p>
            </div>
          </div>

          <div className="reviews-grid">
            <div className="write-review-card">
              <h4>{editingReviewId ? "Edit Your Review" : "Write a Review"}</h4>

              {!currentUser ? (
                <div className="login-to-review">
                  <p>You must be logged in to post a review.</p>
                </div>
              ) : !isVerifiedBuyer ? (
                <div className="not-verified-msg">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ marginBottom: "8px" }}
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p>
                    You can only review this product after purchasing and
                    receiving it.
                  </p>
                </div>
              ) : myReview && !editingReviewId ? (
                <div className="already-reviewed-box">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#166534"
                    strokeWidth="2"
                    style={{ marginBottom: "10px" }}
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <p>You have already reviewed this product.</p>
                  <div className="review-actions">
                    <button
                      onClick={() => handleEditClick(myReview)}
                      className="edit-rev-btn"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>{" "}
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(myReview.id)}
                      className="del-rev-btn"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>{" "}
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label>Select Rating</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="rating-select"
                    >
                      <option value="5">5 Stars (Excellent)</option>
                      <option value="4">4 Stars (Good)</option>
                      <option value="3">3 Stars (Average)</option>
                      <option value="2">2 Stars (Poor)</option>
                      <option value="1">1 Star (Terrible)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Your Comment</label>
                    <textarea
                      required
                      rows="4"
                      placeholder="What did you like or dislike?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>
                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "16px" }}
                  >
                    <button
                      type="submit"
                      className="primary-btn submit-review-btn"
                      disabled={submittingReview}
                      style={{ flex: 1 }}
                    >
                      {submittingReview
                        ? "Saving..."
                        : editingReviewId
                          ? "UPDATE REVIEW"
                          : "POST REVIEW"}
                    </button>
                    {editingReviewId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReviewId(null);
                          setComment("");
                        }}
                        className="cancel-edit-btn"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            <div className="display-reviews">
              {reviews.length === 0 ? (
                <p style={{ color: "#64748b" }}>
                  No reviews yet. Be the first!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="review-item">
                    <div className="review-user-info">
                      <div className="review-avatar">
                        {rev.userPhoto ? (
                          <img src={rev.userPhoto} alt="img" />
                        ) : (
                          rev.userName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <strong>
                          {rev.userName}{" "}
                          {rev.userId === currentUser?.uid && (
                            <span className="you-tag">(You)</span>
                          )}
                        </strong>
                        <span className="review-date">
                          {new Date(rev.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} filled={star <= rev.rating} />
                      ))}
                    </div>
                    <p className="review-text">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
