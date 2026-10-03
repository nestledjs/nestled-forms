# Pipeline Config — nestled-forms

## Repo

| Field                   | Value                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repo_name`             | `nestled-forms`                                                                                                                                   |
| `framework`             | `nestled-library`                                                                                                                                 |
| `github_slug`           | `nestledjs/nestled-forms`                                                                                                                         |
| `base_branch`           | `develop`                                                                                                                                         |
| `repo_path`             | resolve at runtime with `git rev-parse --show-toplevel` — portable across Mac (`~/IdeaProjects`) and Linux (`~/workspaces`) hosts; never hardcode |
| `flightdesk_project_id` | `e7f6e567-caf6-4291-8b5d-6fcda9f60096`                                                                                                            |
| `sdk_command`           | `none`                                                                                                                                            |

## Deployment

| Field            | Value                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auto_merge`     | `true` — the adversarial verifier `MERGE` verdict is the approval; the pipeline merges + deploys directly with no human approval gate (dangerous mode) |
| `deploy_command` | `none` — library — merge only; npm release stays a manual human step                                                                                   |
| `merge_command`  | `gh pr merge <prNumber> --repo nestledjs/nestled-forms --merge --delete-branch`                                                                        |

## Quality Gates

| Field                      | Value                                                                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new_code_coverage_target` | `80%` (SonarCloud quality gate on new/changed code)                                                                                                         |
| `coverage_policy`          | Pipeline verifies the SonarCloud gate passes before advancing to `In Review`. Gate fails → inject fix instructions into the session, stay at `In Progress`. |
| plus                       | Intelligence Check green                                                                                                                                    |

## Source System

FlightDesk is the source of truth for task state and the only work ledger (D23); Linear is
retired (2026-10-03). This folder's agent reports only through FlightDesk: the FlightDesk turn
(`flightdesk turn end`) reports the outcome and FlightDesk advances the task.
