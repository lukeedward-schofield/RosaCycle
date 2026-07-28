# RosaCycle Backend API Reference

A complete reference for every endpoint currently implemented. Written for whoever wires the frontend up to this backend — read this instead of the Flask source.

## Base URL

Local dev: `http://localhost:5000`
Deployed: whatever Railway domain the project owner gives you (ask them — the CLI session that built this backend was deliberately unlinked from Railway so the deployed project could be handed off cleanly).

## Auth

All endpoints require a JWT **except**: `POST /auth/register`, `POST /auth/login`, `GET /health`, `GET /`, `GET /media/<path>`.

Flow: call `POST /auth/register` or `POST /auth/login` → both return `{"token": "...", "user": {...}}` → send that token on every subsequent request as:

```
Authorization: Bearer <token>
```

There is no refresh-token flow and no server-side session/blocklist — tokens are stateless JWTs with no built-in expiry handling beyond whatever `flask-jwt-extended`'s defaults are. `POST /auth/logout` is a no-op that just returns `{"success": true}` — actually discarding the token client-side (e.g. clearing local storage) is what "logs out" the user.

## Error format

Every error (validation, not-found, forbidden, conflict, or unexpected) returns:

```json
{ "error": "Human-readable message." }
```

with an appropriate HTTP status code:

| Status | Meaning | Example cause |
|---|---|---|
| 400 | Validation error | Missing required field |
| 401 | Auth failure | Missing/invalid JWT, wrong login credentials |
| 403 | Forbidden | Acting on a resource you don't own (e.g. editing someone else's trade) |
| 404 | Not found | Bad ID in a URL |
| 409 | Conflict | e.g. sending an offer on a trade that's already reserved, re-deciding an already-decided offer |
| 422 | Unprocessable | Reserved for stricter validation, currently used interchangeably with 400 in a couple of spots |
| 500 | Server error | Unexpected/unhandled exception |

## Request formats — read this before wiring forms

Most endpoints take a plain **JSON body** (`Content-Type: application/json`). Exactly **three** take **`multipart/form-data`** instead, because they accept an image file alongside text fields:

- `POST /trades` (create trade)
- `POST /trades/:id/offers` (send offer)
- `POST /resource-spots` (report resource spot)
- (also `PATCH /trades/:id`, `PATCH /users/me`, `POST /resource-spots/:id/photos` — anything that can attach/replace an image)

For those, send a `FormData` body with each field as a form field (not nested JSON) and the image under the key `image`. Don't set `Content-Type` manually for `FormData` — let the browser set the multipart boundary.

## Enum values — exact casing the API returns

These are lowercase (Python enum `.value`), not capitalized. Map to whatever display labels you want on the frontend — don't guess the casing.

- **Trade status**: `open` | `reserved` | `completed`
- **Offer status**: `pending` | `accepted` | `declined`
- **Resource Spot status**: `active` | `collected`
- **Trading-for type**: `specific` | `nothing` | `negotiating`
- **User role**: `user` | `admin`
- **Notification type**: `offer_received` | `offer_accepted` | `offer_declined`

## Images

Any `image` field in a response is either `null` or a full URL (already resolved against `PUBLIC_BASE_URL`) — e.g. `"https://.../media/trades/<uuid>.jpg"`. Just use it directly as an `<img src>`; don't try to construct the URL yourself.

---

## Auth

### `POST /auth/register`
Public. JSON body:
```json
{ "username": "luke", "firstName": "Luke", "lastName": "S", "email": "luke@example.com", "password": "password123" }
```
→ `201`
```json
{ "token": "...", "user": { "id": "...", "username": "luke", "firstName": "Luke", "lastName": "S", "email": "luke@example.com", "profileImage": null, "role": "user", "createdAt": "2026-07-28T12:01:44+00:00" } }
```
`409` if email or username is already taken.

### `POST /auth/login`
Public. JSON body: `{ "email": "...", "password": "..." }` → `200` same shape as register. `401` on wrong credentials.

### `POST /auth/logout`
Auth required. No body. → `200 { "success": true }`. Doesn't invalidate the token server-side.

