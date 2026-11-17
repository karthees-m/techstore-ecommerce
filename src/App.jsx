import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import Cart from "./pages/Cart/Cart";
import Wishlist from "./pages/Wishlist/Wishlist";
import Checkout from "./pages/Checkout/Checkout";
import MyOrders from "./pages/MyOrders/MyOrders";
import Profile from "./pages/Profile/Profile";
import ProductDetail from "./pages/ProductDetail/ProductDetail"; 
import { CartProvider } from "./context/CartContext";

const ADMIN_EMAIL = "mkarthees7@gmail.com";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Loading Store...
      </div>
    );

  const isAdmin = currentUser && currentUser.email === ADMIN_EMAIL;

  return (
    <CartProvider>
      <div className="app-wrapper">
        <Navbar currentUser={currentUser} isAdmin={isAdmin} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route
              path="/checkout"
              element={
                currentUser ? (
                  <Checkout currentUser={currentUser} />
                ) : (
                  <Navigate to="/cart" />
                )
              }
            />
            <Route
              path="/my-orders"
              element={
                currentUser ? (
                  <MyOrders currentUser={currentUser} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/profile"
              element={
                currentUser ? (
                  <Profile currentUser={currentUser} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/product/:id"
              element={<ProductDetail currentUser={currentUser} />}
            />{" "}
            <Route
              path="/admin"
              element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;
