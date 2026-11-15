import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";

const Navbar = ({ currentUser, isAdmin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { cartCount, wishlistCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim()) {
      navigate(`/?search=${encodeURIComponent(term)}`);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const checkNewUser = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: currentUser.email,
            name: currentUser.displayName || "",
            photoURL: currentUser.photoURL || "",
            createdAt: new Date().toISOString(),
          });
          alert(
            "Welcome to TechStore! Please complete your Delivery & Account details.",
          );
          navigate("/profile");
        }
      }
    };
    checkNewUser();
  }, [currentUser, navigate]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      signOut(auth);
      navigate("/");
    }
  };

  const getAvatarLetter = () => {
    if (currentUser?.displayName)
      return currentUser.displayName.charAt(0).toUpperCase();
    if (currentUser?.email) return currentUser.email.charAt(0).toUpperCase();
    return "U";
  };

  const scrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="marquee-bar">
        <div className="container">
          <marquee behavior="scroll" direction="left" scrollamount="5">
            Welcome to TechStore E-Commerce! &nbsp;&nbsp;&nbsp; |
            &nbsp;&nbsp;&nbsp; Best deals on Laptops, Custom Gaming Rigs, RAM,
            and SSDs! &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; Call Us:
            1800-123-4567 for instant support!
          </marquee>
        </div>
      </div>

      <header className="header">
        <div className="container header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              className="hamburger-btn"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <Link to="/" className="logo">
              <span className="logo-main">TECHSTORE</span>
              <span className="logo-sub">E-COMMERCE</span>
            </Link>
          </div>

          <nav className="main-nav">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <a
              onClick={() => scrollToSection("products")}
              className="nav-link"
              style={{ cursor: "pointer" }}
            >
              Products
            </a>
            <a
              onClick={() => scrollToSection("categories")}
              className="nav-link"
              style={{ cursor: "pointer" }}
            >
              Categories
            </a>
          </nav>

          <div className="header-actions">
            <div className="search-box desktop-only">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="search-icon-btn">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>

            <Link
              to="/wishlist"
              className="nav-icon-btn cart-icon-wrapper"
              title="Wishlist"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlistCount > 0 && (
                <span className="cart-badge wishlist-badge">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="nav-icon-btn cart-icon-wrapper"
              title="Cart"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <div className="profile-section">
              {currentUser ? (
                <div className="user-capsule">
                  <Link
                    to="/my-orders"
                    className="admin-link-btn"
                    style={{
                      background: "#f8fafc",
                      color: "#0f172a",
                      border: "1px solid #e2e8f0",
                      boxShadow: "none",
                    }}
                    title="My Orders"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    <span>Orders</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="admin-link-btn"
                    style={{
                      background: "#f8fafc",
                      color: "#0f172a",
                      border: "1px solid #e2e8f0",
                      boxShadow: "none",
                    }}
                    title="My Profile"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Profile</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="admin-link-btn"
                      title="Admin Dashboard"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className="user-profile-box">
                    {!imgError && currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="profile-pic"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="profile-pic avatar-fallback">
                        {getAvatarLetter()}
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="logout-icon-btn"
                      title="Logout"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => signInWithPopup(auth, provider)}
                  className="login-btn-premium"
                >
                  <span>Login / Sign Up</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <div
        className={`mobile-menu-sidebar ${isMobileMenuOpen ? "active" : ""}`}
      >
        <div className="mobile-menu-header">
          <div className="logo">
            <span className="logo-main">TECHSTORE</span>
          </div>
          <button
            className="close-menu-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="mobile-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="mobile-menu-links">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
          <a
            onClick={() => scrollToSection("products")}
            className="mobile-nav-link"
          >
            Products
          </a>
          <a
            onClick={() => scrollToSection("categories")}
            className="mobile-nav-link"
          >
            Categories
          </a>

          <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>
            Wishlist ({wishlistCount})
          </Link>
          <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
            My Cart ({cartCount})
          </Link>
          {currentUser && (
            <>
              <Link
                to="/my-orders"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                My Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: "14px 24px",
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#dc2626",
                  cursor: "pointer",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
