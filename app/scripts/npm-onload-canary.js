// AC-T34-03 canary (c): .npmrc `onload-script` hook.
// npm versions that honor onload-script require() this file on every npm
// invocation. If this ever runs, it marks the log loudly and fails: repository
// commands must never execute in token-bearing jobs.
// Modern npm (>= 7) never loads this file (warns "Unknown project config"
// instead); see CANARIES.md for the verified behavior matrix.
console.log("CANARY_EXECUTED:t34-npmrc-onload");
process.exit(1);
