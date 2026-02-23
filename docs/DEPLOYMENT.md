# Killing Spree — Deployment Guide

**Last Updated:** February 23, 2026

---

## Overview

Killing Spree is a static React SPA built with Vite. The build outputs a `dist/` folder that can be deployed to any static hosting platform. All options below are **free**.

---

## Prerequisites

1. **Build the project** (required before any deploy):
   ```bash
   npm install
   npm run build
   ```

2. **Optional but recommended:** Initialize git and push to GitHub. Most platforms offer free tiers with Git integration for automatic deploys.

---

## Recommended Free Platforms

| Platform | Best For | Free Tier | Bandwidth | Notes |
|----------|----------|-----------|-----------|-------|
| **Cloudflare Pages** | Unlimited traffic | ✅ | **Unlimited** | No overage fees; safest from surprise bills |
| **Netlify** | Ease of use | ✅ | 100 GB/mo | Great DX, drag-and-drop or CLI |
| **Vercel** | Vite/React | ✅ | 100 GB/mo | Zero-config for Vite projects |
| **GitHub Pages** | Public repos | ✅ | Generous | Need `base` in vite.config if using repo path |

---

## Option 1: Cloudflare Pages (Unlimited Bandwidth)

**Pros:** Unlimited bandwidth, no overage risk, fast CDN.

### Via Git (recommended)

1. Push your code to GitHub.
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create a project → Connect to Git.
3. Select repo, set:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy. Your site will be at `your-project.pages.dev`.

### Via Wrangler CLI (manual)

```bash
npm install -g wrangler
npm run build
wrangler pages deploy dist --project-name=killing-spree
```

---

## Option 2: Netlify

**Pros:** Simple UI, CLI, deploy previews.

### Via Git (recommended)

1. Push to GitHub.
2. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git.
3. Netlify auto-detects the `netlify.toml` in this repo; no extra config needed.
4. Deploy. You’ll get a URL like `random-name-123.netlify.app`.

### Via Netlify CLI (manual, no Git)

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

Follow prompts to create/link a site.

---

## Option 3: Vercel

**Pros:** Great for Vite/React, fast builds.

### Via Git (recommended)

1. Push to GitHub.
2. Go to [vercel.com](https://vercel.com) → Add New → Project → Import repo.
3. Vercel will detect Vite; the `vercel.json` in this repo configures build/output.
4. Deploy. You’ll get a URL like `your-project.vercel.app`.

### Via Vercel CLI (manual)

```bash
npm install -g vercel
npm run build
vercel --prod
```

---

## Option 4: GitHub Pages

**Pros:** Free for public repos, no account beyond GitHub.

1. Add a `base` in `vite.config.ts` if the site lives at `user.github.io/repo-name`:
   ```ts
   export default defineConfig({
     base: '/killing-spree-game/', // your repo name
     plugins: [react()],
   });
   ```

2. Install GitHub Pages deploy action:
   ```bash
   mkdir -p .github/workflows
   ```
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. In repo Settings → Pages → Source: "GitHub Actions". After a push to `main`, the site deploys.

---

## Local Preview (Before Deploy)

```bash
npm run build
npm run preview
```

Open the URL shown (usually `http://localhost:4173`).

---

## Custom Domain

All platforms above support custom domains on free tiers:

- **Netlify / Vercel / Cloudflare:** Add your domain in the dashboard (DNS instructions provided).
- **GitHub Pages:** Use a CNAME or A record as described in GitHub docs.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on refresh | SPA redirect/rewrite must send all routes to `index.html` (already configured in `netlify.toml` and `vercel.json`). |
| Assets 404 | Ensure `base` in `vite.config.ts` matches deployment path (e.g. `/repo-name/` for GitHub Pages). |
| Build fails | Run `npm run build` locally; fix any TypeScript or dependency errors first. |
| Blank page | Check browser console; often caused by wrong `base` path. |

---

## Summary

- **Easiest:** Netlify or Vercel with Git — connect repo and deploy.
- **Most traffic-friendly:** Cloudflare Pages (unlimited bandwidth).
- **Existing GitHub user:** GitHub Pages plus deploy workflow.

All configs in this repo (`netlify.toml`, `vercel.json`) are ready to use.
