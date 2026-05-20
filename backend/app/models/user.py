"""User model for authentication."""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.db.base import Base


class User(Base):
    """
    Local user/profile row. Identity now comes from Supabase Auth; this row
    exists only to link Supabase users (auth_user_id) to ZATCA credentials and
    other backend-owned state.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # Supabase auth.users.id — the actual identity. Nullable for legacy rows
    # created before Supabase was wired up.
    auth_user_id = Column(String(36), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    # No longer used — Supabase owns the password. Kept nullable for legacy rows.
    hashed_password = Column(String(255), nullable=True)

    # Profile info
    full_name = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)
    tax_id = Column(String(15), nullable=True)  # Saudi VAT number is 15 digits
    phone = Column(String(20), nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)

    # ZATCA integration — stored encrypted (Fernet). Widened from String(500)
    # because a production CSID binarySecurityToken plus encryption overhead
    # can exceed 2 KB.
    zatca_csid = Column(Text, nullable=True)
    zatca_secret = Column(Text, nullable=True)
    zatca_private_key = Column(Text, nullable=True)        # PEM of CSR's private key
    zatca_compliance_request_id = Column(String(64), nullable=True)
    zatca_environment = Column(String(20), default="sandbox")  # sandbox / simulation / production
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<User {self.email}>"
