# EM3K Viewer

This is the browser-based learner experience for Edumatic 3000. The viewer is a Vite + Preact app that runs as an offline-first Progressive Web App and is designed to work with portable course packages without requiring the Laravel server to be running.

The current app loads bundled packages from the local content tree, accepts ZIP-based course imports from the Library, validates package structure and asset references, and stores installed course state and learner progress in IndexedDB in the browser. It also supports course-scoped progress and uninstall persistence.

## Current state of the app

The viewer currently includes:

- A dashboard for active courses and quick navigation
- A Library page for activating, deactivating, and uninstalling courses
- ZIP import support for installing additional course packages
- A course viewer route for packaged lesson content
- Help, About, Settings, Donate, Share, Search, and Report screens
- PWA registration and install support for offline use
- Bundled sample content and validation checks for course packages

Current limitations:

- Catalog browsing is still a placeholder; it does not yet connect to a live catalog service
- The server-side publishing workflow is not connected to this client
- Progress sync and multi-device sync are not implemented yet; state stays local to the browser

## Running locally

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

The app is served by Vite at http://localhost:5173.

To create a production build:

```sh
npm run build
```

## Project structure

```text
em3k-viewer/
├── public/
│   └── content/
│       ├── bundled-courses.json
│       └── bundled/
├── scripts/
│   └── validate-content.js
├── src/
│   ├── App.jsx
│   ├── contexts/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   ├── schemas/
│   └── stores/
├── CONTENT_FORMAT.md
├── package.json
├── vite.config.js
├── index.html
└── README.md
```

Key implementation areas:

- src/App.jsx: route definitions and app bootstrap
- src/contexts/LibraryContext.jsx: loaded registry, installed course list, and library actions
- src/lib/coursePackages.js: registry loading, package validation, archive extraction, and asset resolution
- src/lib/courseStorage.js: IndexedDB-backed install and active-state storage
- src/schemas/: JSON schemas used to validate bundled content and lesson definitions
- scripts/validate-content.js: offline validation script for bundled course packages

## Course package format

The package contract is documented in [CONTENT_FORMAT.md](CONTENT_FORMAT.md). The viewer expects an em3k course package to include a course manifest, lesson JSON files, and any referenced assets.

Bundled content is registered in public/content/bundled-courses.json, and the actual package files live under public/content/bundled/.

Validation is strict:

- the bundled registry must match the schema
- each listed course must exist at the expected path
- course and lesson IDs must match their references
- lesson page IDs and block structure are checked
- image/video asset references must exist

## Validating bundled content

Run the validation script before shipping bundled content changes:

```sh
npm run validate:content
```

This checks the bundled registry and all referenced course and lesson files for schema and asset integrity.

## Library behavior

The Library page can:

- show active and inactive courses
- toggle a course on or off for the current device
- uninstall imported packages
- import a zipped course package from disk
- keep installed packages and course metadata in IndexedDB

Uninstalling an imported course removes its package but intentionally preserves its learner progress on this device. Reinstalling a package with the same course ID resumes that saved progress. Course IDs that are already installed or used by bundled courses are rejected during import rather than overwritten.

## Course progress

Progress is stored in the existing IndexedDB `progress` store, keyed by permanent course ID. Each record has an independent `formatVersion`, the associated course version, a stable-ID last location, unique visited page IDs grouped by lesson, completed lesson IDs, quiz attempts, an explicit course-completion timestamp, and an update timestamp. Existing `stepIndex` records are converted using the currently installed course structure. Migration preserves legacy completion but does not invent page visits or quiz attempts.

Opening a page records it once. A lesson without a quiz is marked complete when the learner advances beyond its final page. A quiz lesson is marked complete only after a passing attempt is saved. Quiz and Answers are separate navigation steps; submitted answers are keyed by question ID and remain available for review. Score-only historical attempts remain readable without fabricated responses. Quiz retakes append attempts; `allowRetakes` optionally permits a new attempt after passing and defaults to `false`, while failed attempts are always retryable. The highest passing percentage is derived from retained attempts. Course completion is recorded only after all lesson completion conditions are met and remains recorded if the learner later reviews earlier content.

The status-bar percentage is the number of unique visited page IDs that still exist in the installed course divided by its current page count. It indicates navigation history, not verified mastery. If future course revisions add pages, the larger denominator can lower the percentage; removed pages no longer count in the numerator or denominator. Historical lesson completion and quiz results remain associated with their stable lesson IDs.

This is intentionally local-first; the app does not rely on a remote catalog or server for core playback.

## Current bundled content

The app currently ships with bundled content that is visible in the Library and relevant Help screens. At the moment, packages are intended to be local and portable rather than served from a remote catalog.

## Notes

This viewer is primarily a client-side course player and library manager. The broader edtech platform and server-side catalog/publishing pieces live elsewhere in the repository ecosystem, while this app focuses on portable package playback and local learning workflows.
