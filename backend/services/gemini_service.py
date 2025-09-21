import os, json, requests
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

        import re
        m = re.search(r"\[[\s\S]*\]", cleaned)
        if m:
            cleaned = m.group(0)
        return json.loads(cleaned)


    def analyze_plan_extract_elements(self, plan_file_url: str) -> List[Dict]:
        prompt = f"""
You are an assistant that analyzes architectural floor plan or elevation drawings.

Input: {plan_file_url}

Task:
1) Extract structural elements (walls, slabs, beams, columns, doors, windows, roof, etc.).
2) For each element provide:
   - element_type (string)
   - material_category (string)
   - dimensions (string)
   - coordinates (JSON or null)

Output strictly as a JSON array only.
"""
        raw = self._call_gemini(prompt)
        return self._safe_json_parse(raw)

    # --- NEW / FIXED: signature + prompt with cheat-sheet + JSON guard ---
    def generate_cost_estimates(
        self,
        *,
        elements: List[Dict],
        challenge_id: str,
        challenge_name: str,
        challenge_objective: str,
        challenge_instructions: str,
        plan_file_urls: List[str],
        site_location: str = "Cebu, Philippines",
    ) -> List[Dict]:
        prompt = f"""
Please act as a senior structural cost estimator.

### Project details
- Challenge ID: {challenge_id}
- Name: {challenge_name}
- Objectives: {challenge_objective}
- Instructions: {challenge_instructions}
- Uploaded files: {", ".join(plan_file_urls)}
- Site location (for practices/vendors): {site_location}

### Extracted structural elements (JSON)
{json.dumps(elements, indent=2)}

### Cost categories (use EXACT names)
- EARTHWORK
- FORMWORK & SCAFFOLDING
- MASONRY WORK
- CONCRETE WORK
- STEELWORK
- CARPENTRY WORK
- ROOFING WORK

### Reference (PH practice—use unless plans/specs say otherwise)
- EARTHWORK → excavation, backfill, gravel bedding, borrow fill.
- FORMWORK & SCAFFOLDING → phenolic/marine plywood, coco lumber, tie wire, nails, GI pipes/H-frames.
- MASONRY WORK → CHB 6", cement, sand, tie wire, small rebars (for CHB reinforcement).
- CONCRETE WORK → cement, sand, gravel, water.
- STEELWORK → deformed rebars (10/12/16/20mm × 6m), tie wire; structural steel if applicable.
- CARPENTRY WORK → lumber (2×2/2×3/2×4), plywood (1/2" or 3/4"), screws/nails.
- ROOFING WORK → pre-painted GI sheets (~0.4mm), C-purlins (2×3/2×4 × 6m), tek screws, ridge roll, flashings, sealant.

### Rules
1) List realistic materials under the correct category.
2) Provide approximate quantities and appropriate units (m³, m², pcs, bags, kg, sheet).
3) DO NOT include labor. Materials only.
4) DO NOT invent prices—set unit_price = null and amount = null.
5) If the plan likely includes a roof (typical for the building type) but drawings don’t specify details, still include ROOFING WORK with reasonable assumptions (pre-painted GI sheets, C-purlins, screws, flashings).
6) Output RAW JSON ARRAY ONLY (no markdown, no prose). Each item must follow:

{{
  "item_number": <integer, restart at 1 per cost_category>,
  "description": <string>,
  "quantity": <number>,
  "unit": <string>,
  "cost_category": <one of the exact categories above>,
  "unit_price": null,
  "amount": null,
  "assumptions": <string | null>
}}

Return ONLY the JSON array. Thank you.
"""
        raw = self._call_gemini(prompt)
        data = self._safe_json_parse(raw)

        # Light schema guard
        ok = {
            "EARTHWORK","FORMWORK & SCAFFOLDING","MASONRY WORK",
            "CONCRETE WORK","STEELWORK","CARPENTRY WORK","ROOFING WORK"
        }
        out = []
        for row in data if isinstance(data, list) else []:
            if row.get("cost_category") not in ok:
                continue
            # enforce numeric quantity; keep prices null
            try:
                row["quantity"] = float(row.get("quantity", 0) or 0)
            except Exception:
                row["quantity"] = 0.0
            row["unit_price"] = None
            row["amount"] = None
            row.setdefault("assumptions", None)
            out.append(row)
        return out
