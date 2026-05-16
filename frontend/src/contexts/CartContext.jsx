import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "vision_cart_v2";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const add = useCallback((product) => {
    setItems((prev) => {
      const variant = product.variants?.[0];
      const merchandiseId = variant?.id;
      if (!merchandiseId) return prev;
      const existing = prev.find((i) => i.merchandiseId === merchandiseId);
      if (existing) {
        return prev.map((i) =>
          i.merchandiseId === merchandiseId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          merchandiseId,
          quantity: 1,
          title: product.title,
          image: product.featuredImage?.url || product.images?.[0]?.url,
          price: parseFloat(variant?.price?.amount || product.priceMin?.amount || "0"),
          currency: variant?.price?.currencyCode || product.priceMin?.currencyCode || "BRL",
          handle: product.handle,
        },
      ];
    });
  }, []);

  const remove = useCallback((merchandiseId) => {
    setItems((prev) => prev.filter((i) => i.merchandiseId !== merchandiseId));
  }, []);

  const updateQty = useCallback((merchandiseId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.merchandiseId !== merchandiseId);
      return prev.map((i) =>
        i.merchandiseId === merchandiseId ? { ...i, quantity } : i
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return {
      items,
      open,
      setOpen,
      add,
      remove,
      updateQty,
      clear,
      totalQuantity,
      subtotal,
    };
  }, [items, open, add, remove, updateQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const formatPrice = (amount, currency = "BRL", lang = "pt") => {
  try {
    const locale = lang === "pt" ? "pt-BR" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "BRL",
    }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
};
