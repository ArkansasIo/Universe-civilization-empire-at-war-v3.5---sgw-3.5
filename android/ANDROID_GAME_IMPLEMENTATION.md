# Android Game Implementation Notes

## Architecture

```
Android Java shell
  ├── WebView -> deployed React/TypeScript game on GitHub Pages
  ├── GameConfig -> HTTPS API URL preference
  └── GameApiClient -> asynchronous JSON transport
                       |
                       v
               deployed API service
                       |
                       v
                  PHP / MySQL
```

The repository already contains the game's broad feature set in its React application (empire dashboard, resources, research, combat, espionage, planets, fleets, mothership, rankings, market and administration). Hosting that same application in a WebView is the way for the APK to reuse those screens without rewriting every feature a second time in Java.

## Routes

The current contract is documented in the root `API_CONTRACT.md`. Expected routes include health, register, login, commander, resources, planets, fleet, research, stargates and turn processing. The Android transport does not assume a route is deployed and does not fabricate a successful response.

## Acceptance checks

1. `gradle --no-daemon assembleDebug` produces the debug APK.
2. On Android 10, the launcher opens without requiring a newer API level.
3. The game URL is loaded with JavaScript and DOM storage enabled.
4. A connection failure displays retry instructions instead of a blank screen.
5. External hosts open in the browser; the game host remains in the WebView.
6. The API settings dialog rejects non-HTTPS URLs.
7. API health checks run off the UI thread and report the HTTP/API response.
8. No production secrets are present in source or APK configuration.
