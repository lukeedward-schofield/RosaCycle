import json

from flask import current_app

TRADE_ASSESSMENT_PROMPT = """You are assisting a circular-economy trading app. Look at the photo of an item
someone wants to trade and respond with ONLY a JSON object (no markdown) with these keys:
"itemName" (short string), "category" (one of: Wood, Metal, Plastic, Fabric, Paper, E-waste, Mixed, Organic),
"material" (short free-text description, e.g. "Steel scrap"), "weightKg" (number, your best estimate),
"confidence" (integer 0-100, your confidence in this assessment)."""

RESOURCE_SPOT_ASSESSMENT_PROMPT = """You are assisting a community resource-recovery app. Look at the photo of a
location containing discarded but reusable materials and respond with ONLY a JSON object (no markdown) with these
keys: "material" (one of: Wood, Metal, Plastic, Fabric, Paper, E-waste, Mixed, Organic), "weightKg" (number, your
best estimate of total material weight), "quantity" (integer, your best estimate of item count),
"confidence" (integer 0-100, your confidence in this assessment)."""

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


def _call_gemini(image_file, prompt):
    import google.generativeai as genai

    api_key = current_app.config.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    image_bytes = image_file.read()
    mime_type = image_file.mimetype or "image/jpeg"

    response = model.generate_content(
        [prompt, {"mime_type": mime_type, "data": image_bytes}],
        generation_config={"response_mime_type": "application/json"},
    )
    return json.loads(response.text)


def assess_trade_photo(image_file):
    """Returns a suggestion dict for a trade item photo. Never raises — on any
    failure (missing key, timeout, bad response) it returns a zero-confidence
    empty suggestion so the user can always fall through to manual entry."""
    try:
        result = _call_gemini(image_file, TRADE_ASSESSMENT_PROMPT)
        return {**EMPTY_TRADE_RESULT, **result}
    except Exception:
        current_app.logger.exception("Gemini trade assessment failed")
        return dict(EMPTY_TRADE_RESULT)


def assess_resource_spot_photo(image_file):
    try:
        result = _call_gemini(image_file, RESOURCE_SPOT_ASSESSMENT_PROMPT)
        return {**EMPTY_SPOT_RESULT, **result}
    except Exception:
        current_app.logger.exception("Gemini resource spot assessment failed")
        return dict(EMPTY_SPOT_RESULT)
