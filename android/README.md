# Universe Civilization: Empire at Wars — Android

This Android application is a native, mobile-sized shell around the repository's existing React/TypeScript game. It opens the deployed GitHub Pages game so the existing game screens and mechanics are reused rather than duplicated in a separate, incomplete native port.

## Build

Requires JDK 17 and Android SDK platform 35 / build tools 35.0.0.

```bash
cd android
gradle --no-daemon assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`.

The GitHub Actions workflow builds and uploads the debug APK as the `universe-civilization-debug-apk` artifact.

## Android implementation

- Mobile-friendly WebView host for the existing full React game.
- Navigation controls for Game, Reload and API settings.
- Loading indicator and offline/retry page when the hosted game cannot be reached.
- WebView JavaScript and DOM storage enabled for the game; file access, mixed content and cleartext traffic disabled.
- HTTPS-only API base URL configuration.
- Asynchronous JSON API client for the routes documented in `../API_CONTRACT.md`.
- External links open in the device browser; links on the game's GitHub Pages origin stay in-app.
- Back button navigates within game history before exiting.
- App target SDK 35; minimum SDK 23 (Android 6+) and compatible with Android 10 / Huawei P20.

## Live game and backend status

The APK does not contain the PHP/MySQL production server. The game UI is loaded from:

`https://arkansasio.github.io/Universe-civilization-empire-at-war-v3.5---sgw-3.5/`

That URL must be successfully deployed to GitHub Pages for the full browser game to load. When it is offline, the app shows a retry page instead of inventing live game state.

API routes are defined in `../API_CONTRACT.md`. An API URL can be entered from **API** in the Android toolbar. The included Java client supports HTTPS JSON requests, but the server must implement and deploy the routes before live accounts, synchronized resources, fleets, planets, or turns can work. A client wrapper is not a substitute for a running authenticated backend.

## Security

- No database passwords, signing secrets, API keys or service credentials are bundled.
- The API URL must use HTTPS.
- Never disable certificate validation or send account credentials to an untrusted endpoint.
- This workflow creates a debug APK. A distributable release APK should be signed with GitHub Actions secrets or a local protected keystore; do not commit keystores or passwords.
