# Deploying the ZATCA Bridge backend to Railway

This backend can't run on Vercel — it shells out to a **Java JAR** (the ZATCA SDK
validator) and **tesseract** (PDF OCR), neither of which exists in Vercel's
serverless Python sandbox, and it needs a **persistent database**. Railway runs
our `Dockerfile` as a long-lived container, so both binaries and a real Postgres
connection work.

The database is **Supabase Postgres** (the same project already used for auth).

---

## 1. Push these files to GitHub

`git add backend/Dockerfile backend/.dockerignore backend/start.sh backend/railway.toml`
plus the `db/session.py` change, then push. Railway deploys from the repo.

## 2. Create the Railway service

1. https://railway.app → **New Project → Deploy from GitHub repo** → pick this repo.
2. In the service **Settings → Root Directory**, set **`backend`** (so Railway
   builds with `backend/Dockerfile`, not the Next.js root).
3. Railway reads `backend/railway.toml` for the Dockerfile builder + health check.

## 3. Get the Supabase Postgres connection string

Supabase Dashboard → your project (`xflkfzixaoxcfmujwase`) → **Connect** button →
**ORMs / Connection string** → choose the **Session pooler** (IPv4, port `5432`,
supports persistent connections — ideal for an always-on container).

It looks like:

```
postgresql://postgres.xflkfzixaoxcfmujwase:[YOUR-DB-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres
```

**Two edits before using it as `DATABASE_URL`:**
- Change the scheme `postgresql://` → **`postgresql+asyncpg://`** (this app uses the async driver).
- If your DB password has special characters (`@ : / ? # &`), URL-encode them.

> Avoid the **Transaction pooler** (port `6543`) — the boot-time `alembic`
> migration step needs a stable session. The Session pooler or Direct connection
> is correct here.

## 4. Set Railway environment variables

In the service → **Variables**, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres.xflkfzixaoxcfmujwase:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres` |
| `SECRET_KEY` | a long random string — generate: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ENCRYPTION_KEY` | a Fernet key — generate: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `SUPABASE_URL` | `https://xflkfzixaoxcfmujwase.supabase.co` |
| `CORS_ORIGINS` | `["https://jsk-zatca-bridgee.vercel.app","http://localhost:3000"]`  ← **JSON array** |
| `DEBUG` | `False` |

Optional / only if you have them:
- `SUPABASE_JWT_SECRET` — legacy HS256 secret (Supabase → Settings → API → JWT Keys → Legacy JWT Secret). Skip if the project uses modern asymmetric keys (the backend then fetches JWKS from `SUPABASE_URL`).
- `ZATCA_API_KEY`, `ZATCA_CSID` — for live ZATCA submissions.

Do **not** set `PORT` — Railway injects it and `start.sh` reads it.

`CORS_ORIGINS` is parsed as JSON, so it must be a bracketed array, not a bare
comma list.

## 5. Deploy & verify

Railway builds the image, runs `alembic upgrade head` (creates the schema in
Supabase Postgres), then starts uvicorn. Once green, grab the public domain
(Settings → **Networking → Generate Domain**) and check:

```
https://<your-app>.up.railway.app/api/v1/health
```

It should return `{"status":"healthy", ...}`.

## 6. Point the Vercel frontend at it

In the **Vercel** project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://<your-app>.up.railway.app/api/v1
```

Redeploy the frontend. The "Demo Mode (backend offline)" pill should flip to
**"Backend Connected"**, and invoice submission will run live against ZATCA.

> If the backend is ever down, the frontend now degrades gracefully back to demo
> data (the `client.ts` fallback) instead of throwing a raw NetworkError.

---

### Notes / gotchas
- **First build is slow** (~3–5 min): installs a JRE + tesseract + pandas/lxml/cryptography wheels.
- The committed `cli-3.0.8-jar-with-dependencies.jar` (21 MB) ships in the image — the validator finds it relative to the backend dir.
- Railway gives the container an ephemeral filesystem; that's fine because state lives in Supabase Postgres, not local SQLite.
- The same Dockerfile works on **Render** (New → Web Service → Docker, root `backend`) and **Fly.io** (`fly launch` in `backend/`).
