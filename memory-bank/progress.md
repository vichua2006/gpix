# Progress

## What Works
- Screenshot capture with Electron desktopCapturer and primary-display DPI mapping.
- Screen-sized WebGL selection with dimming, red rectangle, drag selection, and Escape cancellation.
- BGRA-to-RGBA conversion, physical-resolution canvas, nearest-neighbor filtering, and integer region bounds.
- Gemini API conversion, optimized PNG preparation, and automatic LaTeX clipboard copy.
- React settings window, API key validation/visibility toggle, keytar storage, and .env development fallback.
- Tray Open/Quit actions, app icon, custom title bar, and dark theme.
- Success/error toasts with CSS fades and 2.5-second dismissal.
- Windows x64 NSIS installer and separate Mac Intel/Apple Silicon DMG targets.

## Current Status
Version 1.0.3 contains the macOS window fixes and updated release documentation. Local checks passed; the tagged release build is pending the push and CI completion.

## Fixes in 1.0.3
- macOS selection opens as a panel over the current Space instead of entering native fullscreen and animating to a new Space.
- Overlay covers the primary display at its actual origin, including menu bar and Dock.
- Missing Mac Screen Recording permission produces a warning and resets capture state, rather than presenting an incomplete screenshot.
- Toast native shadow and macOS native window corners are disabled; CSS controls the visible shape and shadow.

## CI and Release Behavior
- Main pushes, main pull requests, and manual runs build installers and upload artifacts for 14 days.
- Version tags (for example `1.0.3` or `v1.0.3`) must match `package.json` after stripping an optional `v`.
- Tag builds create a draft GitHub release with all three installers after every platform build succeeds.
- CI checks JavaScript syntax; Mac jobs additionally verify bundle signatures and load packaged sharp/keytar native modules.
- Releases are not automatically published. Packaging checks do not replace manual screenshot/Gemini verification.

## Testing Status
- macOS panel: display bounds, no native fullscreen event, all-Spaces behavior, drag selection, and Escape cancellation passed in Electron.
- Toast: success/error rendering, transparent corners, no native shadow, non-focusable window, and auto-dismissal passed in Electron.
- Permission guard: denied/not-determined Mac states rejected; granted and Windows paths retained capture conversion.
- Normal installed Mac app captured other apps after its stale Screen Recording grant was reset and re-added.
- Local JavaScript syntax, whitespace, and matching package/lockfile version checks passed.
- New installer runtime check and tagged CI build remain pending.

## Known Issues and Follow-ups
- Main UI uses nodeIntegration and disables context isolation for React loading; production hardening remains separate work.
- Mac builds are ad-hoc signed; trusted Developer ID signing and notarization are not configured.
- Replacing an ad-hoc-signed Mac app can invalidate its Screen Recording grant despite an enabled Settings toggle. Fully quit/reopen and, if necessary, regrant access to the exact installed app.
- Primary-display capture only; multi-monitor support and shortcut customization remain future work.

## Important Implementation Details
- Shortcut: Cmd+Shift+S on macOS, Ctrl+Shift+S elsewhere (`CommandOrControl+Shift+S`).
- State flow: idle → capturing → selecting → processing → idle.
- Overlay closes before API processing; cleanup runs on Escape and completion.
- Images stay in memory; sharp resizes to at most 1024px and compresses PNG.
- Gemini configuration: v1 API, gemini-2.5-flash-lite, maxOutputTokens 2048, temperature 0.1.
- API key: OS keychain; .env is only a development fallback.
- Build commands: `npm run build:win -- nsis --x64 --publish never`; `npm run build:mac -- dmg --arm64 --publish never` (or `--x64`).
