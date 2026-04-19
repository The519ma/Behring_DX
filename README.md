# behringdx.health Website Track

This folder contains the isolated public-facing website track for:

- `behringdx.health`

It is intentionally kept separate from the internal lab runtime so it can later be:

- deployed on its own
- moved into a dedicated repo
- published through GitHub Pages or another static host
- evolved without touching the OpenELIS / Node-RED workflow code

## Scope

This folder is for:

- public site content
- brand and motion direction
- portal and referral-facing links
- static assets

This folder is not for:

- clinical runtime logic
- Node-RED flow code
- OpenELIS configuration
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

This repo now includes:

- `.github/workflows/deploy-behringdx-health.yml`
- `.nojekyll`
- `CNAME`

That means the website can be published directly from:

- `websites/behringdx-health/`

through GitHub Pages with the custom domain attached.
