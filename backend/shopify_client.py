"""Shopify Storefront GraphQL client and helpers."""
import os
import httpx
from typing import Any, Dict, Optional


class ShopifyError(Exception):
    pass


def _endpoint() -> str:
    domain = os.environ.get("SHOPIFY_STORE_DOMAIN")
    version = os.environ.get("SHOPIFY_API_VERSION", "2024-04")
    if not domain:
        raise ShopifyError("SHOPIFY_STORE_DOMAIN not configured")
    return f"https://{domain}/api/{version}/graphql.json"


def _headers() -> Dict[str, str]:
    token = os.environ.get("SHOPIFY_STOREFRONT_TOKEN")
    if not token:
        raise ShopifyError("SHOPIFY_STOREFRONT_TOKEN not configured")
    return {
        "X-Shopify-Storefront-Access-Token": token,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


async def gql(query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    payload = {"query": query, "variables": variables or {}}
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(_endpoint(), headers=_headers(), json=payload)
        if r.status_code != 200:
            raise ShopifyError(f"Shopify HTTP {r.status_code}: {r.text[:300]}")
        data = r.json()
        if data.get("errors"):
            raise ShopifyError(f"Shopify GraphQL error: {data['errors']}")
        return data.get("data", {})


# ----- Queries -----

COLLECTIONS_QUERY = """
query Collections($first: Int!) {
  collections(first: $first) {
    edges {
      node {
        id
        handle
        title
        description
        image { url altText }
      }
    }
  }
}
"""

PRODUCT_FRAGMENT = """
fragment ProductFields on Product {
  id
  handle
  title
  description
  descriptionHtml
  tags
  productType
  vendor
  featuredImage { url altText }
  images(first: 8) { edges { node { url altText } } }
  options { id name values }
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  variants(first: 50) {
    edges {
      node {
        id
        title
        availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        image { url altText }
        selectedOptions { name value }
      }
    }
  }
}
"""

PRODUCTS_QUERY = (
    PRODUCT_FRAGMENT
    + """
query Products($first: Int!) {
  products(first: $first) {
    edges {
      node { ...ProductFields }
    }
  }
}
"""
)

COLLECTION_PRODUCTS_QUERY = (
    PRODUCT_FRAGMENT
    + """
query CollectionProducts($handle: String!, $first: Int!) {
  collection(handle: $handle) {
    id
    title
    handle
    products(first: $first) {
      edges {
        node { ...ProductFields }
      }
    }
  }
}
"""
)

CART_CREATE_MUTATION = """
mutation CartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount { amount currencyCode }
        totalAmount { amount currencyCode }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price { amount currencyCode }
                image { url altText }
                product { id title handle }
              }
            }
          }
        }
      }
    }
    userErrors { field message }
  }
}
"""

CART_LINES_ADD_MUTATION = """
mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount { amount currencyCode }
        totalAmount { amount currencyCode }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price { amount currencyCode }
                image { url altText }
                product { id title handle }
              }
            }
          }
        }
      }
    }
    userErrors { field message }
  }
}
"""

CART_LINES_UPDATE_MUTATION = """
mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount { amount currencyCode }
        totalAmount { amount currencyCode }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price { amount currencyCode }
                image { url altText }
                product { id title handle }
              }
            }
          }
        }
      }
    }
    userErrors { field message }
  }
}
"""

CART_LINES_REMOVE_MUTATION = """
mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount { amount currencyCode }
        totalAmount { amount currencyCode }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price { amount currencyCode }
                image { url altText }
                product { id title handle }
              }
            }
          }
        }
      }
    }
    userErrors { field message }
  }
}
"""

CART_QUERY = """
query Cart($id: ID!) {
  cart(id: $id) {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price { amount currencyCode }
              image { url altText }
              product { id title handle }
            }
          }
        }
      }
    }
  }
}
"""


# ----- Transformers (clean response shapes for frontend) -----

def _flatten_edges(connection: Optional[Dict[str, Any]]) -> list:
    if not connection:
        return []
    return [e.get("node", {}) for e in connection.get("edges", [])]


def _shape_product(p: Dict[str, Any]) -> Dict[str, Any]:
    images = _flatten_edges(p.get("images"))
    variants = _flatten_edges(p.get("variants"))
    price_min = (p.get("priceRange") or {}).get("minVariantPrice") or {}
    price_max = (p.get("priceRange") or {}).get("maxVariantPrice") or {}
    options = p.get("options") or []
    return {
        "id": p.get("id"),
        "handle": p.get("handle"),
        "title": p.get("title"),
        "description": p.get("description") or "",
        "descriptionHtml": p.get("descriptionHtml") or "",
        "tags": p.get("tags") or [],
        "productType": p.get("productType") or "",
        "vendor": p.get("vendor") or "",
        "featuredImage": p.get("featuredImage"),
        "images": images,
        "priceMin": price_min,
        "priceMax": price_max,
        "options": [
            {
                "id": o.get("id"),
                "name": o.get("name"),
                "values": o.get("values") or [],
            }
            for o in options
        ],
        "variants": [
            {
                "id": v.get("id"),
                "title": v.get("title"),
                "availableForSale": v.get("availableForSale", False),
                "price": v.get("price") or {},
                "compareAtPrice": v.get("compareAtPrice") or None,
                "image": v.get("image") or None,
                "selectedOptions": v.get("selectedOptions") or [],
            }
            for v in variants
        ],
    }


def _shape_collection(c: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": c.get("id"),
        "handle": c.get("handle"),
        "title": c.get("title"),
        "description": c.get("description") or "",
        "image": c.get("image"),
    }


def _shape_cart(c: Dict[str, Any]) -> Dict[str, Any]:
    if not c:
        return {}
    lines = _flatten_edges(c.get("lines"))
    return {
        "id": c.get("id"),
        "checkoutUrl": c.get("checkoutUrl"),
        "totalQuantity": c.get("totalQuantity", 0),
        "subtotal": (c.get("cost") or {}).get("subtotalAmount") or {},
        "total": (c.get("cost") or {}).get("totalAmount") or {},
        "lines": [
            {
                "id": ln.get("id"),
                "quantity": ln.get("quantity", 0),
                "variant": ln.get("merchandise") or {},
            }
            for ln in lines
        ],
    }


# ----- Public helpers used by routes -----

async def list_collections(first: int = 20) -> list:
    data = await gql(COLLECTIONS_QUERY, {"first": first})
    nodes = _flatten_edges(data.get("collections"))
    # Filter out generic "catch-all" handles and de-dup numeric suffixes
    # (Shopify/DROPI can sync the same collection multiple times as handle-1, handle-2…)
    excluded = {"frontpage", "todos-los-productos", "todos-os-produtos", "all"}
    seen_bases = set()
    cleaned: list = []
    for n in nodes:
        handle = (n.get("handle") or "").lower()
        if not handle or handle in excluded:
            continue
        # Strip trailing "-<digits>" to detect duplicates of the same logical collection
        base = handle
        while base and base.rsplit("-", 1)[-1].isdigit():
            base = base.rsplit("-", 1)[0]
        if base in excluded or base in seen_bases:
            continue
        seen_bases.add(base)
        cleaned.append(_shape_collection(n))
    return cleaned


async def list_products(first: int = 24, collection_handle: Optional[str] = None) -> list:
    if collection_handle:
        data = await gql(COLLECTION_PRODUCTS_QUERY, {"handle": collection_handle, "first": first})
        coll = data.get("collection") or {}
        nodes = _flatten_edges(coll.get("products"))
    else:
        data = await gql(PRODUCTS_QUERY, {"first": first})
        nodes = _flatten_edges(data.get("products"))
    return [_shape_product(n) for n in nodes]


async def cart_create(lines: Optional[list] = None) -> Dict[str, Any]:
    data = await gql(CART_CREATE_MUTATION, {"input": {"lines": lines or []}})
    res = data.get("cartCreate") or {}
    if res.get("userErrors"):
        raise ShopifyError(str(res["userErrors"]))
    return _shape_cart(res.get("cart") or {})


async def cart_lines_add(cart_id: str, lines: list) -> Dict[str, Any]:
    data = await gql(CART_LINES_ADD_MUTATION, {"cartId": cart_id, "lines": lines})
    res = data.get("cartLinesAdd") or {}
    if res.get("userErrors"):
        raise ShopifyError(str(res["userErrors"]))
    return _shape_cart(res.get("cart") or {})


async def cart_lines_update(cart_id: str, lines: list) -> Dict[str, Any]:
    data = await gql(CART_LINES_UPDATE_MUTATION, {"cartId": cart_id, "lines": lines})
    res = data.get("cartLinesUpdate") or {}
    if res.get("userErrors"):
        raise ShopifyError(str(res["userErrors"]))
    return _shape_cart(res.get("cart") or {})


async def cart_lines_remove(cart_id: str, line_ids: list) -> Dict[str, Any]:
    data = await gql(CART_LINES_REMOVE_MUTATION, {"cartId": cart_id, "lineIds": line_ids})
    res = data.get("cartLinesRemove") or {}
    if res.get("userErrors"):
        raise ShopifyError(str(res["userErrors"]))
    return _shape_cart(res.get("cart") or {})


async def cart_get(cart_id: str) -> Dict[str, Any]:
    data = await gql(CART_QUERY, {"id": cart_id})
    return _shape_cart(data.get("cart") or {})
