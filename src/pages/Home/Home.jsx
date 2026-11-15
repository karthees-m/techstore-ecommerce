import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import { db } from "../../services/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import "./Home.css";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeBrand, setActiveBrand] = useState("All");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [storeBrands, setStoreBrands] = useState([]);
  const [storeCategories, setStoreCategories] = useState([]);
  const [brandLogos, setBrandLogos] = useState([]);
  const [isMarqueeEnabled, setIsMarqueeEnabled] = useState(true);

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
  const [currentSlide, setCurrentSlide] = useState(0);

  const [storeInfo, setStoreInfo] = useState({
    address: "",
    phone: "",
    timing: "",
    mapEmbed: "",
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const defaultCategoryImages = {
    Laptops:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80",
    Computers:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80",
    RAM: "https://images.unsplash.com/photo-1592664474505-51c549ad15c5?auto=format&fit=crop&w=700&q=80",
    Storage:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=700&q=80",
    Motherboard:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80",
    CCTV: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=700&q=80",
    Bluetooth:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=700&q=80",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        setProducts(
          querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );

        const metaSnap = await getDoc(doc(db, "store_metadata", "config"));
        if (metaSnap.exists()) {
          const m = metaSnap.data();
          if (m.brands)
            setStoreBrands(
              m.brands.map((b, i) =>
                typeof b === "string"
                  ? { name: b, pos: i + 1, visible: true }
                  : b,
              ),
            );
          if (m.categories)
            setStoreCategories(
              m.categories.map((c, i) =>
                typeof c === "string"
                  ? { name: c, image: "", pos: i + 1, visible: true }
                  : { visible: true, pos: i + 1, ...c },
              ),
            );
          if (m.brandLogos) setBrandLogos(m.brandLogos);
          if (m.isMarqueeEnabled !== undefined)
            setIsMarqueeEnabled(m.isMarqueeEnabled);
          if (m.uiTheme) document.body.setAttribute("data-theme", m.uiTheme);
          if (m.storeInfo) setStoreInfo(m.storeInfo);
          if (m.heroSlides && m.heroSlides.length > 0)
            setHeroSlides(m.heroSlides);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery);
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const matchesBrand = activeBrand === "All" || p.brand === activeBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const visibleCategories = storeCategories
    .filter((c) => c.visible !== false)
    .sort((a, b) => (a.pos || 0) - (b.pos || 0));
  const visibleBrands = storeBrands
    .filter((b) => b.visible !== false)
    .sort((a, b) => (a.pos || 0) - (b.pos || 0));

  return (
    <div className="page-view active">
      {!searchQuery && (
        <section className="hero reveal-zoom">
          <div className="hero-slider">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                className={`hero-slide ${index === currentSlide ? "active" : ""}`}
                style={{ backgroundImage: `url('${slide.image}')` }}
                aria-label={slide.title}
              >
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                  <span className="hero-tag">{slide.subtitle}</span>
                  <h1>{slide.title}</h1>
                  <p>{slide.description}</p>
                  <button
                    aria-label="Explore Products Catalog"
                    className="primary-btn"
                    onClick={() => {
                      document
                        .getElementById("products")
                        .scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Explore Products
                  </button>
                </div>
              </div>
            ))}

            {heroSlides.length > 1 && (
              <div className="hero-dots" aria-label="Slider navigation">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Slide ${index + 1}`}
                    className={`hero-dot ${index === currentSlide ? "active" : ""}`}
                    onClick={() => setCurrentSlide(index)}
                  ></button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {!searchQuery && brandLogos.length > 0 && (
        <section className="brand-logos-section">
          <div className="container brand-track-wrapper">
            <div
              className={`brand-track ${isMarqueeEnabled ? "marquee-active" : "static"}`}
            >
              <div className="brand-track-inner">
                {brandLogos.map((logo, i) => (
                  <div key={i} className="brand-logo-item" title={logo.name}>
                    <img src={logo.url} alt={logo.name} loading="lazy" />
                  </div>
                ))}
                {isMarqueeEnabled &&
                  brandLogos.map((logo, i) => (
                    <div
                      key={`dup-${i}`}
                      className="brand-logo-item"
                      title={logo.name}
                    >
                      <img src={logo.url} alt={logo.name} loading="lazy" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {!searchQuery && visibleCategories.length > 0 && (
        <section id="categories" className="categories-section reveal">
          <div className="container">
            <div className="section-heading">
              <p>SHOP BY CATEGORY</p>
              <h2>Everything Your Setup Needs</h2>
            </div>
            <div className="category-grid">
              {visibleCategories.map((cat, index) => {
                const catImage =
                  cat.image ||
                  defaultCategoryImages[cat.name] ||
                  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80";
                return (
                  <button
                    key={index}
                    aria-label={`Filter by category ${cat.name}`}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      setActiveBrand("All");
                      document
                        .getElementById("products")
                        .scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`category-card ${activeCategory === cat.name ? "active-cat-card" : ""}`}
                  >
                    <div className="category-image">
                      <img src={catImage} alt={cat.name} loading="lazy" />
                    </div>
                    <div className="category-text">
                      <h3>{cat.name}</h3>
                      <p>Verified Stock</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section id="products" className="products-section reveal">
        <div className="container">
          <div className="products-top">
            <div>
              <p className="section-small">FEATURED CATALOG</p>
              <h2>
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : activeCategory === "All"
                    ? "All Products"
                    : activeCategory}
              </h2>
            </div>
            <button
              aria-label="View all products filter reset"
              className="clear-filter"
              onClick={() => {
                setActiveCategory("All");
                setActiveBrand("All");
                window.location.href = "/";
              }}
            >
              View All Products
            </button>
          </div>

          {!searchQuery && (
            <div className="brand-filters">
              <button
                aria-label="Filter all brands"
                onClick={() => setActiveBrand("All")}
                className={activeBrand === "All" ? "active" : ""}
              >
                All Brands
              </button>
              {visibleBrands.map((brandObj) => (
                <button
                  aria-label={`Filter by brand ${brandObj.name}`}
                  key={brandObj.name}
                  onClick={() => setActiveBrand(brandObj.name)}
                  className={activeBrand === brandObj.name ? "active" : ""}
                >
                  {brandObj.name}
                </button>
              ))}
            </div>
          )}

          <div className="product-grid">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((n) => (
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
              ))
            ) : filteredProducts.length === 0 ? (
              <h3
                style={{
                  padding: "40px",
                  gridColumn: "1 / -1",
                  textAlign: "center",
                }}
              >
                No products found matching your search.
              </h3>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{ display: "flex", height: "100%" }}
                >
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {!searchQuery && (
        <section className="store-info-section reveal">
          <div className="container">
            <div className="section-heading">
              <p>VISIT OUR STORE</p>
              <h2>Find Us on Google Maps</h2>
            </div>

            <div className="store-info-box">
              <div className="store-map-wrapper">
                <div
                  className="map-embed-container"
                  dangerouslySetInnerHTML={{
                    __html: storeInfo.mapEmbed
                      ? storeInfo.mapEmbed.replace(
                          "<iframe",
                          '<iframe title="Store Location Map"',
                        )
                      : "",
                  }}
                ></div>
              </div>

              <div className="store-details-wrapper">
                <div className="store-info-item">
                  <div className="store-icon-box">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <span className="store-label">Official Store Location</span>
                    <h4>{storeInfo.address}</h4>
                  </div>
                </div>

                <div className="store-info-item">
                  <div className="store-icon-box">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="store-label">Direct Help Line</span>
                    <h4>{storeInfo.phone}</h4>
                    <p>Instant support available</p>
                  </div>
                </div>

                <div className="store-info-item">
                  <div className="store-icon-box">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <span className="store-label">Store Timings</span>
                    <h4>{storeInfo.timing}</h4>
                    <p>Open All Week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
