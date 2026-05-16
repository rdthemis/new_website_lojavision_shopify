import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Plus, Check } from "lucide-react";
import { EASE, fadeUp, stagger } from "@/lib/animations";
import { useI18n } from "@/lib/i18n";
import { useCart, formatPrice } from "@/contexts/CartContext";
import { fetchProducts } from "@/lib/api";
import { useProductModal } from "@/contexts/ProductModalContext";

const BEST_SELLER_HANDLES = ["mejores-ventas", "best-sellers", "mais-vendidos"];

const BestSellerCard = ({ product, index = 0 }) => {
  const { add, items } = useCart();
  const { t, lang } = useI18n();
  const { open: openModal } = useProductModal();
  const [justAdded, setJustAdded] = useState(false);

  const variant = product.variants?.[0];
  const inCart = items.some((i) => i.merchandiseId === variant?.id);
  const price = parseFloat(variant?.price?.amount || product.priceMin?.amount || "0");
  const currency = variant?.price?.currencyCode || product.priceMin?.currencyCode || "BRL";

  const onAdd = (e) => {
    e.stopPropagation();
    add(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <motion.article
      data-testid={`bestseller-card-${product.handle}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.0, ease: EASE, delay: (index % 6) * 0.1 }}
      className="snap-start shrink-0 w-[78%] sm:w-[44%] md:w-[31%] lg:w-[23%]"
    >
      <div className="bg-white rounded-3xl p-4 hover:shadow-[0_20px_60px_rgba(0,0,0,0.07)] transition-shadow">
        <div
          role="button"
          tabIndex={0}
          data-testid={`bestseller-image-${product.handle}`}
          onClick={() => openModal(product)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openModal(product);
            }
          }}
          aria-label={product.title}
          className="cursor-pointer focus:outline-none"
        >
          <div className="relative overflow-hidden rounded-2xl bg-neutral-100" style={{ aspectRatio: "4/5" }}>
          <motion.img
            src={product.featuredImage?.url || product.images?.[0]?.url}
            alt={product.featuredImage?.altText || product.title}
            draggable={false}
            className="w-full h-full object-cover"
            initial={{ scale: 1.04 }}
            whileInView={{ scale: 1.0 }}
            whileHover={{ scale: 1.05 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: EASE }}
          />
          {/* Best Seller badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-sm"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,206,84,0.95) 0%, rgba(255,162,32,0.95) 100%)",
              boxShadow: "0 6px 18px rgba(255,162,32,0.35)",
            }}
          >
            <Star className="w-3 h-3 text-white fill-white" />
            <span className="text-[10px] tracking-[0.15em] uppercase font-bold text-white">
              {t.bestSellers.badge}
            </span>
          </div>

          {/* Add-to-cart pill */}
          <button
            data-testid={`bestseller-add-${product.handle}`}
            onClick={onAdd}
            aria-label="Add to cart"
            className={`absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
              justAdded || inCart ? "bg-neutral-900 text-white" : "text-white"
            }`}
            style={!(justAdded || inCart) ? { backgroundColor: "#FF574D" } : {}}
          >
            {justAdded || inCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                {t.product.added}
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                {t.product.add}
              </>
            )}
          </button>
        </div>
        </div>

        <div className="px-1 pt-4 pb-2">
          <h3 className="font-display text-base md:text-lg text-neutral-900 leading-snug line-clamp-2 min-h-[3em]">
            {product.title}
          </h3>
          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-xs text-neutral-500 truncate">{product.vendor || ""}</p>
            <div className="shrink-0 text-base md:text-lg font-semibold text-neutral-900 tabular-nums">
              {formatPrice(price, currency, lang)}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const BestSellers = ({ onSeeAll }) => {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      // Try the known handles in order until one returns products.
      for (const handle of BEST_SELLER_HANDLES) {
        try {
          const data = await fetchProducts(handle);
          if (alive && data.products && data.products.length > 0) {
            setProducts(data.products.slice(0, 8));
            setLoading(false);
            return;
          }
        } catch {
          /* try next */
        }
      }
      // Fallback: pull top products from generic endpoint
      try {
        const data = await fetchProducts(null);
        if (alive) setProducts((data.products || []).slice(0, 8));
      } catch {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!loading && products.length === 0) return null;

  return (
    <section
      data-testid="bestsellers-section"
      className="w-[95%] mx-auto mt-24 md:mt-32"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger(0.1, 0.15)}
        className="flex items-end justify-between gap-6 mb-8 md:mb-10"
      >
        <div>
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase font-semibold text-neutral-500 mb-3"
          >
            <Star className="w-3.5 h-3.5" style={{ color: "#FF8C1A", fill: "#FF8C1A" }} />
            {t.bestSellers.kicker}
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl md:text-5xl tracking-tight leading-tight font-semibold text-neutral-900"
            data-testid="bestsellers-title"
          >
            {t.bestSellers.title}
          </motion.h2>
        </div>

        <motion.div
          variants={fadeUp}
          className="hidden md:flex items-center gap-2 shrink-0"
        >
          <button
            data-testid="bestsellers-prev"
            onClick={() => scrollBy(-1)}
            aria-label={t.bestSellers.prev}
            className="w-10 h-10 rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            data-testid="bestsellers-next"
            onClick={() => scrollBy(1)}
            aria-label={t.bestSellers.next}
            className="w-10 h-10 rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {onSeeAll && (
            <button
              data-testid="bestsellers-see-all"
              onClick={onSeeAll}
              className="ml-2 inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: "#0A0A0A" }}
            >
              {t.bestSellers.seeAll}
            </button>
          )}
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="flex gap-5 md:gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[78%] sm:w-[44%] md:w-[31%] lg:w-[23%] bg-white rounded-3xl p-4"
            >
              <div
                className="bg-neutral-100 rounded-2xl animate-pulse"
                style={{ aspectRatio: "4/5" }}
              />
              <div className="h-4 bg-neutral-100 rounded mt-4 animate-pulse" />
              <div className="h-4 bg-neutral-100 rounded mt-2 w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          data-testid="bestsellers-scroll"
          className="flex gap-5 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-thin pb-3 -mx-1 px-1"
          style={{ scrollPadding: "0 1rem" }}
        >
          {products.map((p, i) => (
            <BestSellerCard key={p.id || p.handle} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BestSellers;
