from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
import bcrypt
import jwt
import mercadopago

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Mercado Pago
MP_ACCESS_TOKEN = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
MP_PUBLIC_KEY = os.getenv("MERCADO_PAGO_PUBLIC_KEY")
sdk = mercadopago.SDK(MP_ACCESS_TOKEN)

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "default_secret_key")
security = HTTPBearer()

# Models
class Product(BaseModel):
    name: str
    category: str  # sorvetes, acai, picoles, tacas
    price: float
    image: str  # base64
    description: Optional[str] = ""
    subcategory: Optional[str] = ""  # frutas, cremosos, etc
    isLaunch: bool = False
    stock: int = 100
    isActive: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    description: Optional[str] = None
    subcategory: Optional[str] = None
    isLaunch: Optional[bool] = None
    stock: Optional[int] = None
    isActive: Optional[bool] = None

class Banner(BaseModel):
    title: str
    image: str  # base64
    link: Optional[str] = ""
    isActive: bool = True
    position: int = 0

class Promotion(BaseModel):
    title: str
    description: str
    discount: float
    productIds: List[str] = []
    startDate: str
    endDate: str
    isActive: bool = True

class Season(BaseModel):
    name: str  # natal, pascoa, verao, etc
    title: str
    description: str
    startDate: str
    endDate: str
    bannerImage: str  # base64
    productIds: List[str] = []
    isActive: bool = True

class OrderItem(BaseModel):
    productId: str
    productName: str
    quantity: int
    price: float

class Order(BaseModel):
    items: List[OrderItem]
    total: float
    customerName: str
    customerPhone: str
    paymentMethod: str  # pix, card, cash
    status: str = "pending"  # pending, paid, preparing, delivered, cancelled
    paymentId: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

# Helper functions
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# Initialize admin user
@app.on_event("startup")
async def startup_event():
    # Create admin user if not exists
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    
    existing_admin = db.admins.find_one({"username": admin_username})
    if not existing_admin:
        hashed = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt())
        db.admins.insert_one({
            "username": admin_username,
            "password": hashed,
            "role": "admin",
            "createdAt": datetime.now()
        })
        print(f"Admin user created: {admin_username}")

# Auth endpoints
@app.post("/api/admin/login")
async def admin_login(credentials: AdminLogin):
    admin = db.admins.find_one({"username": credentials.username})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode(
        {"username": credentials.username, "role": admin["role"], "exp": datetime.utcnow() + timedelta(days=7)},
        JWT_SECRET,
        algorithm="HS256"
    )
    
    return {"token": token, "username": credentials.username}

# Product endpoints
@app.get("/api/products")
async def get_products(category: Optional[str] = None, active_only: bool = True):
    query = {}
    if category:
        query["category"] = category
    if active_only:
        query["isActive"] = True
    
    products = list(db.products.find(query))
    return [serialize_doc(p) for p in products]

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    product = db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_doc(product)

@app.post("/api/products")
async def create_product(product: Product, user=Depends(verify_token)):
    product_dict = product.dict()
    product_dict["createdAt"] = datetime.now()
    result = db.products.insert_one(product_dict)
    return {"id": str(result.inserted_id), "message": "Product created successfully"}

@app.put("/api/products/{product_id}")
async def update_product(product_id: str, product: ProductUpdate, user=Depends(verify_token)):
    update_data = {k: v for k, v in product.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    update_data["updatedAt"] = datetime.now()
    result = db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product updated successfully"}

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str, user=Depends(verify_token)):
    result = db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Banner endpoints
@app.get("/api/banners")
async def get_banners(active_only: bool = True):
    query = {"isActive": True} if active_only else {}
    banners = list(db.banners.find(query).sort("position", 1))
    return [serialize_doc(b) for b in banners]

@app.post("/api/banners")
async def create_banner(banner: Banner, user=Depends(verify_token)):
    banner_dict = banner.dict()
    banner_dict["createdAt"] = datetime.now()
    result = db.banners.insert_one(banner_dict)
    return {"id": str(result.inserted_id), "message": "Banner created successfully"}

