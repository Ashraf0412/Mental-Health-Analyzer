import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./hospital.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "REPLACE_ME")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")


settings = Settings()
