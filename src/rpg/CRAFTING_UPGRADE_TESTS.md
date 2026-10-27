# Crafting Upgrade Regression Tests

Use `npm run crafting:regression` to execute deterministic regression checks for tempering and masterworking.

The test suite covers preview values, success material/currency costs, protection consumption, failure downgrades, invalid item state and random rolls, insufficient wallet rejection without input mutation, masterwork gating and material costs, cumulative upgrade cost estimation, and default rule-table completeness.

Related integration checks:
- `npm run crafting:service:smoke`
- `npm run crafting:http:smoke`

These checks are wired into the Engine Tests workflow. Production database transactional behavior should also be verified in an environment with the configured MySQL test database.
