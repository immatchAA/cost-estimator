from flask import Blueprint, request, jsonify
from supabase import create_client, Client
import os
import random
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

auth_bp = Blueprint("auth", __name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client (SUPABASE_URL, SUPABASE_KEY)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    auth_response = supabase.auth.sign_up({
        "email": email,
        "password": password,
        "redirect_to": None  
    })

    if "error" in auth_response and auth_response["error"]:
        return jsonify({"error": auth_response["error"]["message"]}), 400

    user = auth_response.user  

    insert_response = supabase.table("users").insert({
        "id": user.id,  
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "role": role
    }).execute()

    if insert_response.get("error"):
        return jsonify({"error": insert_response["error"]["message"]}), 400

    return jsonify({"message": "User registered successfully"}), 201



@auth_bp.route("/login", methods=["POST"])
def login_user():
    """Login user using Supabase"""
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return jsonify({"message": "Login successful", "data": user}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401