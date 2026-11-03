# GitHub Copilot Instructions

Follow the repository-wide instructions in `/AGENTS.md`.

## Task execution
- Start by summarizing the task, affected files, acceptance criteria, and risks in the issue or pull request description.
- Work only on the assigned task; do not bundle unrelated refactors.
- Inspect existing implementations before creating new abstractions.
- Prefer data-driven rules and shared helpers for RPG/MMO systems.
- Keep UI previews clearly separated from production-authoritative game state.
- For route or navigation work, verify both the navigation entry and the route renderer.

## Required validation for frontend changes
1. Run `npm run lint`.
2. Run `npm run build`.
3. Run the narrowest relevant smoke test(s) listed in `package.json`.
4. Report the exact results, including any command that could not run.

## Pull requests
- Open a pull request instead of merging directly to `main`.
- Summarize behavior changes and tests; include screenshots for visual changes when available.
- Do not claim deployment succeeded based solely on a successful local build.
- Never include secrets or user credentials in code, logs, issues, or PRs.

## External agent/tool compatibility
These are portable repository instructions, not an installation of Everything Claude Code (ECC). Use only the skills, commands, hooks, and MCP integrations actually available in the current agent environment. Do not assume Claude Code-specific hooks or plugins run inside GitHub Copilot.
