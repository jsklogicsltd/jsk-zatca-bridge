"""Add zatca_private_key + zatca_compliance_request_id to users; widen csid/secret to Text.

Revision ID: 004_zatca_user_cols
Revises: 003_supabase_auth
Create Date: 2026-05-20
"""
from alembic import op
import sqlalchemy as sa


revision = '004_zatca_user_cols'
down_revision = '003_supabase_auth'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('users') as batch:
        batch.add_column(sa.Column('zatca_private_key', sa.Text(), nullable=True))
        batch.add_column(sa.Column('zatca_compliance_request_id', sa.String(length=64), nullable=True))
        # CSID binarySecurityToken + Fernet overhead can exceed VARCHAR(500).
        batch.alter_column('zatca_csid', existing_type=sa.String(length=500), type_=sa.Text())
        batch.alter_column('zatca_secret', existing_type=sa.String(length=500), type_=sa.Text())


def downgrade() -> None:
    with op.batch_alter_table('users') as batch:
        batch.drop_column('zatca_compliance_request_id')
        batch.drop_column('zatca_private_key')
        batch.alter_column('zatca_csid', existing_type=sa.Text(), type_=sa.String(length=500))
        batch.alter_column('zatca_secret', existing_type=sa.Text(), type_=sa.String(length=500))
