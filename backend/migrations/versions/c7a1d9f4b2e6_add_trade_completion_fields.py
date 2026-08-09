"""add trade completion fields

Revision ID: c7a1d9f4b2e6
Revises: abdffe41d667
Create Date: 2026-08-10 00:45:00
"""

from alembic import op
import sqlalchemy as sa


revision = "c7a1d9f4b2e6"
down_revision = "abdffe41d667"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "trades",
        sa.Column("completion_requested_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "trades",
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade():
    op.drop_column("trades", "completed_at")
    op.drop_column("trades", "completion_requested_at")
