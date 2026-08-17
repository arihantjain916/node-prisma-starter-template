# node-prisma-starter-template

Express 5 + Prisma 7 (MariaDB driver adapter) + TypeScript starter, with linting,
tests, git hooks, and CI wired up.

## Requirements

- Node `>=20` (`.nvmrc` pins 24)
- A MariaDB/MySQL instance, or Docker

## Getting started

```bash
npm install
cp .env.example .env   # then fill in real credentials
npx prisma generate
npm start
```

`npm start` runs `tsx --watch`, so edits reload automatically.

> `npx prisma generate` is required before the first `typecheck`, `lint`, or
> `test` run — `src/lib/prisma.ts` imports the generated client from
> `generated/`, which is gitignored.

## Scripts

| Script               | Does                                           |
| -------------------- | ---------------------------------------------- |
| `npm start`          | Dev server with watch reload (`tsx`)           |
| `npm run build`      | `prisma generate` + bundle to `dist/` (`tsup`) |
| `npm run serve`      | Run the built bundle                           |
| `npm run typecheck`  | `tsc --noEmit`                                 |
| `npm run lint`       | ESLint (type-aware)                            |
| `npm run format`     | Prettier over the repo                         |
| `npm test`           | Vitest once                                    |
| `npm run test:watch` | Vitest in watch mode                           |

## Environment

Every variable is validated at boot by a Zod schema in
[`src/lib/env.ts`](src/lib/env.ts). A missing or malformed value exits with a
listed reason instead of failing later with an opaque driver error. Import `env`
from that module rather than reading `process.env` directly — it is typed, and
numeric values are already coerced.

## Layout

```
src/
  app.ts          Express app + middleware + error handling (exported for tests)
  index.ts        Server entry: listen, graceful shutdown
  app.test.ts     Supertest coverage of the app
  lib/
    env.ts        Zod-validated, typed environment
    logger.ts     Pino logger (pretty in dev, JSON in prod)
    prisma.ts     PrismaClient on the MariaDB adapter
    errors.ts     HttpError / NotFoundError
```

`app.ts` is separate from `index.ts` so tests can import the app without
binding a port.

## Endpoints

| Method | Path      | Returns                    |
| ------ | --------- | -------------------------- |
| `GET`  | `/`       | `{ message: "Welcome" }`   |
| `GET`  | `/health` | `{ status: "ok", uptime }` |

## Docker

```bash
docker compose up --build
```

Brings up MariaDB plus the API. Compose overrides `DATABASE_HOST` to `db`; the
rest comes from your `.env`.

## Git hooks

Managed by Husky, installed automatically via the `prepare` script.

| Hook         | Runs                                    |
| ------------ | --------------------------------------- |
| `pre-commit` | `npm run typecheck`, then `lint-staged` |
| `commit-msg` | `commitlint` (Conventional Commits)     |
| `pre-push`   | `npm test`                              |

Commit messages must follow
[Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add refresh token rotation
fix: reject expired sessions
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `revert`.

Bypass in an emergency with `git commit --no-verify` or `HUSKY=0 git commit`.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs typecheck, lint,
tests, and a Prettier check on every push to `main` and every PR, plus
commitlint across the PR's commit range.
