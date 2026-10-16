# Universe Civilization Android Companion

Native Android project for the Universe Civilization: Empire at Wars repository.

## Build

Requires JDK 17 and Android SDK platform/build tools installed by Android Studio or GitHub Actions.

```bash
cd android
gradle assembleDebug
```

The debug APK is written to:

`android/app/build/outputs/apk/debug/app-debug.apk`

The GitHub Actions workflow `.github/workflows/android-apk.yml` builds the APK and uploads it as an Actions artifact.

## Current implementation

- Native Java Android launcher application.
- Command dashboard and navigable companion sections.
- Internet permission for future API calls.
- Android application ID: `com.arkansasio.universecivilization`.
- Version: `3.5.0`.

## API integration

See `API_CONTRACT.md`. The app deliberately does not point to localhost or invent a production server. Configure a deployed HTTPS API base URL before connecting live game accounts/data. Do not put database credentials, service-account keys, or private tokens in the APK.

## Note

This is a mobile companion shell and APK build scaffold. It does not port the entire React game engine to native Android, and live game APIs must be deployed and authenticated separately.
