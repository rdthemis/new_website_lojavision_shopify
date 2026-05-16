from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

import shopify_client as shopify

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
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


@api_router.get("/shopify/collections")
async def get_collections(first: int = 20) -> Dict[str, Any]:
    try:
        collections = await shopify.list_collections(first=first)
        return {"collections": collections}
    except shopify.ShopifyError as e:
        logger.error(f"Shopify collections error: {e}")
        raise HTTPException(status_code=502, detail=str(e))


@api_router.get("/shopify/products")
async def get_products(first: int = 24, collection: Optional[str] = None) -> Dict[str, Any]:
    try:
        products = await shopify.list_products(first=first, collection_handle=collection)
        return {"products": products, "collection": collection}
    except shopify.ShopifyError as e:
        logger.error(f"Shopify products error: {e}")
        raise HTTPException(status_code=502, detail=str(e))


@api_router.post("/shopify/cart")
async def post_cart_create(body: CartCreateBody) -> Dict[str, Any]:
    try:
        lines = [ln.model_dump() for ln in (body.lines or [])]
        cart = await shopify.cart_create(lines=lines)
        return {"cart": cart}
    except shopify.ShopifyError as e:
        logger.error(f"Shopify cart create error: {e}")
        raise HTTPException(status_code=502, detail=str(e))


@api_router.post("/shopify/cart/add")
async def post_cart_add(body: CartLinesAddBody) -> Dict[str, Any]:
    try:
        cart = await shopify.cart_lines_add(
            cart_id=body.cartId, lines=[ln.model_dump() for ln in body.lines]
        )
        return {"cart": cart}
    except shopify.ShopifyError as e:
        logger.error(f"Shopify cart add error: {e}")
        raise HTTPException(status_code=502, detail=str(e))


@api_router.post("/shopify/cart/update")
async def post_cart_update(body: CartLinesUpdateBody) -> Dict[str, Any]:
    try:
        cart = await shopify.cart_lines_update(
            cart_id=body.cartId, lines=[ln.model_dump() for ln in body.lines]
        )
        return {"cart": cart}
    except shopify.ShopifyError as e:
        logger.error(f"Shopify cart update error: {e}")
        raise HTTPException(status_code=502, detail=str(e))


@api_router.post("/shopify/cart/remove")
async def post_cart_remove(body: CartLinesRemoveBody) -> Dict[str, Any]:
    try:
        cart = await shopify.cart_lines_remove(cart_id=body.cartId, line_ids=body.lineIds)
        return {"cart": cart}
    except shopify.ShopifyError as e:
        logger.error(f"Shopify cart remove error: {e}")
        raise HTTPException(status_code=502, detail=str(e))


@api_router.get("/shopify/cart/{cart_id:path}")
async def get_cart(cart_id: str) -> Dict[str, Any]:
    try:
        cart = await shopify.cart_get(cart_id=cart_id)
        return {"cart": cart}
    except shopify.ShopifyError as e:
        logger.error(f"Shopify cart get error: {e}")
        raise HTTPException(status_code=502, detail=str(e))


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
