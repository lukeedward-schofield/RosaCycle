"""add deleted trade status

Revision ID: fdd29339c2c1
Revises: 8a6940eb4218
Create Date: 2026-08-09 01:24:32.321907

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fdd29339c2c1'
down_revision = '8a6940eb4218'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE tradestatus ADD VALUE IF NOT EXISTS 'DELETED'")


def downgrade():
    pass
