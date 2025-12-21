from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "WhyTrade API", "version": settings.VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# APIルーターをここに追加
# from app.api.v1 import auth, trades, analytics, tags
# app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
# app.include_router(trades.router, prefix=f"{settings.API_V1_STR}/trades", tags=["trades"])
