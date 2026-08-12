from fastapi import FastAPI
from .core.database import engine
from .core.database import Base
from .api import auth as auth_api


app = FastAPI(title="Hospital AI Support & Patient Management API")


@app.on_event("startup")
def on_startup():
    # Create database tables in development; use migrations for production
    Base.metadata.create_all(bind=engine)


# Ensure tables exist when module is imported (helps tests/dev)
Base.metadata.create_all(bind=engine)


app.include_router(auth_api.router)


@app.get("/api/status")
def status():
    return {"status": "ok"}
