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

- itemName should be short.
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

- material should be as specific as possible.
- description should be one concise sentence.
- quantity should estimate how many visible reusable objects exist.
- weightKg should estimate the total weight.

Never output markdown.

Never explain anything.

Only output JSON.
"""