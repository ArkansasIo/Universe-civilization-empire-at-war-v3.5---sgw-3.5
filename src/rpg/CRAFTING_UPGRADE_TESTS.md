# Tempering and Masterworking Regression Tests

This file exercises the crafting upgrade state machine independently of the larger application's test suite.

Run with:

```bash
npx tsx src/rpg/crafting-upgrade-regression.test.ts
```

Coverage includes previews, exact material/currency spending, protection behavior, failure downgrades, invalid-state rejection, immutable input handling, masterwork progression, and cumulative cost estimation. This is regression coverage for the current rules; it is not a substitute for a transactional integration test against the production database.
