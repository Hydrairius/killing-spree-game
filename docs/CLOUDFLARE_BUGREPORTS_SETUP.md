# Cloudflare D1 Bug Reports Setup

Store bug reports in Cloudflare D1 by adding a Pages Function and database.

## Prerequisites

- Wrangler v3.45+ (`npx wrangler --version`)
- Cloudflare account with Pages project

## 1. Create the D1 Database

```bash
npx wrangler d1 create killing-spree-bugreports
```

You'll see output like:

```
✅ Successfully created DB 'killing-spree-bugreports'
[[d1_databases]]
binding = "DB"
database_name = "killing-spree-bugreports"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy the `database_id` UUID.

## 2. Update wrangler.toml

Open `wrangler.toml` and replace `YOUR_DATABASE_ID` with the UUID from step 1:

```toml
[[d1_databases]]
binding = "DB"
database_name = "killing-spree-bugreports"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## 3. Run the Migration

Create the `bug_reports` table in both local (dev) and remote (production):

**Local (for `wrangler pages dev`):**
```bash
npx wrangler d1 execute killing-spree-bugreports --local --file=./migrations/0001_init_bugreports.sql
```

**Remote (production):**
```bash
npx wrangler d1 execute killing-spree-bugreports --remote --file=./migrations/0001_init_bugreports.sql
```

## 4. Configure the Frontend

No `.env` change needed for same-origin deploys. Bug reports default to `/api/bugreports`, which works when the game and API share the same origin (e.g. `killing-spree-game.pages.dev`).

Override only if using a custom domain or different base URL:

```env
VITE_BUGREPORT_WEBHOOK_URL=https://your-domain.com/api/bugreports
```

To disable remote storage (local IndexedDB only):

```env
VITE_BUGREPORT_WEBHOOK_URL=off
```

## 5. Deploy

Build and deploy with the updated script:

```bash
npm run build
npx dotenv-cli -e .env -- npx wrangler pages deploy --project-name=killing-spree-game
```

Wrangler uses `wrangler.toml` (`pages_build_output_dir = "./dist"`) and deploys:

- Static assets from `./dist`
- Pages Function at `/api/bugreports`

## How It Works

1. User submits a bug report in-game.
2. Report is saved locally (IndexedDB) as before.
3. If `VITE_BUGREPORT_WEBHOOK_URL` is set, the client POSTs the report to `/api/bugreports`.
4. The Pages Function receives the JSON and inserts it into D1.
5. Screenshot and log content are **not** stored in D1 (to stay within row size limits). Full reports with attachments remain in IndexedDB and can be exported from the Bug Reports viewer.

## Viewing Reports in D1

**Cloudflare Dashboard**

1. Workers & Pages → D1 → `killing-spree-bugreports`
2. Use the SQL Editor to query:

```sql
SELECT id, created_at, title, category, severity FROM bug_reports ORDER BY created_at DESC LIMIT 20;
```

**Wrangler CLI**

```bash
npx wrangler d1 execute killing-spree-bugreports --remote --command="SELECT id, title, created_at FROM bug_reports ORDER BY created_at DESC LIMIT 10"
```

## Local Development

To test the API locally:

```bash
# Start D1 local + Pages dev server
npx wrangler pages dev dist --compatibility-date=2024-12-01 --d1=DB=killing-spree-bugreports
```

Ensure the migration has been run locally first.

## Troubleshooting

- **Functions not found:** Deploy must be done from project root; `functions/api/bugreports.ts` must exist.
- **D1 binding error:** Confirm `database_id` in wrangler.toml matches your D1 database.
- **CORS:** The API and game share the same origin, so CORS is not needed for normal use.
