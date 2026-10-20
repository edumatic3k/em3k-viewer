# EM3K Course Content Format

This document describes the em3k course package contract and authoring rules. A package is content, not an application or a server record. The Viewer currently loads bundled packages from `public/content/bundled` and imports packages from ZIP archives; it does not provide a local-directory import flow.

The course, lesson, and bundled-course registry schemas use JSON Schema draft-07. Course and lesson packages use `formatVersion: 1`. The schema is the contract: renderer conveniences that are not accepted by validation are not part of the format.

## Package layout and paths

```text
course-package/
  course.json
  lessons/
    introduction.json
  assets/
    map.svg
```

`course.json` is the package entry point. It contains course metadata and an ordered list of lesson references. Each lesson file contains ordered pages; pages contain typed content blocks. Bundled packages are served as files, while imported packages use a ZIP archive with the same package-relative layout.

Lesson and asset paths are relative to the directory containing `course.json`, not to a lesson file. Use paths such as `lessons/introduction.json` and `assets/map.svg`; do not use `../`, absolute paths, external URLs, backslashes, `.` or `..` path components, queries, or fragments. Referenced image and video files must exist in the package.

The schemas are in `src/schemas/course.schema.json`, `src/schemas/lesson.schema.json`, and `src/schemas/bundled-courses.schema.json`.

## Package boundaries

- Packages contain stable IDs, version, title, description, publisher ID, language, license, lesson order, pages, and assets.
- Publisher profiles belong to the publishing service or catalog. A package refers to a publisher by ID; it does not embed verification claims or a mutable list of that publisher's courses.
- Catalog records contain discovery and distribution data and point to a package version. They do not replace or redefine the package.
- Viewer state (installed course IDs, active state, preferences, and learner progress) is local to the learner and is not part of a published package.
- Bundled viewer content is registered separately. A registry entry may place a bundled package in Help or the Library without changing the package format.

## Bundled course registry

The viewer registry, `public/content/bundled-courses.json`, has this shape:

```json
{
  "formatVersion": 1,
  "courses": [
    {
      "id": "org.em3k.system.sample-peru",
      "entry": "sample-peru/course.json",
      "placement": "library"
    }
  ]
}
```

Each entry requires `id`, `entry`, and `placement`. Placement is exactly `library` or `help`; the entry ID must match the referenced `course.json` ID. The registry's `formatVersion` must be `1`.

## Course manifest

Example `course.json`:

```json
{
  "formatVersion": 1,
  "id": "org.em3k.system.sample-peru",
  "version": "1.0.0",
  "title": "Discovering Peru",
  "description": "A brief introduction to Peru.",
  "publisherId": "em3k-system",
  "language": "en-US",
  "license": "CC-BY-4.0",
  "thumbnail": "assets/Machu_Picchu_Peru.jpg",
  "tags": ["peru", "geography", "beginner"],
  "lessons": [
    {
      "id": "peru-overview",
      "title": "An Introduction to Peru",
      "file": "lessons/peru-overview.json"
    }
  ]
}
```

| Property | Required? | Type / rule | Meaning |
| --- | --- | --- | --- |
| `formatVersion` | Yes | Number, must equal `1` | Package format version, not course revision |
| `id` | Yes | At least 3 characters; lowercase letters/digits, `.`, `_`, `:`, `-` | Stable course ID; publisher qualification is a convention, not checked against `publisherId` |
| `version` | Yes | Semantic-version-like `major.minor.patch`, optional prerelease | Revision of this course |
| `title` | Yes | Nonempty string | Human-readable title |
| `description` | No | String | Course introduction |
| `publisherId` | Yes | Nonempty string using the allowed ID characters | Publisher reference |
| `language` | Yes | 2–3 lowercase letters, optionally followed by `-` and two uppercase country letters | For example, `en`, `en-US`, `es-PE` |
| `license` | Yes | Nonempty string | Licensing identifier or label |
| `thumbnail` | No | Package-relative path | Course intro artwork |
| `tags` | No | Unique array of nonempty strings | Search/discovery metadata |
| `lessons` | Yes | Array with at least one `{id,title,file}` entry | Ordered lesson references |

All lesson reference fields (`id`, `title`, `file`) are required. Lesson IDs use lowercase letters, digits, and hyphens and must match the referenced lesson file's `id`. Additional keys are rejected.

Increment `version` when publishing a changed package. Use `formatVersion` only when the package contract itself changes.

### Thumbnail behavior

`thumbnail` is valid and is resolved from the package root on the course intro screen. The current Dashboard summary omits it and uses a placeholder instead. Supporting thumbnails on the Dashboard requires preserving the field in the summary and resolving assets for both bundled and imported ZIP packages; imported assets may use object URLs.

## Lessons, pages, and blocks

Example lesson:

```json
{
  "formatVersion": 1,
  "id": "peru-overview",
  "title": "An Introduction to Peru",
  "description": "Geography, sights and culture.",
  "pages": [
    {
      "id": "geography",
      "heading": "Peru at a Glance",
      "subhead": "Geography and cultural highlights",
      "blocks": [
        { "type": "text", "content": "Peru lies on the west coast of South America." },
        { "type": "heading", "content": "Highlights", "level": 2 },
        { "type": "image", "src": "assets/Machu_Picchu_Peru.jpg", "alt": "Machu Picchu among the mountains", "caption": "Machu Picchu" },
        { "type": "list", "style": "unordered", "items": ["Capital: Lima", "Currency: sol"] },
        { "type": "callout", "variant": "tip", "title": "Remember", "content": "The capital of Peru is Lima." },
        { "type": "spacer", "size": "medium" },
        { "type": "slideshow", "images": [
          { "src": "assets/Machu_Picchu_Peru.jpg", "alt": "Machu Picchu", "caption": "An Inca site" },
          { "src": "assets/Flag_of_Peru.svg", "alt": "Flag of Peru" }
        ] }
      ]
    }
  ]
}
```

