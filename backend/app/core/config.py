from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "ZATCA Bridge API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://zatca:zatca_password@localhost:5432/zatca_bridge"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    # ZATCA API
    ZATCA_API_URL: str = "https://sandbox.zatca.gov.sa/api"
    ZATCA_API_KEY: Optional[str] = None
    ZATCA_CSID: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # Fernet key used to encrypt stored ZATCA credentials. Generate with:
    #   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    # If unset, a key is derived from SECRET_KEY (dev-only).
    ENCRYPTION_KEY: Optional[str] = None

    # Supabase (Auth + Storage). The backend verifies Supabase-issued JWTs
    # against SUPABASE_JWT_SECRET. Get this from:
    #   Supabase Dashboard → Settings → API → JWT Settings → JWT Secret
    SUPABASE_URL: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    # Optional: service-role key for admin operations (bypass RLS). Required if
    # the backend needs to write to storage on behalf of a user.
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    # JWT audience claim Supabase signs into access tokens. Default "authenticated".
    SUPABASE_JWT_AUDIENCE: str = "authenticated"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
