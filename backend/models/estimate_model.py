from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class AIAnalysis(BaseModel):
    analysis_id: Optional[UUID]
    challenge_id: UUID
    overall_confidence: Optional[float]
    status: Optional[str] = "draft"
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class StructuralElement(BaseModel):
    element_id: Optional[UUID]
    analysis_id: UUID
    element_type: str
    material_category: Optional[str]
    dimensions: Optional[str]
    coordinates: Optional[dict]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class AICostEstimate(BaseModel):
    estimate_id: Optional[UUID]
    analysis_id: UUID
    item_number: int
    description: str
    quantity: float
    unit: str
    unit_price: Optional[float]
    amount: Optional[float]
    cost_category: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class CostEstimatesSummary(BaseModel):
    summary_id: Optional[UUID]
    analysis_id: UUID
    earthwork_amount: float
    formwork_amount: float
    masonry_amount: float
    concrete_amount: float
    steelwork_amount: float
    carpentry_amount: float
    roofing_amount: float
    total_material_cost: float
    labor_cost: float
    contingencies_amount: float
    grand_total_cost: float
    created_at: Optional[datetime]

class EstimateItem(BaseModel):
    element_id: str
    material: str
    quantity: float
    unit: str
    unit_price: float
    total_price: float

class EstimateSummary(BaseModel):
    challenge_id: str
    total_cost: float
    currency: str
    notes: str | None = None