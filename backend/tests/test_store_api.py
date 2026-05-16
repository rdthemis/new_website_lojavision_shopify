"""Backend API tests for unified store endpoints + Shopify proxy + newsletter."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
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
        assert d["storefront_token_configured"] is True
        assert d["shopify_domain"]
        assert d["api_version"]


# ----- Unified store collections (LIVE Shopify) -----
class TestStoreCollections:
    def test_collections_from_shopify(self, api):
        r = api.get(f"{BASE_URL}/api/store/collections?first=50", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["data_source"] == "shopify"
        cols = d["collections"]
        assert isinstance(cols, list) and len(cols) > 0
        handles = [c["handle"] for c in cols]
        # Cleaned: must not include catch-all collections
        assert "frontpage" not in handles
        assert "todos-los-productos" not in handles
        for c in cols:
            assert c.get("title")
            assert "_id" not in c


# ----- Unified store products (LIVE Shopify) -----
class TestStoreProducts:
    def test_products_from_shopify(self, api):
        r = api.get(f"{BASE_URL}/api/store/products?first=5", timeout=25)
        assert r.status_code == 200
        d = r.json()
        assert d["data_source"] == "shopify"
        prods = d["products"]
        assert isinstance(prods, list) and len(prods) > 0
        p = prods[0]
        assert p.get("id", "").startswith("gid://shopify/Product/")
        assert p.get("title")
        # BRL pricing
        price = p.get("priceMin") or {}
        assert price.get("currencyCode") == "BRL"
        assert float(price.get("amount")) > 0
        # No _id leak
        assert "_id" not in p


# ----- Checkout (LIVE Shopify -> real checkoutUrl) -----
class TestCheckoutShopify:
    def test_checkout_returns_lojavirtualvision_url(self, api):
        # Pull a real variant id first
        pr = api.get(f"{BASE_URL}/api/store/products?first=1", timeout=20).json()
        variants = pr["products"][0].get("variants") or []
        assert variants, "expected at least one variant for live product"
        variant_id = variants[0]["id"]

        body = {"lines": [{"merchandiseId": variant_id, "quantity": 1}]}
        r = api.post(f"{BASE_URL}/api/store/checkout", json=body, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["data_source"] == "shopify"
        cart = d["cart"]
        checkout_url = d.get("checkoutUrl") or cart.get("checkoutUrl")
        assert checkout_url and "lojavirtualvision.com" in checkout_url


# ----- Newsletter subscribe (new feature) -----
class TestNewsletter:
    @pytest.fixture(scope="class")
    def fresh_email(self):
        return f"newsletter-test-{uuid.uuid4().hex[:10]}@vision.com"

    def test_subscribe_first_time(self, api, fresh_email):
        r = api.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": fresh_email, "lang": "pt"},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["ok"] is True
        assert d["already_subscribed"] is False
        assert d["coupon_code"] == "BEMVINDO10"
        assert d["discount_percent"] == 10
        assert d["email"] == fresh_email.lower()
        assert "_id" not in d

    def test_subscribe_duplicate_returns_already(self, api, fresh_email):
        # Resubmit same email (uppercase to also verify normalisation)
        r = api.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": fresh_email.upper(), "lang": "pt"},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["ok"] is True
        assert d["already_subscribed"] is True
        assert d["coupon_code"] == "BEMVINDO10"
        assert d["email"] == fresh_email.lower()
        assert "_id" not in d

    @pytest.mark.parametrize("bad_email", ["not-an-email", "", "abc@", "noatsign.com", "   "])
    def test_subscribe_invalid_email(self, api, bad_email):
        r = api.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": bad_email},
            timeout=15,
        )
        assert r.status_code == 400, f"{bad_email!r} expected 400, got {r.status_code}"
        d = r.json()
        assert d.get("detail") == "invalid_email"

    def test_count_endpoint_increments(self, api):
        r1 = api.get(f"{BASE_URL}/api/newsletter/subscribers/count", timeout=15)
        assert r1.status_code == 200
        before = r1.json()["count"]
        assert isinstance(before, int)

        new_email = f"newsletter-count-{uuid.uuid4().hex[:10]}@vision.com"
        sub = api.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": new_email},
            timeout=15,
        )
        assert sub.status_code == 200

        r2 = api.get(f"{BASE_URL}/api/newsletter/subscribers/count", timeout=15)
        after = r2.json()["count"]
        assert after == before + 1, f"count did not increment: {before} -> {after}"


# ----- Direct Shopify proxy (now LIVE, expect 200) -----
class TestShopifyProxy:
    def test_shopify_collections_direct(self, api):
        r = api.get(f"{BASE_URL}/api/shopify/collections", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert "collections" in d
        assert isinstance(d["collections"], list)
