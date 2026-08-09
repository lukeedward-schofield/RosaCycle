import json

from flask import current_app

from app.trades.ai_prompts import TRADE_ASSESSMENT_PROMPT


REQUIRED_FIELDS = (
    "isRelevant",
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


EMPTY_ASSESSMENT = {
    "isRelevant": False,
    "itemName": "",
    "category": "",
    "material": "",
    "description": "",
    "weightKg": 0,
    "quantity": 0,
}


def assess_trade_photo(image_file):
    try:
        result = _call_gemini(
            image_file=image_file,
            prompt=TRADE_ASSESSMENT_PROMPT,
        )

        missing = [field for field in REQUIRED_FIELDS if field not in result]
        if missing:
            raise ValueError(
                f"Gemini response missing field(s): {', '.join(missing)}."
            )

        if not isinstance(result["isRelevant"], bool):
            raise ValueError('Gemini response field "isRelevant" must be a boolean.')

        return {
            "success": True,
            "assessment": result,
        }

    except ContentBlockedError:
        # Treat safety-blocked photos as unusable photos so the client can
        # require a retake instead of allowing the upload to continue.
        return {
            "success": True,
            "assessment": dict(EMPTY_ASSESSMENT),
        }

    except Exception:
        # A quota/network/processing failure is different from a confirmed
        # unrelated photo. Keep manual entry available rather than blocking
        # the entire feature when Gemini is unavailable.
        current_app.logger.exception("Trade assessment failed")
        return {
            "success": False,
            "error": "AI couldn't analyze this image. Please enter the item details manually.",
        }


def _call_gemini(image_file, prompt):
    import google.generativeai as genai

    api_key = current_app.config.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("models/gemini-flash-latest")

    image_file.stream.seek(0)
    image_bytes = image_file.read()
    mime_type = image_file.mimetype or "image/jpeg"

    response = model.generate_content(
        [prompt, {"mime_type": mime_type, "data": image_bytes}],
        generation_config={"response_mime_type": "application/json"},
        safety_settings=_build_safety_settings(),
    )

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
