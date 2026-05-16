import React from "react";
import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { EASE } from "@/lib/animations";
import { useCart, formatPrice } from "@/contexts/CartContext";
import { useI18n } from "@/lib/i18n";
import { useProductModal } from "@/contexts/ProductModalContext";

const ProductCard = ({ product, index = 0 }) => {
  const { add, items } = useCart();
  const { t, lang } = useI18n();
  const { open: openModal } = useProductModal();
  const [justAdded, setJustAdded] = React.useState(false);

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
      data-testid={`product-card-${product.handle}`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.1, ease: EASE, delay: (index % 4) * 0.12 }}
      className="group bg-white rounded-3xl p-4 transition-shadow hover:shadow-[0_20px_60px_rgb(0,0,0,0.06)]"
    >
      <div
        role="button"
        tabIndex={0}
        data-testid={`product-image-${product.handle}`}
        onClick={() => openModal(product)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal(product);
          }
        }}
        aria-label={product.title}
        className="block w-full text-left cursor-pointer focus:outline-none"
      >
        <div className="relative overflow-hidden rounded-2xl bg-neutral-100" style={{ aspectRatio: "1/1" }}>
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
          <div className="absolute top-3 left-3">
            <span className="inline-block text-[10px] tracking-[0.2em] uppercase font-semibold text-neutral-700 bg-white/85 backdrop-blur-sm rounded-full px-2.5 py-1">
              {product.productType || product.tags?.[0] || ""}
            </span>
          </div>
          <button
            data-testid={`add-to-cart-${product.handle}`}
            onClick={onAdd}
            aria-label="Add to cart"
            className={`absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
              justAdded || inCart
                ? "bg-neutral-900 text-white"
                : "text-white"
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

        <div className="px-1 pt-4 pb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-base md:text-lg text-neutral-900 leading-snug truncate group-hover:text-[#FF574D] transition-colors">
              {product.title}
            </h3>
            {product.vendor && (
              <p className="text-xs text-neutral-500 mt-0.5 truncate">{product.vendor}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="text-base md:text-lg font-semibold text-neutral-900 tracking-tight tabular-nums">
              {formatPrice(price, currency, lang)}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
