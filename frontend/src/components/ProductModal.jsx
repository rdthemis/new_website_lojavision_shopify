import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { EASE } from "@/lib/animations";
import { useI18n } from "@/lib/i18n";
import { useCart, formatPrice } from "@/contexts/CartContext";
import { useProductModal } from "@/contexts/ProductModalContext";
import { startCheckout } from "@/lib/api";

const findMatchingVariant = (variants, selected) => {
  if (!variants?.length) return null;
  if (!selected || Object.keys(selected).length === 0) return variants[0];
  return (
    variants.find((v) => {
      const opts = v.selectedOptions || [];
      return opts.every((o) => selected[o.name] === o.value);
    }) || null
  );
};

const ProductModal = () => {
  const { product, close } = useProductModal();
  const { add, setOpen: setCartOpen } = useCart();
  const { t, lang } = useI18n();

  const [selected, setSelected] = useState({});
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [buying, setBuying] = useState(false);

  // When the modal opens with a new product, hydrate defaults from the first
  // variant so the picker reflects an immediate valid selection.
  useEffect(() => {
    if (!product) return;
    const first = product.variants?.[0];
    const initial = {};
    (first?.selectedOptions || []).forEach((o) => {
      initial[o.name] = o.value;
    });
    setSelected(initial);
    setImageIndex(0);
    setQty(1);
    setJustAdded(false);
    setBuying(false);
  }, [product]);

  const variant = useMemo(() => {
    if (!product) return null;
    return findMatchingVariant(product.variants, selected);
  }, [product, selected]);

  // If the chosen variant has its own image, scroll the gallery there.
  useEffect(() => {
    if (!product || !variant?.image?.url) return;
    const idx = (product.images || []).findIndex(
      (img) => img.url === variant.image.url
    );
    if (idx >= 0) setImageIndex(idx);
  }, [variant, product]);

  if (!product) return null;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.featuredImage
        ? [product.featuredImage]
        : [];

  const price = parseFloat(
    variant?.price?.amount || product.priceMin?.amount || "0"
  );
  const compareAt = variant?.compareAtPrice?.amount
    ? parseFloat(variant.compareAtPrice.amount)
    : null;
  const currency =
    variant?.price?.currencyCode || product.priceMin?.currencyCode || "BRL";
  const inStock = variant ? variant.availableForSale : false;
  const hasMultipleOptions = (product.options || []).length > 0 &&
    (product.options || []).some((o) => (o.values || []).length > 1);

  const handleAdd = () => {
    if (!variant) return;
    add(product, {
      variant,
      quantity: qty,
      variantTitle: variant.title,
      variantImage: variant?.image?.url,
    });
    setJustAdded(true);
    toast.success(
      lang === "pt" ? "Adicionado ao carrinho!" : "Added to cart!"
    );
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleBuyNow = async () => {
    if (!variant) return;
    setBuying(true);
    try {
      const data = await startCheckout([
        { merchandiseId: variant.id, quantity: qty },
      ]);
      if (data.data_source === "shopify" && data.checkoutUrl) {
        toast.success(
          lang === "pt" ? "Indo pro checkout..." : "Heading to checkout..."
        );
        window.location.href = data.checkoutUrl;
      } else {
        toast.message(t.cart.demoNotice);
      }
    } catch {
      toast.error(
        lang === "pt" ? "Erro ao iniciar checkout." : "Checkout error."
      );
    } finally {
      setBuying(false);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && close()}>
      <DialogContent
        data-testid="product-modal"
        className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-white rounded-3xl border-0"
      >
        {/* Hidden a11y title/description */}
        <DialogTitle className="sr-only">{product.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {product.description?.slice(0, 140) || product.title}
        </DialogDescription>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] md:max-h-[85vh]">
          {/* ----- Left: Image gallery ----- */}
          <div className="relative bg-neutral-100 md:rounded-l-3xl overflow-hidden">
            <div
              className="relative w-full"
              style={{ aspectRatio: "1/1" }}
              data-testid="modal-gallery"
            >
              <AnimatePresence mode="wait">
                {images[imageIndex] && (
                  <motion.img
                    key={`${imageIndex}-${images[imageIndex].url}`}
                    src={images[imageIndex].url}
                    alt={images[imageIndex].altText || product.title}
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1.0 }}
                    exit={{ opacity: 0, scale: 1.0 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  />
                )}
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    data-testid="modal-prev-image"
                    onClick={() =>
                      setImageIndex((i) => (i - 1 + images.length) % images.length)
                    }
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    data-testid="modal-next-image"
                    onClick={() =>
                      setImageIndex((i) => (i + 1) % images.length)
                    }
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3 md:p-4 scrollbar-thin">
                {images.slice(0, 8).map((img, i) => (
                  <button
                    key={img.url + i}
                    data-testid={`modal-thumb-${i}`}
                    onClick={() => setImageIndex(i)}
                    className={`shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === imageIndex
                        ? "border-[#FF574D]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ----- Right: Info & actions ----- */}
          <div className="flex flex-col overflow-y-auto p-6 md:p-8 lg:p-10 max-h-[90vh] md:max-h-[85vh]">
            {product.vendor && (
              <span className="text-xs tracking-[0.25em] uppercase font-semibold text-neutral-500 mb-2">
                {product.vendor}
              </span>
            )}
            <h2
              data-testid="modal-title"
              className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight"
            >
              {product.title}
            </h2>

            <div className="mt-4 flex items-baseline gap-3">
              <span
                data-testid="modal-price"
                className="font-display text-2xl md:text-3xl font-bold text-neutral-900 tabular-nums"
              >
                {formatPrice(price, currency, lang)}
              </span>
              {compareAt && compareAt > price && (
                <span className="text-base text-neutral-400 line-through tabular-nums">
                  {formatPrice(compareAt, currency, lang)}
                </span>
              )}
            </div>

            {/* Options pickers */}
            {hasMultipleOptions && (
              <div
                className="mt-6 space-y-4"
                data-testid="modal-options"
              >
                {product.options.map((opt) =>
                  (opt.values || []).length > 1 ? (
                    <div key={opt.id || opt.name}>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xs tracking-[0.2em] uppercase font-semibold text-neutral-500">
                          {opt.name}
                        </span>
                        <span className="text-sm text-neutral-700 font-medium">
                          {selected[opt.name] || ""}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {opt.values.map((val) => {
                          const active = selected[opt.name] === val;
                          return (
                            <button
                              key={val}
                              data-testid={`modal-option-${opt.name}-${val}`}
                              onClick={() =>
                                setSelected((s) => ({ ...s, [opt.name]: val }))
                              }
                              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                active
                                  ? "border-transparent text-white"
                                  : "border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
                              }`}
                              style={
                                active ? { backgroundColor: "#0A0A0A" } : {}
                              }
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <span className="text-xs tracking-[0.2em] uppercase font-semibold text-neutral-500 block mb-2">
                {t.modal.quantity}
              </span>
              <div className="inline-flex items-center rounded-full border border-neutral-200">
                <button
                  data-testid="modal-qty-dec"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-neutral-100 rounded-l-full transition-colors disabled:opacity-50"
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span
                  data-testid="modal-qty"
                  className="px-5 text-base font-semibold tabular-nums min-w-[40px] text-center"
                >
                  {qty}
                </span>
                <button
                  data-testid="modal-qty-inc"
                  onClick={() => setQty((q) => q + 1)}
                  className="p-2.5 hover:bg-neutral-100 rounded-r-full transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                data-testid="modal-add-to-cart"
                onClick={handleAdd}
                disabled={!inStock}
                className={`flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-full text-sm font-semibold transition-all ${
                  !inStock
                    ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                    : justAdded
                      ? "bg-neutral-900 text-white"
                      : "text-white hover:translate-y-[-1px]"
                }`}
                style={
                  inStock && !justAdded ? { backgroundColor: "#FF574D" } : {}
                }
              >
                {!inStock ? (
                  t.modal.outOfStock
                ) : justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t.modal.added}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    {t.modal.addToCart}
                  </>
                )}
              </button>
              <button
                data-testid="modal-buy-now"
                onClick={handleBuyNow}
                disabled={!inStock || buying}
                className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-full text-sm font-semibold border-2 transition-all disabled:opacity-50"
                style={{
                  borderColor: "#0A0A0A",
                  color: "#0A0A0A",
                }}
              >
                {buying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.modal.processing}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {t.modal.buyNow}
                  </>
                )}
              </button>
            </div>

            {justAdded && (
              <button
                data-testid="modal-view-cart"
                onClick={() => {
                  close();
                  setTimeout(() => setCartOpen(true), 250);
                }}
                className="mt-3 text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-2 self-start"
              >
                {lang === "pt" ? "Ver carrinho →" : "View cart →"}
              </button>
            )}

            {/* Description */}
            {(product.descriptionHtml || product.description) && (
              <div className="mt-8 pt-6 border-t border-neutral-100">
                <span className="text-xs tracking-[0.2em] uppercase font-semibold text-neutral-500 block mb-3">
                  {t.modal.description}
                </span>
                {product.descriptionHtml ? (
                  <div
                    data-testid="modal-description-html"
                    className="prose prose-sm max-w-none text-neutral-700 leading-relaxed [&_a]:text-[#FF574D] [&_img]:rounded-2xl [&_img]:my-3 [&_p]:mb-3 [&_strong]:text-neutral-900 [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h2]:text-lg [&_h3]:text-base [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:pl-5 [&_ol]:list-decimal"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                ) : (
                  <p
                    data-testid="modal-description"
                    className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line"
                  >
                    {product.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
