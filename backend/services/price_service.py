import json, re, uuid
from statistics import median
from typing import Dict, Any, List, Tuple
from datetime import datetime

from services.gemini_service import GeminiPriceSearch
from services.supabase_service import SupabaseClient  


def _to_number(price_str):
    if not price_str or str(price_str).strip() == "":
        return 0.0

    try:
        clean = re.sub(r"[^\d.]", "", str(price_str))
        return float(clean) if clean else 0.0
    except (ValueError, TypeError):
        return 0.0


class PriceService:
    def __init__(self):
        self.gemini = GeminiPriceSearch()
        self.sb = SupabaseClient()

    def fetch_listings(self, material: str, unit: str, size: str, site_hint: str = "Cebu, Philippines") -> List[Dict[str, Any]]:

        prompt = (
    f"You are a cost estimation assistant trained on Philippine construction materials.\n"
    f"Generate 15–20 realistic listings for:\n"
    f"- Material: {material}\n"
    f"- Size: {size}. Size Rules: If the user provided a size ('{size}'), use that exact size for every listing; if size is empty, return all realistic size variations for the material; if the material normally has no size variations, set size to 'N/A'; never output brand names or generic labels under size—only true physical dimensions (e.g., 0.4mm x 8', 2-1/2\", etc.).\n"
    f"- Unit: {unit}\n"
    f"- Location focus: {site_hint}\n\n"

    f"Rules:\n"
    f"1. The 'size' field MUST always be exactly '{size}'.\n"
    f"2. Do NOT invent your own sizes.\n"
    f"3. Vendor must NOT be empty (Provide Vendor like: Wilcon, CitiHardware, Lazada, Shopee, Citi Builders). These are just examples provide realistic vendors based in Cebu, PH.\n"
    f"4. All items must be realistic and updated Cebu, Philippines-market accurate.\n\n"
    f"5. ALL prices must be in REALISTIC PH Peso values.\n"
    f"6. Price must NEVER be a decimal like 5.5, 4.95, 6.0 — THESE ARE INVALID. Price must always include a peso sign. Use only formats like: ₱120, ₱350, ₱1,250\n"
    f"7. Provide all materials that you can search as much as possible. And provide different price range.\n"

    f"Return ONLY a raw JSON array with fields:\n"
    f"[\"material\", \"brand\", \"size\", \"unit\", \"price\", \"vendor\", \"location\"]\n\n"

    f"Follow this example structure strictly (values will vary):\n"
    f"[\n"
    f"  {{\n"
    f"    \"material\": \"{material}\",\n"
    f"    \"brand\": \"BrandName\",\n"
    f"    \"size\": \"{size}\",\n"
    f"    \"unit\": \"{unit}\",\n"
    f"    \"price\": \"₱300\",\n"
    f"    \"vendor\": \"Wilcon Depot\",\n"
    f"    \"location\": \"Cebu City\",\n"
    f"  }}\n"
    f"]\n"
)


        raw = self.gemini._call_gemini(prompt)

        match = re.search(r"\[.*\]", raw, re.DOTALL)
        clean = match.group(0) if match else raw.strip()

        if not clean:
            return []

        try:
            listings = json.loads(clean)
            return listings if isinstance(listings, list) else []
        except Exception:
            return []

    def persist_listings(self, listings: List[Dict[str, Any]]) -> None:
        for item in listings:
            try:
                self.sb.save_material_price(item)
            except Exception:
                pass

    def pick_unit_price(self, listings: List[Dict[str, Any]]) -> float:
        prices = [_to_number(x.get("price")) for x in listings if x.get("price")]
        return median(prices) if prices else 0.0

    def get_unit_price(
        self,
        material: str,
        unit: str,
        size: str,
        site_hint: str = "Cebu, Philippines",
        challenge_id=None,
    ) -> Tuple[float, List[Dict[str, Any]]]:

        listings = self.fetch_listings(material, unit, size, site_hint)

        self.persist_listings(listings)

        return self.pick_unit_price(listings), listings
