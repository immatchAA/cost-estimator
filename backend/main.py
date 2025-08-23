from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes.challenges import router as challenges_router

from pydantic import BaseModel
from services.gemini_service import GeminiPriceSearch
from services.supabase_service import SupabaseClient
import json
import re

app = FastAPI()
app.include_router(challenges_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini = GeminiPriceSearch()
supabase = SupabaseClient()

class MaterialRequest(BaseModel):
    material: str

@app.post("/search_price")
async def search_price(request: MaterialRequest):
    material = request.material
    if not material:
        raise HTTPException(status_code=400, detail="Missing material")

    try:
        prompt = (
            f"You are a cost estimation assistant trained on the latest material pricing information in the Philippines. "
            f"Find the most recent and realistic listings for {material} available in Cebu and nearby areas. "
            f"Include a variety of brands and store types — such as Wilcon Depot, CitiHardware, Lazada, Shopee, local hardware suppliers, and other known vendors. "
            f"Your goal is to simulate the best possible multi-source listings based on your knowledge. "
            f"For each listing, return the following fields:\n"
            "- material\n"
            "- brand\n"
            "- unit (e.g., per bag, per piece, per kg)\n"
            "- price (in PHP)\n"
            "- vendor/store name\n"
            "- location (e.g., Cebu City, Mandaue, Talisay)\n"
            "- optional: Google Maps link (gmaps_link)\n\n"
            "Strictly return the output as a **raw JSON array only** — do NOT include markdown formatting, do NOT wrap the result with backticks (```) or 'json'. "
            "Return only the valid JSON array like this:\n"
            "[\n"
            "  {\n"
            "    \"material\": \"Cement\",\n"
            "    \"brand\": \"Holcim Excel\",\n"
            "    \"unit\": \"40kg bag\",\n"
            "    \"price\": \"₱250\",\n"
            "    \"vendor\": \"Wilcon Depot\",\n"
            "    \"location\": \"Cebu City\",\n"
            "    \"gmaps_link\": \"https://goo.gl/maps/abc123\"\n"
            "  },\n"
            "  {\n"
            "    \"material\": \"Cement\",\n"
            "    \"brand\": \"Republic Portland\",\n"
            "    \"unit\": \"40kg bag\",\n"
            "    \"price\": \"₱240\",\n"
            "    \"vendor\": \"CitiHardware\",\n"
            "    \"location\": \"Mandaue\",\n"
            "    \"gmaps_link\": \"https://goo.gl/maps/xyz456\"\n"
            "  }\n"
            "]"
        )

        ai_response = gemini.generate_cost_estimate(prompt)

        match = re.search(r"\[.*\]", ai_response, re.DOTALL)
        if not match:
            raise HTTPException(status_code=500, detail={"error": "No valid JSON array found", "raw": ai_response})

        clean_json = match.group(0)
        material_list = json.loads(clean_json)

        for item in material_list:
            supabase.save_material_price(item)

        return material_list

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
