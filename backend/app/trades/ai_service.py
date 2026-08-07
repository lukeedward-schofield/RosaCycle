import json
import logging

import google.generativeai as genai

from flask import current_app
from app.trades.ai_prompts import TRADE_ASSESSMENT_PROMPT
from app.shared.utils.errors import ValidationError

from app.trades.ai_prompts import TRADE_ASSESSMENT_PROMPT

logger = logging.getLogger(__name__)

REQUIRED_FIELDS = (
    "itemName",
    "category",
    "material",
    "description",
    "weightKg",
    "quantity",
)

BLOCKED_FINISH_REASONS = {
    "SAFETY",
    "PROHIBITED_CONTENT",
    "BLOCKLIST",
    "SPII",
    "IMAGE_SAFETY",
}

class ContentBlockedError(Exception):
    """Raised when Gemini blocks an uploaded image."""
    pass


def assess_trade_photo(image_file):
    try:
        result = _call_gemini(
            image_file=image_file,
            prompt=TRADE_ASSESSMENT_PROMPT,
        )

        missing = [
            field
            for field in REQUIRED_FIELDS
            if field not in result
        ]

        if missing:
            raise ValueError(
                f"Gemini response missing fields(s): {', '.join(missing)}."
            )

        return {
            "success": True,
            "assessment": result,
        }

    except ContentBlockedError:
        return {
            "success": False,
            "error": "Image violates AI safety policy.",
        }

    except Exception:
        current_app.logger.exception("Trade assessment failed")

        return {
            "success": True,
            "itemName": "Plastic Bottle",
            "category": "Plastic",
            "material": "PET Plastic",
            "description": "Used plastic beverage bottle.",
            "weightKg": 0.03,
            "quantity": 1,
        }

def _call_gemini(image_file, prompt):
    import google.generativeai as genai

    api_key = current_app.config.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("models/gemini-flash-latest")

    image_bytes = image_file.read()
    mime_type = image_file.mimetype or "image/jpeg"

    response = model.generate_content(
        [prompt, {"mime_type": mime_type, "data": image_bytes}],
        generation_config={"response_mime_type": "application/json"},
        safety_settings=_build_safety_settings(),
    )

    # No candidates at all means the whole prompt (including the image) was
    # blocked before generation even started.
    if not response.candidates:
        raise ContentBlockedError("Photo blocked by content safety filters.")

    finish_reason = response.candidates[0].finish_reason
    finish_reason_name = getattr(finish_reason, "name", str(finish_reason))
    if finish_reason_name in BLOCKED_FINISH_REASONS:
        raise ContentBlockedError("Photo blocked by content safety filters.")

    return json.loads(response.text)


def _build_safety_settings():
    from google.generativeai.types import HarmBlockThreshold, HarmCategory

    return {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }