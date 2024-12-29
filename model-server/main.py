from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File
from PIL import Image
import torch
import io
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware

# Clean up resources on shutdown
pipe = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model on startup
    global pipe
    pipe = pipeline("image-classification", model="dima806/facial_emotions_image_detection")
    yield

app = FastAPI(lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read and process the image
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    
    # Use the pipeline directly to get predictions
    results = pipe(images=image)
    
    # Convert predictions to desired format
    predictions = []
    for result in results:
        predictions.append({
            "emotion": result["label"],
            "probability": f"{result['score']:.4f}"
        })

    return {"predictions": predictions}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
