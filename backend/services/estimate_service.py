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

    # 1) Create ai_analysis
    analysis_id = str(uuid.uuid4())
    supabase.table("ai_analysis").insert({
        "analysis_id": analysis_id,
        "challenge_id": str(challenge_id),
        "overall_confidence": 0.9,
        "status": "draft",
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    # 2) Extract elements from the plan
    elements = gemini.analyze_plan_extract_elements(plan_file_url)
    for e in elements:
        supabase.table("structural_elements").insert({
            "element_id": str(uuid.uuid4()),
            "analysis_id": analysis_id,
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

    # 4) Price each item
    category_subtotals = defaultdict(float)
    enriched = []
    for row in estimates:
        desc = row.get("description") or ""
        unit = row.get("unit") or ""
        qty  = float(row.get("quantity") or 0)
        cat  = row.get("cost_category") or "UNCATEGORIZED"

        unit_price, _listings = price_service.get_unit_price(desc, unit, site_hint=site_location)
        amount = round(qty * unit_price, 2) if unit_price else 0.0

        row["unit_price"] = unit_price if unit_price else None
        row["amount"] = amount if amount else None

        category_subtotals[cat] += amount
        enriched.append(row)

        supabase.table("ai_cost_estimates").insert({
            "estimate_id": str(uuid.uuid4()),
            "analysis_id": analysis_id,
            "item_number": row.get("item_number"),
            "description": desc,
            "quantity": qty,
            "unit": unit,
            "unit_price": row["unit_price"],
            "amount": row["amount"],
            "cost_category": cat,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

    subtotal = round(sum(category_subtotals.values()), 2)
    contingency_pct = 0.10
    contingency_amt = round(subtotal * contingency_pct, 2)
    total = round(subtotal + contingency_amt, 2)

    supabase.table("cost_estimates_summary").insert({
        "summary_id": str(uuid.uuid4()),
        "analysis_id": analysis_id,
        "subtotal_amount": subtotal,
        "contingency_percentage": contingency_pct,
        "contingency_amount": contingency_amt,
        "total_amount": total,
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    per_category = [
        {"cost_category": k, "subtotal": round(v, 2)}
        for k, v in category_subtotals.items()
    ]
    per_category.sort(key=lambda x: x["cost_category"])

    return {
        "analysis_id": analysis_id,
        "elements": elements,
        "estimates": enriched,
        "category_subtotals": per_category,
        "summary": {
            "subtotal": subtotal,
            "contingency_percentage": contingency_pct,
            "contingency_amount": contingency_amt,
            "total": total
        }
    }
