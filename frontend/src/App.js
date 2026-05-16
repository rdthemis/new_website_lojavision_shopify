import React, { useEffect, useRef, useState, useCallback } from "react";
import "@/App.css";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/contexts/CartContext";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import TrustBar from "@/components/TrustBar";
import CategoryMenu from "@/components/CategoryMenu";
import BestSellers from "@/components/BestSellers";
import ProductGrid from "@/components/ProductGrid";
import Reviews from "@/components/Reviews";
import Newsletter from "@/components/Newsletter";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { fetchCollections, fetchProducts } from "@/lib/api";

const Storefront = () => {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState(null);

  const categoriesRef = useRef(null);
  const productsRef = useRef(null);
  const topRef = useRef(null);

  // Load collections once
  useEffect(() => {
    let alive = true;
    fetchCollections()
      .then((data) => {
        if (!alive) return;
        setCollections(data.collections || []);
        setDataSource(data.data_source);
      })
      .catch((err) => {
        console.error("Failed to load collections", err);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Load products whenever category changes
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchProducts(activeCategory)
      .then((data) => {
        if (!alive) return;
        setProducts(data.products || []);
        if (data.data_source) setDataSource(data.data_source);
      })
      .catch((err) => {
        console.error("Failed to load products", err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [activeCategory]);

  const scrollTo = useCallback((ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const onCategorySelect = useCallback(
    (handle) => {
      setActiveCategory(handle);
      // Smooth scroll to products section after a tiny delay
      setTimeout(() => scrollTo(productsRef), 80);
    },
    [scrollTo]
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }} ref={topRef}>
      <Header
        onJumpCategories={() => scrollTo(categoriesRef)}
        onJumpProducts={() => scrollTo(productsRef)}
        onJumpTop={() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      />

      <main>
        <HeroCarousel
          onCta={() => scrollTo(productsRef)}
          onSecondary={() => scrollTo(categoriesRef)}
        />

        <TrustBar />

        <div ref={categoriesRef}>
          <CategoryMenu
            collections={collections}
            activeHandle={activeCategory}
            onSelect={onCategorySelect}
          />
        </div>

        <BestSellers onSeeAll={() => scrollTo(productsRef)} />

        <div ref={productsRef}>
          <ProductGrid
            products={products}
            collections={collections}
            activeCategory={activeCategory}
            onCategoryChange={onCategorySelect}
            loading={loading}
          />
        </div>

        <Reviews />

        <Newsletter />
      </main>

      <Footer
        dataSource={dataSource}
        collections={collections}
        onCategorySelect={onCategorySelect}
      />
      <CartDrawer />
      <Toaster position="top-center" richColors />
    </div>
  );
};

function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <Storefront />
      </CartProvider>
    </I18nProvider>
  );
}

export default App;
