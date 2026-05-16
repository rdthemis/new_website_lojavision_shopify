import React from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { fadeUp, stagger } from "@/lib/animations";
import { useI18n } from "@/lib/i18n";

const Pill = ({ children, active, onClick, testId }) => (
  <button
    data-testid={testId}
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors ${
      active
        ? "border-transparent text-white"
        : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
    }`}
    style={active ? { backgroundColor: "#0A0A0A" } : {}}
  >
    {children}
  </button>
);

const ProductGrid = ({
  products = [],
  collections = [],
  activeCategory,
  onCategoryChange,
  loading,
}) => {
  const { t } = useI18n();

  return (
    <section
      id="products"
      data-testid="products-section"
      className="w-[95%] mx-auto mt-24 md:mt-32"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger(0.1, 0.15)}
        className="mb-8 md:mb-10"
      >
        <motion.div
          variants={fadeUp}
          className="text-xs tracking-[0.25em] uppercase font-semibold text-neutral-500 mb-3"
        >
          {t.sections.productsKicker}
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="font-display text-4xl md:text-5xl tracking-tight leading-tight font-semibold text-neutral-900"
          data-testid="products-title"
        >
          {t.sections.productsTitle}
        </motion.h2>
      </motion.div>

      {/* Filter pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 md:mb-10 scrollbar-thin"
        data-testid="category-filter-pills"
      >
        <Pill
          testId="filter-pill-all"
          active={!activeCategory}
          onClick={() => onCategoryChange(null)}
        >
          {t.sections.all}
        </Pill>
        {collections.map((c) => (
          <Pill
            key={c.handle}
            testId={`filter-pill-${c.handle}`}
            active={activeCategory === c.handle}
            onClick={() => onCategoryChange(c.handle)}
          >
            {c.title}
          </Pill>
        ))}
      </motion.div>

      {loading ? (
        <div data-testid="products-loading" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4">
              <div className="bg-neutral-100 rounded-2xl animate-pulse" style={{ aspectRatio: "1/1" }} />
              <div className="h-4 bg-neutral-100 rounded mt-4 animate-pulse" />
              <div className="h-4 bg-neutral-100 rounded mt-2 w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          data-testid="products-empty"
          className="text-center py-20 rounded-3xl bg-white border border-neutral-200"
        >
          <p className="text-neutral-600">{t.sections.noProducts}</p>
        </div>
      ) : (
        <div
          data-testid="products-grid"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8"
        >
          {products.map((p, i) => (
            <ProductCard key={p.id || p.handle} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
