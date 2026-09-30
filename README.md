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
`workspace_id`, `app_binding_id`, `claim_url`) per dispatch; nothing
CrossCheck-issued is hard-coded in the repo. The `SHOPIFY_APP_AUTOMATION_TOKEN`
secret comes from the `shopify-upload` environment.

## Canaries

`CANARIES.md` documents the three executable canaries (AC-T34-03): npm
lifecycle scripts, the `shopify.web.toml` command, and the `.npmrc` hook.
Each prints a `CANARY_EXECUTED:<name>` marker and exits non-zero if it ever
runs, so any job that executes repository commands fails loudly instead of
silently.
