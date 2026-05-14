from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import cases, documents, auth, ai, copilot, privacy, reports, system
from .database import init_db
import uvicorn
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database
    init_db()
    yield

app = FastAPI(
    title="API Passerelle AI",
    description="Infrastructure opérationnelle pour les ONG aidant les migrants en France.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Passerelle AI API is operational",
        "version": "1.0.0"
    }

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(cases.router, prefix="/api/v1/cases", tags=["Cases"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])
app.include_router(copilot.router, prefix="/api/v1/copilot", tags=["Copilot"])
app.include_router(privacy.router, prefix="/api/v1/privacy", tags=["Privacy"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(system.router, prefix="/api/v1/system", tags=["System"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
