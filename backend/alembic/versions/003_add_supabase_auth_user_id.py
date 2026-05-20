"""Link User to Supabase via auth_user_id; make hashed_password nullable.

Revision ID: 003_supabase_auth
Revises: 002_create_users
Create Date: 2026-05-20
"""
from alembic import op
import sqlalchemy as sa


revision = '003_supabase_auth'
down_revision = '002_create_users'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('users') as batch:
        batch.add_column(sa.Column('auth_user_id', sa.String(length=36), nullable=True))
        batch.create_index('ix_users_auth_user_id', ['auth_user_id'], unique=True)
        # Supabase now owns the password.
        batch.alter_column('hashed_password', existing_type=sa.String(length=255), nullable=True)


def downgrade() -> None:
    with op.batch_alter_table('users') as batch:
        batch.drop_index('ix_users_auth_user_id')
        batch.drop_column('auth_user_id')
        batch.alter_column('hashed_password', existing_type=sa.String(length=255), nullable=False)
