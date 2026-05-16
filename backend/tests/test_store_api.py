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


# ----- Product detail fields (modal needs these) -----
class TestStoreProductDetailFields:
    """New fields required for the Product Detail Modal."""

    def test_products_expose_modal_fields(self, api):
        r = api.get(f"{BASE_URL}/api/store/products?first=3", timeout=25)
        assert r.status_code == 200
        d = r.json()
        prods = d["products"]
        assert len(prods) >= 1
        for p in prods:
            # descriptionHtml is a string (possibly empty)
            assert "descriptionHtml" in p
            assert isinstance(p["descriptionHtml"], str)
            # options is an array of {id, name, values:[]}
            assert "options" in p and isinstance(p["options"], list)
            for o in p["options"]:
                assert "name" in o
                assert "values" in o and isinstance(o["values"], list)
            # variants enriched
            assert p.get("variants"), "expected at least one variant"
            for v in p["variants"]:
                assert "selectedOptions" in v and isinstance(v["selectedOptions"], list)
                for so in v["selectedOptions"]:
                    assert "name" in so and "value" in so
                # image can be None or a dict with url
                if v.get("image") is not None:
                    assert isinstance(v["image"], dict)
                    assert "url" in v["image"]
                # compareAtPrice can be None or dict
                if v.get("compareAtPrice") is not None:
                    assert isinstance(v["compareAtPrice"], dict)
            assert "_id" not in p

    def test_collection_products_share_same_shape(self, api):
        # Reused fragment — same enriched shape via collection endpoint
        r = api.get(
            f"{BASE_URL}/api/store/products?collection=mejores-ventas&first=3",
            timeout=25,
        )
        assert r.status_code == 200
        d = r.json()
        prods = d.get("products") or []
        if not prods:
            pytest.skip("mejores-ventas collection empty on this storefront")
        p = prods[0]
        assert "descriptionHtml" in p
        assert "options" in p and isinstance(p["options"], list)
        assert p.get("variants"), "expected at least one variant"
        v = p["variants"][0]
        assert "selectedOptions" in v
        assert "image" in v
        assert "compareAtPrice" in v
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


# ----- Reviews (social proof, auto-seeded on first request) -----
class TestReviews:
    def test_reviews_pt_default(self, api):
        r = api.get(f"{BASE_URL}/api/reviews?lang=pt&limit=8", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["lang"] == "pt"
        assert d["total"] == 8
        assert isinstance(d["average_rating"], (int, float))
        assert 4.5 <= d["average_rating"] <= 5.0
        reviews = d["reviews"]
        assert len(reviews) == 8
        for rv in reviews:
            assert "_id" not in rv
            assert rv.get("id")
            assert rv.get("customer_name")
            assert isinstance(rv.get("rating"), int) and 1 <= rv["rating"] <= 5
            assert rv.get("headline")
            assert rv.get("body")
            assert rv.get("product_title")
            assert rv.get("product_image")
            assert rv.get("verified") is True
            assert rv.get("created_at")
            # localized fields should NOT leak raw _en/_pt keys
            assert "headline_en" not in rv
            assert "headline_pt" not in rv
            assert "body_en" not in rv
            assert "body_pt" not in rv

    def test_reviews_en_localization(self, api):
        rp = api.get(f"{BASE_URL}/api/reviews?lang=pt&limit=8", timeout=20).json()
        re_ = api.get(f"{BASE_URL}/api/reviews?lang=en&limit=8", timeout=20).json()
        assert re_["lang"] == "en"
        assert re_["total"] == 8
        # Same ids in same order, different headlines/bodies
        pt_by_id = {r["id"]: r for r in rp["reviews"]}
        en_by_id = {r["id"]: r for r in re_["reviews"]}
        assert set(pt_by_id.keys()) == set(en_by_id.keys())
        # At least one headline/body differs (proves localization)
        differs = sum(
            1
            for i in pt_by_id
            if pt_by_id[i]["headline"] != en_by_id[i]["headline"]
            or pt_by_id[i]["body"] != en_by_id[i]["body"]
        )
        assert differs >= 7, f"expected localization, only {differs} differ"

    def test_reviews_limit_3_sorted_desc(self, api):
        r = api.get(f"{BASE_URL}/api/reviews?limit=3", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert len(d["reviews"]) == 3
        # total still reflects full collection
        assert d["total"] == 8
        # ordered by created_at desc
        dates = [rv["created_at"] for rv in d["reviews"]]
        assert dates == sorted(dates, reverse=True)

    def test_reviews_limit_caps_at_50(self, api):
        r = api.get(f"{BASE_URL}/api/reviews?limit=100", timeout=20)
        assert r.status_code == 200
        d = r.json()
        # Only 8 seeded; even with cap 50 we only get up to total
        assert len(d["reviews"]) <= 50
        assert len(d["reviews"]) == d["total"]
        assert d["total"] == 8

    def test_reviews_idempotent_seed(self, api):
        # Hit endpoint twice — total must stay at 8 (no duplicate seeding)
        d1 = api.get(f"{BASE_URL}/api/reviews?limit=8", timeout=20).json()
        d2 = api.get(f"{BASE_URL}/api/reviews?limit=8", timeout=20).json()
        assert d1["total"] == 8
        assert d2["total"] == 8
        ids1 = {r["id"] for r in d1["reviews"]}
        ids2 = {r["id"] for r in d2["reviews"]}
        assert ids1 == ids2

    def test_reviews_invalid_lang_falls_back_to_pt(self, api):
        r = api.get(f"{BASE_URL}/api/reviews?lang=zz&limit=2", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["lang"] == "pt"


# ----- Direct Shopify proxy (now LIVE, expect 200) -----
class TestShopifyProxy:
    def test_shopify_collections_direct(self, api):
        r = api.get(f"{BASE_URL}/api/shopify/collections", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert "collections" in d
        assert isinstance(d["collections"], list)
