import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

const ProductModalContext = createContext(null);

export const ProductModalProvider = ({ children }) => {
  const [product, setProduct] = useState(null);

  const open = useCallback((p) => setProduct(p), []);
  const close = useCallback(() => setProduct(null), []);

  const value = useMemo(() => ({ product, open, close }), [product, open, close]);

  return (
    <ProductModalContext.Provider value={value}>{children}</ProductModalContext.Provider>
  );
};

export const useProductModal = () => {
  const ctx = useContext(ProductModalContext);
  if (!ctx) throw new Error("useProductModal must be used within ProductModalProvider");
  return ctx;
};
