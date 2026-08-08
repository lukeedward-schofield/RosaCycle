"""add trade deleted notification type

Revision ID: abdffe41d667
Revises: fdd29339c2c1
Create Date: 2026-08-09 02:22:37.963364

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'abdffe41d667'
down_revision = 'fdd29339c2c1'
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "ALTER TYPE notificationtype ADD VALUE 'TRADE_DELETED'"
    )


def downgrade():
    pass
