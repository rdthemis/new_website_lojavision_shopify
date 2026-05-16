"""Backend API tests for unified store endpoints + Shopify proxy fallback."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Frontend .env contains the public URL — read it directly when not exported
    env_path = "/app/frontend/.env"
    with open(env_path) as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"')
                break
BASE_URL = BASE_URL.rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ----- Health -----
class TestHealth:
    def test_health_status(self, api):
        r = api.get(f"{BASE_URL}/api/health", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "ok"
        assert "shopify_domain" in d
        assert "api_version" in d
        assert "storefront_token_configured" in d
        assert d["storefront_token_configured"] is True


# ----- Unified store collections -----
class TestStoreCollections:
    def test_collections_demo_fallback(self, api):
        r = api.get(f"{BASE_URL}/api/store/collections", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["data_source"] == "demo"
        cols = d["collections"]
        assert isinstance(cols, list)
        assert len(cols) == 4
        handles = sorted([c["handle"] for c in cols])
        assert handles == ["decoracao", "ferramentas", "moda", "tech"]
        for c in cols:
            assert c.get("title")
            assert c.get("image", {}).get("url")


# ----- Unified store products -----
class TestStoreProducts:
    def test_products_all(self, api):
        r = api.get(f"{BASE_URL}/api/store/products", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["data_source"] == "demo"
        assert len(d["products"]) == 8

    @pytest.mark.parametrize("handle,expected_count", [
        ("tech", 2),
        ("moda", 2),
        ("decoracao", 2),
        ("ferramentas", 2),
    ])
    def test_products_by_collection(self, api, handle, expected_count):
        r = api.get(f"{BASE_URL}/api/store/products", params={"collection": handle}, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["data_source"] == "demo"
        assert d["collection"] == handle
        prods = d["products"]
        assert len(prods) == expected_count
        for p in prods:
            assert p["collection_handle"] == handle
            assert p.get("featuredImage", {}).get("url")
            assert p.get("priceMin", {}).get("amount")

    def test_tech_specific_products(self, api):
        r = api.get(f"{BASE_URL}/api/store/products", params={"collection": "tech"}, timeout=20)
        assert r.status_code == 200
        titles = [p["title"] for p in r.json()["products"]]
        assert "Smart Watch Flex Pro" in titles
        assert "Wireless Earbuds Air" in titles


# ----- Checkout fallback -----
class TestCheckoutFallback:
    def test_checkout_demo_fallback_not_500(self, api):
        body = {"lines": [{"merchandiseId": "demo/variant/1", "quantity": 2}]}
        r = api.post(f"{BASE_URL}/api/store/checkout", json=body, timeout=20)
        assert r.status_code == 200, f"got {r.status_code}: {r.text}"
        d = r.json()
        assert d["data_source"] == "demo"
        assert "message" in d
        assert "lines" in d
        assert d["lines"][0]["merchandiseId"] == "demo/variant/1"
        assert d["lines"][0]["quantity"] == 2


# ----- Direct Shopify proxy (expected 502 because token invalid) -----
class TestShopifyProxy:
    def test_shopify_collections_returns_502(self, api):
        r = api.get(f"{BASE_URL}/api/shopify/collections", timeout=20)
        assert r.status_code == 502
        d = r.json()
        assert "detail" in d
        assert isinstance(d["detail"], str) and len(d["detail"]) > 0
