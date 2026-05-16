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
- ✅ Shopify Storefront GraphQL client (collections, products, cart create/add/update/remove, get) — ready when token is valid
- ✅ Demo fallback layer (4 collections, 8 products) — automatically engages when Shopify returns errors
- ✅ Unified `/api/store/*` endpoints + direct `/api/shopify/*` proxies
- ✅ Bilingual PT/EN UI with persistent language preference (localStorage)
- ✅ Hero carousel with Ken-Burns + staggered text reveals
- ✅ Bento category grid (Tech 2x2 featured + 3 single tiles)
- ✅ Product grid with filter pills + responsive layout
- ✅ Slide-in cart drawer with qty controls, remove, subtotal, demo-aware checkout
- ✅ Sticky glass header with cart badge + lang toggle
- ✅ Dark footer with shopify/demo source badge
- ✅ All testing passed (10/10 backend pytest + full frontend E2E)

## Backlog
**P0 (block real-production launch)**
- Replace `atkn_…` / `shpss_…` token in `backend/.env` with a valid Storefront API access token (the user needs to install the Custom App and grant Storefront API scopes); no code change required.

**P1 (revenue / conversion)**
- Newsletter capture section (email → MongoDB)
- Product quick-view modal (image gallery + variants picker)
- "Best seller" / "New arrival" tag rendering when present in Shopify metafields
- Cross-sell module under cart drawer

**P2 (polish)**
- Skeleton shimmer instead of static pulse
- Light/dark theme toggle
- Page-level i18n for product descriptions when Shopify ships localised storefront

## Next Tasks
1. (User) Generate a real Shopify Storefront API access token from the meu-app-vision-2 custom app and replace `SHOPIFY_STOREFRONT_TOKEN` in `backend/.env`. Restart backend → landing automatically switches `data_source` to `shopify` and `Finalizar Compra` becomes a real Shopify-hosted checkout redirect.
2. (Optional) Add the newsletter capture block to convert browsers into subscribers.
