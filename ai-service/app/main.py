import os
import logging
import requests
from fastapi import FastAPI
from pydantic import BaseModel

# Set up simple logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MindTrace AI Service", version="1.0.0")

HF_API_KEY = os.getenv("HF_API_KEY")
API_URL = "https://api-inference.huggingface.co/models/bhadresh-savani/distilbert-base-uncased-emotion"

class EmotionAnalysisRequest(BaseModel):
    text: str

class EmotionAnalysisResponse(BaseModel):
    emotion: str
    score: float

# Map distilbert output labels to our existing expected labels
LABEL_MAPPING = {
    "sadness": "sadness",
    "joy": "joy",
    "love": "joy",       # Map love to joy for backend compatibility
    "anger": "anger",
    "fear": "fear",
    "surprise": "surprise"
}

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/v1/analyze-emotion", response_model=EmotionAnalysisResponse)
def analyze_emotion(request: EmotionAnalysisRequest):
    logger.info(f"Analyzing text: {request.text[:50]}...")
    
    headers = {}
    if HF_API_KEY:
        headers["Authorization"] = f"Bearer {HF_API_KEY}"
    else:
        logger.warning("HF_API_KEY not set. Using unauthenticated HuggingFace API (rate limits apply).")

    payload = {
        "inputs": request.text
    }
    
    try:
        # Send POST request to HuggingFace API
        response = requests.post(API_URL, headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        result = response.json()
        
        # HuggingFace API usually returns a list of lists: [[{"label": "emotion", "score": 0.9}, ...]]
        if isinstance(result, list) and len(result) > 0 and isinstance(result[0], list):
            predictions = sorted(result[0], key=lambda x: x.get("score", 0), reverse=True)
            best_prediction = predictions[0]
            
            raw_emotion = best_prediction.get("label", "neutral")
            score = best_prediction.get("score", 0.5)
            
            # Apply mapping, defaulting to raw emotion if not found
            emotion = LABEL_MAPPING.get(raw_emotion.lower(), raw_emotion.lower())
            
            return EmotionAnalysisResponse(emotion=emotion, score=score)
        else:
            logger.error(f"Unexpected API response format: {result}")
            return EmotionAnalysisResponse(emotion="neutral", score=0.5)
            
    except Exception as e:
        logger.error(f"Error calling HF Inference API: {str(e)}")
        # Return fallback on failure
        return EmotionAnalysisResponse(
            emotion="neutral",
            score=0.5
        )
