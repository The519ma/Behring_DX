# behringdx.health Website Track

This folder contains the isolated public-facing website track for:

- `behringdx.health`

It is intentionally kept separate from the internal lab runtime so it can later be:

- deployed on its own
- moved into a dedicated repo
- published through GitHub Pages or another static host
- evolved without touching the internal lab Node-RED workflow code

## Scope

This folder is for:

- public site content
- brand and motion direction
- portal and referral-facing links
- static assets

This folder is not for:

- clinical runtime logic
- Node-RED flow code
- LIS or middleware configuration
- secrets

## Current Technical Direction

- static site
- motion layer inspired by [animejs.com](https://animejs.com/)
- domain target:
  - `behringdx.health`
- GitHub Pages-ready deployment from this folder
- configurable public referral form embed via `site-config.js`

## Deployment Notes

If this site is later moved to GitHub Pages, the included `CNAME` file is already set to:

- `behringdx.health`

That makes the site easier to split out later without rewriting the static content structure.

## Referral Form Mount

The public referral section reads from:

- `site-config.js`

Current keys:

- `referralFormUrl`
- `referralFallbackUrl`

Example:

```js
window.BEHRING_SITE_CONFIG = {
  referralFormUrl: "https://your-public-baserow-host.example/form/your-form-id",
  referralFallbackUrl: "https://portal.behringdx.health"
};
```

If the form blocks iframe embedding, the site will still expose the fallback launch link cleanly.

## GitHub Pages

Publishing is handled by GitHub Actions (`.github/workflows/deploy-pages.yml`):

1. On each push to `main` / `master`, the workflow runs `npm ci && npm run build` and pushes the contents of **`dist/`** to the **`gh-pages`** branch (orphan branch, one commit per deploy).

2. **One-time setup in the GitHub UI** (repo **Settings**, not your profile):

   - Open **Pages** directly: `https://github.com/The519ma/Behring_DX/settings/pages` (replace owner/repo if you forked).
   - Under **Build and deployment** (GitHub sometimes shows only a **Source** or **Branch** area with the same choices), set **Source** to **Deploy from a branch**.
   - **Branch**: `gh-pages`, **folder**: `/ (root)`, then **Save**.  
     If `gh-pages` is not listed yet, run the workflow once from the **Actions** tab, refresh the Pages screen, then pick the branch.
   - Optional: under **Custom domain**, enter `behringdx.health` if you use that hostname (DNS must still point to GitHub as in their docs).

3. If you **do not** see **Pages** in the left sidebar under **Code and automation**, you need **admin** access to the repository, or an org owner must allow GitHub Pages for the organization.

The `CNAME` and `.nojekyll` files live under `public/` so they are included in each `dist/` build.
