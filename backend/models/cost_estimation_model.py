from pydantic import BaseModel, Field, conlist
from typing import List, Optional, Annotated
from uuid import UUID
from datetime import datetime

class CostEstimateItemIn(BaseModel):
    cost_category: str = Field(..., min_length=1)
    material_name: str = Field(..., min_length=1)
    quantity: float = Field(..., ge=0)
    unit: Optional[str] = None
    unit_price: float = Field(..., ge=0)
    cost_category: str

class CategorySubtotalIn(BaseModel):
    cost_category: str
    subtotal: float

class CostEstimateCreate(BaseModel):
    student_id: UUID
    challenge_id: UUID
    items: Annotated[list[CostEstimateItemIn], conlist(CostEstimateItemIn, min_length=1)]
    contingency_percentage: float = 0.10
    submit: bool = False
    category_subtotals: List[CategorySubtotalIn] = []
    status: Optional[str] = None

class CostEstimateOut(BaseModel):
    studentsCostEstimatesID: UUID
    subtotal_amount: float
    contingency_percentage: float
    contingency_amount: float
    total_amount: float
    submitted_at: Optional[datetime] = None
    total_material_cost_tc: float
    contingencies_percent_int: int
    contingencies_amount: float
    grand_total_cost: float
    category_subtotals: List[CategorySubtotalIn] = []
    status: str


    