# Builds and Releases

Source of truth: `.github/workflows/build.yml`, `package.json`, and `build/sign-mac.js`. This describes the configured workflow, not the status of an individual release.

GitHub Actions builds Windows x64 and separate Mac Intel/Apple Silicon installers on pushes to `main`, pull requests to `main`, and manual runs. Each job runs `npm ci`, checks JavaScript syntax, and packages with electron-builder. Mac jobs also verify bundle signatures and load the packaged `keytar` and `sharp` native modules. Installers are available under the run's **Artifacts** for 14 days. This verifies packaging; screenshot capture and Gemini conversion still need a manual app check.

Pushing a version tag (`v1.0.3` or `1.0.3`) builds all three installers and attaches them to a **draft GitHub release** after every build succeeds. The tag must match `package.json`'s version so the release and installer versions stay aligned. Review and publish the draft from GitHub Releases.

For a new release, bump the package and lockfile version with `npm version <version> --no-git-tag-version`, commit the change, then tag that commit and push the branch/tag when ready.

Local builds: `npm ci`, then `npm run build:win` or `npm run build:mac`. Use `npm run build:mac -- dmg --arm64 --publish never` or `npm run build:mac -- dmg --x64 --publish never` to build one Mac architecture. Outputs go to `dist/`. CI builds each Mac architecture on a matching runner because `keytar` and `sharp` contain native binaries.

DMG is the default for drag-to-Applications installation. ZIP is useful for portable distribution or future auto-update payloads; PKG is useful for managed deployments. A universal DMG can cover both Mac architectures in one download, but requires merging and checking both native dependency sets. Separate DMGs keep downloads smaller and builds simpler. None of these formats replaces Apple signing/notarization. To enable trusted Mac releases, configure `CSC_LINK`/`CSC_KEY_PASSWORD` and Apple's notarization credentials in a future protected release build; keep PR builds limited to ad-hoc signing.
