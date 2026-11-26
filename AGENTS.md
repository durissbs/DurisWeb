# Agent Guide

Website for DurisMUD - usually hosted on same server as DurisMUD

**On production environment, please be careful about running heavy parallel processes/jobs together!  We have to be careful about server load!**

## Repository

- This is a logical monorepo with independent `backend/` and `frontend/` pnpm projects; there is no root package manifest.
- Backend: Express 5, TypeScript, Knex, MySQL, and Redis. Frontend: Vue 3, Vite, TypeScript, and Tailwind CSS.
- Read the nearest README plus `docs/development.md`. Follow `docs/CONVENTIONS.md`; integration or security work also requires `docs/SECURITY-COMPLIANCE.md`.
- UI work also follows [docs/DESIGN.md](docs/DESIGN.md), the central design guide and index of source-owned design contracts.
- DurisMUD is a separate repository. Do not modify or operate it unless explicitly requested.

## Environmental Settings

- Each of project's root, backend/ and frontend/ has environmental files, *root `.env` holds whether
    this particular checkout is local/dev, staging, or production AND a usable account for live testing on the website*
- project root has `.env` `.env.example`
- backend/ has `backend/.env` `backend/.env.example` `backend/.env.test` `backend/.env.test.example`
- frontend/ has `frontend/.env` `frontend/.env.example`

## Production location

- Production is on the Vultr host under the `durissbs` account. The website checkout is `/home/durissbs/durisweb` and the paired MUD checkout is `/home/durissbs/duris`.
- Verify website acceptance at `https://playduris.com` and `https://www.playduris.com`. The MUD health endpoint is `https://ws.playduris.com/health`. The legacy `duris.sbs` hostnames also respond and should be preserved.
- Preserve the installed user units for the application, private cache and Cloudflare ingress. The website uses `durisweb-production.service`, `durisweb-redis.service`, `durisweb-cloudflared.service` and `playduris-cloudflared.service`. The MUD uses `duris-mud-production.service`, `duris-mariadb.service` and `duris-redis.service`.
- Confirm effective bindings and release paths through the installed units and protected deployment settings. Keep host-specific recovery details in the private operator reference.

## Working Rules

- Inspect relevant implementation, tests, and configuration before editing. Keep changes focused and preserve unrelated work in the checkout.
- Reuse established patterns. Update documentation when behavior or configuration changes; never add secrets, `.env` files, dumps, generated output, backups, or player data.
- Use ESM and include `.js` on relative TypeScript imports. Prefer named exports, `async`/`await`, strict types, and validation of external input; do not add `any`.
- Use `camelCase` for values/functions, `PascalCase` for types and Vue components, and `snake_case` for database fields and hook IDs.
- Treat browser-visible `VITE_*` values as public. Never log secrets, tokens, or IP addresses; security and integration failures must fail closed.
- Never edit an applied migration. New migrations need a reversible `down`; use an isolated test database and do not run migrations against shared environments without explicit direction.

## Website changelog

- For website updates and deployments, use the local [news-update skill](.agents/skills/news-update/SKILL.md) (`$news-update`) to reconcile release changes with **News → Website Changelog**.
- Prepare release news during implementation; publish it through `/admin/changelog` or `/api/changelog` after the described release is verified live. Include this step in an authorized website deployment, reusing the session's authorization.
- Before declaring the release complete, verify the saved entry and its public rendering, or record why no new entry is needed (already covered or no reader-visible change). A draft is not a published update.
- Website Changelog uses `website_changelog`; it is separate from MUD News and the MUD repository's news file/import workflow.
- Mudlet Client Changelog (`/news?tab=client`) uses the reviewed frontend snapshot of `LuminariMUD/duris-client` history. The same news-update skill refreshes it; client notes become live with a website deployment, not an `/api/changelog` write.

## Verification

Run commands from the repository root with `pnpm --dir`. For the affected package, run the narrowest relevant tests plus:

```bash
pnpm --dir <backend|frontend> format:check
pnpm --dir <backend|frontend> lint
pnpm --dir <backend|frontend> type-check
```

Backend tests use `pnpm --dir backend test --runInBand`; frontend tests use `pnpm --dir frontend test:unit --run`. Run the applicable build for runtime changes. Backend database/MUD-write changes also require `pnpm --dir backend verify:mud-writes`. Cross-package changes must validate both packages. Report every command run and any checks not run.
