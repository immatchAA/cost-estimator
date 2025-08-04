import os
import requests

class GeminiPriceSearch:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    def generate_cost_estimate(self, prompt):
        headers = {
            "Content-Type": "application/json"
        }
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        }

        response = requests.post(f"{self.url}?key={self.api_key}", json=payload, headers=headers)

        if response.status_code == 200:
            return response.json()["candidates"][0]["content"]["parts"][0]["text"]
        else:
            raise Exception(f"Gemini API error: {response.text}")
