# Coding Agent Instructions

These instructions apply to all coding agents working in this repository, including GitHub Copilot and compatible agent tools.

## Before changing code
1. Read the relevant source files, tests, and nearby documentation.
2. Identify the smallest change that satisfies the task.
3. Check the current branch and working tree; do not overwrite unrelated work.
4. For gameplay/economy features, distinguish client presentation from authoritative server behavior.

## Project conventions
- Preserve existing features and the established architecture.
- Follow the repository's TypeScript, React, and Vite conventions.
- Prefer small, focused pull requests with explicit acceptance criteria.
- Reuse existing game rules/helpers rather than duplicating formulas.
- Add or update tests for behavior changes and bug fixes.
- Never commit secrets, API keys, tokens, credentials, production data, or generated build output.

## Validation
- Install dependencies using the repository's lockfile and documented package manager.
- Run `npm run lint` and `npm run build` for frontend changes when dependencies/environment permit.
- Run the most relevant existing smoke tests; inspect `package.json` for available scripts.
- Report exact commands and outcomes. Never claim a test passed unless it actually ran and passed.
- If blocked by external limits or missing credentials, report that separately from source/build failures.

## Security and game integrity
- Treat the browser as untrusted. Do not make client-only resource deductions, ownership checks, or inventory transfers authoritative.
- Any persistent economy, inventory, vault, trade, or progression mutation must be authenticated and validated server-side, with atomic transactions and replay/idempotency protections where appropriate.
- Do not introduce a new backend, database, authentication provider, or secret configuration without documenting the architecture and required setup.
- Avoid weakening permissions or bypassing security checks to make a test pass.

## Pull request requirements
- Keep scope narrow and explain the user-visible behavior.
- Include tests and a short test report.
- List remaining risks, migrations, configuration, and deployment blockers.
- Do not merge pull requests automatically.