@app.put("/api/banners/{banner_id}")
async def update_banner(banner_id: str, banner: Banner, user=Depends(verify_token)):
    result = db.banners.update_one(
        {"_id": ObjectId(banner_id)},
        {"$set": {**banner.dict(), "updatedAt": datetime.now()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Banner updated successfully"}

@app.delete("/api/banners/{banner_id}")
async def delete_banner(banner_id: str, user=Depends(verify_token)):
    result = db.banners.delete_one({"_id": ObjectId(banner_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Banner deleted successfully"}

# Promotion endpoints
@app.get("/api/promotions")
async def get_promotions(active_only: bool = True):
    query = {}
    if active_only:
        query["isActive"] = True
    promotions = list(db.promotions.find(query))
    return [serialize_doc(p) for p in promotions]

@app.post("/api/promotions")
async def create_promotion(promotion: Promotion, user=Depends(verify_token)):
    promo_dict = promotion.dict()
    promo_dict["createdAt"] = datetime.now()
    result = db.promotions.insert_one(promo_dict)
    return {"id": str(result.inserted_id), "message": "Promotion created successfully"}

@app.put("/api/promotions/{promo_id}")
async def update_promotion(promo_id: str, promotion: Promotion, user=Depends(verify_token)):
    result = db.promotions.update_one(
        {"_id": ObjectId(promo_id)},
        {"$set": {**promotion.dict(), "updatedAt": datetime.now()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"message": "Promotion updated successfully"}

@app.delete("/api/promotions/{promo_id}")
async def delete_promotion(promo_id: str, user=Depends(verify_token)):
    result = db.promotions.delete_one({"_id": ObjectId(promo_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"message": "Promotion deleted successfully"}

# Season endpoints
@app.get("/api/seasons")
async def get_seasons(active_only: bool = True):
    query = {}
    if active_only:
        query["isActive"] = True
    seasons = list(db.seasons.find(query))
    return [serialize_doc(s) for s in seasons]

@app.post("/api/seasons")
async def create_season(season: Season, user=Depends(verify_token)):
    season_dict = season.dict()
    season_dict["createdAt"] = datetime.now()
    result = db.seasons.insert_one(season_dict)
    return {"id": str(result.inserted_id), "message": "Season created successfully"}

@app.put("/api/seasons/{season_id}")
async def update_season(season_id: str, season: Season, user=Depends(verify_token)):
    result = db.seasons.update_one(
        {"_id": ObjectId(season_id)},
        {"$set": {**season.dict(), "updatedAt": datetime.now()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Season not found")
    return {"message": "Season updated successfully"}

@app.delete("/api/seasons/{season_id}")
async def delete_season(season_id: str, user=Depends(verify_token)):
    result = db.seasons.delete_one({"_id": ObjectId(season_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Season not found")
    return {"message": "Season deleted successfully"}

# Order endpoints
@app.get("/api/orders")
async def get_orders(user=Depends(verify_token)):
    orders = list(db.orders.find().sort("createdAt", -1))
    return [serialize_doc(o) for o in orders]

@app.post("/api/orders")
async def create_order(order: Order):
    order_dict = order.dict()
    order_dict["createdAt"] = datetime.now()
    result = db.orders.insert_one(order_dict)
    return {"id": str(result.inserted_id), "message": "Order created successfully"}

@app.put("/api/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, user=Depends(verify_token)):
    result = db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": status, "updatedAt": datetime.now()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated successfully"}

# Payment endpoints
@app.post("/api/payment/create")
async def create_payment(order_id: str, total: float):
    try:
        preference_data = {
            "items": [
                {
                    "title": f"Pedido Amarena #{order_id[:8]}",
                    "quantity": 1,
                    "unit_price": float(total)
                }
            ],
            "back_urls": {
                "success": "https://amarena-sorveteria.preview.emergentagent.com/success",
                "failure": "https://amarena-sorveteria.preview.emergentagent.com/failure",
                "pending": "https://amarena-sorveteria.preview.emergentagent.com/pending"
            },
            "auto_return": "approved",
            "external_reference": order_id
        }
        
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]
        
        return {
            "preferenceId": preference["id"],
            "initPoint": preference["init_point"],
            "publicKey": MP_PUBLIC_KEY
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/payment/webhook")
async def payment_webhook(data: dict):
    # Handle Mercado Pago webhook notifications
    try:
        if data.get("type") == "payment":
            payment_id = data.get("data", {}).get("id")
            if payment_id:
                payment_info = sdk.payment().get(payment_id)
                if payment_info["status"] == 200:
                    payment = payment_info["response"]
                    order_id = payment.get("external_reference")
                    status_map = {
                        "approved": "paid",
                        "pending": "pending",
                        "rejected": "cancelled"
                    }
                    new_status = status_map.get(payment["status"], "pending")
                    
                    if order_id:
                        db.orders.update_one(
                            {"_id": ObjectId(order_id)},
                            {"$set": {"status": new_status, "paymentId": str(payment_id)}}
                        )
        return {"status": "ok"}
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"status": "error"}

# Dashboard stats
@app.get("/api/admin/stats")
async def get_stats(user=Depends(verify_token)):
    total_products = db.products.count_documents({"isActive": True})
    total_orders = db.orders.count_documents({})
    pending_orders = db.orders.count_documents({"status": "pending"})
    total_revenue = sum([order.get("total", 0) for order in db.orders.find({"status": "paid"})])
    
    return {
        "totalProducts": total_products,
        "totalOrders": total_orders,
        "pendingOrders": pending_orders,
        "totalRevenue": total_revenue
    }

@app.get("/api/health")
async def health():
    return {"status": "ok", "database": "connected"}
