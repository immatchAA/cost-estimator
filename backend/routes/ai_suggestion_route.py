from fastapi import APIRouter
from models.ai_suggestion_model import SuggestionRequest
from services.ai_suggestion_service import SuggestionService

router = APIRouter()
service = SuggestionService()

@router.post("/ai-suggestions")
def ai_suggestions(req: SuggestionRequest):
    suggestion = service.get_suggestion(req)
    return {"suggestion": suggestion}
