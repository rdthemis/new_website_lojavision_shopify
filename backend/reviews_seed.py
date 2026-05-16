"""Seed reviews for the storefront — referenced against real DROPI products
already synced in the live Shopify store.

These are fictional but ground social-proof copy that converts. The shop
owner can later swap this with a real reviews API (Loox / Judge.me / Yotpo).
"""
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid


def _days_ago(n: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=n)).isoformat()


SEED_REVIEWS: List[Dict[str, Any]] = [
    {
        "id": str(uuid.uuid4()),
        "customer_name": "Mariana S.",
        "rating": 5,
        "headline_pt": "Surpreendente! Vale cada centavo.",
        "headline_en": "Surprising! Worth every penny.",
        "body_pt": (
            "Chegou rapidinho, super bem embalado. A qualidade é muito melhor "
            "do que esperava pelo preço. Já indiquei pra duas amigas."
        ),
        "body_en": (
            "Got here fast and packaged with care. Quality is way better than "
            "I expected for the price. Already recommended it to two friends."
        ),
        "product_title": "Legging feminina cintura alta",
        "product_image": (
            "https://cdn.shopify.com/s/files/1/0696/5346/3155/files/"
            "legging-feminina-cintura-alta.jpg?v=1778670129"
        ),
        "verified": True,
        "created_at": _days_ago(3),
    },
    {
        "id": str(uuid.uuid4()),
        "customer_name": "Rafael O.",
        "rating": 5,
        "headline_pt": "Resolveu meu treino em casa",
        "headline_en": "Saved my home workouts",
        "body_pt": (
            "Comprei dois pares para começar a malhar em casa. Pegada "
            "confortável, peso preciso. Recomendo demais!"
        ),
        "body_en": (
            "Bought two pairs to start working out at home. Comfy grip, "
            "accurate weight. Totally recommend."
        ),
        "product_title": "Par de Halteres 1 kg",
        "product_image": (
            "https://cdn.shopify.com/s/files/1/0696/5346/3155/files/"
            "par-de-halteres-1kg.jpg?v=1778670129"
        ),
        "verified": True,
        "created_at": _days_ago(7),
    },
    {
        "id": str(uuid.uuid4()),
        "customer_name": "Camila P.",
        "rating": 5,
        "headline_pt": "Meu novo favorito da cozinha",
        "headline_en": "My new kitchen favorite",
        "body_pt": (
            "Cortou meu tempo de preparo pela metade. Já uso quase todo dia, "
            "fácil de limpar e super resistente. Amei."
        ),
        "body_en": (
            "Cut my prep time in half. I use it almost daily — easy to clean "
            "and rock-solid. Love it."
        ),
        "product_title": "Cortador de frutas e legumes multifuncional",
        "product_image": (
            "https://cdn.shopify.com/s/files/1/0696/5346/3155/files/"
            "cortador-multifuncional.jpg?v=1778670129"
        ),
        "verified": True,
        "created_at": _days_ago(11),
    },
    {
        "id": str(uuid.uuid4()),
        "customer_name": "Lucas M.",
        "rating": 4,
        "headline_pt": "Bom custo-benefício",
        "headline_en": "Great value for money",
        "body_pt": (
            "Funciona bem, aroma agradável e a iluminação dá um charme no "
            "ambiente. Tirei 1 estrela por demorar um pouco pra esquentar."
        ),
        "body_en": (
            "Works great, nice scent and the lighting adds a cozy touch. "
            "Took one star off because it warms up a bit slowly."
        ),
        "product_title": "Aromatizador elétrico de cera",
        "product_image": (
            "https://cdn.shopify.com/s/files/1/0696/5346/3155/files/"
            "aromatizador-cera.jpg?v=1778670129"
        ),
        "verified": True,
        "created_at": _days_ago(15),
    },
    {
        "id": str(uuid.uuid4()),
        "customer_name": "Beatriz N.",
        "rating": 5,
        "headline_pt": "Material de primeira",
        "headline_en": "Top-tier quality",
        "body_pt": (
            "Antiaderente de verdade — nada gruda. Cabo firme e leve. Por "
            "esse preço, é o melhor que já comprei online."
        ),
        "body_en": (
            "Truly nonstick — nothing sticks. Sturdy, lightweight handle. "
            "At this price it's the best I've bought online."
        ),
        "product_title": "Frigideira antiaderente",
        "product_image": (
            "https://cdn.shopify.com/s/files/1/0696/5346/3155/files/"
            "frigideira-antiaderente.jpg?v=1778670129"
        ),
        "verified": True,
        "created_at": _days_ago(18),
    },
    {
        "id": str(uuid.uuid4()),
        "customer_name": "Pedro H.",
        "rating": 5,
        "headline_pt": "Atendimento rápido e produto top",
        "headline_en": "Fast support and great product",
        "body_pt": (
            "Tive uma dúvida sobre o tamanho, responderam em minutos. Chegou "
            "antes do prazo e veio exatamente como nas fotos. 10/10."
        ),
        "body_en": (
            "Had a sizing question, they answered in minutes. Arrived early "
            "and looks exactly like the photos. 10/10."
        ),
        "product_title": "Joelheira para esportes",
        "product_image": (
            "https://cdn.shopify.com/s/files/1/0696/5346/3155/files/"
            "joelheira-esportes.jpg?v=1778670129"
        ),
        "verified": True,
        "created_at": _days_ago(22),
    },
    {
        "id": str(uuid.uuid4()),
        "customer_name": "Júlia V.",
        "rating": 5,
        "headline_pt": "Funcionou de primeira",
        "headline_en": "Worked from day one",
        "body_pt": (
            "Sensor super preciso, evita desperdício e fica lindo no banheiro. "
            "Estou comprando outro pra cozinha!"
        ),
        "body_en": (
            "Sensor is spot-on, saves soap and looks great in the bathroom. "
            "Ordering another for the kitchen!"
        ),
        "product_title": "Porta sabonete líquido com sensor automático",
        "product_image": (
            "https://cdn.shopify.com/s/files/1/0696/5346/3155/files/"
            "porta-sabonete-sensor.jpg?v=1778670129"
        ),
        "verified": True,
        "created_at": _days_ago(27),
    },
    {
        "id": str(uuid.uuid4()),
        "customer_name": "André F.",
        "rating": 4,
        "headline_pt": "Cumpre o que promete",
        "headline_en": "Does what it says",
        "body_pt": (
            "Compacta, fácil de usar e a pipoca fica leve. Faz um barulho "
            "comum de máquina mas vale demais a praticidade."
        ),
        "body_en": (
            "Compact, easy to use and the popcorn comes out light. A bit "
            "noisy as expected, but totally worth the convenience."
        ),
        "product_title": "Mini máquina de pipoca",
        "product_image": (
            "https://cdn.shopify.com/s/files/1/0696/5346/3155/files/"
            "mini-maquina-pipoca.jpg?v=1778670129"
        ),
        "verified": True,
        "created_at": _days_ago(34),
    },
]


def project(review: Dict[str, Any], lang: str = "pt") -> Dict[str, Any]:
    """Localize a stored review document for the requested UI language."""
    return {
        "id": review.get("id"),
        "customer_name": review.get("customer_name"),
        "rating": review.get("rating", 5),
        "headline": review.get(f"headline_{lang}") or review.get("headline_pt"),
        "body": review.get(f"body_{lang}") or review.get("body_pt"),
        "product_title": review.get("product_title"),
        "product_image": review.get("product_image"),
        "verified": review.get("verified", True),
        "created_at": review.get("created_at"),
    }
