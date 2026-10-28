# Coding Agent Workflow: Planner → Implementer → Reviewer

This workflow is designed for GitHub Copilot and other compatible coding agents. It adopts portable ideas used by agent toolkits such as Everything Claude Code (ECC); it does not install or execute ECC-specific hooks.

## Roles

### 1. Planner
Before implementation, produce a short plan containing:
- Goal and observable acceptance criteria
- Existing files and architecture to reuse
- Proposed file-level changes
- Tests and validation commands
- Security, migration, and deployment risks
- Questions/blockers that genuinely require a human decision

The planner should not edit code unless explicitly asked to combine planning and implementation.

### 2. Implementer
- Work on a feature branch.
- Implement only the agreed scope.
- Add or update tests alongside the implementation.
- Run lint, build, and focused tests where possible.
- Record exact commands, results, and blockers in the pull request.

### 3. Reviewer
Review the diff independently for:
- Correctness and regressions
- Missing tests and edge cases
- Authentication, authorization, input validation, and secret exposure
- Client/server trust boundaries and transaction safety
- Accessibility, responsive behavior, and route reachability
- Build/deployment assumptions and undocumented setup

A review is not a substitute for actually running tests. Report findings by severity and reference files/lines where possible.

## Suggested GitHub workflow

1. Create a focused issue with the goal, constraints, and acceptance criteria.
2. Ask Copilot to plan the task first.
3. Assign the issue to Copilot if the repository/account exposes Copilot as an available assignee; otherwise start a Copilot coding-agent task from the GitHub UI.
4. Ask Copilot to implement on a branch and open a pull request.
5. Run CI and inspect the diff. Request a separate review pass.
6. Resolve failures and review findings.
7. A human reviews and merges the PR; agents must not merge automatically.

## First task: stash vault interface

Issue: [Validate and repair Protected, Inventory, and Equipment Vault interface](https://github.com/ArkansasIo/Universe-civilization-empire-at-war-v3.5---sgw-3.5/issues/9)

Acceptance criteria:
- Protected Vault, Inventory Vault, and Equipment Vault are selectable and reachable from navigation.
- TypeScript checks and production build pass, or exact blockers are documented.
- Focused tests cover the relevant vault rules and route/component behavior.
- Deployment status is verified separately from build status.
- Persistent storage and resource spending are not represented as production-ready unless implemented with authenticated server-side checks and atomic transactions.

## Portable task prompt

> First return a concise plan: inspect the existing code, list files likely to change, define acceptance criteria, and identify risks. Then implement only the approved scope on a feature branch. Run the relevant tests, `npm run lint`, and `npm run build` when available. Open a pull request, report exact test outcomes, and do not merge automatically. Follow `AGENTS.md` and `.github/copilot-instructions.md`.
