"""Demo data for fallback when Shopify is unreachable / unauthorised.

These shapes EXACTLY mirror the transformed Shopify product/collection responses
so frontend code remains identical regardless of source.
"""
from typing import List, Dict, Any


DEMO_COLLECTIONS: List[Dict[str, Any]] = [
    {
        "id": "demo/collection/tech",
        "handle": "tech",
        "title": "Tech",
        "description": "Eletrônicos & gadgets inteligentes",
        "image": {
            "url": "https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlbGVjdHJvbmljcyUyMHBhc3RlbCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
            "altText": "Tech category",
        },
    },
    {
        "id": "demo/collection/moda",
        "handle": "moda",
        "title": "Moda",
        "description": "Tendências e estilo jovem",
        "image": {
            "url": "https://images.unsplash.com/photo-1774773133575-64e79d3be22c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwxfHx0cmVuZHklMjB5b3V0aCUyMGZhc2hpb24lMjBicmlnaHR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
            "altText": "Fashion category",
        },
    },
    {
        "id": "demo/collection/decoracao",
        "handle": "decoracao",
        "title": "Decoração",
        "description": "Para casas com personalidade",
        "image": {
            "url": "https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob21lJTIwZGVjb3IlMjBicmlnaHR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
            "altText": "Home decor category",
        },
    },
    {
        "id": "demo/collection/ferramentas",
        "handle": "ferramentas",
        "title": "Ferramentas",
        "description": "Equipamento que entrega resultado",
        "image": {
            "url": "https://images.unsplash.com/photo-1671803854413-0773f8de4f8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjB0b29scyUyMGJyaWdodCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
            "altText": "Tools category",
        },
    },
]


def _price(amount: str, currency: str = "BRL") -> Dict[str, str]:
    return {"amount": amount, "currencyCode": currency}


def _make(idx: int, handle: str, title: str, desc: str, price: str, image: str,
          collection_handle: str, product_type: str) -> Dict[str, Any]:
    img = {"url": image, "altText": title}
    return {
        "id": f"demo/product/{idx}",
        "handle": handle,
        "title": title,
        "description": desc,
        "tags": [collection_handle, product_type.lower()],
        "productType": product_type,
        "vendor": "Vision Store",
        "featuredImage": img,
        "images": [img],
        "priceMin": _price(price),
        "priceMax": _price(price),
        "variants": [
            {
                "id": f"demo/variant/{idx}",
                "title": "Default",
                "availableForSale": True,
                "price": _price(price),
            }
        ],
        "collection_handle": collection_handle,
    }


DEMO_PRODUCTS: List[Dict[str, Any]] = [
    _make(
        1, "smart-watch-flex", "Smart Watch Flex Pro",
        "Relógio inteligente com monitor cardíaco, GPS integrado e bateria de 7 dias. / "
        "Smartwatch with heart rate monitor, built-in GPS and 7-day battery life.",
        "299.90",
        "https://images.unsplash.com/photo-1665054806483-5e86924a5835?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBlbGVjdHJvbmljcyUyMHBhc3RlbCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
        "tech", "Eletrônicos",
    ),
    _make(
        2, "wireless-earbuds-air", "Wireless Earbuds Air",
        "Fones sem fio com cancelamento de ruído ativo e som imersivo. / "
        "Wireless earbuds with active noise cancellation and immersive sound.",
        "189.00",
        "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBlbGVjdHJvbmljcyUyMHBhc3RlbCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
        "tech", "Eletrônicos",
    ),
    _make(
        3, "linen-overshirt", "Camisa Linho Soft",
        "Camisa de linho oversized — leveza e elegância no dia a dia. / "
        "Oversized linen overshirt — easy elegance for every day.",
        "149.90",
        "https://images.unsplash.com/photo-1766465524004-f1649d7d8236?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHw0fHx0cmVuZHklMjB5b3V0aCUyMGZhc2hpb24lMjBicmlnaHR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
        "moda", "Vestuário",
    ),
    _make(
        4, "youth-set", "Conjunto Youth Edit",
        "Look completo casual chic para qualquer ocasião. / "
        "Complete casual chic outfit for any occasion.",
        "279.00",
        "https://images.unsplash.com/photo-1778480976317-d25017eed6e5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwyfHx0cmVuZHklMjB5b3V0aCUyMGZhc2hpb24lMjBicmlnaHR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
        "moda", "Vestuário",
    ),
    _make(
        5, "ceramic-vase", "Vaso Cerâmica Curve",
        "Vaso artesanal de cerâmica para ambientes contemporâneos. / "
        "Handcrafted ceramic vase for contemporary spaces.",
        "89.90",
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBob21lJTIwZGVjb3IlMjBicmlnaHR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
        "decoracao", "Decoração",
    ),
    _make(
        6, "wall-art-prints", "Trio Quadros Print",
        "Trio de quadros decorativos para sala — moldura natural inclusa. / "
        "Trio of decorative prints — natural frames included.",
        "199.00",
        "https://images.unsplash.com/photo-1672860044506-e3ec09653e82?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBob21lJTIwZGVjb3IlMjBicmlnaHR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
        "decoracao", "Decoração",
    ),
    _make(
        7, "cordless-drill", "Parafusadeira Brushless 18V",
        "Parafusadeira sem fio com motor brushless e duas baterias. / "
        "Cordless brushless drill with two batteries — pro-grade power.",
        "459.00",
        "https://images.unsplash.com/photo-1672033282598-662d5a93b9f4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjB0b29scyUyMGJyaWdodCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
        "ferramentas", "Ferramentas",
    ),
    _make(
        8, "tool-kit-essential", "Kit Ferramentas Essencial",
        "Kit completo de 24 peças para projetos caseiros e profissionais. / "
        "Complete 24-piece toolkit for home and pro projects.",
        "329.90",
        "https://images.unsplash.com/photo-1750054976309-9164e39cdc8d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0b29scyUyMGJyaWdodCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzc4OTA1OTYyfDA&ixlib=rb-4.1.0&q=85",
        "ferramentas", "Ferramentas",
    ),
]


def filter_demo_products(collection_handle: str = None) -> List[Dict[str, Any]]:
    if not collection_handle:
        return DEMO_PRODUCTS
    return [p for p in DEMO_PRODUCTS if p.get("collection_handle") == collection_handle]
