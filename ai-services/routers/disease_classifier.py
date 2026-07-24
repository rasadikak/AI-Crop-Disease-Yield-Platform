from fastapi import APIRouter, UploadFile, File
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms
import json
import io

router = APIRouter(prefix='/disease', tags=['disease'])


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

with open("./plant_disease_classifier/class_to_idx.json", "r") as f:
    class_to_idx = json.load(f)
idx_to_class = {v: k for k, v in class_to_idx.items()}

model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, len(class_to_idx))
model.load_state_dict(torch.load("./plant_disease_classifier/plant_disease_model.pth", map_location=device))
model = model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                          std=[0.229, 0.224, 0.225])
])


@router.post('/')
async def disease_classifier(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    image_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted_idx = torch.max(probabilities, 1)

    predicted_class = idx_to_class[predicted_idx.item()]

    return {
        "disease": predicted_class,
        "confidence": round(confidence.item() * 100, 2)
    }