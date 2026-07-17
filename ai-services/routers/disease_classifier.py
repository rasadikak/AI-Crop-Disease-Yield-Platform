from fastapi import APIRouter, HTTPException


router = APIRouter(prefix='/disease', tags=['disease'])

@router.post('/')
def disease_classifier():
    pass