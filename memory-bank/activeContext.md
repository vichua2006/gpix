# Active Context

## Current Work Focus
Release 1.0.3: macOS selection overlay and toast window rendering fixes.

## Recent Changes
- README build/release documentation is now a short summary; full commands, workflow, and Mac packaging decisions live in [build-and-releases.md](build-and-releases.md).
- macOS selection uses a screen-sized `panel`, with native fullscreen disabled. It stays on the current Space without the fullscreen transition, including above fullscreen apps.
- Overlay bounds use the primary display's origin and size. The screen-saver window level covers the menu bar and Dock; mouse selection and Escape cancellation remain intact.
- Toast windows disable native shadows and macOS native rounded corners, with an explicitly transparent background. CSS retains the rounded toast, shadow, colors, and fades; the 2.5-second dismissal and non-focusable window remain.
- Capture checks macOS Screen Recording permission after `desktopCapturer.getSources()`. A missing grant produces an actionable warning instead of a wallpaper/app-only selection overlay.
- GitHub Actions builds Windows x64 NSIS and separate macOS Intel/Apple Silicon DMGs. Main pushes compile installers; version tags compile and create a draft release with all three installers after successful builds.
- Package and lockfile versions are 1.0.3; the release tag must match (an optional `v` prefix is supported).

## Verification
- Native macOS overlay smoke check passed: exact display bounds, no native fullscreen event, all-Spaces panel, drag selection, and Escape cancellation.
- Native Electron toast check passed for success/error messages, transparent corners, disabled native shadow, no focus stealing, and auto-dismissal.
- Permission guard checked for denied/not-determined macOS states and normal granted/Windows capture.
- Actual installed app capture was verified after resetting/regranting its stale macOS permission entry. The installed app has the panel fix; it needs a new build to include the permission guard and toast fix.
- JavaScript syntax, diff whitespace, and package/lockfile release-version checks passed. Release CI still needs to finish after the tag is pushed.

## Decisions and Operational Guidance
- Preserve screenshot selection behavior while avoiding macOS native fullscreen Spaces.
- `CommandOrControl+Shift+S` means Cmd+Shift+S on macOS and Ctrl+Shift+S on Windows/Linux.
- Ad-hoc Mac signing is configured; Developer ID signing and notarization remain unconfigured.
- A permission toggle can appear enabled while capture is denied after replacing an ad-hoc-signed app. Fully quit/reopen first; a targeted ScreenCapture reset and re-adding the exact installed app restored capture in this session.
- Inspect the normally launched app when debugging permissions: a directly spawned diagnostic process reported a different permission state during this investigation.
- Always set `AI_AGENT=true` for project commands. Stop immediately if a command reports that execution was stopped to prevent production operations.
- `.cursor/01-memory.mdc` governs ongoing project work and memory-bank updates: read all bank files, then document current state, next steps, and relevant decisions.

## Next Steps
- Check the 1.0.3 tag workflow and generated draft release; publication is a separate action.
- Validate the new installed Mac build with Cmd+Shift+S, region selection, clipboard output, and toast appearance. Regrant Screen Recording permission if replacement invalidates it.
- Main settings UI still uses `nodeIntegration: true` and `contextIsolation: false`; harden it with preload/bundling in a separate change.
- Optional future work: multiple monitors and shortcut customization.
