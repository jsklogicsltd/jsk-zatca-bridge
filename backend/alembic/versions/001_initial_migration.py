"""add invoices table

Revision ID: 001_initial
Revises: 
Create Date: 2026-01-29 15:43:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create invoices table
    op.create_table(
        'invoices',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('invoice_number', sa.String(length=100), nullable=False),
        sa.Column('xml_content', sa.Text(), nullable=True),
        sa.Column('hash', sa.String(length=64), nullable=True),
        sa.Column('previous_hash', sa.String(length=64), nullable=True),
        sa.Column('status', sa.Enum('DRAFT', 'SIGNED', 'REPORTED', 'CLEARED', 'REJECTED', name='invoicestatus'), nullable=False),
        sa.Column('zatca_response', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_invoices_id'), 'invoices', ['id'], unique=False)
    op.create_index(op.f('ix_invoices_uuid'), 'invoices', ['uuid'], unique=True)
    op.create_index(op.f('ix_invoices_invoice_number'), 'invoices', ['invoice_number'], unique=True)
    op.create_index(op.f('ix_invoices_status'), 'invoices', ['status'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_invoices_status'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_invoice_number'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_uuid'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_id'), table_name='invoices')
    
    # Drop table
    op.drop_table('invoices')
    
    # Drop enum
    sa.Enum(name='invoicestatus').drop(op.get_bind(), checkfirst=True)
