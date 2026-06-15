
from fastapi import APIRouter

router= APIRouter(tags=['crop_yeild_pred'], prefix='/crop_yeild_pred')

@router.post('/')
def crop_yeild_predictor():
    pass