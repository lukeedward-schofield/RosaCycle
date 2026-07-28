from flask import Blueprint

from app.controller import ai_controller
from app.utils.auth import require_auth

ai_bp = Blueprint("ai", __name__, url_prefix="/ai")


@ai_bp.post("/assess-trade-photo")
@require_auth
def assess_trade():
    return ai_controller.assess_trade()


@ai_bp.post("/assess-resource-spot-photo")
@require_auth
def assess_resource_spot():
    return ai_controller.assess_resource_spot()
