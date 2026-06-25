---
name: conventional-commits
description: Use when creating, reviewing, or suggesting git commit messages, branches, pull requests, or release notes so they follow Conventional Commits and GitHub Flow.
---

# Conventional Commits

Use this skill whenever a commit message, branch name, PR title, or release-oriented change summary is needed.

## Commit Format

Every commit message must follow:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Rules:
- Start with a lowercase type followed by `:` and one space.
- Use a short imperative description in Spanish or English, matching the surrounding repo style.
- Add a scope when it clarifies the affected area, for example `feat(match): ...`.
- Add a body only when the reason or tradeoff is not obvious from the diff.
- Mark breaking changes with a footer or body line starting exactly with `BREAKING CHANGE: `.

## Types

Required semantic types:
- `feat`: adds a user-visible or API-visible capability. Maps to SemVer minor.
- `fix`: fixes a bug. Maps to SemVer patch.

Allowed supporting types:
- `docs`: documentation-only changes.
- `test`: tests only or test coverage changes.
- `refactor`: code restructuring without behavior change.
- `perf`: performance improvement.
- `style`: formatting/style only, no behavior change.
- `build`: build system, package manager, or dependency metadata.
- `ci`: CI/CD configuration.
- `chore`: maintenance that does not fit another type.

## Examples

```text
feat(match): implement volunteer matching core
```

```text
fix(phone): accept current Venezuelan mobile prefixes
```

```text
docs(agent): document github flow and commit convention
```

```text
feat(api): change volunteer registration contract

BREAKING CHANGE: registration now requires token_gestion in the request body.
```

## GitHub Flow

Follow GitHub Flow for all repository changes:
- Start from the current base branch, normally `master` or `main`.
- Create a short-lived branch before committing, named with a Conventional Commit style prefix, for example `feat/matching-core`, `fix/phone-prefixes`, or `docs/agent-flow`.
- Keep commits focused and independently reviewable.
- Push the branch to `origin`.
- Open a pull request for review before merging.
- Do not commit directly to the base branch unless explicitly requested.

## Pre-Commit Checklist

Before committing:
- Inspect `git status --short`.
- Inspect `git diff` for unstaged work.
- Inspect `git log --oneline -10` for repo style.
- Stage only intended files.
- Run relevant tests or document why they were not run.
- Never include secrets, generated build output, `node_modules`, or unrelated user changes.

Reference: https://www.conventionalcommits.org/es/v1.0.0-beta.3/#especificaci%c3%b3
