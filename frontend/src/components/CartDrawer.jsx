import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart, formatPrice } from "@/contexts/CartContext";
import { useI18n } from "@/lib/i18n";
import { startCheckout } from "@/lib/api";

const CartDrawer = () => {
  const { items, open, setOpen, updateQty, remove, subtotal, clear } = useCart();
  const { t, lang } = useI18n();
  const [submitting, setSubmitting] = useState(false);

  const currency = items[0]?.currency || "BRL";

  const onCheckout = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const lines = items.map((i) => ({ merchandiseId: i.merchandiseId, quantity: i.quantity }));
      const data = await startCheckout(lines);
      if (data.data_source === "shopify" && data.checkoutUrl) {
        toast.success(lang === "pt" ? "Redirecionando para o checkout..." : "Redirecting to checkout...");
        window.location.href = data.checkoutUrl;
      } else {
        toast.message(t.cart.demoNotice, {
          description: lang === "pt"
            ? "Quando o token Shopify estiver válido, o botão te leva direto ao checkout real."
            : "Once a valid Shopify token is configured, this button will take you straight to real checkout.",
        });
      }
    } catch (err) {
      toast.error(lang === "pt" ? "Erro ao finalizar compra." : "Checkout error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        data-testid="cart-drawer"
        className="w-full sm:max-w-md p-0 flex flex-col bg-white"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <SheetTitle className="font-display text-2xl tracking-tight font-semibold text-neutral-900">
            {t.cart.title}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div data-testid="cart-empty" className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "#FFF1EF" }}
            >
              <ShoppingBag className="w-7 h-7" style={{ color: "#FF574D" }} />
            </div>
            <p className="font-medium text-neutral-900">{t.cart.empty}</p>
            <p className="text-sm text-neutral-500 mt-1">{t.cart.emptySub}</p>
            <Button
              data-testid="cart-continue-shopping"
              variant="outline"
              className="mt-6 rounded-full"
              onClick={() => setOpen(false)}
            >
              {t.cart.continueShopping}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" data-testid="cart-items">
              {items.map((it) => (
                <div
                  key={it.merchandiseId}
                  data-testid={`cart-item-${it.handle}`}
                  className="flex gap-3 items-start"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 shrink-0">
                    {it.image && (
                      <img src={it.image} alt={it.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm text-neutral-900 leading-snug line-clamp-2">
                        {it.title}
                      </h4>
                      <button
                        data-testid={`cart-remove-${it.handle}`}
                        onClick={() => remove(it.merchandiseId)}
                        className="text-neutral-400 hover:text-neutral-700 transition-colors"
                        aria-label={t.cart.remove}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm font-semibold text-neutral-900 mt-1 tabular-nums">
                      {formatPrice(it.price * it.quantity, it.currency, lang)}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full border border-neutral-200">
                      <button
                        data-testid={`cart-qty-dec-${it.handle}`}
                        onClick={() => updateQty(it.merchandiseId, it.quantity - 1)}
                        className="p-1.5 hover:bg-neutral-100 rounded-l-full transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span
                        data-testid={`cart-qty-${it.handle}`}
                        className="px-3 text-sm font-medium tabular-nums min-w-[28px] text-center"
                      >
                        {it.quantity}
                      </span>
                      <button
                        data-testid={`cart-qty-inc-${it.handle}`}
                        onClick={() => updateQty(it.merchandiseId, it.quantity + 1)}
                        className="p-1.5 hover:bg-neutral-100 rounded-r-full transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 px-6 py-5 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">{t.cart.subtotal}</span>
                <span
                  data-testid="cart-subtotal"
                  className="text-lg font-semibold text-neutral-900 tabular-nums"
                >
                  {formatPrice(subtotal, currency, lang)}
                </span>
              </div>
              <Button
                data-testid="cart-checkout-button"
                onClick={onCheckout}
                disabled={submitting}
                className="w-full rounded-full h-12 text-sm font-semibold text-white"
                style={{ backgroundColor: "#FF574D" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {lang === "pt" ? "Processando..." : "Processing..."}
                  </>
                ) : (
                  t.cart.checkout
                )}
              </Button>
              <button
                data-testid="cart-clear"
                onClick={clear}
                className="w-full text-xs text-neutral-500 hover:text-neutral-800 transition-colors py-1"
              >
                {lang === "pt" ? "Esvaziar carrinho" : "Clear cart"}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
