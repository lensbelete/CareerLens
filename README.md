# CareerLens

CareerLens is a job-intelligence app for people who want to compare a CV with a job description, see the overlap, and keep track of applications.

It is a working local product: NestJS API, Next.js UI, PostgreSQL. Matching uses evidenced skills plus deterministic text similarity. Optional OpenAI-compatible embeddings can be switched on; if they are missing or fail, the API falls back and says so.

## Architecture

- `web/` — Next.js App Router UI
- `api/` — NestJS REST API, TypeORM, JWT auth
- `docker-compose.yml` — PostgreSQL 16

There is no separate Python service. Semantic similarity is optional via `EMBEDDING_API_URL`. The default path is hybrid lexical matching in NestJS.

## Prerequisites

- Node.js 20.9+
- npm
- Docker (for PostgreSQL), or a local Postgres 16 instance

## Quick start

```bash
cp .env.example .env
cp .env.example api/.env
# edit JWT_SECRET before any non-local use

docker compose up -d
cd api && npm ci && npm run start:dev
# in another terminal
cd web && npm ci && npm run dev
```

API: http://localhost:4000  
Swagger: http://localhost:4000/docs  
Web: http://localhost:3000  
Health: http://localhost:4000/health

### Database

Compose starts Postgres as `careerlens` / `careerlens` on port 5432.

Migrations run automatically when `DATABASE_MIGRATIONS_RUN=true` (the default).

```bash
cd api
npm run migration:run
npm run seed
```

Seed data:

- 12 **sample** jobs, each labelled in the description. They are not live vacancies.
- Demo user `demo@careerlens.dev` / `DemoPass123!` with a clearly marked sample profile.

### Environment

See `.env.example`. Important variables:

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Required, min 16 characters |
| `DATABASE_*` | Postgres connection |
| `UPLOAD_DIR` | Where CV PDFs are stored |
| `EMBEDDING_API_URL` / `EMBEDDING_API_KEY` | Optional OpenAI-compatible embeddings |
| `NEXT_PUBLIC_API_URL` | Browser API origin (`web/.env.local`) |

If embeddings are unset, matching uses TF-IDF cosine similarity. The match payload includes `method: hybrid-lexical` or `hybrid-embeddings`.

## Matching

Score is 0–100, not a hiring probability.

Weights:

1. Required skills — 45%
2. Text similarity — 25%
3. Preferred skills — 15%
4. Experience title overlap — 10%
5. Education mention — 5%

Skill evidence:

- **explicit** — listed on the profile or CV skills section
- **inferred** — found in experience/project/CV text
- **missing** — not evidenced

Embeddings are cached by SHA-256 of the text. A failed embedding request does not fake a score; the lexical path is used instead.

## Tests

```bash
cd api && npm test
cd api && RUN_E2E=1 npm run test:e2e   # needs a running database
cd api && npm run typecheck
cd web && npx tsc --noEmit
cd web && npm run lint
```

## Known limitations

- CV parsing is section-based, not an LLM. Edit the profile when extraction is wrong.
- Short skill names can collide with ordinary English (`go`, `r`).
- pgvector is not required; vectors are JSON in Postgres when embeddings are enabled.
- Redis/BullMQ is not used; CV processing is synchronous.
- Sample jobs must not be treated as current vacancies.

## Scripts

| Command | Where | What |
| --- | --- | --- |
| `npm run start:dev` | api | Nest watch mode |
| `npm run seed` | api | Sample jobs + demo user |
| `npm run dev` | web | Next.js dev server |
| `npm run build` | api / web | Production build |