---

## User

### `GET /users/me`
Auth required. → `200`, the current user (same shape as the register/login `user` object).

### `PATCH /users/me`
Auth required. **Multipart** form fields, all optional: `firstName`, `lastName`, `username`, `email`, `password`, `currentPassword` (required if changing `username`/`email`/`password`), file field `image` for a new profile photo.

Business rule: changing username/email/password/photo is rate-limited to once every `PROFILE_EDIT_COOLDOWN_DAYS` (default 7) — a second sensitive change within that window returns `409` with a "you can update again in N day(s)" message.

→ `200`, updated user object. `403` if `currentPassword` is missing/wrong when required.

---

## Trade

Trade object shape (returned by all trade endpoints):
```json
{
  "id": "...", "name": "Old Woods", "category": "Wood", "material": "Reclaimed lumber",
  "image": null, "location": "Balibago, Santa Rosa, Laguna", "pickupLocation": null,
  "posterName": "Luke", "posterId": "...", "weightKg": 4.5, "quantity": 1,
  "tradingFor": { "type": "negotiating", "value": null },
  "description": "...", "status": "open", "hasOffers": false, "offerAccepted": false,
  "createdAt": "2026-07-28T12:01:44+00:00"
}
```
Note: `hasOffers`/`offerAccepted` are computed from the trade's offers at read time — they're not stored fields, always trust what the API returns rather than caching/deriving them yourself.

### `GET /trades`
Auth required. Query params (both optional): `?category=Wood`, `?location=Santa+Rosa`. Returns all **other users'** open/reserved/completed trades (excludes your own) — this is the Browse view. → `200`, array of Trade.

### `GET /trades/mine`
Auth required. → `200`, array of your own trades (Track Trades / My Trades view).

### `GET /trades/:id`
Auth required. → `200`, single Trade. `404` if not found.

### `POST /trades`
Auth required. **Multipart.** Required fields: `itemName`, `category`, `material`, `locationText`, `quantity`, `tradingForType` (one of `specific`/`nothing`/`negotiating`). Optional: `description`, `weightKg`, `pickupLocationText`, `tradingForValue` (required in practice if `tradingForType` is `specific`), file `image`. → `201`, the created Trade.

### `PATCH /trades/:id`
Auth required, **owner only** (`403` otherwise). **Multipart.** Any of the same fields as create, all optional — only sent fields get updated. → `200`, updated Trade.

---

## Offer

Offer object shape:
```json
{
  "id": "...", "tradeId": "...", "tradeName": "Old Woods",
  "offererId": "...", "offererName": "Aero",
  "itemName": "Old Bond Paper", "category": "Paper", "material": "Clean sheets",
  "weightKg": 2.0, "description": "...", "image": null,
  "status": "pending", "createdAt": "...", "decidedAt": null
}
```

### `POST /trades/:id/offers`
Auth required. **Multipart.** Required: `itemName`, `category`, `material`. Optional: `weightKg`, `description`, file `image`.

Business rules enforced: you can't offer on your own trade (`403`); the trade must be `open` (`409` if already `reserved`/`completed` — **a trade can only have one active/pending offer at a time**, this is the core invariant). On success the trade flips to `reserved`. → `201`, the created Offer.

### `GET /trades/:id/offers`
Auth required. → `200`, array of Offers on that trade (there will only ever be at most one `pending` at a time, but past `declined` ones stay in history).

### `POST /offers/:id/accept`
Auth required, must be the **trade owner** (`403` otherwise). Offer must be `pending` (`409` if already decided). On success: offer → `accepted`, trade → `completed`, offerer gets an `offer_accepted` notification. → `200`, updated Offer.

### `POST /offers/:id/decline`
Same auth/ownership rules as accept. On success: offer → `declined`, **trade reopens to `open`** (so a new offer can be sent), offerer gets an `offer_declined` notification. → `200`, updated Offer.

