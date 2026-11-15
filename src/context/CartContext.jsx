import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // 🔥 INITIALIZE STATE FROM LOCAL STORAGE
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("techstore_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlistItems, setWishlistItems] = useState(() => {
    const savedWishlist = localStorage.getItem("techstore_wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // 🔥 SAVE TO LOCAL STORAGE WHENEVER CART CHANGES
  useEffect(() => {
    localStorage.setItem("techstore_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // 🔥 SAVE TO LOCAL STORAGE WHENEVER WISHLIST CHANGES
  useEffect(() => {
    localStorage.setItem("techstore_wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // --- CART FUNCTIONS ---
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // --- WISHLIST FUNCTIONS ---
  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id); // Remove if exists
      }
      return [...prev, product]; // Add if doesn't exist
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
