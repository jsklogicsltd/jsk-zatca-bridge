"""User model for authentication."""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class User(Base):
    """User model for authentication and authorization."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile info
    full_name = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)
    tax_id = Column(String(15), nullable=True)  # Saudi VAT number is 15 digits
    phone = Column(String(20), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    
    # ZATCA integration
    zatca_csid = Column(String(500), nullable=True)
    zatca_secret = Column(String(500), nullable=True)
    zatca_environment = Column(String(20), default="sandbox")  # sandbox or production
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<User {self.email}>"
