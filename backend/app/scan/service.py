import json
import traceback

from flask import current_app

# Finish reasons that mean Gemini declined to analyze the image for content
# policy reasons, as opposed to a transient/processing failure. Any of these
# maps to `blocked: True` in the response rather than the generic empty
# fallback, so the frontend can show its "this photo couldn't be processed"
# notice instead of silently looking like a low-confidence miss.
BLOCKED_FINISH_REASONS = {
    "SAFETY",
    "PROHIBITED_CONTENT",
    "BLOCKLIST",
    "SPII",
    "IMAGE_SAFETY",
}

TRADE_ASSESSMENT_PROMPT = """You are assisting a circular-economy trading app. Look at the photo of an item
someone wants to trade and respond with ONLY a JSON object (no markdown) with these keys:
"itemName" (short string), "category" (one of: Wood, Metal, Plastic, Fabric, Paper, E-waste, Mixed, Organic),
"material" (short free-text description, e.g. "Steel scrap"), "weightKg" (number, your best estimate),
"confidence" (integer 0-100, your confidence in this assessment)."""

RESOURCE_SPOT_ASSESSMENT_PROMPT = RESOURCE_SPOT_ASSESSMENT_PROMPT = """
You are assisting a community resource-recovery app.

Analyze the image and respond ONLY with valid JSON.

{
  "name": "...",
  "material": "...",
  "weightKg": 0,
  "quantity": 0,
  "description": "...",
  "confidence": 0
}

Rules:

"name" should be a short title such as:
"Pile of Cardboard"
"Mixed Plastic Waste"
"Scrap Metal"
"Wood Pallets"

"description" should briefly describe what is visible.

"material" must be one of:

Wood
Metal
Plastic
Fabric
Paper
E-waste
Mixed
Organic

Return ONLY JSON.
"""

EMPTY_TRADE_RESULT = {
    "itemName": "",
    "category": "",
    "material": "",
    "weightKg": None,
    "confidence": 0,
}

EMPTY_SPOT_RESULT = {
    "material": "",
    "weightKg": None,
    "quantity": None,
    "confidence": 0,
}


class ContentBlockedError(Exception):
    """Raised when Gemini declines to analyze the image for content-safety
    reasons (as opposed to a transient/processing failure)."""


def _build_safety_settings():
    from google.generativeai.types import HarmBlockThreshold, HarmCategory

    return {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
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


def assess_trade_photo(image_file):
    """Returns a suggestion dict for a trade item photo. Never raises — on any
    failure (missing key, timeout, bad response) it returns a zero-confidence
    empty suggestion so the user can always fall through to manual entry.
    `blocked` is True only when the photo itself was refused for content
    safety reasons, distinct from an ordinary processing failure."""
    try:
        result = _call_gemini(image_file, TRADE_ASSESSMENT_PROMPT)
        return {**EMPTY_TRADE_RESULT, **result, "blocked": False}
    except ContentBlockedError:
        current_app.logger.info("Gemini blocked a trade photo for content safety")
        return {**EMPTY_TRADE_RESULT, "blocked": True}

    
    except Exception as e:
        current_app.logger.exception("Gemini resource spot assessment failed")
        print("\n===== GEMINI ERROR =====")
        print(e)
        print("========================\n")

    return {
        **EMPTY_SPOT_RESULT,
        "blocked": False,
    }


def assess_resource_spot_photo(image_file):
    try:
        result = _call_gemini(image_file, RESOURCE_SPOT_ASSESSMENT_PROMPT)
        return {**EMPTY_SPOT_RESULT, **result, "blocked": False}
    except ContentBlockedError:
        current_app.logger.info("Gemini blocked a resource spot photo for content safety")
        return {**EMPTY_SPOT_RESULT, "blocked": True}
    except Exception:
        current_app.logger.exception("Gemini resource spot assessment failed")
        return {**EMPTY_SPOT_RESULT, "blocked": False}
