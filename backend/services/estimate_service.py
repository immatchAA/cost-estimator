import uuid, os
from datetime import datetime
from collections import defaultdict

from supabase import create_client
from dotenv import load_dotenv

from services.gemini_service import GeminiPriceSearch
from services.supabase_service import SupabaseService
from services.price_service import PriceService

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
gemini = GeminiPriceSearch()
supasvc = SupabaseService()
price_service = PriceService()


def run_ai_estimation(challenge_id: str, plan_file_url: str):
    # 0) Fetch challenge context
    challenge = supasvc.get_challenge(challenge_id)
    if not challenge:
        raise ValueError(f"challenge_id not found: {challenge_id}")

    challenge_name = challenge.get("challenge_name") or ""
    challenge_obj  = challenge.get("challenge_objectives") or ""
    challenge_ins  = challenge.get("challenge_instructions") or ""
    site_location  = challenge.get("site_location") or "Cebu, Philippines"

    elements_result = gemini.analyze_plan_extract_elements(plan_file_url)
    if isinstance(elements_result, list):
        elements = elements_result
        confidence = 0.50
    else:
        elements = elements_result.get("elements", [])
        confidence = elements_result.get("confidence", 0.50)

    # 1) Create ai_analysis
    analysis_id = str(uuid.uuid4())
    supabase.table("ai_analysis").insert({
        "analysis_id": analysis_id,
        "challenge_id": str(challenge_id),
        "overall_confidence": confidence,
        "status": "draft",
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    # 2) Extract elements from the plan
    for e in elements:
        supabase.table("structural_elements").insert({
            "element_id": str(uuid.uuid4()),
            "analysis_id": analysis_id,
             "challenge_id": str(challenge_id),
            **e,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

    # 3) Generate categorized BoQ rows (without prices)
    estimates = gemini.generate_cost_estimates(
        elements=elements,
        challenge_id=challenge_id,
        challenge_name=challenge_name,
        challenge_objective=challenge_obj,
        challenge_instructions=challenge_ins,
        plan_file_urls=[plan_file_url],
    )

    
    per_cat_index = defaultdict(int)
    for row in estimates:
        cat = row.get("cost_category") or "UNCATEGORIZED"
        per_cat_index[cat] += 1
        row["item_number"] = per_cat_index[cat]

    # 4) Price each item
    category_subtotals = defaultdict(float)
    enriched = []
    for row in estimates:
        desc = row.get("description") or ""
        unit_raw = (row.get("unit") or "").strip().lower()
        unit_map = {
            "sheets": "sheet",
            "sheet(s)": "sheet",
            "bags": "bag",
            "bag(s)": "bag",
            "kgs": "kg",
            "kg(s)": "kg",
            "pcs.": "pcs",
            "pieces": "pcs",
            "piece": "pcs",
            "meters": "m",
            "metre": "m",
            "metres": "m",
            "sqm": "m²",
            "sq.m": "m²",
            "sq m": "m²",
            "sq. m": "m²",
            "cubic meter": "m³",
            "cubic meters": "m³",
            "bd ft": "board ft",     
            "board feet": "board ft", 
            "tubes": "tube",
        }
        unit = unit_map.get(unit_raw, unit_raw)
        row["unit"] = unit
        qty  = float(row.get("quantity") or 0)
        cat  = row.get("cost_category") or "UNCATEGORIZED"

        
        desc = row.get("description") or ""

        skip_keywords = ("steel beam", "steel column", "i-beam", "h-beam")
        if any(k in desc.lower() for k in skip_keywords):
            unit_price = 0.0
            _listings = []
        elif desc.lower().startswith("water"):
            unit_price = 0.0
            _listings = []
        else:
            unit_price, _listings = price_service.get_unit_price(
    desc, unit, site_hint=site_location, challenge_id=challenge_id
)

        amount = round(qty * unit_price, 2) if unit_price else 0.0

        row["unit_price"] = unit_price if unit_price else 0.0
        row["amount"] = amount

        category_subtotals[cat] += amount
        enriched.append(row)

        supabase.table("ai_cost_estimates").insert({
            "estimate_id": str(uuid.uuid4()),
            "analysis_id": analysis_id,
            "challenge_id": str(challenge_id),
            "item_number": row.get("item_number"),
            "description": desc,
            "quantity": qty,
            "unit": unit,
            "unit_price": row["unit_price"],
            "amount": row["amount"],
            "cost_category": cat,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

    for estimate in estimates:
        category = estimate.get("cost_category", "").upper()
        amount = estimate.get("amount", 0.0) or 0.0
        if category not in category_subtotals:
            category_subtotals[category] = 0.0
        category_subtotals[category] += amount

    earthwork = category_subtotals.get("EARTHWORK", 0.0)
    formwork = category_subtotals.get("FORMWORK & SCAFFOLDING", 0.0)
    masonry = category_subtotals.get("MASONRY WORK", 0.0)
    concrete = category_subtotals.get("CONCRETE WORK", 0.0)
    steelwork = category_subtotals.get("STEELWORK", 0.0)
    carpentry = category_subtotals.get("CARPENTRY WORK", 0.0)
    roofing = category_subtotals.get("ROOFING WORK", 0.0)

    total_material_cost = round(sum([
    earthwork, formwork, masonry, concrete, steelwork, carpentry, roofing
    ]), 2)

    labor_cost = round(total_material_cost * 0.4, 2)
    contingencies = round((total_material_cost + labor_cost) * 0.05, 2)
    grand_total = round(total_material_cost + labor_cost + contingencies, 2)


    supabase.table("cost_estimates_summary").insert({
        "summary_id": str(uuid.uuid4()),
        "analysis_id": analysis_id,
        "earthwork_amount": earthwork,
        "formwork_amount": formwork,
        "masonry_amount": masonry,
        "concrete_amount": concrete,
        "steelwork_amount": steelwork,
        "carpentry_amount": carpentry,
        "roofing_amount": roofing,
        "total_material_cost": total_material_cost,
        "labor_cost": labor_cost,
        "contingencies_amount": contingencies,
        "grand_total_cost": grand_total,
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    per_category = [
        {"cost_category": k, "subtotal": round(v, 2)}
        for k, v in category_subtotals.items()
    ]
    per_category.sort(key=lambda x: x["cost_category"])

    return {
        "analysis_id": analysis_id,
        "confidence": confidence,
        "elements": elements,
        "estimates": enriched,
        "category_subtotals": per_category,
        "summary": {
            "earthwork_amount": earthwork,
            "formwork_amount": formwork,
            "masonry_amount": masonry,
            "concrete_amount": concrete,
            "steelwork_amount": steelwork,
            "carpentry_amount": carpentry,
            "roofing_amount": roofing,
            "total_material_cost": total_material_cost,
            "labor_cost": labor_cost,
            "contingencies_amount": contingencies,
            "grand_total_cost": grand_total
        }
    }
