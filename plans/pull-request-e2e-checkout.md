# Plan — Fix cross-repo checkout on pull_request events (2026-08-08)

## Goal

The e2e job of `cicd.yml` checks out the backend repo with `ref: ${{ github.ref_name }}`. On `pull_request` events `github.ref_name` resolves to `25/merge` (the PR merge ref, not a branch/tag), so the cross-repo checkout fails with "A branch or tag with the name '25/merge' could not be found". Use the PR head branch when available.

## Changes
- `.github/workflows/cicd.yml` — `ref: ${{ github.ref_name }}` → `ref: ${{ github.head_ref || github.ref_name }}`
- `decisions/2026-08-08-pull-request-checkout-ref.md` — new decision record

## Verification
- YAML parses (rubyaml).
- Push events (ref `main`/`dev`) behave identically; PR events check out the source branch.