import uuid, os, time
from datetime import datetime
from collections import defaultdict

from supabase import create_client
from dotenv import load_dotenv
from fastapi import HTTPException

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

    time.sleep(2)

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

import uuid
from datetime import datetime
from .supabase_service import SupabaseService

supasvc = SupabaseService()
supabase = supasvc.client

def save_teacher_estimates(challenge_id: str, analysis_id: str, items: list[dict], summary: dict):
    # 1. Collect ids to keep
    keep_ids = [str(i["estimate_id"]) for i in items if i.get("estimate_id")]


    if not analysis_id:
        res = supabase.table("ai_analysis") \
            .select("analysis_id") \
            .eq("challenge_id", challenge_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        if res.data:
            analysis_id = res.data[0]["analysis_id"]
        else:
            raise HTTPException(status_code=400, detail="No analysis_id found for this challenge")

    # 2. Delete rows not in keep_ids
    if keep_ids:
        supabase.table("ai_cost_estimates") \
            .delete() \
            .eq("challenge_id", challenge_id) \
            .not_.in_("estimate_id", keep_ids) \
            .execute()
    else:
        supabase.table("ai_cost_estimates").delete().eq("challenge_id", challenge_id).execute()

    # 3. Insert or update rows
    for row in items:
        if row.get("estimate_id"):
            # Update existing
            supabase.table("ai_cost_estimates").update({
                "analysis_id": analysis_id,
                "description": row["description"],
                "quantity": row["quantity"],
                "unit": row["unit"],
                "unit_price": row["unit_price"],
                "amount": row["amount"],
                "cost_category": row["cost_category"],
                "updated_at": datetime.utcnow().isoformat()
            }).eq("estimate_id", row["estimate_id"]).execute()
        else:
            # Insert new
            supabase.table("ai_cost_estimates").insert({
                "estimate_id": str(uuid.uuid4()),
                "analysis_id": analysis_id,
                "challenge_id": challenge_id,
                "item_number": row.get("item_number", 0),
                "description": row["description"],
                "quantity": row["quantity"],
                "unit": row["unit"],
                "unit_price": row["unit_price"],
                "amount": row["amount"],
                "cost_category": row["cost_category"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }).execute()

    # 4. Upsert project summary
    existing = supabase.table("cost_estimates_summary") \
        .select("summary_id") \
        .eq("challenge_id", challenge_id) \
        .limit(1).execute()

    base = {
        "analysis_id": analysis_id,
        "challenge_id": challenge_id,
        "earthwork_amount": summary["earthwork_amount"],
        "formwork_amount": summary["formwork_amount"],
        "masonry_amount": summary["masonry_amount"],
        "concrete_amount": summary["concrete_amount"],
        "steelwork_amount": summary["steelwork_amount"],
        "carpentry_amount": summary["carpentry_amount"],
        "roofing_amount": summary["roofing_amount"],
        "total_material_cost": summary["total_material_cost"],
        "labor_cost": summary["labor_cost"],
        "contingencies_amount": summary["contingencies_amount"],
        "grand_total_cost": summary["grand_total_cost"],
        "updated_at": datetime.utcnow().isoformat()
    }

    if existing.data:
        supabase.table("cost_estimates_summary").update(base) \
            .eq("summary_id", existing.data[0]["summary_id"]).execute()
    else:
        base["summary_id"] = str(uuid.uuid4())
        base["created_at"] = datetime.utcnow().isoformat()
        supabase.table("cost_estimates_summary").insert(base).execute()
