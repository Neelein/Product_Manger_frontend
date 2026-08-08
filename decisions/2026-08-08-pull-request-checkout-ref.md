# Decision — Fix cross-repo checkout ref for pull_request events (2026-08-08)

## Problem
The e2e job of `cicd.yml` checks out the backend repo (`Neelein/Product_Manger_Backend`)
with `ref: ${{ github.ref_name }}`. On `pull_request` events `github.ref` is
`refs/pull/N/merge` and `github.ref_name` is `N/merge`, which is not a branch or
tag in the sibling repo. Result: git error "A branch or tag with the name
'25/merge' could not be found".

## Change
`ref: ${{ github.ref_name }}` → `ref: ${{ github.head_ref || github.ref_name }}`.
On PR events `github.head_ref` names the source branch (present in the sibling
repo); otherwise fall back to `github.ref_name` (`main`/`dev`).

## Alternative rejected
Skipping the backend checkout for PR runs would leave E2E unvalidated for PRs.