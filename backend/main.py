from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

# .envファイルの内容を読み込む
load_dotenv()

app = FastAPI()

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # すべてのオリジンを許可 (本番環境では特定のオリジンに限定することを推奨)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hotpepper APIのキーを環境変数から取得
HOTPEPPER_API_KEY = os.getenv("HOTPEPPER_API_KEY")

class Location(BaseModel):
    lat: float
    lng: float

@app.post("/api/restaurants")
async def get_restaurants(location: Location):
    try:
        response = requests.get(
            "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/",
            params={
                "key": HOTPEPPER_API_KEY,
                "lat": location.lat,
                "lng": location.lng,
                "range": 3,  # 検索範囲（1-5）
                "format": "json"
            }
        )
        response.raise_for_status()  # HTTPエラーをチェック
        data = response.json()
        if "results" in data and "shop" in data["results"]:
            return [
                {
                    "id": shop["id"],
                    "name": shop["name"],
                    "logo_image": shop.get("logo_image"),
                    "name_kana": shop.get("name_kana"),
                    "address": shop["address"],
                    "station_name": shop.get("station_name"),
                    "ktai_coupon": shop.get("ktai_coupon"),
                    "lat": shop["lat"],
                    "lng": shop["lng"],
                    "genre": shop["genre"]["name"],
                    "catch": shop["genre"]["catch"],
                    "sub_genre": shop.get("sub_genre", {}).get("name"),
                    "budget": shop["budget"].get("average"),
                    "budget_memo": shop.get("budget_memo"),
                    "capacity": shop.get("capacity"),
                    "access": shop["access"],
                    "open": shop.get("open"),
                    "close": shop.get("close"),
                    "party_capacity": shop.get("party_capacity"),
                    "wifi": shop.get("wifi"),
                    "course": shop.get("course"),
                    "free_drink": shop.get("free_drink"),
                    "free_food": shop.get("free_food"),
                    "private_room": shop.get("private_room"),
                    "card": shop.get("card"),
                    "non_smoking": shop.get("non_smoking"),
                    "urls": shop["urls"]["pc"],
                    "tel": shop.get("tel"),
                    "photo": shop["photo"]["mobile"].get("l"),
                }
                for shop in data["results"]["shop"]
            ]
        else:
            return []

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request exception: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"General exception: {e}")
