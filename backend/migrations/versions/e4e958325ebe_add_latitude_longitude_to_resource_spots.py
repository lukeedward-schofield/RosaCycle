"""add latitude longitude to resource spots

Revision ID: e4e958325ebe
Revises: a3803a826d91
Create Date: 2026-08-07 02:19:07.643015

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e4e958325ebe'
down_revision = 'a3803a826d91'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("resource_spots") as batch_op:
        batch_op.add_column(sa.Column("latitude", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("longitude", sa.Float(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    with op.batch_alter_table("resource_spots") as batch_op:
        batch_op.drop_column("longitude")
        batch_op.drop_column("latitude")

    # ### end Alembic commands ###
