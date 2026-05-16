from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Any, Dict

import shopify_client as shopify
from demo_data import DEMO_COLLECTIONS, filter_demo_products

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection (kept for future use / cart persistence if needed)
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Landing E-commerce Shopify API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# -------------------- Models --------------------

class CartLineInput(BaseModel):
    merchandiseId: str
    quantity: int = 1


class CartCreateBody(BaseModel):
    lines: Optional[List[CartLineInput]] = None


class CartLinesAddBody(BaseModel):
    cartId: str
    lines: List[CartLineInput]


class CartLineUpdate(BaseModel):
    id: str
    quantity: int


class CartLinesUpdateBody(BaseModel):
    cartId: str
    lines: List[CartLineUpdate]


class CartLinesRemoveBody(BaseModel):
    cartId: str
    lineIds: List[str]


# -------------------- Helpers --------------------

async def _try_shopify_collections(first: int) -> Optional[List[Dict[str, Any]]]:
    try:
        return await shopify.list_collections(first=first)
    except shopify.ShopifyError as e:
        logger.warning(f"Shopify collections unavailable, falling back to demo: {e}")
        return None


async def _try_shopify_products(first: int, collection: Optional[str]) -> Optional[List[Dict[str, Any]]]:
    try:
        return await shopify.list_products(first=first, collection_handle=collection)
    except shopify.ShopifyError as e:
        logger.warning(f"Shopify products unavailable, falling back to demo: {e}")
        return None


# -------------------- Routes --------------------

@api_router.get("/")
async def root():
    return {"message": "Landing E-commerce Shopify API", "ok": True}


@api_router.get("/health")
async def health():
    return {
        "status": "ok",
        "shopify_domain": os.environ.get("SHOPIFY_STORE_DOMAIN"),
        "api_version": os.environ.get("SHOPIFY_API_VERSION"),
        "storefront_token_configured": bool(os.environ.get("SHOPIFY_STOREFRONT_TOKEN")),
    }


# ----- Unified store endpoints (try Shopify, fall back to demo) -----

@api_router.get("/store/collections")
async def store_collections(first: int = 20) -> Dict[str, Any]:
    data = await _try_shopify_collections(first)
    if data is not None and len(data) > 0:
        return {"data_source": "shopify", "collections": data}
    return {"data_source": "demo", "collections": DEMO_COLLECTIONS}


@api_router.get("/store/products")
async def store_products(first: int = 24, collection: Optional[str] = None) -> Dict[str, Any]:
    data = await _try_shopify_products(first, collection)
    if data is not None and len(data) > 0:
        return {"data_source": "shopify", "products": data, "collection": collection}
    return {
        "data_source": "demo",
        "products": filter_demo_products(collection),
        "collection": collection,
    }


# ----- Direct Shopify-only proxies (for cart/checkout once token is valid) -----

@api_router.get("/shopify/collections")
async def get_collections(first: int = 20) -> Dict[str, Any]:
    try:
        collections = await shopify.list_collections(first=first)
        return {"collections": collections}
    except shopify.ShopifyError as e:
        raise HTTPException(status_code=502, detail=str(e))


@api_router.get("/shopify/products")
async def get_products(first: int = 24, collection: Optional[str] = None) -> Dict[str, Any]:
    try:
        products = await shopify.list_products(first=first, collection_handle=collection)
        return {"products": products, "collection": collection}
    except shopify.ShopifyError as e:
        raise HTTPException(status_code=502, detail=str(e))


@api_router.post("/shopify/cart")
async def post_cart_create(body: CartCreateBody) -> Dict[str, Any]:
    try:
        lines = [ln.model_dump() for ln in (body.lines or [])]
        cart = await shopify.cart_create(lines=lines)
        return {"cart": cart}
    except shopify.ShopifyError as e:
        raise HTTPException(status_code=502, detail=str(e))


@api_router.post("/shopify/cart/add")
async def post_cart_add(body: CartLinesAddBody) -> Dict[str, Any]:
    try:
        cart = await shopify.cart_lines_add(
            cart_id=body.cartId, lines=[ln.model_dump() for ln in body.lines]
        )
        return {"cart": cart}
    except shopify.ShopifyError as e:
        raise HTTPException(status_code=502, detail=str(e))


@api_router.post("/shopify/cart/update")
async def post_cart_update(body: CartLinesUpdateBody) -> Dict[str, Any]:
    try:
        cart = await shopify.cart_lines_update(
            cart_id=body.cartId, lines=[ln.model_dump() for ln in body.lines]
        )
        return {"cart": cart}
    except shopify.ShopifyError as e:
        raise HTTPException(status_code=502, detail=str(e))


@api_router.post("/shopify/cart/remove")
async def post_cart_remove(body: CartLinesRemoveBody) -> Dict[str, Any]:
    try:
        cart = await shopify.cart_lines_remove(cart_id=body.cartId, line_ids=body.lineIds)
        return {"cart": cart}
    except shopify.ShopifyError as e:
        raise HTTPException(status_code=502, detail=str(e))


@api_router.get("/shopify/cart/{cart_id:path}")
async def get_cart(cart_id: str) -> Dict[str, Any]:
    try:
        cart = await shopify.cart_get(cart_id=cart_id)
        return {"cart": cart}
    except shopify.ShopifyError as e:
        raise HTTPException(status_code=502, detail=str(e))


# ----- Unified checkout (Shopify when possible, demo fallback otherwise) -----

class CheckoutBody(BaseModel):
    lines: List[CartLineInput]


@api_router.post("/store/checkout")
async def store_checkout(body: CheckoutBody) -> Dict[str, Any]:
    """Try to create a Shopify cart and return its checkoutUrl.
    If Shopify isn't reachable/authorised, return a demo response so the
    frontend can show a friendly 'demo mode' message instead of failing.
    """
    try:
        lines = [ln.model_dump() for ln in body.lines]
        cart = await shopify.cart_create(lines=lines)
        return {"data_source": "shopify", "cart": cart, "checkoutUrl": cart.get("checkoutUrl")}
    except shopify.ShopifyError as e:
        logger.warning(f"Demo checkout fallback: {e}")
        total = 0.0
        for ln in body.lines:
            total += ln.quantity * 0
        return {
            "data_source": "demo",
            "message": (
                "Modo demo ativo — para checkout real, configure um Storefront API "
                "Access Token válido nas variáveis de ambiente."
            ),
            "lines": [ln.model_dump() for ln in body.lines],
        }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
