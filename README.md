# Study Rail

A personal progress tracker for the combined Python / JavaScript / React / PD1 (Apex) / AI Engineering study plan. Built with React + Vite. Progress saves to the browser's `localStorage` — it's per-device, not synced across browsers or computers.

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

To edit the curriculum (add/remove weeks or tracks), edit the `TRACKS` and `WEEKS` objects at the top of `src/App.jsx` — everything else derives from that data.

## Build

```bash
npm run build
```

Outputs a static site to `dist/`.

---

## Deploying

Both options below assume the code is pushed to a GitHub repo first:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Option A — Vercel (simplest for a static Vite app)

1. Go to [vercel.com](https://vercel.com), sign in, click **Add New → Project**.
2. Import your GitHub repo. Vercel auto-detects Vite — build command `npm run build`, output directory `dist`. No changes needed.
3. Click **Deploy**. You'll get a `*.vercel.app` URL immediately.

**Custom domain:**
1. Project → **Settings → Domains** → enter your domain → **Add**.
2. Vercel shows you a DNS record to add at your domain registrar:
   - Root domain (`example.com`): an **A record** pointing to `76.76.21.21`
   - Subdomain (`study.example.com`): a **CNAME** pointing to `cname.vercel-dns.com`
3. Add that record in your registrar's DNS settings. Propagation is usually a few minutes to a few hours.
4. Vercel auto-issues an SSL certificate once DNS resolves — no separate step needed.

### Option B — Railway

Railway isn't a pure static host by default, so this project's `start` script uses `serve` to host the built files — already wired up in `package.json`.

1. Go to [railway.app](https://railway.app), **New Project → Deploy from GitHub repo**.
2. Select your repo. Railway auto-detects Node via Nixpacks.
3. In **Settings → Build**, confirm:
   - Build command: `npm run build`
   - Start command: `npm start`
4. Deploy. Railway assigns a `*.up.railway.app` URL.

**Custom domain:**
1. Project → **Settings → Networking → Custom Domain** → enter your domain.
2. Railway shows a **CNAME** target (something like `xxxx.up.railway.app`).
3. Add that CNAME record at your registrar for your domain or subdomain.
4. Railway auto-provisions SSL once DNS resolves.

---

## If you want cross-device sync later

Right now progress lives only in the browser you're using. If you eventually want it to follow you across devices, that needs a small backend (even something lightweight like a Railway Postgres add-on + a couple of API routes, or a service like Supabase for auth + storage). Not needed to ship this as-is — just worth knowing the current version is single-device by design.
