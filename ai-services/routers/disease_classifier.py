from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image, UnidentifiedImageError
import torch
import torch.nn as nn
from torchvision import models, transforms
import json
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/disease', tags=['disease'])

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


try:
    with open("./plant_disease_classifier/class_to_idx.json", "r") as f:
        class_to_idx = json.load(f)
    idx_to_class = {v: k for k, v in class_to_idx.items()}
except FileNotFoundError:
    raise RuntimeError("class_to_idx.json not found — check the path")
except json.JSONDecodeError:
    raise RuntimeError("class_to_idx.json is not valid JSON")


try:
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, len(class_to_idx))
    model.load_state_dict(
        torch.load("./plant_disease_classifier/plant_disease_model.pth", map_location=device)
    )
    model = model.to(device)
    model.eval()
except FileNotFoundError:
    raise RuntimeError("plant_disease_model.pth not found — check the path")
except RuntimeError as e:
    raise RuntimeError(f"Model architecture doesn't match saved weights: {e}")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                          std=[0.229, 0.224, 0.225])
])


@router.post('/')
async def disease_classifier(file: UploadFile = File(...)):
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    # Read the uploaded file
    try:
        image_bytes = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read uploaded file")

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # Decode the image
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="File is not a valid image")
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to process image")

    # Preprocess + run inference
    try:
        image_tensor = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)

        predicted_class = idx_to_class[predicted_idx.item()]

    except Exception as e:
        logger.error(f"Inference failed: {e}")
        raise HTTPException(status_code=500, detail="Model inference failed")

    return {
        "disease": predicted_class,
        "confidence": round(confidence.item() * 100, 2)
    }