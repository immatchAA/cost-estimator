from datetime import datetime
from models.cost_estimation_model import CostEstimateCreate, CostEstimateItemIn, CostEstimateOut
from services.supabase_service import SupabaseClient

class CostEstimationService:
    def __init__(self, sb: SupabaseClient):
        self.db = sb

    def _totals(self, items: list[CostEstimateItemIn], pct: float):
        subtotal = round(sum((i.quantity or 0) * (i.unit_price or 0) for i in items), 2)
        contingency_amount = round(subtotal * pct, 2)
        total = round(subtotal + contingency_amount, 2)
        return subtotal, contingency_amount, total

    def save_estimation(self, payload: CostEstimateCreate) -> CostEstimateOut:
        subtotal, contingency_amount, total = self._totals(payload.items, payload.contingency_percentage)

        status = "submitted" if payload.submit else "draft"

        est_id = self.db.upsert_cost_estimate(
            student_id=str(payload.student_id),
            challenge_id=str(payload.challenge_id),
            total_amount=total,
            submitted_at=datetime.utcnow().isoformat() if payload.submit else None,
            status=status,
        )

        self.db.replace_estimate_items(est_id, payload.items)

        # pass category_subtotals into summary
        self.db.upsert_estimate_summary(
            est_id=est_id,
            subtotal=subtotal,
            pct=payload.contingency_percentage,
            contingency=contingency_amount,
            total=total,
            category_subtotals=[s.dict() for s in payload.category_subtotals] if payload.category_subtotals else [],
            challenge_id=str(payload.challenge_id)
        )

        return CostEstimateOut(
            studentsCostEstimatesID=est_id,
            subtotal_amount=subtotal,
            contingency_percentage=payload.contingency_percentage,
            contingency_amount=contingency_amount,
            total_amount=total,
            submitted_at=datetime.utcnow() if payload.submit else None,
            total_material_cost_tc=subtotal,
            contingencies_percent_int=round(payload.contingency_percentage * 100),
            contingencies_amount=contingency_amount,
            grand_total_cost=total,
            category_subtotals=payload.category_subtotals or [],
            status=status,
        )

    def get_estimation(self, student_id, challenge_id):
        return self.db.get_estimate_with_items(str(student_id), str(challenge_id))


