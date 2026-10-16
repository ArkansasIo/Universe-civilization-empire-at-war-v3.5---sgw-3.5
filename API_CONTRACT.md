# Universe Civilization Mobile API Contract

This contract defines HTTPS JSON endpoints for the Android companion and web client. It does not imply that the endpoints are already deployed. Route implementations should live in the server backend and authenticate every private operation.

## Conventions

- Base URL: `https://YOUR_API_HOST/api/v1`
- Content type: `application/json`
- Private endpoints require `Authorization: Bearer <access-token>`.
- Never ship database credentials or privileged service keys in the Android APK.
- Return non-2xx status codes for failures with `{ "error": { "code": "...", "message": "..." } }`.
- Validate and authorize resource ownership on every request.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Service health/version |
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Authenticate and issue access token |
| GET | `/commander` | Current commander profile |
| GET | `/resources` | Current resource balances |
| GET | `/planets` | Player-owned colonies |
| GET | `/fleet` | Player-owned fleet overview |
| GET | `/research` | Technology and active research |
| GET | `/stargates` | Authorized gate network status |
| POST | `/turn/process` | Process a turn (idempotency key required) |

## Example responses

### GET /health

```json
{ "status": "ok", "service": "universe-civilization-api", "version": "1.0.0" }
```

### GET /resources

```json
{
  "naquadah": 120000,
  "bankedNaquadah": 45000,
  "metal": 80000,
  "crystal": 24000,
  "deuterium": 9000,
  "energy": 2200,
  "darkMatter": 0
}
```

Sample values are illustrative only; production responses must come from authorized game state.

## Android connection policy

Use HTTPS in release builds. Keep the API URL configurable through build configuration or a settings screen. Do not disable TLS validation. Refresh tokens securely and use short-lived access tokens. Do not store passwords or long-lived secrets in plain text.

## Server implementation checklist

1. Add the routes to the existing PHP backend or a dedicated API service.
2. Use prepared SQL statements and database transactions for writes.
3. Implement password hashing, rate limiting, validation and token expiry.
4. Enforce player ownership for planets, resources, fleets and research.
5. Make turn processing atomic and idempotent.
6. Add integration tests before pointing the Android client at production.
