# Safe Android voice-control architecture

This starter uses user-initiated speech recognition and spoken replies. It does not silently operate other apps or run an always-on microphone.

## Recommended architecture
1. Voice UI: microphone starts only after the user taps the mic; show listening state and stop on end/error.
2. Intent router (future): allow-list safe intents such as opening an app or reading a user-provided note.
3. Native Android bridge (future): use supported Android APIs and request the required runtime permissions.
4. Accessibility Service (optional native module): use only for a genuine accessibility use case. Disclose its behavior and require manual enablement in Android Settings.
5. Confirmation gate: require explicit confirmation before sending messages, deleting content, purchases, changing security settings, or other consequential actions.
6. Stop controls: visible running state, stop button, and logs that avoid storing message contents or credentials.

## Rules
- Never ask for passwords, OTPs, or payment PINs.
- Do not store microphone recordings without separate explicit opt-in.
- Do not use Accessibility to bypass security prompts or automate financial transactions.
- Respect Android background execution limits and foreground-service notification requirements.
- Keep provider API keys on a server, never in the APK or EXPO_PUBLIC variables.
- Test permission denial, cancellation, offline mode, and speech recognition mistakes before enabling native actions.

## Native implementation note
A real Accessibility Service needs Android Kotlin code, manifest declarations, a disclosure screen, and manual enablement in system settings. This starter does not claim those capabilities are implemented.
