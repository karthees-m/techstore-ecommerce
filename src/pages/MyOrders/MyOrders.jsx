import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import "./MyOrders.css";

const MyOrders = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // 🔥 FETCH DYNAMIC STORE INFO FOR INVOICE
  const [storeInfo, setStoreInfo] = useState({
    address: "Annai Complex, Kuthukalvalasai, TN 627803",
    phone: "091503 03600",
    email: "support@techstore.com",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User Orders
        const q = query(
          collection(db, "orders"),
          where("customerEmail", "==", currentUser.email),
        );
        const snap = await getDocs(q);
        const myOrders = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        myOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(myOrders);

        // Fetch Admin Configured Store Info
        const metaSnap = await getDoc(doc(db, "store_metadata", "config"));
        if (metaSnap.exists() && metaSnap.data().storeInfo) {
          setStoreInfo(metaSnap.data().storeInfo);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await updateDoc(doc(db, "orders", orderId), { status: "Cancelled" });
        setOrders(
          orders.map((o) =>
            o.id === orderId ? { ...o, status: "Cancelled" } : o,
          ),
        );
        alert("Order cancelled successfully.");
      } catch (error) {
        console.error("Cancel Error:", error);
        alert("Failed to cancel order.");
      }
    }
  };

  // 🔥 DYNAMICALLY GENERATE INVOICE WITH ADMIN STORE INFO
  const handleDownloadInvoice = (order) => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.id.slice(0, 8).toUpperCase()}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; margin: 0; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); border-radius: 8px; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .header-table td { vertical-align: top; }
          .logo-text { font-size: 26px; font-weight: 900; color: #2563eb; margin: 0; letter-spacing: 1px; }
          .company-details { font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 6px; }
          .invoice-title { text-align: right; }
          .invoice-title h2 { font-size: 22px; color: #0f172a; margin: 0 0 5px 0; text-transform: uppercase; }
          .invoice-title p { font-size: 13px; color: #64748b; margin: 3px 0; }
          
          .billing-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; background: #f8fafc; border-radius: 6px; overflow: hidden; }
          .billing-table td { padding: 15px; font-size: 13px; color: #334155; }
          .billing-table h4 { margin: 0 0 6px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; }

          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th { background: #2563eb; color: white; padding: 12px; font-size: 12px; text-transform: uppercase; text-align: left; }
          .items-table th:last-child { text-align: right; }
          .items-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
          .items-table td:last-child { text-align: right; font-weight: 600; }

          .total-section { width: 100%; display: flex; justify-content: flex-end; }
          .total-box { width: 300px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .total-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #475569; }
          .total-row.grand { font-size: 18px; font-weight: 800; color: #0f172a; border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 10px; }

          .footer-note { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <table class="header-table">
            <tr>
              <td>
                <h1 class="logo-text">TECHSTORE</h1>
                <div class="company-details">
                  ${storeInfo.address}<br/>
                  Phone: ${storeInfo.phone} | Email: ${storeInfo.email || "support@techstore.com"}
                </div>
              </td>
              <td class="invoice-title">
                <h2>Tax Invoice</h2>
                <p><strong>Order ID:</strong> #${order.id.slice(0, 8).toUpperCase()}</p>
                <p><strong>Date:</strong> ${order.date}</p>
                <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">${order.status}</span></p>
              </td>
            </tr>
          </table>

          <table class="billing-table">
            <tr>
              <td width="50%">
                <h4>Billed To:</h4>
                <strong>${order.customerName}</strong><br/>
                ${order.shippingAddress}<br/>
                <strong>Phone:</strong> ${order.customerPhone}
              </td>
              <td width="50%">
                <h4>Payment Info:</h4>
                <strong>Method:</strong> Prepaid / Online / COD<br/>
                <strong>Currency:</strong> INR (₹)
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th>Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td>₹${Number(item.price).toLocaleString("en-IN")}</td>
                  <td>₹${(Number(item.price) * item.quantity).toLocaleString("en-IN")}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div style="display: flex; justify-content: flex-end;">
            <div class="total-box">
              <div class="total-row"><span>Subtotal:</span> <span>₹${order.totalAmount.toLocaleString("en-IN")}</span></div>
              <div class="total-row"><span>Shipping:</span> <span style="color: #16a34a; font-weight: bold;">FREE</span></div>
              <div class="total-row grand"><span>Grand Total:</span> <span>₹${order.totalAmount.toLocaleString("en-IN")}</span></div>
            </div>
          </div>

          <div class="footer-note">
            <p>This is a computer-generated invoice and does not require a physical signature.</p>
            <p>Thank you for shopping with TechStore!</p>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="my-orders-page container page-view active">
        <h2>My Order History</h2>
        <div className="orders-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card" style={{ height: "140px" }}>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line long"></div>
              <div className="skeleton-line medium"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page container page-view active">
      <h2>My Order History</h2>

      {orders.length === 0 ? (
        <div
          className="empty-wishlist"
          style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076495.png"
            alt="No Orders"
            style={{
              width: "100px",
              height: "100px",
              marginBottom: "20px",
              opacity: 0.8,
            }}
          />
          <h2>No Orders Placed Yet!</h2>
          <p style={{ color: "#64748b", marginBottom: "20px" }}>
            When you place orders, they will appear here to track and manage.
          </p>
          <Link
            to="/"
            className="primary-btn"
            style={{ display: "inline-block", textDecoration: "none" }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-history-card">
              <div className="order-history-header">
                <div>
                  <span className="order-id">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="order-date"> • {order.date}</span>
                </div>
                <div className="order-total">
                  Total: ₹{order.totalAmount.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="order-items-preview">
                {order.items.map((item, i) => (
                  <div key={i} className="preview-item-row">
                    <Link
                      to={`/product/${item.id}`}
                      className="preview-img-box"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          opacity: order.status === "Cancelled" ? 0.5 : 1,
                        }}
                      />
                    </Link>
                    <div className="preview-item-details">
                      <Link to={`/product/${item.id}`} className="product-link">
                        <h4
                          style={{
                            textDecoration:
                              order.status === "Cancelled"
                                ? "line-through"
                                : "none",
                            color:
                              order.status === "Cancelled"
                                ? "#94a3b8"
                                : "#0f172a",
                          }}
                        >
                          {item.name}
                        </h4>
                      </Link>
                      <p>
                        Qty: {item.quantity}{" "}
                        <span>
                          | ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </p>

                      {order.status === "Delivered" && item.id && (
                        <Link
                          to={`/product/${item.id}#reviews`}
                          className="rate-item-btn"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                          Rate & Review Product
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-history-footer">
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
                <button
                  className="track-toggle-btn"
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id,
                    )
                  }
                >
                  Track Order & Details
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      transform:
                        expandedOrder === order.id
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      transition: "0.3s",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              {expandedOrder === order.id && (
                <div className="order-tracking-details">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    {order.status === "Processing" && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="cancel-order-btn"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Cancel Order
                      </button>
                    )}

                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="download-invoice-btn"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download Invoice
                    </button>
                  </div>

                  {order.status === "Cancelled" ? (
                    <div className="cancelled-alert">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                      This order has been cancelled and will not be delivered.
                    </div>
                  ) : (
                    <div className="tracking-timeline">
                      <div
                        className={`track-step ${order.status === "Processing" || order.status === "Shipped" || order.status === "Delivered" ? "active" : ""}`}
                      >
                        <div className="track-icon">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                        </div>
                        <p>Processing</p>
                      </div>
                      <div
                        className={`track-line ${order.status === "Shipped" || order.status === "Delivered" ? "active" : ""}`}
                      ></div>

                      <div
                        className={`track-step ${order.status === "Shipped" || order.status === "Delivered" ? "active" : ""}`}
                      >
                        <div className="track-icon">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                          </svg>
                        </div>
                        <p>Shipped</p>
                      </div>
                      <div
                        className={`track-line ${order.status === "Delivered" ? "active" : ""}`}
                      ></div>

                      <div
                        className={`track-step ${order.status === "Delivered" ? "active" : ""}`}
                      >
                        <div className="track-icon">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                        </div>
                        <p>Delivered</p>
                      </div>
                    </div>
                  )}

                  <div className="delivery-address-box">
                    <h4>Delivering To:</h4>
                    <p>
                      <strong>{order.customerName}</strong>
                    </p>
                    <p>{order.shippingAddress}</p>
                    <p>Phone: {order.customerPhone}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
