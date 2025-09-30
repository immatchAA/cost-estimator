from pydantic import BaseModel
from typing import List, Optional

class EstimateRow(BaseModel):
    cost_category: str
    description: str
    quantity: float
    unit: Optional[str] = None
    unit_price: float

class SuggestionRequest(BaseModel):
    challenge_id: str
    challenge_name: Optional[str] = None
    challenge_instructions: Optional[str] = None
    challenge_objectives: Optional[str] = None
    file_url: Optional[str] = None
    items: List[EstimateRow]