### `GET /offers/mine`
Auth required. → `200`, array of offers **you sent** (on other people's trades).

### `GET /offers/received`
Auth required. → `200`, array of offers **received** on your own trades.

---

## Resource Spot

Resource Spot object shape:
```json
{
  "id": "...", "name": "Garbage Pile", "material": "Plastic",
  "weightKg": 6.5, "quantity": 12, "description": "...",
  "location": "Tagapo, Santa Rosa, Laguna", "permissionNote": "Public area, no permission needed.",
  "image": null, "status": "active", "reporterId": "...", "reporterName": "Luke",
  "createdAt": "...", "expiresAt": "..."
}
```
No lat/lng — location is free text only (MVP scope decision). Map UI needs to render pins some other way (e.g. geocode `location` client-side, or just list them) — this is a known frontend gap, not something the API provides.

### `GET /resource-spots`
Auth required. → `200`, array of currently **active and unexpired** spots only (expired/collected ones are filtered out server-side — no client-side filtering needed).

### `GET /resource-spots/:id`
Auth required. → `200`, single spot (includes expired/collected ones too, unlike the list endpoint). `404` if not found.

### `POST /resource-spots`
Auth required. **Multipart.** Required: `name`, `material`, `locationText`. Optional: `weightKg`, `quantity`, `description`, `permissionNote`, file `image`. → `201`, created spot. `expiresAt` is set automatically (server-configured number of days out).

### `POST /resource-spots/:id/photos`
Auth required — **any authenticated user**, not just the reporter (per spec: "community members may submit a new photo after collecting materials"). **Multipart**, required file `image`. `409` if the spot is already `collected`. → `200`, updated spot with the new photo.

### `POST /resource-spots/:id/collected`
Auth required — again any authenticated user, not owner-restricted. No body. `409` if already collected. → `200`, updated spot with `status: "collected"` (this is when it should disappear from a map view — check `GET /resource-spots` again, it'll be filtered out).

---

## Notification

Notification object shape:
```json
{
  "id": "...", "type": "offer_received", "title": "New offer received",
  "body": "You received an offer on \"Old Woods\".",
  "relatedTradeId": "...", "relatedOfferId": "...",
  "isRead": false, "createdAt": "..."
}
```

### `GET /notifications`
Auth required. → `200`, all your notifications, newest first.

### `GET /notifications/unread-count`
Auth required. → `200 { "count": 3 }` — for a bell-icon badge.

### `PATCH /notifications/:id/read`
Auth required, must be the recipient (`403` otherwise). No body. → `200`, updated notification with `isRead: true`.

---

## Rating

Only usable on **completed** trades, and only by the two actual parties (the trade owner and the offerer whose offer was accepted) rating each other — one rating per direction per trade.

### `POST /trades/:id/ratings`
Auth required. JSON body: `{ "score": 5, "comment": "Great trade!" }` (`score` 1–5 required, `comment` optional). `403` if the trade isn't completed, you're not a party to it, or there's no accepted offer to rate. `409` if you've already rated this trade. → `201`, created rating.

### `GET /users/:id/ratings`
Auth required. → `200 { "ratings": [...], "average": 4.5 }` — `average` is `null` if the user has no ratings yet.

---

## AI (Gemini photo assessment)

Stateless — nothing is persisted by these calls. Always returns `200`, never errors out to the client (falls back to an empty/zero-confidence suggestion if Gemini fails or `GEMINI_API_KEY` isn't set) — always let the user fall through to manual entry regardless of what comes back.

### `POST /ai/assess-trade-photo`
Auth required. **Multipart**, required file `image`. → `200`:
```json
{ "itemName": "", "category": "", "material": "Steel scrap", "weightKg": 4.5, "confidence": 87 }
```

### `POST /ai/assess-resource-spot-photo`
Auth required. **Multipart**, required file `image`. → `200`:
```json
{ "material": "Plastic", "weightKg": 4.0, "quantity": 3, "confidence": 82 }
```

---

## Misc

### `GET /health`
Public. → `200 { "status": "ok" }`.

### `GET /`
Public. → `200`, basic service info — useful for confirming the deployed URL is actually this API before you start integrating.

### `GET /media/<path:filename>`
Public. Serves uploaded images. You should never need to construct this URL manually — every `image` field in every response is already the full resolved URL.
