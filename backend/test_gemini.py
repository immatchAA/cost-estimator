import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
print("Loaded key:", API_KEY[:6] + "..." if API_KEY else "None")

url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent"

payload = {
    "contents": [
        {"parts": [{"text": "Hello Gemini, reply with just the word 'hi'."}]}
    ]
}

resp = requests.post(f"{url}?key={API_KEY}", json=payload)
print(resp.status_code, resp.text)
