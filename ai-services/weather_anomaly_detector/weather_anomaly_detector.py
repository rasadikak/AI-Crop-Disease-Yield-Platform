import requests

districts=[]
latitude=[]
longitude=[]

def create_pkl_for_each_district():
    for i in districts, latitude,longitude:
        result= requests.get("https://archive-api.open-meteo.com/v1/archive?latitude={latitude[i]}&longitude={longitude[i]}&start_date=2000-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,relative_humidity_2m_min&timezone={district[i]}")
        daily_result= result["daily"]
        