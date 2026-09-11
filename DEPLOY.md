# 🚀 Deploy LittleBites to Vercel (permanent phone-installable link)

This gives you a forever URL like `https://littlebites.vercel.app` that you can
install on any iPhone or Android — working from anywhere, even when your laptop is off.

There are 4 parts:
1. Create a free hosted PostgreSQL database and copy its `DATABASE_URL`
2. Push your code to GitHub
3. Import the repo into Vercel and add `DATABASE_URL`
4. Create the tables + seed data in your hosted database

Total time: ~15 minutes. No credit card required for the free tiers.

---

## PART 1 — Create the database & get your DATABASE_URL

Pick ONE provider. **Neon** is the simplest for beginners.

### Option A — Neon (recommended)
1. Go to https://neon.tech and sign up (free).
2. Click **Create Project** → give it a name (e.g. `littlebites`) → **Create**.
3. On the project dashboard, find the **Connection string** box.
4. Choose the **"Pooled connection"** and copy the string. It looks like:
   ```
   postgresql://alex:AbC123@ep-cool-name-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Save this string** — this is your `DATABASE_URL`.

### Option B — Supabase
1. Go to https://supabase.com → **New project** (free). Set a database password (remember it!).
2. Wait ~2 minutes for it to provision.
3. Go to **Project Settings → Database → Connection string → URI**.
4. Copy the URI and replace `[YOUR-PASSWORD]` with the password you set. Make sure it ends with `?sslmode=require`:
   ```
   postgresql://postgres.abcdxyz:YOURPASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
   ```
5. **Save this string** — this is your `DATABASE_URL`.

### Option C — Vercel Postgres (set up during Part 3)
You can skip this part and instead click **Storage → Create Database → Postgres**
inside your Vercel project later. Vercel then adds `DATABASE_URL` for you automatically.

---

## PART 2 — Push your code to GitHub

1. Create a free account at https://github.com if you don't have one.
2. Create a new **empty** repository (e.g. `littlebites`) — do NOT add a README.
3. In your project folder on your laptop, run these commands in the terminal:
   ```bash
   git init
   git add .
   git commit -m "LittleBites baby food app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/littlebites.git
   git push -u origin main
   ```
   (Replace `YOUR-USERNAME` with your GitHub username.)

> ✅ Your `.env` file is ignored by git, so your secrets are NOT uploaded — good.

---

## PART 3 — Import into Vercel

1. Go to https://vercel.com and **Sign up with GitHub** (free).
2. Click **Add New… → Project**.
3. Find your `littlebites` repo → click **Import**.
4. Vercel auto-detects Next.js — leave the build settings as-is.
5. Expand **Environment Variables** and add:
   - **Name:** `DATABASE_URL`
   - **Value:** paste the connection string from Part 1
   - Apply to **Production, Preview, and Development**
   *(If using Vercel Postgres instead: skip this, go to the **Storage** tab after deploy,
   create a Postgres database, and Vercel injects `DATABASE_URL` automatically.)*
6. Click **Deploy** and wait ~1–2 minutes.
7. You'll get your permanent link, e.g. `https://littlebites.vercel.app`. 🎉

> ⚠️ If you open the link now it may error — that's expected. The database has no
> tables yet. Do Part 4, then refresh.

---

## PART 4 — Create tables + seed the data

Run this **once** from your laptop, pointing at your HOSTED database.

1. Make sure dependencies are installed:
   ```bash
   npm install
   ```
2. Create the tables (paste YOUR connection string):
   ```bash
   DATABASE_URL="postgresql://...your-hosted-url...?sslmode=require" npx drizzle-kit push --config=drizzle.config.prod.ts
   ```
   Type `y` if it asks to confirm.
3. Load all the foods, recipes, and guides:
   ```bash
   DATABASE_URL="postgresql://...your-hosted-url...?sslmode=require" npx tsx src/db/seed.ts
   ```
   You should see `Seed complete!`.

> 💻 On Windows PowerShell, set the variable first:
> ```powershell
> $env:DATABASE_URL="postgresql://...your-hosted-url...?sslmode=require"
> npx drizzle-kit push --config=drizzle.config.prod.ts
> npx tsx src/db/seed.ts
> ```

---

## ✅ Done — install on your phone

1. Open your permanent link (e.g. `https://littlebites.vercel.app`) on your phone.
2. Go to the **Kids tab → Full install guide + QR code** (or visit `/install`).
3. **iPhone (Safari):** Share button → **Add to Home Screen** → **Add**.
4. **Android (Chrome):** ⋮ menu → **Install app** → **Install**.

The app now lives on your home screen and works from anywhere, forever. 🥑

---

## Updating the app later
Whenever you change the code:
```bash
git add .
git commit -m "my changes"
git push
```
Vercel automatically rebuilds and updates your live app — nothing to reinstall on your phone.

If you changed `src/db/schema.ts` (added/changed tables), re-run the Part 4 push command
against your hosted `DATABASE_URL` to apply the changes.

---

## Troubleshooting
- **Site errors with "DATABASE_URL is required"** → the env var isn't set in Vercel. Add it in
  **Project → Settings → Environment Variables**, then **Deployments → ⋯ → Redeploy**.
- **"no such table" / empty app** → you skipped Part 4. Run the push + seed commands.
- **SSL / self-signed certificate errors** → make sure your URL ends with `?sslmode=require`.
  The app already enables SSL automatically for non-local databases.
- **Password has special characters** → URL-encode them (e.g. `@` → `%40`, `#` → `%23`).
