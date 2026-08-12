# Pipeline Config — nestled-forms

## Repo
| Field | Value |
|---|---|
| `repo_name` | `nestled-forms` |
| `framework` | `nestled-library` |
| `github_slug` | `nestledjs/nestled-forms` |
| `base_branch` | `develop` |
| `repo_path` | resolve at runtime with `git rev-parse --show-toplevel` — portable across Mac (`~/IdeaProjects`) and Linux (`~/workspaces`) hosts; never hardcode |
| `flightdesk_project_id` | `e7f6e567-caf6-4291-8b5d-6fcda9f60096` |
| `sdk_command` | `none` |

## Deployment
| Field | Value |
|---|---|
| `auto_merge` | `true` — the adversarial verifier `MERGE` verdict is the approval — pipeline merges + deploys directly (`In Progress` → merge → `Done`), no `In Review` / human `Approved` gate (dangerous mode); see `linear-pipeline.md` → Merge Policy |
| `deploy_command` | `none` — library — merge only; npm release stays a manual human step |
| `merge_command` | `gh pr merge <prNumber> --repo nestledjs/nestled-forms --merge --delete-branch` |

## Quality Gates
| Field | Value |
|---|---|
| `new_code_coverage_target` | `80%` (SonarCloud quality gate on new/changed code) |
| `coverage_policy` | Pipeline verifies the SonarCloud gate passes before advancing to `In Review`. Gate fails → inject fix instructions into the session, stay at `In Progress`. |
| plus | Intelligence Check green |

## Source System — Linear (Pirate & Fox team)
| Field | Value |
|---|---|
| `source_system` | `linear` |
| Canonical lifecycle | `https://raw.githubusercontent.com/pirateandfox/qalatra-prompts/develop/linear-pipeline.md` — state IDs, GraphQL patterns, turn-taking, identity |
| `linear_project_id` | `5de2da9a-9b50-4287-bc29-aa8c4dfd2b5a` (Nestled Forms) |
| API token | `secret get SHI_LINEAR` (authors as Shi) |
| FD task reference | the issue's `FlightDesk` attachment |

This pipeline only processes issues whose Linear project is `5de2da9a-9b50-4287-bc29-aa8c4dfd2b5a`. Never mutate issues
routed to other repos.

## Closeout
Approved → merge (= deploy) → archive cloud session → archive FlightDesk task (webhook usually
handles it) → **post the closing comment** → set Linear `Done` **last**, only after cleanup succeeds.

The closing comment is a **required** step and must come **before** `Done` — see *Closeout sequence*
in `linear-pipeline.md`. Observed skipped twice (cashcast PIR-265 2026-08-11, flightdesk PIR-259
2026-08-12): the handler merged, archived, and set `Done` while leaving the issue's last word as the
pipeline's own "I need a decision from you" question, so from Linear alone it read as abandoned. On
PIR-259 it was skipped even though the dispatch prompt named it explicitly — ordering it before
`Done` is the fix, asking for it is not. Verify it landed.
