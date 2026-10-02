# crosscheck-t34-merchant-app (throwaway)

Disposable acceptance app for CrossCheck T34 (dev only — not a real merchant
app). It exists so the merchant-CI template (`prepare.yml` / `prepare.py`)
has a governed target for gate OG1 and the caller workflow below has
something to dispatch for OG2(a). It will never hold production traffic.

Layout (per the template contract the app must live in a subdirectory):

- `app/` — the Shopify app (`app_root: app`, `config_name: production`):
  `app/shopify.app.production.toml`, npm workspaces under
  `app/extensions/*`, and exactly one extension,
  `app/extensions/t34-validation`, a cart and checkout validation Function
  that blocks any cart line above 99 units.
- `.github/workflows/merchant-app-release.yml` — the caller workflow. It pins
  the trusted reusable workflow
  (`soleun/crosscheck-t34-trusted-workflow/.github/workflows/prepare.yml`)
  by full commit SHA and passes the enrolled baseline from the
  `MERCHANT_APP_BASELINE_JSON` repo variable.

## How the workflow is dispatched

Actions -> merchant-app-release -> Run workflow. `claim_mode` defaults to
`recording` (never touches Shopify; receipt records
`uploadStatus: not_attempted`). Fill in the CrossCheck ids (`deploy_run_id`,
`workspace_id`, `app_binding_id`, `claim_url`, `preparation_nonce`) per dispatch; nothing
CrossCheck-issued is hard-coded in the repo. The trusted workflow's `upload`
job declares the `shopify-upload` environment, so GitHub resolves the
`SHOPIFY_APP_AUTOMATION_TOKEN` and `CROSSCHECK_UPLOAD_KEY` secrets inside the
called job; the caller only passes the secret references through (both are
`required: false` in the template) and selects no environment itself.

## Canaries

`CANARIES.md` documents the three executable canaries (AC-T34-03): npm
lifecycle scripts, the `shopify.web.toml` command, and the `.npmrc` hook.
Each prints a `CANARY_EXECUTED:<name>` marker and exits non-zero if it ever
runs, so any job that executes repository commands fails loudly instead of
silently.

## Release log

- 2026-10-01: live preparation run after the receipt-verifier fix (T422). README-only change, so the next app version gets a fresh name; no app, extension or TOML change.
- 2026-10-02: live preparation run after the full-seal and no-effect settlement fixes (T425-T427). README-only change for a fresh version name.
- 2026-10-02: live preparation run after the schema-valid Cell overlay (T428) and read-only settlement (T429). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle F1 (RND-4798). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle F2 (RND-4798). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle F3 (RND-4798). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle F4 (RND-4798). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle F5 (RND-4798). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle U1 (RND-4798). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle U2 (RND-4798). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle U3 (RND-4798). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle U4 (RND-4798). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle U5 (RND-4798). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle U6 (RND-4798). README-only change for a fresh version name.
- 2026-10-02: retention gate cycle U7 (RND-4798). README-only change for a fresh version name.
