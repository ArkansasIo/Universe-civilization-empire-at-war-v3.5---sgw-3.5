# GitHub Pages and CI

## Deployment

The Pages workflow in `.github/workflows/pages.yml` builds the Vite client and deploys
`dist/` using the official GitHub Pages artifact and deployment actions.

For the repository Pages URL, the base path must match the repository name:

```text
/Universe-civilization-empire-at-war-v3.5---sgw-3.5/
```

The Pages workflow sets `VITE_BASE_PATH` during the build. The Vite configuration
falls back to `/` for local development and custom-domain hosting. Keep
`public/CNAME` and the root `CNAME` aligned with the custom domain settings in
GitHub Pages when using the custom domain.

## Local checks

Use Node.js 24 and npm:

```bash
npm install
npm run lint
npm run build
npm run preview
```

Then open the local preview URL printed by Vite. The `lint` script currently performs
TypeScript checking with `tsc --noEmit`; it is not an ESLint rule set.

## Continuous integration

`.github/workflows/ci.yml` runs type-checking and a production Vite build for pushes,
pull requests, and manual dispatches. The Pages workflow also verifies that the build
produces a non-empty `dist/index.html` before it uploads the artifact.

## Backend boundary

GitHub Pages is static hosting: it serves the browser client and cannot execute the PHP
backend, cron worker, or database migrations. Deploy the PHP API to a PHP-capable host
with MySQL, set its environment/configuration there, and configure the frontend API URL
for that deployment. Never put database passwords, API keys, or service-account
credentials in files under `public/` or in Vite variables prefixed with `VITE_`,
because those values are shipped to browsers.

## Troubleshooting 404s

1. Confirm Pages is configured to deploy with **GitHub Actions**.
2. Check the latest run of `.github/workflows/pages.yml` and confirm the build and
   deploy jobs succeeded.
3. Confirm the browser is visiting the repository URL with the repository-name path,
   unless the configured custom domain is being used.
4. Confirm all in-app static asset paths are relative to Vite's configured base or use
   Vite-managed imports. Hard-coded root paths such as `/src/main.tsx` bypass the
   repository base path in production; Vite transforms the entry point from `index.html`
   during a normal build.
5. If a custom domain is used, verify DNS, GitHub Pages custom-domain settings, and the
   tracked `CNAME` file agree.

## Current limitations

The existing large game feature test file is a manual assertion script, not yet wired into
the npm scripts. Some assertions encode expected balance and content values; run it only
after confirming its assumptions still match the current data model. Type-check and
production build are the current automated CI gates.
