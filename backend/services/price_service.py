
import json, re, uuid
from statistics import median
from typing import Dict, Any, List, Tuple
from datetime import datetime

from services.gemini_service import GeminiPriceSearch
from services.supabase_service import SupabaseClient  

def _to_number(price_str: str) -> float:
    return float(re.sub(r"[^\d.]", "", str(price_str))) if price_str is not None else 0.0

class PriceService:
    def __init__(self):
        self.gemini = GeminiPriceSearch()
        self.sb = SupabaseClient()

    def fetch_listings(self, material: str, unit: str, site_hint: str = "Cebu, Philippines") -> List[Dict[str, Any]]:
        prompt = (
            f"You are a cost estimation assistant trained on material pricing in the Philippines.\n"
            f"Find recent, realistic listings for {material} (unit: {unit}) in/near {site_hint}.\n"
            f"Include Wilcon, CitiHardware, Lazada, Shopee, local suppliers.\n"
            f"Return RAW JSON array ONLY (no markdown, no text), items with fields:\n"
            f'["material","brand","unit","price","vendor","location","gmaps_link"]\n'
            f'Examples of unit values: "bag", "pcs", "m3", "m2", "kg", "sheet".'
        )
        raw = self.gemini._call_gemini(prompt)
  
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        clean = match.group(0) if match else raw.strip()
        listings = json.loads(clean)
        return listings if isinstance(listings, list) else []

    def persist_listings(self, listings: List[Dict[str, Any]]) -> None:
        for item in listings:
            try:
                self.sb.save_material_price(item)  
            except Exception:
                
                pass

    def pick_unit_price(self, listings: List[Dict[str, Any]]) -> float:
        prices = [_to_number(x.get("price")) for x in listings if x.get("price")]
        return median(prices) if prices else 0.0

    def get_unit_price(self, material: str, unit: str, site_hint: str = "Cebu, Philippines", challenge_id=None) -> Tuple[float, List[Dict[str, Any]]]:
        listings = self.fetch_listings(material, unit, site_hint)
        self.persist_listings(listings)
        return self.pick_unit_price(listings), listings
