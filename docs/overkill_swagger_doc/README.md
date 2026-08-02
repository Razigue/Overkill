# Swagger Documentation: Overkill API

Generated on 2026-08-01 and updated on 2026-08-02 by actually testing every route of the 7
Symfony controllers (`SecurityController`, `OffersController`, `UserSkillController`,
`UserFavoriteController`, `CvController`, `ContactController`, `AdminController`) against an
isolated Docker instance (backend + fresh PostgreSQL, dedicated Docker network), never against
the project's real Neon database. `AdminController` required promoting a test user to
`ROLE_ADMIN` with a direct SQL update on the isolated database (no API route grants that role),
and a local mock HTTP server standing in for the real n8n webhook so the success path could be
tested without calling production infrastructure.

## Files

- **`index.html`**: open it directly in a browser (double-click). The OpenAPI spec is
  embedded in the file, so no CORS/local server needed. Requires an internet connection to
  load Swagger UI from a CDN (jsdelivr).
- **`openapi.yaml`**: the source OpenAPI 3.0.3 spec, importable into Postman, Insomnia,
  Swagger Editor, etc.
- **`openapi.json`**: same content, JSON format (generated from the YAML).

