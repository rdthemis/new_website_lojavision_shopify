# PRD — Vision · Shopify Single-Page Landing E-commerce

## Original Problem Statement
> Uma página ecommerce para a shopify com banner principal com carrossel, menu de categoria, produtos, carrinho, página no formato tela única com efeito slowmotion de entrada das imagens e texto.

## User Choices
- **Niches**: Tech (Eletrônicos), Moda, Decoração, Ferramentas
- **Visual style**: Clean e jovem
- **Backend**: Real Shopify Storefront API integration (with checkout redirect to Shopify)
- **Languages**: Portuguese + English (PT/EN toggle)
- **Product source**: Synced from DROPI → Shopify → frontend (single-source via Shopify)
- **Demo fallback**: While the user fixes their Shopify Storefront token, the backend serves 8 demo products / 4 demo collections so the UX is fully demonstrable. The Shopify integration is plug-and-play — swap the env token and the same UI renders real products + real checkout URL.

## Architecture
- **Backend** (FastAPI + Python): `/app/backend/server.py`, `/app/backend/shopify_client.py`, `/app/backend/demo_data.py`
  - Unified store endpoints: `/api/store/collections`, `/api/store/products?collection=`, `/api/store/checkout`
  - Direct Shopify proxies: `/api/shopify/*` (collections, products, cart create/add/update/remove/get)
  - Try-Shopify-first, fall-back-to-demo pattern in store endpoints
- **Frontend** (React 19 + Tailwind + framer-motion + shadcn):
  - `App.js` (single-page) with refs for smooth in-page scroll
  - Header, HeroCarousel (Ken-Burns + slow text reveal), CategoryMenu (bento), ProductGrid, ProductCard, CartDrawer, Footer, Reveal wrapper
  - Contexts: `CartContext` (localStorage), `I18nContext` (PT/EN)
- **MongoDB**: provisioned, currently unused (cart is client-side via localStorage; reserved for future order history)

## Personas
- **Browser-shopper** — wants to discover products via curated categories, quick add-to-cart, low-friction checkout
- **Store owner (admin)** — wants to plug in Shopify token and instantly see DROPI-synced products live on the landing

## Core Requirements (static)
1. Sticky bilingual header with cart badge
2. Hero carousel — 3 slides, auto-rotate 6.5s, Ken-Burns slow zoom, staggered text reveal, prev/next + dots
3. Bento category menu — 4 categories, first one featured 2x2
4. Filterable product grid — pill filters per category + "Todos/All"
5. Slide-in cart drawer — qty controls, remove, subtotal, demo notice when Shopify checkout unavailable
6. Slow-motion entry animations (1.2s, cubic-bezier(0.16,1,0.3,1)) on every section
7. Coral accent (#FF574D), Outfit + Plus Jakarta Sans typography, off-white background
8. data-testid coverage on every interactive element

## What's Been Implemented (Dec 2025)
- ✅ **LIVE Shopify integration** — Storefront token `77082de5774ce82a8be36717c4886aa1` (Headless app) authenticates against `f8ujhx-36.myshopify.com` (Loja Virtual Vision) on API version 2025-10. Real DROPI-synced products render with BRL pricing.
- ✅ **Real checkout verified** — "Finalizar Compra" creates Shopify cart and redirects to `https://lojavirtualvision.com/checkouts/...` (Visa/Master/Amex enabled).
- ✅ Shopify Storefront GraphQL client (collections, products, cart create/add/update/remove, get)
- ✅ Demo fallback layer (4 collections, 8 products) kept as safety net if Shopify becomes unreachable
- ✅ Unified `/api/store/*` endpoints + direct `/api/shopify/*` proxies
- ✅ Collection cleanup: filters generic handles (`frontpage`, `todos-los-productos`) and dedupes `-N` numeric duplicates
- ✅ Bilingual PT/EN UI with persistent language preference (localStorage)
- ✅ Hero carousel with Ken-Burns + staggered text reveals
- ✅ Bento category grid (adaptive layout: 3 tiles = single row, 4 tiles = asymmetric 2x2 featured)
- ✅ Product grid with filter pills + responsive layout
- ✅ Slide-in cart drawer with qty controls, remove, subtotal, real Shopify checkout redirect
- ✅ Sticky glass header with cart badge + lang toggle
- ✅ Dark footer with "Shopify connected" live badge
- ✅ All testing passed (10/10 backend pytest + full frontend E2E including real-checkout navigation)

## Backlog
**P0** — *(none — production-ready as of this iteration)*

**P1 (revenue / conversion)**
- Newsletter capture section (email → MongoDB) with first-order coupon
- Product quick-view modal (image gallery + variants picker)
- Cross-sell module under cart drawer

**P2 (polish)**
- Skeleton shimmer instead of static pulse
- Page-level i18n for product descriptions when Shopify ships localised storefront
- Friendlier collection title overrides (Mejores Ventas → "Mais Vendidos" in PT)

## Next Tasks
1. (Optional) Add newsletter capture block + first-order coupon to convert browsers into subscribers.
2. (Optional) Add a "Mais Vendidos / Best Sellers" label override so Spanish DROPI collection titles read naturally in PT/EN.
