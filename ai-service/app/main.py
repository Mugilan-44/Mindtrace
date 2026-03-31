from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import logging

# Set up simple logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MindTrace AI Service", version="1.0.0")

class EmotionAnalysisRequest(BaseModel):
    text: str

class EmotionAnalysisResponse(BaseModel):
    emotion: str
    score: float

# Initialize the pipeline globally so it's loaded once upon startup
logger.info("Initializing emotion detection pipeline... This may take a moment.")
classifier = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion", top_k=1)
logger.info("Pipeline initialized successfully.")

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
    # Inference
    result = classifier(request.text)
    
    # result is a list of lists when top_k is specified, e.g. [[{'label': 'joy', 'score': 0.9}]]
    best_prediction = result[0][0]
    
    raw_emotion = best_prediction['label']
    score = best_prediction['score']
    
    # Apply mapping, defaulting to raw emotion if not found
    emotion = LABEL_MAPPING.get(raw_emotion.lower(), raw_emotion.lower())
    
    return EmotionAnalysisResponse(
        emotion=emotion,
        score=score
    )
