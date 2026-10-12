# FakePay · AUREL

An iPhone-only fictional wallet. Interactive demo authentication adds a pulsing face scan, retry controls, and an optional fictional keypad to the minimalist AUREL wallet. No real payments, NFC, payment account information, or biometric verification.

## Run on an iPhone

1. Install dependencies with `npm install` if needed.
2. Run `npx expo start --clear`.
3. Connect your computer and iPhone to the same Wi-Fi network.
4. Scan the terminal QR code with the iPhone Camera and open in Expo Go.

## Authentication test checklist

- **Wallet:** the existing dark AUREL card and session placeholder remain unchanged. Tap Continue.
- **Face ID:** only “Face ID” appears below the centered, gently pulsing custom icon. After 2.5 seconds, Passcode appears. Waiting must never advance the session.
- **Passcode:** tap Passcode to open the separate light-gray full-screen demo. Confirm Simulation, Demo Passcode, six empty dots, and a circular numeric keypad.
- **Entry:** use six made-up digits. Each tap fills one dot; delete removes one. After six taps, wait 200ms for a 400ms horizontal shake. The dots then clear for another attempt. Extra taps and delete are ignored until the shake finishes. No entered digit values are retained, logged, stored, or transmitted; only the tap count is tracked.
- **Haptics:** with haptics On in Settings, expect one light impact at the start of each shake. Repeat with Off and expect none. iOS may suppress feedback through system settings or Low Power Mode.
- **Cancel:** cancel during entry, the delay, and the shake. Return to Face ID with Passcode immediately available; reopening always starts with six empty dots.
- **Interruption:** background or lock the phone during entry or the shake. Return to a cleared keypad without a delayed haptic. Closing the payment screen cancels the session.
- **Accessibility:** test larger text, scrolling, and Reduce Motion. Reduce Motion keeps the face icon and dot row static while preserving the retry/reset behavior.
- **Settings:** confirm error selection, saved delay, and haptic preferences still persist after reloading.

The authentication UI never succeeds or automatically proceeds to the reader. The older processing/reader/error sequence remains in the controller, but the new passcode view always rejects demo entries. The saved authentication-delay setting is retained; the Face ID fallback uses a fixed 2.5-second delay. Preferences stay on the device under `@fakepay/settings/v1`.

## Checks

- `npm run lint -- --no-cache`
- `npm run typecheck`
- `node tests/prankSequence.test.cjs`
- `node tests/prankSettings.test.cjs`
- `node tests/demoPasscode.test.cjs`

## Structure

- `src/app/`: Router layout, wallet, payment, passcode, and settings routes.
- `src/components/`: reusable card, screen layout, buttons, icons, choice rows, and animation visuals.
- `src/context/SettingsContext.tsx`: preference loading and ordered AsyncStorage writes.
- `src/hooks/`: sequence lifecycle, haptics, and Reduce Motion preference.
- `src/utils/`: settings validation and cancellable state machine.
- `src/theme/`: shared monochrome colors.

The UI uses the iOS system font and React Native animation. Expo-compatible AsyncStorage and LinearGradient provide persistence and the card finish; both are bundled in Expo Go. `react-native-svg` renders the custom face and reader icons and is also bundled in Expo Go. Pulsing uses React Native’s native animation driver; Reduce Motion disables it.
