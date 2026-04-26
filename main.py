import os
import json
import logging
import io
from uuid import uuid4
from datetime import datetime
from typing import List, Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv
from PIL import Image

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Environment Variables ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    logger.error("Missing environment variables. Please check .env file.")

# --- Clients ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="WrapRoute AI - Python Backend")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI Logic ---
def analyze_wrapper_with_gemini(image_bytes: bytes) -> Dict[str, Any]:
    """Analyzes image using Gemini 1.5 Flash."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = (
            "Analyze this image carefully for a circular economy waste management app. "
            "1. Is it a multi-layered plastic (MLP) food wrapper (like Lays, Kurkure, chocolate wrappers)? "
            "2. Identify the brand if visible. "
            "3. State the condition (crushed/clean/soiled). "
            "Return ONLY a JSON object with keys: "
            "'is_mlp' (bool), 'brand' (str), 'condition' (str), 'confidence' (float)."
        )

        response = model.generate_content([prompt, img])
        text = response.text.strip()
        
        # Clean potential markdown wrapping
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        logger.error(f"AI Analysis failed: {e}")
        return {"is_mlp": False, "error": str(e)}

# --- Endpoints ---

@app.get("/api/health")
async def health():
    return {"status": "ok", "db": "connected" if supabase else "missing"}

@app.post("/api/scan")
async def scan_wrapper(user_id: str, bin_id: str, file: UploadFile = File(...)):
    """
    1. Scan Image with Gemini AI
    2. Reward User in Supabase
    3. Update Bin Capacity
    4. Trigger Agentic Dispatch if needed
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database client not initialized")

    contents = await file.read()
    ai_result = analyze_wrapper_with_gemini(contents)

    if not ai_result.get("is_mlp"):
        return {"success": False, "message": "Item rejected. Not a valid MLP wrapper."}

    brand = ai_result.get("brand", "Generic")
    reward_amount = 15 # Award 15 Eco-Coins

    try:
        # 1. Update User Profile (Eco-Coins)
        user_response = supabase.table("user_profiles").select("eco_coins").eq("user_id", user_id).single().execute()
        current_coins = user_response.data.get("eco_coins", 0) if user_response.data else 0
        supabase.table("user_profiles").update({"eco_coins": current_coins + reward_amount}).eq("user_id", user_id).execute()

        # 2. Update Bin Capacity (+5% per wrapper for demo)
        bin_response = supabase.table("bins").select("capacity", "location").eq("id", bin_id).single().execute()
        if not bin_response.data:
            raise HTTPException(status_code=404, detail="Bin not found")
        
        new_capacity = min(100, (bin_response.data.get("capacity", 0) + 5))
        supabase.table("bins").update({"capacity": new_capacity}).eq("id", bin_id).execute()

        # 3. Log Transaction
        txn_id = f"TXN-{uuid4().hex[:8].upper()}"
        supabase.table("transactions").insert({
            "id": txn_id,
            "user_id": user_id,
            "type": "REWARD",
            "amount": reward_amount,
            "brand": brand,
            "bin_id": bin_id,
            "timestamp": datetime.utcnow().isoformat()
        }).execute()

        # 4. Agentic Dispatch Trigger (90%)
        dispatch_triggered = False
        if new_capacity >= 90:
            supabase.table("dispatches").insert({
                "bin_id": bin_id,
                "location": bin_response.data.get("location"),
                "status": "PENDING",
                "priority": "HIGH",
                "assigned_truck": f"FL-{uuid4().hex[:4].upper()}"
            }).execute()
            dispatch_triggered = True

        return {
            "success": True,
            "message": "Wrapper Validated",
            "brand": brand,
            "reward": reward_amount,
            "new_capacity": new_capacity,
            "dispatch_triggered": dispatch_triggered
        }

    except Exception as e:
        logger.error(f"Database operation failed: {e}")
        raise HTTPException(status_code=500, detail="Internal processing error")

@app.get("/api/dashboard-stats")
async def get_dashboard_stats():
    """Fetches aggregated data for the React frontend."""
    if not supabase:
        return {"error": "DB not configured"}
    
    try:
        bins = supabase.table("bins").select("*").execute()
        txns = supabase.table("transactions").select("*").order("timestamp", desc=True).limit(10).execute()
        dispatches = supabase.table("dispatches").select("*").eq("status", "PENDING").execute()
        
        # Calculate summary
        total_diverted_val = supabase.table("transactions").select("id").execute()
        total_diverted = len(total_diverted_val.data) * 0.005 # Assuming 5g per wrapper

        return {
            "bins": bins.data,
            "recent_transactions": txns.data,
            "active_dispatches": dispatches.data,
            "summary": {
                "total_mlp_diverted_tons": round(total_diverted, 3),
                "active_fleet_count": len(dispatches.data)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # In AI Studio, we must use port 3000 if this is the primary server
    uvicorn.run(app, host="0.0.0.0", port=8000)
