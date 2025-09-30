import json
from services.gemini_service import GeminiPriceSearch
from models.ai_suggestion_model import SuggestionRequest

class SuggestionService:
    def __init__(self):
        self.gemini = GeminiPriceSearch()

    def get_suggestion(self, req: SuggestionRequest) -> str:
        rows_text = "\n".join(
            f"{r.cost_category}: {r.description} "
            f"(qty {r.quantity} {r.unit or ''}, price {r.unit_price})"
            for r in req.items if r.description
        ) or "No items yet"

        prompt = f"""
You are an assistant giving hints for a student’s cost estimation challenge.

Challenge: {req.challenge_name or 'Unnamed'}
Instructions: {req.challenge_instructions or '—'}
Objectives: {req.challenge_objectives or '—'}
Reference plan: {req.file_url or 'No plan uploaded'}

Student’s current inputs:
{rows_text}

Please return 2–3 short, constructive suggestions.
- Do not give exact answers or costs.
- Keep it concise and encouraging.
"""

        return self.gemini._call_gemini(prompt)
