# Deploy: Vercel + Supabase (new project)

There is **no old Supabase account** connected to this repo. Everything is ready for a **brand-new** Supabase project.

---

## Important: how the app works now

| Layer | Storage |
|--------|---------|
| **Hosting** | **Vercel** |
| **Login** | **Supabase Auth** |
| **Courses, assignments, notes, exams, etc.** | **Supabase Postgres** (same data on every device) |

You **must** set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` and Vercel. The app no longer saves student data in the browser.

Files:

- `vercel.json` — Vercel build  
- `src/lib/supabase/` — auth + database API  
- `supabase/migrations/001_initial_schema.sql` — base tables  
- `supabase/migrations/002_full_schema.sql` — routines, attendance, holidays, etc.  

---

## Part 1 — Supabase (new project)

### 1. Create project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)  
2. **New project** → pick org, name (e.g. `university-command-center`), strong DB password, region close to you  
3. Wait until the project is **Active**

### 2. Run the database schema

1. In Supabase: **SQL Editor** → **New query**  
2. Run **`supabase/migrations/001_initial_schema.sql`** → **Run**  
3. New query → run **`supabase/migrations/002_full_schema.sql`** → **Run**  
4. Confirm tables: `profiles`, `courses`, `routines`, `attendance_logs`, `system_config`, etc.

### 3. Auth settings

1. **Authentication** → **Providers** → enable **Email**  
2. **Authentication** → **Providers** → **Email** → turn **OFF** “Confirm email” (so sign-up works immediately)  
3. **Authentication** → **URL configuration**  
   - **Site URL:** `https://YOUR-VERCEL-APP.vercel.app` (update after first Vercel deploy)  
   - **Redirect URLs:** add  
     - `http://localhost:5173/**`  
     - `https://YOUR-VERCEL-APP.vercel.app/**`  

### 4. API keys

1. **Project Settings** → **API**  
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`  
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`  
3. Never put the **service_role** key in the frontend or Vercel “public” env.

### 5. Admin account

**First time:** use **Sign up** with:

| Field | Value |
|--------|--------|
| Email | `universitycommandcenter@gmail.com` |
| Username | `ucc_admin` |
| Password | your choice (or `admin123` for testing) |

Signing up with that email automatically sets **role = admin** in the app.

**If sign-up says the email already exists:** use **Sign in** instead (you registered before).

**If you signed up before admin auto-role was added**, run in SQL Editor:

```sql
update public.profiles
set role = 'admin', username = 'ucc_admin'
where email = 'universitycommandcenter@gmail.com';
```

Then sign out and sign in again.

---

## Part 2 — Vercel

### 1. Push code to GitHub

```bash
git init
git add .
git commit -m "Prepare Vercel + Supabase"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

### 2. Import on Vercel

This app is **TanStack Start** (SSR), not a plain Vite static site. Do **not** use the **Vite** preset or `dist/client` as output — that causes **404 NOT_FOUND**.

1. [https://vercel.com/new](https://vercel.com/new)  
2. Import your GitHub repo  
3. Framework preset: **Other** — **not Vite** (Vite preset → 404)  
4. Build settings:
   - **Build command:** `npm run build`  
   - **Output directory:** leave **empty** (Nitro creates `.vercel/output`; do not use `dist/client`)  
   - **Install command:** `npm install`  
5. Vercel sets `VERCEL=1` automatically so the build uses the Nitro Vercel adapter  
6. After changing settings: **Redeploy → Redeploy without Build Cache**  

### 3. Environment variables (Vercel → Settings → Environment Variables)

Add for **Production** (and Preview if you want):

| Name | Value | Notes |
|------|--------|--------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | From Supabase API settings |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | anon public key only |
| `VITE_ADMIN_EMAIL` | `universitycommandcenter@gmail.com` | |
| `VITE_ADMIN_USERNAME` | `ucc_admin` | |
| `VITE_ADMIN_PASSWORD` | *(strong password)* | Change from default |
| `VITE_OTP_API_URL` | Google Apps Script URL | Optional, for signup OTP |
| `VITE_ADMIN_FORM_URL` | Google Form URL | Optional, wellness check-in |

Redeploy after changing env vars.

### 4. Local `.env` (development)

Copy `.env.example` → `.env` and fill the same variables. Restart:

```bash
npm run dev
```

---

## Part 3 — Google Apps Script (email OTP / reminders)

1. Open `google-apps-script/email-otp.gs` in [script.google.com](https://script.google.com)  
2. New project → paste code → save  
3. **Deploy** → **New deployment** → **Web app**  
   - Execute as: **Me**  
   - Who has access: **Anyone**  
4. Copy the `/exec` URL → `VITE_OTP_API_URL` in Vercel and `.env`  
5. In Admin panel, enable email reminders and **Save & sync**

---

## Part 4 — Checklist

- [ ] Supabase project created (new, not an old one)  
- [ ] `001_initial_schema.sql` run successfully  
- [ ] Auth email provider enabled; redirect URLs set  
- [ ] `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in Vercel  
- [ ] Repo deployed on Vercel; site opens  
- [ ] Admin password changed from default  
- [ ] (Optional) OTP Apps Script deployed  

---

## Troubleshooting

**404 NOT_FOUND on every page**  
- You deployed as a static Vite app (`dist/client`). There is no `index.html` there.  
- Fix: use **Other** preset, **empty** output directory, and ensure `vite.config.ts` includes `nitro({ preset: "vercel" })`.  
- Redeploy **without build cache**.

**Build fails on Vercel**  
- Run `npm install` then `npm run build` locally and fix errors first.  
- Alternative host: **Cloudflare Pages** (`wrangler.jsonc` is already in the repo).

**“Supabase is not configured”**  
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel and redeploy.

**Sign-up asks to confirm email**  
- In Supabase: **Authentication → Providers → Email** → disable **Confirm email**.

**Old data not visible**  
- Data from the previous browser-only version is **not** migrated automatically. Students sign up again; courses must be re-added (or export/import manually later).
