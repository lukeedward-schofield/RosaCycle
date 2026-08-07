TRADE_ASSESSMENT_PROMPT = """
You are analyzing a photo of reusable materials.

Return ONLY valid JSON.

{
    "itemName": "",
    "category": "",
    "material": "",
    "description": "",
    "weightKg": 0,
    "quantity": 1
}

Rules:

- title should be short (2-5 words).
- category should be one of:
  Plastic
  Metal
  Glass
  Paper
  Electronics
  Textile
  Wood
  Rubber
  Mixed

- material should identify the specific material whenever possible.
- description should be one concise sentence describing the visible item(s).
- quantity should estimate the number of reusable items visible.
- estimatedWeightKg should estimate the total weight in kilograms.

If you are not confident:
- use "" for text fields
- use 0 for numeric fields

Never output markdown.
Never explain your reasoning.
Return ONLY the JSON object.
"""