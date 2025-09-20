# services/gemini_service.py
import os
import json
import requests
from typing import List, Dict, Any


class GeminiPriceSearch:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            "gemini-2.0-flash:generateContent"
        )

    def _call_gemini(self, prompt: str) -> str:
        headers = {"Content-Type": "application/json"}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        resp = requests.post(f"{self.url}?key={self.api_key}", json=payload, headers=headers)
        if resp.status_code != 200:
            raise Exception(f"Gemini API error: {resp.text}")
        return resp.json()["candidates"][0]["content"]["parts"][0]["text"]

    def _safe_json_parse(self, text: str) -> Any:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = "\n".join(cleaned.split("\n")[1:-1])
        return json.loads(cleaned)

    # -------------------------
    # STEP 1: Extract elements
    # -------------------------
    def analyze_plan_extract_elements(self, plan_file_url: str) -> List[Dict]:
        """
        Calls Gemini to extract structural elements from a plan file.
        """
        prompt = f"""
You are an assistant that analyzes architectural floor plan or elevation drawings.

Input: {plan_file_url}

Task:
1. Extract all structural elements (walls, slabs, beams, columns, doors, windows, roof, etc.).
2. For each element, provide:
   - element_type (string, e.g., wall, slab, beam, column, etc.)
   - material_category (string, e.g., concrete, wood, steel, glass, etc.)
   - dimensions (string, keep original format if available, e.g., "3m x 5m x 0.2m")
   - coordinates (JSON with approximate x,y values if extractable; otherwise null)

Output strictly as a JSON array.
"""
        raw = self._call_gemini(prompt)
        return self._safe_json_parse(raw)

    # -------------------------
    # STEP 2: Generate BoQ
    # -------------------------
    def generate_cost_estimates(
        self,
        elements: List[Dict],
        challenge_id: str,
        challenge_name: str,
        challenge_objective: str,
        challenge_instructions: str,
        plan_file_urls: List[str],
        site_location: str = "Cebu, Philippines",
    ) -> List[Dict]:
        prompt = f"""
You are a senior structural cost estimator for low- to mid-rise buildings in Cebu, Philippines (metric units).
Your task is to produce a categorized Bill of Quantities (BoQ) with realistic materials and quantities
based on the provided challenge context and extracted structural elements. DO NOT include unit prices
or amounts—another service will fetch live prices.

### Challenge context
- Challenge ID: {challenge_id}
- Name/Title: {challenge_name}
- Objective/Notes: {challenge_objective}
- Instructions: {challenge_instructions}
- Files: {", ".join(plan_file_urls)}
- Site location (assume affects practices/vendors): {site_location}

### Extracted structural elements (JSON)
{json.dumps(elements, indent=2)}

### Categories (use EXACT names):
- EARTHWORK
- FORMWORK & SCAFFOLDING
- MASONRY WORK
- CONCRETE WORK
- STEELWORK
- CARPENTRY WORK
- ROOFING WORK

### Estimating rules to follow (PH/Cebu, metric):

1) EARTHWORK
- Compute excavation volume for trenches/footings: V = L × W × D (m³) from footings/strip footings.
- Backfill volume ≈ 0.8–0.9 × excavation volume after concrete volumes are placed.
- Include borrowed fill (sand/gravel), water for compaction, and (if needed) hauling/disposal.
- Units: m³ (soil, fill), truckloads (optional note), liters (water, optional).

2) FORMWORK & SCAFFOLDING
- Formwork area = surface area of concrete elements (columns, beams, slabs, walls), in m² contact area.
- Translate to plywood sheets (4x8 ft ~ 1.22m × 2.44m), studs/walers (lumber lengths), nails/tie wire.
- Include scaffolding (GI pipes or H-frames) estimated by wall heights/floor areas/element access.
- Units: m² (formwork), pcs (plywood), m (lumber/GI pipe), kg or rolls (tie wire), sets (scaffold frames).

3) MASONRY WORK
- Wall area = Height × Length (m²) → CHB quantity by block size (commonly 6”).
- Mortar volumes using typical mix (1:3 cement:sand); plastering if specified (e.g., 1:2:5).
- Include reinforcement (vertical/horizontal bars) per standard details if present.
- Units: m² (wall), pcs (CHB), bags (cement 40kg), m³ (sand), kg/pcs (rebars), kg/rolls (tie wire).

4) CONCRETE WORK
- Concrete volumes for footings, columns, beams, slabs, walls in m³.
- Mix design references (e.g., 1:2:4) to express materials: bags cement (40kg), sand m³, gravel m³.
- Do NOT include rebar here (that’s under STEELWORK).
- Units: m³ (concrete), bags (cement), m³ (sand/gravel), liters (water optional).

5) STEELWORK
- Reinforcing steel from bar schedules; specify diameters (e.g., 10, 12, 16, 20 mm) and lengths/weights.
- If structural steel is present (channels, angles, I-beams), compute by section and length.
- Units: kg (preferred) or pcs × length (m) with diameter/section clearly stated; include tie wire (kg).

6) CARPENTRY WORK (if applicable)
- Include framing lumber, blocking, headers, sheathing as indicated in elements.
- Units: m (length), pcs (for standard sizes), m² (sheathing/boards).

7) ROOFING WORK
- Roof area = plan area / cos(slope angle) if slope known; otherwise apply typical slope assumptions.
- Materials: GI roofing sheets, purlins, screws, flashing, ridge rolls, sealants.
- Units: m² (roof area), pcs/sheets (GI), m (flashing, purlins), sets (accessories).

General:
- Prefer metric units; include product forms typical in PH: 40kg cement bags, 6m rebar lengths, CHB 6".
- Include reasonable waste: 5–10% for formwork & finishes, 3–5% for steel (offcuts), as applicable.
- Base all quantities on the supplied elements and challenge context; if something is ambiguous, state a
  conservative assumption in an "assumptions" field (string) on that row.
- DO NOT invent unit prices. Set "unit_price" = null and "amount" = null for every row.

### Output format (STRICT)
Return a raw JSON array ONLY. Each item MUST match this schema:
{{
  "item_number": "<integer, sequence restarts at 1 inside each cost_category>",
  "description": "<string>",
  "quantity": "<number>",
  "unit": "<string>",
  "cost_category": "<one of the exact categories above>",
  "unit_price": null,
  "amount": null,
  "assumptions": "<string | null>"
}}
"""
        raw = self._call_gemini(prompt)
        data = self._safe_json_parse(raw)

        # Basic schema guard
        filtered = []
        ok_cats = {
            "EARTHWORK","FORMWORK & SCAFFOLDING","MASONRY WORK",
            "CONCRETE WORK","STEELWORK","CARPENTRY WORK","ROOFING WORK"
        }
        for row in data:
            if row.get("cost_category") not in ok_cats:
                continue
            row.setdefault("unit_price", None)
            row.setdefault("amount", None)
            row.setdefault("assumptions", None)
            try:
                row["quantity"] = float(row.get("quantity", 0) or 0)
            except Exception:
                row["quantity"] = 0.0
            filtered.append(row)
        return filtered
