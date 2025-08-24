from fastapi import FastAPI, APIRouter, HTTPException, Request
from pydantic import BaseModel
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()
auth_router = APIRouter(prefix="/auth")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request validation
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role: str


class LoginRequest(BaseModel):
    email: str
    password: str


@auth_router.post("/register")
async def register(request: RegisterRequest):
    auth_response = supabase.auth.sign_up({
        "email": request.email,
        "password": request.password,
        "redirect_to": None
    })

    if "error" in auth_response and auth_response["error"]:
        raise HTTPException(status_code=400, detail=auth_response["error"]["message"])

    user = auth_response.user

    insert_response = supabase.table("users").insert({
        "id": user.id,
        "first_name": request.first_name,
        "last_name": request.last_name,
        "email": request.email,
        "role": request.role
    }).execute()

    if insert_response.get("error"):
        raise HTTPException(status_code=400, detail=insert_response["error"]["message"])

    return {"message": "User registered successfully"}


@auth_router.post("/login")
async def login_user(request: LoginRequest):
    if not request.email or not request.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    try:
        user = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        return {"message": "Login successful", "data": user}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


# Register router with the app
app.include_router(auth_router)
