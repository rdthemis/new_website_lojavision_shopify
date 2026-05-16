import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { EASE, fadeUp, stagger } from "@/lib/animations";
import { useI18n } from "@/lib/i18n";

/**
 * Bento-style asymmetric category tiles. 4 categories.
 * Layout: first tile spans 2 columns on md+, others single column.
 */
const CategoryMenu = ({ collections = [], activeHandle, onSelect }) => {
  const { t } = useI18n();

  const handleSelect = (handle) => {
    onSelect?.(handle);
  };

  return (
    <section
      id="categories"
      data-testid="categories-section"
      className="w-[95%] mx-auto mt-24 md:mt-32"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger(0.1, 0.15)}
        className="flex items-end justify-between mb-8 md:mb-10"
      >
        <div>
          <motion.div
            variants={fadeUp}
            className="text-xs tracking-[0.25em] uppercase font-semibold text-neutral-500 mb-3"
          >
            {t.sections.categoriesKicker}
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl md:text-5xl tracking-tight leading-tight font-semibold text-neutral-900"
            data-testid="categories-title"
          >
            {t.sections.categoriesTitle}
          </motion.h2>
        </div>

        <motion.button
          variants={fadeUp}
          data-testid="category-all-toggle"
          onClick={() => handleSelect(null)}
          className={`hidden md:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border transition-colors ${
            !activeHandle
              ? "border-transparent text-white"
              : "border-neutral-300 text-neutral-800 hover:bg-neutral-100"
          }`}
          style={!activeHandle ? { backgroundColor: "#0A0A0A" } : {}}
        >
          {t.sections.all}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
        {collections.slice(0, 4).map((c, i) => {
          const count = Math.min(collections.length, 4);
          const isFeatured = i === 0 && count >= 3;
          // For 3 items: featured spans 2 cols × 1 row + 2 single tiles = clean single row
          // For 4 items: featured spans 2 cols × 2 rows + 3 single tiles fill the rest
          // For ≤2 items: every tile single
          const featuredSpan =
            count === 3
              ? "col-span-2 row-span-1 md:col-span-2 md:row-span-1"
              : "col-span-2 row-span-2";
          const isActive = activeHandle === c.handle;
          return (
            <motion.button
              key={c.handle}
              data-testid={`category-tile-${c.handle}`}
              onClick={() => handleSelect(c.handle)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1.0, ease: EASE, delay: i * 0.12 }}
              className={`group relative overflow-hidden rounded-3xl text-left ${
                isFeatured ? featuredSpan : "col-span-1 row-span-1"
              }`}
            >
              <motion.img
                src={c.image?.url}
                alt={c.image?.altText || c.title}
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1.06 }}
                whileHover={{ scale: 1.12 }}
                whileInView={{ scale: 1.0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: EASE }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              {isActive && (
                <div
                  className="absolute inset-0 ring-4 ring-inset"
                  style={{ boxShadow: "inset 0 0 0 4px #FF574D" }}
                />
              )}
              <div className="relative h-full p-5 md:p-7 flex flex-col justify-end">
                <span className="text-[10px] md:text-xs tracking-[0.25em] uppercase font-semibold text-white/85 mb-1">
                  {c.handle}
                </span>
                <div className="flex items-end justify-between gap-3">
                  <h3
                    className={`font-display text-white font-semibold tracking-tight ${
                      isFeatured ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"
                    }`}
                  >
                    {c.title}
                  </h3>
                  <span className="shrink-0 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                {isFeatured && c.description && (
                  <p className="mt-3 text-sm text-white/80 max-w-xs hidden md:block">
                    {c.description}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryMenu;
