# em3k Course Package Format

This document describes the first em3k course package contract. A package is content, not an application or a server record. It can be read from a web cache, a downloaded archive, a local directory, or another platform-specific store.

## Package Layout

```text
course-package/
  course.json
  lessons/
    introduction.json
    next-steps.json
  assets/
    map.svg
```

`course.json` is the package entry point. It contains course metadata and an ordered list of lesson references. Each lesson file contains ordered pages; pages contain typed content blocks. Asset paths are relative to the package root. Packages may be distributed as directories or archives, but the package contents and references are the same.

The course and lesson JSON Schemas are in `src/schemas/course.schema.json` and `src/schemas/lesson.schema.json`. They use JSON Schema draft-07 and `formatVersion: 1`.

## Boundaries

- Course packages contain stable IDs, version, title, description, publisher ID, language, license, lesson order, pages, and assets.
- Publisher profiles belong to the publishing service or catalog. A package refers to a publisher by ID; it does not embed verification claims or a mutable list of all that publisher's courses.
- Catalog records contain discovery and distribution data and point to a package version. They do not replace or redefine the package.
- Viewer state (installed course IDs, active state, preferences, and learner progress) is local to the learner and is not part of a published package.
- Bundled viewer content is registered separately by the viewer. A registry entry may place a bundled package in Help or the Library without changing the package format.

## Content Rules

- IDs are stable within their scope. A course ID is publisher-qualified; lesson and page IDs are unique within their parent.
- Increment the course `version` when publishing a changed package. Use `formatVersion` only when the package contract itself changes.
- Pages use a small set of typed blocks. Text content is plain text, not HTML. Block properties are defined by the lesson schema; unknown block shapes should be rejected or reported, not silently interpreted.
- Image and other bundled asset references are package-relative. A viewer resolves them through its storage adapter rather than assuming a web URL or filesystem path.
- Quiz answers in a client-readable package are visible to learners. They are suitable for practice and self-study, not secure assessment.

## Compatibility

Readers validate packages before use. A future format version must not be silently treated as version 1. Schema changes should be additive where practical; breaking changes require a new format version and an explicit migration or unsupported-version message.

The server, catalog, and viewer should validate against these same schemas. The viewer must be able to validate and use a package without contacting the server.