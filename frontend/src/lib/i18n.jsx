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
    trust: {
      shipping: { title: "Frete grátis", sub: "Em compras acima de R$ 199" },
      secure: { title: "Compra 100% segura", sub: "Pagamento criptografado" },
      installments: { title: "Pague em até 12x", sub: "No cartão, sem juros*" },
      returns: { title: "Devolução em 7 dias", sub: "Sem perguntas, sem stress" },
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
    bestSellers: {
      kicker: "Favoritos da semana",
      title: "Mais Vendidos",
      badge: "Best Seller",
      seeAll: "Ver todos",
      prev: "Anterior",
      next: "Próximo",
    },
    reviews: {
      kicker: "Quem comprou recomenda",
      title: "O que os clientes dizem",
      avgPrefix: "Avaliação média",
      basedOn: (n) => `Baseado em ${n} avaliações verificadas`,
      verified: "Comprador verificado",
      boughtPrefix: "Comprou:",
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
    modal: {
      addToCart: "Adicionar ao Carrinho",
      buyNow: "Comprar Agora",
      added: "Adicionado!",
      quantity: "Quantidade",
      selectOption: "Selecione",
      outOfStock: "Esgotado",
      description: "Descrição",
      close: "Fechar",
      processing: "Processando...",
    },
    newsletter: {
      kicker: "Bem-vindx ao clube",
      title: "Ganhe 10% no primeiro pedido.",
      subtitle:
        "Entra para a nossa lista e recebe um cupom de 10% off + novidades em primeira mão. Sem spam, prometido.",
      placeholder: "seu melhor email",
      cta: "Quero meu cupom",
      sending: "Enviando...",
      successTitle: "Tá quase lá!",
      successBody: "Aqui está seu cupom — use no checkout do Shopify:",
      copy: "Copiar",
      copied: "Copiado!",
      alreadyTitle: "Você já é do clube ✨",
      alreadyBody: "Seu cupom continua valendo:",
      errorInvalid: "Esse email não parece válido.",
      errorGeneric: "Algo deu errado. Tenta de novo?",
      privacy: "Ao se inscrever você concorda em receber emails ocasionais. Cancela quando quiser.",
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
    trust: {
      shipping: { title: "Free shipping", sub: "On orders above R$ 199" },
      secure: { title: "100% secure checkout", sub: "Encrypted payment" },
      installments: { title: "Pay in up to 12×", sub: "Interest-free on credit card*" },
      returns: { title: "7-day returns", sub: "No questions, no hassle" },
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
    bestSellers: {
      kicker: "Weekly favorites",
      title: "Best Sellers",
      badge: "Best Seller",
      seeAll: "See all",
      prev: "Previous",
      next: "Next",
    },
    reviews: {
      kicker: "From happy customers",
      title: "What buyers are saying",
      avgPrefix: "Average rating",
      basedOn: (n) => `Based on ${n} verified reviews`,
      verified: "Verified buyer",
      boughtPrefix: "Bought:",
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
    modal: {
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      added: "Added!",
      quantity: "Quantity",
      selectOption: "Select",
      outOfStock: "Out of stock",
      description: "Description",
      close: "Close",
      processing: "Processing...",
    },
    newsletter: {
      kicker: "Welcome to the club",
      title: "Get 10% off your first order.",
      subtitle:
        "Join our list and grab a 10% off coupon + early drops. No spam, promise.",
      placeholder: "your best email",
      cta: "Send me the coupon",
      sending: "Sending...",
      successTitle: "Almost there!",
      successBody: "Here's your coupon — use it at Shopify checkout:",
      copy: "Copy",
      copied: "Copied!",
      alreadyTitle: "You're already in ✨",
      alreadyBody: "Your coupon is still valid:",
      errorInvalid: "That email doesn't look right.",
      errorGeneric: "Something went wrong. Try again?",
      privacy: "By subscribing you agree to receive occasional emails. Unsubscribe anytime.",
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
