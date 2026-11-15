import React, { useState, useEffect, useRef } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("analytics");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brandLogos, setBrandLogos] = useState([]);
  const [isMarqueeEnabled, setIsMarqueeEnabled] = useState(true);
  const [uiTheme, setUiTheme] = useState("modern");

  const [heroSlides, setHeroSlides] = useState([
    {
      id: "1",
      title: "Build Your Ultimate Gaming Rig",
      subtitle: "TECHSTORE'S PREMIER IT STORE",
      description:
        "High-performance Laptops, Custom Desktop PCs, Components, and Expert IT Solutions right at your doorstep.",
      image:
        "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=80",
    },
  ]);
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
  });

  const [storeInfo, setStoreInfo] = useState({
    address: "",
    phone: "",
    timing: "",
    mapEmbed: "",
  });

  const [newLogo, setNewLogo] = useState({ name: "", url: "" });
  const [newCategory, setNewCategory] = useState({
    name: "",
    image: "",
    visible: true,
  });
  const [newBrand, setNewBrand] = useState({ name: "", visible: true });

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    originalPrice: "",
    image: "",
    description: "",
    stockQuantity: "",
  });

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pSnap = await getDocs(collection(db, "products"));
      setProducts(pSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const oSnap = await getDocs(collection(db, "orders"));
      setOrders(oSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const metaSnap = await getDoc(doc(db, "store_metadata", "config"));
      if (metaSnap.exists()) {
        const m = metaSnap.data();
        if (m.brands)
          setBrands(
            m.brands
              .map((b, i) =>
                typeof b === "string"
                  ? { name: b, pos: i + 1, visible: true }
                  : b,
              )
              .sort((a, b) => a.pos - b.pos),
          );
        if (m.categories)
          setCategories(
            m.categories
              .map((c, i) =>
                typeof c === "string"
                  ? { name: c, image: "", pos: i + 1, visible: true }
                  : { visible: true, pos: i + 1, ...c },
              )
              .sort((a, b) => a.pos - b.pos),
          );
        if (m.brandLogos)
          setBrandLogos(m.brandLogos.sort((a, b) => a.pos - b.pos));
        if (m.isMarqueeEnabled !== undefined)
          setIsMarqueeEnabled(m.isMarqueeEnabled);
        if (m.uiTheme) setUiTheme(m.uiTheme);
        if (m.storeInfo) setStoreInfo(m.storeInfo);
        if (m.heroSlides && m.heroSlides.length > 0)
          setHeroSlides(m.heroSlides);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAnalyticsData = () => {
    let totalRev = 0;
    let totalProductsSold = 0;
    const salesByProduct = {};
    const salesByDate = {};
    const statusCounts = {
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    orders.forEach((order) => {
      if (order.status !== "Cancelled") {
        totalRev += order.totalAmount;
        const dateOnly = order.date.split(",")[0];
        salesByDate[dateOnly] =
          (salesByDate[dateOnly] || 0) + order.totalAmount;
        order.items.forEach((item) => {
          totalProductsSold += item.quantity;
          salesByProduct[item.name] =
            (salesByProduct[item.name] || 0) + item.price * item.quantity;
        });
      }
      if (statusCounts[order.status] !== undefined)
        statusCounts[order.status] += 1;
    });
    const topProducts = Object.entries(salesByProduct)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    const revenueTimeline = Object.entries(salesByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const statusData = [
      { name: "Processing", value: statusCounts.Processing, color: "#eab308" },
      { name: "Shipped", value: statusCounts.Shipped, color: "#3b82f6" },
      { name: "Delivered", value: statusCounts.Delivered, color: "#22c55e" },
    ].filter((d) => d.value > 0);
    return {
      totalRev,
      totalProductsSold,
      topProducts,
      revenueTimeline,
      statusData,
    };
  };

  const {
    totalRev,
    totalProductsSold,
    topProducts,
    revenueTimeline,
    statusData,
  } = getAnalyticsData();

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      stockQuantity: Number(formData.stockQuantity),
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        alert("Product updated!");
      } else {
        await addDoc(collection(db, "products"), productData);
        alert("Product added!");
      }
      setFormData({
        name: "",
        brand: "",
        category: "",
        price: "",
        originalPrice: "",
        image: "",
        description: "",
        stockQuantity: "",
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      alert("Failed to save product.");
    }
  };
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      fetchData();
    }
  };
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      fetchData();
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const saveMeta = async (updatedFields) => {
    await setDoc(doc(db, "store_metadata", "config"), updatedFields, {
      merge: true,
    });
    fetchData();
  };

  const handleSaveStoreInfo = async (e) => {
    e.preventDefault();
    await saveMeta({ storeInfo });
    alert("✅ Store Location & Details Saved Successfully!");
  };

  const handleAddSlide = (e) => {
    e.preventDefault();
    if (!newSlide.title || !newSlide.image)
      return alert("Fill Slide Title and Image URL!");
    const updatedSlides = [
      ...heroSlides,
      { id: Date.now().toString(), ...newSlide },
    ];
    setHeroSlides(updatedSlides);
    saveMeta({ heroSlides: updatedSlides });
    setNewSlide({ title: "", subtitle: "", description: "", image: "" });
    alert("✅ Hero Slide Added!");
  };

  const handleDeleteSlide = (id) => {
    if (heroSlides.length <= 1)
      return alert("You must keep at least one hero slide.");
    if (window.confirm("Delete this slide?")) {
      const updatedSlides = heroSlides.filter((s) => s.id !== id);
      setHeroSlides(updatedSlides);
      saveMeta({ heroSlides: updatedSlides });
    }
  };

  const handleDragSort = (type) => {
    let list = [];
    if (type === "categories") list = [...categories];
    if (type === "brands") list = [...brands];
    if (type === "logos") list = [...brandLogos];
    const draggedItemContent = list.splice(dragItem.current, 1)[0];
    list.splice(dragOverItem.current, 0, draggedItemContent);
    const updatedList = list.map((item, i) => ({ ...item, pos: i + 1 }));
    if (type === "categories") setCategories(updatedList);
    if (type === "brands") setBrands(updatedList);
    if (type === "logos") setBrandLogos(updatedList);
    saveMeta({ [type === "logos" ? "brandLogos" : type]: updatedList });
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.image)
      return alert("Fill Category Name and Image URL!");
    const newList = [
      ...categories,
      { ...newCategory, pos: categories.length + 1 },
    ];
    setCategories(newList);
    saveMeta({ categories: newList });
    setNewCategory({ name: "", image: "", visible: true });
  };
  const handleUpdateCategory = (name, field, value) => {
    const updated = categories.map((c) =>
      c.name === name ? { ...c, [field]: value } : c,
    );
    setCategories(updated);
    saveMeta({ categories: updated });
  };
  const handleDeleteCategory = (name) => {
    if (window.confirm("Delete category?")) {
      const updated = categories.filter((c) => c.name !== name);
      setCategories(updated);
      saveMeta({ categories: updated });
    }
  };

  const handleAddBrand = () => {
    if (!newBrand.name) return alert("Enter brand name");
    const newList = [
      ...brands,
      {
        ...newBrand,
        name: newBrand.name.toUpperCase(),
        pos: brands.length + 1,
      },
    ];
    setBrands(newList);
    saveMeta({ brands: newList });
    setNewBrand({ name: "", visible: true });
  };
  const handleUpdateBrand = (name, field, value) => {
    const updated = brands.map((b) =>
      b.name === name ? { ...b, [field]: value } : b,
    );
    setBrands(updated);
    saveMeta({ brands: updated });
  };
  const handleDeleteBrand = (name) => {
    if (window.confirm("Delete brand?")) {
      const updated = brands.filter((b) => b.name !== name);
      setBrands(updated);
      saveMeta({ brands: updated });
    }
  };

  const handleAddLogo = () => {
    if (!newLogo.name || !newLogo.url) return alert("Fill Logo Name and URL!");
    const newList = [...brandLogos, { ...newLogo, pos: brandLogos.length + 1 }];
    setBrandLogos(newList);
    saveMeta({ brandLogos: newList });
    setNewLogo({ name: "", url: "" });
  };
  const handleDeleteLogo = (name) => {
    if (window.confirm("Delete logo?")) {
      const updated = brandLogos.filter((l) => l.name !== name);
      setBrandLogos(updated);
      saveMeta({ brandLogos: updated });
    }
  };

  return (
    <div className="admin-page page-view active">
      <div className="container" style={{ padding: "40px 0" }}>
        <div className="admin-header">
          <h2>Store Management Dashboard</h2>
        </div>

        <div className="admin-stats-grid">
          <div className="stat-card">
            <h4>Total Revenue</h4>
            <div className="stat-value" style={{ color: "#16a34a" }}>
              ₹{totalRev.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="stat-card">
            <h4>Items Sold</h4>
            <div className="stat-value" style={{ color: "#2563eb" }}>
              {totalProductsSold}
            </div>
          </div>
          <div className="stat-card">
            <h4>Active Orders</h4>
            <div className="stat-value">
              {
                orders.filter(
                  (o) => o.status !== "Delivered" && o.status !== "Cancelled",
                ).length
              }
            </div>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Sales Analytics
          </button>
          <button
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Manage Products
          </button>
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Live Orders
          </button>
          <button
            className={`tab-btn ${activeTab === "meta" ? "active" : ""}`}
            onClick={() => setActiveTab("meta")}
          >
            Settings
          </button>
        </div>

        {activeTab === "analytics" && (
          <div className="admin-tab-content analytics-tab">
            <div className="admin-card full-width-chart">
              <h3>Revenue Timeline (Sales Trend)</h3>
              {revenueTimeline.length === 0 ? (
                <p style={{ color: "#64748b" }}>No sales data yet.</p>
              ) : (
                <div style={{ width: "100%", height: 350, marginTop: "20px" }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={revenueTimeline}
                      margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(val) => `₹${val / 1000}k`}
                      />
                      <Tooltip
                        formatter={(value) =>
                          `₹${value.toLocaleString("en-IN")}`
                        }
                        labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563eb"
                        strokeWidth={4}
                        dot={{
                          r: 6,
                          fill: "#2563eb",
                          strokeWidth: 2,
                          stroke: "white",
                        }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="analytics-grid-2">
              <div className="admin-card">
                <h3>Top Selling Products</h3>
                {topProducts.length === 0 ? (
                  <p style={{ color: "#64748b" }}>No sales data yet.</p>
                ) : (
                  <div
                    style={{ width: "100%", height: 300, marginTop: "20px" }}
                  >
                    <ResponsiveContainer>
                      <BarChart
                        data={topProducts}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={true}
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="#475569"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          formatter={(value) =>
                            `₹${value.toLocaleString("en-IN")}`
                          }
                          cursor={{ fill: "#f1f5f9" }}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#3b82f6"
                          radius={[0, 4, 4, 0]}
                          barSize={25}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <div className="admin-card">
                <h3>Order Fulfillment Status</h3>
                {statusData.length === 0 ? (
                  <p style={{ color: "#64748b" }}>No orders placed yet.</p>
                ) : (
                  <div
                    style={{ width: "100%", height: 300, marginTop: "20px" }}
                  >
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} Orders`} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="admin-tab-content">
            <div className="admin-card form-card">
              <h3>{editingId ? "Update Product" : "Add New Product"}</h3>
              <form onSubmit={handleProductSubmit}>
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Brand</label>
                    <select
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands
                        .filter((b) => b.visible)
                        .map((b) => (
                          <option key={b.name} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Category</option>
                      {categories
                        .filter((c) => c.visible)
                        .map((c, i) => (
                          <option key={i} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Selling Price (₹)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Original MRP (₹)</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity (Units)</label>
                    <input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stockQuantity: e.target.value,
                        })
                      }
                      required
                      placeholder="e.g. 50"
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label>Image URL</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label>Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="primary-btn">
                    {editingId ? "Save Changes" : "Upload to Store"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          name: "",
                          brand: "",
                          category: "",
                          price: "",
                          originalPrice: "",
                          image: "",
                          description: "",
                          stockQuantity: "",
                        });
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-card">
              <h3>Existing Products Inventory</h3>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Brand/Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img
                            src={p.image}
                            alt="img"
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "contain",
                            }}
                          />
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>
                          {p.brand} / {p.category}
                        </td>
                        <td>₹{p.price.toLocaleString("en-IN")}</td>
                        <td>
                          {p.stockQuantity > 0 ? (
                            <span
                              style={{ color: "#16a34a", fontWeight: "bold" }}
                            >
                              {p.stockQuantity} In Stock
                            </span>
                          ) : (
                            <span
                              style={{ color: "#dc2626", fontWeight: "bold" }}
                            >
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => {
                              setEditingId(p.id);
                              setFormData(p);
                              window.scrollTo(0, 0);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteProduct(p.id)}
                          >
                            Del
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="admin-card">
            <h3>Live Customer Orders</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Customer Info</th>
                    <th>Items Ordered</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                    [...orders]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontSize: "11px", color: "#64748b" }}>
                            {order.date}
                          </td>
                          <td>
                            <strong>{order.customerName}</strong>
                            <br />
                            <span style={{ fontSize: "12px" }}>
                              {order.customerPhone}
                            </span>
                          </td>
                          <td>
                            <ul
                              style={{
                                margin: 0,
                                paddingLeft: "15px",
                                fontSize: "12px",
                                color: "#475569",
                              }}
                            >
                              {order.items.map((it, i) => (
                                <li key={i}>
                                  {it.name} (x{it.quantity})
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td style={{ fontWeight: "800", color: "#0f172a" }}>
                            ₹{order.totalAmount.toLocaleString("en-IN")}
                          </td>
                          <td>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                background:
                                  order.status === "Processing"
                                    ? "#fef08a"
                                    : order.status === "Shipped"
                                      ? "#bfdbfe"
                                      : order.status === "Cancelled"
                                        ? "#fee2e2"
                                        : "#bbf7d0",
                                color:
                                  order.status === "Processing"
                                    ? "#854d0e"
                                    : order.status === "Shipped"
                                      ? "#1e3a8a"
                                      : order.status === "Cancelled"
                                        ? "#dc2626"
                                        : "#166534",
                              }}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <select
                              aria-label="Update order status"
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  e.target.value,
                                )
                              }
                              style={{
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#334155",
                                cursor: "pointer",
                                background: "#f8fafc",
                              }}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "meta" && (
          <div className="admin-tab-content">
            <div className="admin-card">
              <h3>Store Theme Settings</h3>
              <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
                <label
                  className="toggle-label"
                  style={{ width: "auto", justifyContent: "flex-start" }}
                >
                  <input
                    type="radio"
                    name="theme"
                    checked={uiTheme === "modern"}
                    onChange={() => saveMeta({ uiTheme: "modern" })}
                  />{" "}
                  Modern List View
                </label>
                <label
                  className="toggle-label"
                  style={{ width: "auto", justifyContent: "flex-start" }}
                >
                  <input
                    type="radio"
                    name="theme"
                    checked={uiTheme === "classic"}
                    onChange={() => saveMeta({ uiTheme: "classic" })}
                  />{" "}
                  Classic Grid View
                </label>
              </div>
            </div>

            <div className="admin-card">
              <h3>Home Page Hero Banner Slider Manager</h3>
              <form
                onSubmit={handleAddSlide}
                className="admin-form-grid"
                style={{ marginBottom: "24px" }}
              >
                <div className="form-group">
                  <label>Subtitle Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. TECHSTORE'S PREMIER IT STORE"
                    value={newSlide.subtitle}
                    onChange={(e) =>
                      setNewSlide({ ...newSlide, subtitle: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Main Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Build Your Ultimate Gaming Rig"
                    value={newSlide.title}
                    onChange={(e) =>
                      setNewSlide({ ...newSlide, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="Short description..."
                    value={newSlide.description}
                    onChange={(e) =>
                      setNewSlide({ ...newSlide, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label>Background Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newSlide.image}
                    onChange={(e) =>
                      setNewSlide({ ...newSlide, image: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <button type="submit" className="primary-btn meta-btn">
                    + Add Hero Slide
                  </button>
                </div>
              </form>

              <div className="meta-list-card">
                <div className="meta-row-header">
                  <span style={{ flex: 1 }}>Slide Title & Subtitle</span>
                  <span style={{ width: "100px" }}>Action</span>
                </div>
                {heroSlides.map((slide) => (
                  <div className="meta-item-row" key={slide.id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flex: 1,
                      }}
                    >
                      <img
                        src={slide.image}
                        alt="slide"
                        style={{
                          width: "50px",
                          height: "30px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                        loading="lazy"
                      />
                      <div>
                        <strong style={{ fontSize: "13px" }}>
                          {slide.title}
                        </strong>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          {slide.subtitle}
                        </div>
                      </div>
                    </div>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteSlide(slide.id)}
                    >
                      Del
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <h3>Store Location & Mini Map Embed</h3>
              <form onSubmit={handleSaveStoreInfo} className="admin-form-grid">
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label>Store Address</label>
                  <input
                    type="text"
                    value={storeInfo.address}
                    onChange={(e) =>
                      setStoreInfo({ ...storeInfo, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Help Line Phone</label>
                  <input
                    type="text"
                    value={storeInfo.phone}
                    onChange={(e) =>
                      setStoreInfo({ ...storeInfo, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Opening Hours (Timings)</label>
                  <input
                    type="text"
                    value={storeInfo.timing}
                    onChange={(e) =>
                      setStoreInfo({ ...storeInfo, timing: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label>Google Maps Embed HTML (&lt;iframe&gt; code)</label>
                  <textarea
                    rows="3"
                    value={storeInfo.mapEmbed}
                    onChange={(e) =>
                      setStoreInfo({ ...storeInfo, mapEmbed: e.target.value })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                  ></textarea>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <button type="submit" className="primary-btn meta-btn">
                    Save Store Info
                  </button>
                </div>
              </form>
            </div>

            <div className="metadata-grid">
              <div className="admin-card">
                <h3>
                  Store Categories{" "}
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: "normal",
                    }}
                  >
                    (Drag to reorder)
                  </span>
                </h3>
                <div className="meta-add-box">
                  <input
                    type="text"
                    placeholder="Category Name"
                    className="meta-input"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    className="meta-input"
                    value={newCategory.image}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, image: e.target.value })
                    }
                  />
                  <button
                    onClick={handleAddCategory}
                    className="primary-btn meta-btn"
                  >
                    + Add
                  </button>
                </div>
                <div className="meta-list-card">
                  <div className="meta-row-header">
                    <span style={{ width: "30px" }}>Pos</span>
                    <span style={{ flex: 1 }}>Category</span>
                    <span style={{ width: "60px", textAlign: "center" }}>
                      Vis
                    </span>
                    <span style={{ width: "50px" }}>Act</span>
                  </div>
                  {categories.map((c, idx) => (
                    <div
                      className="meta-item-row draggable"
                      key={c.name}
                      draggable
                      onDragStart={(e) => (dragItem.current = idx)}
                      onDragEnter={(e) => (dragOverItem.current = idx)}
                      onDragEnd={() => handleDragSort("categories")}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="drag-handle" title="Drag to reorder">
                        ☰
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flex: 1,
                          overflow: "hidden",
                        }}
                      >
                        {c.image && (
                          <img
                            src={c.image}
                            alt={c.name}
                            style={{
                              width: "28px",
                              height: "28px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                            loading="lazy"
                          />
                        )}
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                          }}
                        >
                          {c.name}
                        </span>
                      </div>
                      <label
                        className="toggle-label"
                        style={{ width: "auto", margin: "0 10px" }}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Toggle visibility for ${c.name}`}
                          checked={c.visible !== false}
                          onChange={(e) =>
                            handleUpdateCategory(
                              c.name,
                              "visible",
                              e.target.checked,
                            )
                          }
                        />
                      </label>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteCategory(c.name)}
                      >
                        Del
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card">
                <h3>
                  Featured Brands{" "}
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: "normal",
                    }}
                  >
                    (Drag to reorder)
                  </span>
                </h3>
                <div className="meta-add-box">
                  <input
                    type="text"
                    placeholder="Brand Name"
                    className="meta-input"
                    value={newBrand.name}
                    onChange={(e) =>
                      setNewBrand({ ...newBrand, name: e.target.value })
                    }
                  />
                  <button
                    onClick={handleAddBrand}
                    className="primary-btn meta-btn"
                  >
                    + Add
                  </button>
                </div>
                <div className="meta-list-card">
                  <div className="meta-row-header">
                    <span style={{ width: "30px" }}>Pos</span>
                    <span style={{ flex: 1 }}>Brand</span>
                    <span style={{ width: "60px", textAlign: "center" }}>
                      Vis
                    </span>
                    <span style={{ width: "50px" }}>Act</span>
                  </div>
                  {brands.map((b, idx) => (
                    <div
                      className="meta-item-row draggable"
                      key={b.name}
                      draggable
                      onDragStart={(e) => (dragItem.current = idx)}
                      onDragEnter={(e) => (dragOverItem.current = idx)}
                      onDragEnd={() => handleDragSort("brands")}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="drag-handle" title="Drag to reorder">
                        ☰
                      </div>
                      <span
                        style={{ flex: 1, fontWeight: "700", fontSize: "13px" }}
                      >
                        {b.name}
                      </span>
                      <label
                        className="toggle-label"
                        style={{ width: "auto", margin: "0 10px" }}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Toggle visibility for brand ${b.name}`}
                          checked={b.visible !== false}
                          onChange={(e) =>
                            handleUpdateBrand(
                              b.name,
                              "visible",
                              e.target.checked,
                            )
                          }
                        />
                      </label>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteBrand(b.name)}
                      >
                        Del
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-card" style={{ marginTop: "30px" }}>
              <h3>
                Store Frontend Brand Logos{" "}
                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "normal",
                  }}
                >
                  (Drag to reorder)
                </span>
              </h3>
              <div className="meta-add-box">
                <input
                  type="text"
                  placeholder="Brand Name"
                  className="meta-input"
                  value={newLogo.name}
                  onChange={(e) =>
                    setNewLogo({ ...newLogo, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Logo Image URL"
                  className="meta-input"
                  value={newLogo.url}
                  onChange={(e) =>
                    setNewLogo({ ...newLogo, url: e.target.value })
                  }
                />
                <button
                  className="primary-btn meta-btn"
                  onClick={handleAddLogo}
                >
                  + Add Logo
                </button>
              </div>
              <div className="meta-list-card">
                <div className="meta-row-header">
                  <span style={{ width: "30px" }}>Pos</span>
                  <span style={{ flex: 1 }}>Brand Logo Details</span>
                  <span style={{ width: "70px" }}>Action</span>
                </div>
                {brandLogos.map((l, idx) => (
                  <div
                    className="meta-item-row draggable"
                    key={l.name}
                    draggable
                    onDragStart={(e) => (dragItem.current = idx)}
                    onDragEnter={(e) => (dragOverItem.current = idx)}
                    onDragEnd={() => handleDragSort("logos")}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="drag-handle" title="Drag to reorder">
                      ☰
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        flex: 1,
                      }}
                    >
                      <img
                        src={l.url}
                        alt={l.name}
                        style={{
                          height: "32px",
                          width: "80px",
                          objectFit: "contain",
                          background: "#f8fafc",
                          padding: "4px",
                          borderRadius: "4px",
                          border: "1px solid #e2e8f0",
                        }}
                        loading="lazy"
                      />
                      <span style={{ fontWeight: "700", fontSize: "13px" }}>
                        {l.name}
                      </span>
                    </div>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteLogo(l.name)}
                    >
                      Del
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDashboard;
