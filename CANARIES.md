# AC-T34-03 executable canaries

Repository commands must never execute in token-bearing jobs. The three
canaries below are tripwires: each writes a unique `CANARY_EXECUTED:<name>`
marker to stdout and exits non-zero, so any job that ever executes one fails
loudly and visibly instead of silently running merchant-controlled bytes.

All three live under `app/` — where npm and the Shopify CLI actually run —
because the enrolled build recipe (`npm ci --ignore-scripts`, then
`npm run build`) executes with `app/` as its working directory.

## (a) npm lifecycle scripts — `app/package.json`

`preinstall`, `install` and `postinstall` each run
`echo CANARY_EXECUTED:t34-app-<phase> && exit 1`. There are intentionally NO
`prebuild`/`postbuild` scripts: `npm run build` legitimately runs those in
the secretless build job, so defining them as canaries would break every
recording run.

- Trigger: any `npm install` / `npm ci` WITHOUT `--ignore-scripts`.
- Silent in: the trusted build job, which installs with
  `npm ci --ignore-scripts` (verified: exit 0, no marker), and `npm run build`
  (install-time scripts never run as part of `run`; verified: build output
  only, exit 0). See the worker report for the offline probe transcript.

## (b) web command — `app/shopify.web.toml`

```toml
roles = ["frontend"]

[commands]
dev = "echo CANARY_EXECUTED:t34-shopify-web-dev && exit 1"
```

There is intentionally NO `build` key: `shopify app build` executes
`commands.build` for every discovered web (verified against the pinned CLI
4.8.2 sources: the build command runs `configuration.commands["build"]` per
web and skips webs without one), so a build canary would fire in the
secretless build job. The `dev` command only runs under `shopify app dev` or
a deploy flow that builds webs; the trusted workflow deploys with
`--no-build` and never runs dev, so execution of this command in CI means a
job ran merchant-controlled web commands.

- Trigger: `shopify app dev`, or any flow invoking the web `dev` command.
- Silent in: `shopify app build`, `shopify app deploy --no-build`.

## (c) npm config hook — `app/.npmrc` + `app/scripts/npm-onload-canary.js`

```ini
onload-script=./scripts/npm-onload-canary.js
```

The script prints `CANARY_EXECUTED:t34-npmrc-onload` and exits 1.

Verified behavior matrix (probed offline with npm 11.18.0; the CI toolchain
is npm 10 on Node 22 — same major behavior family):

| npm version | behavior |
|---|---|
| npm <= 6 | `require()`s the script on every invocation: marker + exit 1. |
| npm >= 7 (incl. CI) | `onload-script` was removed: npm prints `npm warn Unknown project config "onload-script"` on every invocation and never executes the file. |

So on the CI toolchain this canary is a present-but-inert tripwire with a
visible warning, not an executing hook: modern npm offers no `.npmrc` key
that executes a command (lifecycle execution lives in `package.json`, covered
by canary (a); `script-shell` was rejected as a canary because `npm run`
itself executes through it, so a failing `script-shell` would break the
legitimate `npm run build` in the secretless build job). If npm ever
re-introduces config-load execution, this file fails the run loudly.
