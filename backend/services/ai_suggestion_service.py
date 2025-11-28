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
You are an assistant giving short, practical hints for a student's construction
cost estimation challenge. Keep all suggestions brief and actionable.

Challenge: {req.challenge_name or 'Unnamed'}
Instructions: {req.challenge_instructions or '—'}
Objectives: {req.challenge_objectives or '—'}
Reference plan: {req.file_url}

Student’s current inputs:
{rows_text}

Your task:
- Give 3–5 short hints only.
- Each hint must be 1–2 sentences.
- NO long paragraphs.
- NO full explanations.
- NO exact numbers or solutions.
- Focus on: missing materials, wrong units, wrong quantities, or overlooked plan details.
- Suggest materials based on Cebu, PH as one of your suggestions.

Examples of the format:
- “Consider using CHB for exterior walls; it's more cost-efficient than your current choice.”
- “Recheck your slab quantity — the area on the plan seems larger.”
- “Verify door and window openings; your list looks incomplete.”
- “Add formwork materials; columns and beams require it.”

Return exactly 4 numbered suggestions.

Each suggestion MUST:
- start with “1.” “2.” “3.” “4.”
- be on its own line
- be 1–2 sentences only
- NOT combine multiple hints into one line
"""


        return self.gemini._call_gemini(prompt)
