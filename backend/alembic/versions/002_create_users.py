"""Create users table.

Revision ID: 002_create_users
Revises: 001_initial
Create Date: 2026-01-29
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision = '002_create_users'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        
        # Profile
        sa.Column('full_name', sa.String(255), nullable=True),
        sa.Column('company_name', sa.String(255), nullable=True),
        sa.Column('tax_id', sa.String(15), nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        
        # Status
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('is_superuser', sa.Boolean(), default=False),
        
        # ZATCA
        sa.Column('zatca_csid', sa.String(500), nullable=True),
        sa.Column('zatca_secret', sa.String(500), nullable=True),
        sa.Column('zatca_environment', sa.String(20), default='sandbox'),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('users')
