"""allow multiple pending offers per trade

Revision ID: d92c4e8a71b3
Revises: c7a1d9f4b2e6
Create Date: 2026-08-10
"""

from alembic import op
import sqlalchemy as sa


revision = "d92c4e8a71b3"
down_revision = "c7a1d9f4b2e6"
branch_labels = None
depends_on = None


def upgrade():
    # The original index allowed only one PENDING offer for an entire trade.
    # Keep the anti-spam guardrail, but scope it to one pending offer per user
    # per trade so different users can submit competing offers.
    op.drop_index("ix_offers_one_pending_per_trade", table_name="offers")
    op.create_index(
        "ix_offers_one_pending_per_user_trade",
        "offers",
        ["trade_id", "offerer_id"],
        unique=True,
        postgresql_where=sa.text("status = 'PENDING'"),
        sqlite_where=sa.text("status = 'PENDING'"),
    )


def downgrade():
    op.drop_index("ix_offers_one_pending_per_user_trade", table_name="offers")
    op.create_index(
        "ix_offers_one_pending_per_trade",
        "offers",
        ["trade_id"],
        unique=True,
        postgresql_where=sa.text("status = 'PENDING'"),
        sqlite_where=sa.text("status = 'PENDING'"),
    )
