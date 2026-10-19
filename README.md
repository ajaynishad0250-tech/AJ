# AJAY JARVIS AI

Android-first Hindi/English voice assistant starter built with Expo React Native.

## Includes
- Hindi and English speech recognition and spoken replies.
- Chat UI connected to an optional server-side AI proxy.
- Provider API keys stay on the server.
- Permission-first Android voice-control design notes.

## Build APK from Termux
```sh
git clone https://github.com/ajaynishad0250-tech/AJ.git
cd AJ
npm install
npx expo install --fix
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```
Download the APK from the EAS build page on your phone. Local adb is not needed to download it.

## AI backend
See backend/.env.example. Deploy backend/server.js to a trusted Node host, set AI_API_KEY and related variables on the server, then build with EXPO_PUBLIC_AI_API_URL set to the server base URL. Never put provider keys in the app or in EXPO_PUBLIC variables.

## Voice-control safety
See android-native/VOICE_CONTROL.md. This is a starter scaffold, not a finished always-listening assistant. Full control of other apps requires Android-native APIs and explicit user consent; it cannot be silently enabled by an Expo app.
