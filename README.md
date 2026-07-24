# 🌿 AgriSense

### AI-Powered Agricultural Intelligence Platform for Sri Lankan Farmers

AgriSense is a full-stack agricultural intelligence platform that uses
**AI, machine learning, and computer vision** to help farmers make
better decisions. It provides crop disease detection, treatment recommendations for diseases, yield prediction, weather anomaly alerts, and an AI chatbot for farming advice.

------------------------------------------------------------------------

## 🚀 Features

### 🔬 Crop Disease Detection

-   Upload leaf images to detect diseases
-   Uses **ResNet-18 deep learning model (pretrained on ImageNet)**
-   Provides predictions + treatment suggestions

### 📊 Crop Yield Prediction

-   Predicts harvest yield using:
    -   Crop type
    -   Temperature
    -   Pesticide usage
-   Uses **Random Forest model**
-   Outputs yield + confidence range

### 🌦️ Weather Anomaly Detection

-   Detects unusual weather patterns
-   Covers all **25 districts in Sri Lanka**
-   Alerts:
    -   Drought
    -   Flood risk
    -   Heat spikes

### 🤖 AI Farming Chatbot

-   Powered by **Google Gemini**
-   Provides farming advice\


### 🔐 Authentication System

-   Secure login & registration
-   JWT-based authentication
-   Email verification & password reset

------------------------------------------------------------------------

## 🏗️ Architecture

    Frontend (React)
          ↓
    Backend (Node.js / Express)
          ↓
    AI Service (FastAPI - Python)

------------------------------------------------------------------------

## 🧠 AI Models

### Disease Classifier

-   ResNet-18 deep learning model
-   \~95% accuracy

### Yield Predictor

-   Random Forest
-   Output: kg/ha
-   R² Score: 0.9892

### Weather Detector

-   Isolation Forest
-   Detects anomalies




------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

-   React + Vite
-   TypeScript
-   Tailwind CSS

### Backend

-   Node.js + Express
-   Prisma ORM
-   PostgreSQL

### AI Service

-   FastAPI
-   PyTorch
-   scikit-learn

------------------------------------------------------------------------

## ⚙️ Getting Started

### Clone Repo

``` bash
git clone https://github.com/rasadikak/AI-Crop-Disease-Yield-Platform.git

cd agri_platform
```

### Backend

``` bash
cd backend
npm install
npm run dev
```

### AI Service

``` bash
cd ai-services
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

``` bash
cd frontend
npm install
npm run dev
```



## 📁 Structure

    agrisense/
    ├── frontend/
    ├── backend/
    └── ai-services/

------------------------------------------------------------------------

## 👩‍💻 Author

**Kaushani Rasadika**

------------------------------------------------------------------------

## 📄 License

Educational use only
