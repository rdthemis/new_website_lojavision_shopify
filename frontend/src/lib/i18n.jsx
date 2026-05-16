import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

const dict = {
  pt: {
    nav: {
      home: "Início",
      products: "Produtos",
      categories: "Categorias",
      about: "Sobre",
      cart: "Carrinho",
    },
    hero: {
      eyebrow: "Coleção 2026",
      titles: [
        "Coisas boas, sem complicar.",
        "Design jovem que atravessa o dia.",
        "Você compra. A gente entrega o bom gosto.",
      ],
      subtitles: [
        "Tech, moda, casa e ferramentas em um só lugar.",
        "Peças pensadas para quem vive intenso.",
        "Curadoria diária para uma rotina mais leve.",
      ],
      cta: "Explorar coleção",
      secondary: "Ver categorias",
    },
    sections: {
      categoriesTitle: "Categorias",
      categoriesKicker: "Achados por estilo",
      productsTitle: "Produtos em alta",
      productsKicker: "Selecionados pra você",
      all: "Todos",
      noProducts: "Nenhum produto encontrado nesta categoria.",
    },
    product: {
      add: "Adicionar",
      added: "Adicionado",
      from: "a partir de",
    },
    cart: {
      title: "Seu Carrinho",
      empty: "Seu carrinho está vazio.",
      emptySub: "Adicione produtos para começar.",
      subtotal: "Subtotal",
      checkout: "Finalizar Compra",
      remove: "Remover",
      qty: "Qtd",
      demoNotice: "Modo demo — checkout real disponível ao configurar o token Shopify.",
      continueShopping: "Continuar comprando",
    },
    footer: {
      tag: "Curadoria. Entrega. Bom gosto.",
      sections: { shop: "Loja", help: "Ajuda", company: "Empresa" },
      rights: "Todos os direitos reservados.",
    },
    badges: { live: "Conectado ao Shopify", demo: "Modo Demo" },
  },
  en: {
    nav: {
      home: "Home",
      products: "Products",
      categories: "Categories",
      about: "About",
      cart: "Cart",
    },
    hero: {
      eyebrow: "2026 Collection",
      titles: [
        "Good things, made simple.",
        "Young design for everyday wear.",
        "You shop. We deliver good taste.",
      ],
      subtitles: [
        "Tech, fashion, home and tools — all in one place.",
        "Pieces designed for those who live fully.",
        "Daily curation for a lighter routine.",
      ],
      cta: "Explore collection",
      secondary: "Browse categories",
    },
    sections: {
      categoriesTitle: "Categories",
      categoriesKicker: "Finds by style",
      productsTitle: "Trending now",
      productsKicker: "Hand-picked for you",
      all: "All",
      noProducts: "No products found in this category.",
    },
    product: {
      add: "Add",
      added: "Added",
      from: "from",
    },
    cart: {
      title: "Your Cart",
      empty: "Your cart is empty.",
      emptySub: "Add products to get started.",
      subtotal: "Subtotal",
      checkout: "Checkout",
      remove: "Remove",
      qty: "Qty",
      demoNotice: "Demo mode — real checkout available once Shopify token is configured.",
      continueShopping: "Continue shopping",
    },
    footer: {
      tag: "Curation. Delivery. Good taste.",
      sections: { shop: "Shop", help: "Help", company: "Company" },
      rights: "All rights reserved.",
    },
    badges: { live: "Shopify connected", demo: "Demo mode" },
  },
};

const I18nContext = createContext({ lang: "pt", t: dict.pt, setLang: () => {} });

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    if (typeof window === "undefined") return "pt";
    return localStorage.getItem("lang") || "pt";
  });

  const setLang = useCallback((l) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: dict[lang] }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