The lesson root requires `formatVersion`, `id`, `title`, and `pages`; `description` and `quiz` are optional. `pages` must contain at least one page. Each page requires `id`, `heading`, and `blocks`; `subhead` is optional. A page's `blocks` array may be empty. Extra properties at these levels are rejected.

The schema checks ID syntax but does not enforce uniqueness. The Viewer package loader checks for duplicate lesson IDs within a course, page IDs within a lesson, and question IDs within a quiz. It does not check option-ID uniqueness.

The schema defines exactly eight block types:

| Type | Required fields | Optional fields and behavior |
| --- | --- | --- |
| `text` | `content` | Plain text paragraph; no HTML, Markdown, formatting, alignment, or styling properties |
| `heading` | Nonempty `content` | `level`: integer 2–6; renderer defaults to `h2` |
| `image` | `src`, `alt` | `caption`; `alt` may be empty by schema, but the renderer warns when it is falsy |
| `slideshow` | `images` (at least one) | Each image requires `src` and `alt`; `caption` is optional. Previous/next controls are rendered; captions are hidden below medium screen sizes |
| `list` | Nonempty `items` array of strings | `style`: `ordered` or `unordered`; defaults to unordered |
| `callout` | `content` | `variant`: `info`, `tip`, `warning`, or `danger`; optional `title`. `tip` renders as `info` |
| `video` | `src`, nonempty `title` | `caption`; uses an HTML5 player with native controls and `preload="metadata"` |
| `spacer` | `type` | `size`: `small`, `medium`, or `large` |

Block content is plain text, not HTML or Markdown. List items are strings, not nested blocks. Images are centered and responsive by default. Video playback depends on browser codec support; external embeds and YouTube-specific blocks are not part of the format. All image/video paths must reference existing package files.

The current renderer reads some presentation properties that validation does not accept. Because schemas disallow additional properties, do not use `align`, `width`, `className`, `style`, `fluid`, heading `size`, or callout variant `note` in validated content. The renderer also reads `size` on spacers, but currently renders every size identically. Schema-supported alignment or presentation options require deliberate schema, renderer, test, and documentation changes.

The page `heading` is the main page title; a `heading` block is for subsections. Version 1 does not define left/right image alignment or floated text.

## Quizzes

A lesson may have an optional `quiz` with this structure:

```json
{
  "title": "Peru Basics",
  "passPercent": 70,
  "allowRetakes": false,
  "questions": [
    {
      "id": "capital",
      "type": "multiple-choice",
      "prompt": "What is Peru's capital?",
      "options": [
        { "id": "lima", "text": "Lima" },
        { "id": "cusco", "text": "Cusco" }
      ],
      "answer": "lima"
    },
    {
      "id": "location",
      "type": "true-false",
      "prompt": "Peru is in South America.",
      "answer": true
    }
  ]
}
```

The quiz requires a nonempty `title`, `passPercent` from 0 to 100, and a nonempty `questions` array. `allowRetakes` is optional, boolean, and defaults to `false`. With `false`, a learner may retry after failing but cannot start another attempt after passing; `true` allows retakes after passing.

Only two question types are supported:

- `multiple-choice` requires `id`, `type`, `prompt`, at least two `{id,text}` options, and `answer` containing an option ID. The Viewer checks that the answer matches an option and compares the selected option ID with it; option IDs are not required to be unique by schema or checked for duplicates.
- `true-false` requires `id`, `type`, `prompt`, and `answer` as the JSON boolean `true` or `false`, not a quoted string.

Question IDs must be unique within a quiz, and multiple-choice answers must refer to a defined option. The quiz follows the lesson pages. A passing saved attempt marks the quiz lesson complete; submissions and answers are learner progress stored in IndexedDB, not package content. Answers are visible to clients, so quizzes are suitable for practice and self-study, not secure or tamper-proof assessment.

## Validation and compatibility

Run the content validator from the Viewer repository root after editing bundled content:

```bash
npm run validate:content
```

`npm run validate:content` validates registered bundled packages against the schemas and checks duplicate bundled course, lesson, and page IDs; registry/course and lesson/reference ID matches; and the presence of thumbnail, image, slideshow, and video assets. It does not check quiz question-ID duplicates or multiple-choice answer references (the Viewer package loader does those checks), nor does it guarantee that content renders as intended or that a browser can play a particular video codec.

Imported ZIPs must contain exactly one `course.json` and all referenced files under its package root. The current importer limits both the uploaded archive and unpacked contents to 50 MB and the archive to 2,000 files, and refuses duplicate installed or bundled course IDs.

Readers validate packages before use. A future format version must not be silently treated as version 1. Schema changes should be additive where practical; breaking changes require a new format version and an explicit migration or unsupported-version message. The server, catalog, and viewer should validate against the same schemas, and the viewer must be able to validate and use a package without contacting the server.

## Current implementation gaps

- The Dashboard does not yet display course thumbnails, although manifests support them.
- The Dashboard course summaries also omit `tags`; the schema accepts them, but the Viewer does not currently expose them there or provide catalog indexing.
- Several renderers read `className` and/or `style`, but those properties are not accepted by the schemas. `ImageBlock` also reads properties such as `fluid` that validation rejects.
- The heading renderer reads `size`, and the callout renderer recognizes `note`, but neither is accepted by the schema.
- Spacer `size` is accepted but does not yet change rendered spacing.
- The bundled sample course can serve as a demonstration of all block types; examples should be schema-validated and rendering-smoke-tested.

These gaps should be addressed as explicit implementation changes, not by treating undocumented renderer behavior as part of the format.
