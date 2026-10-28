import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [app, sidebar, view, progression, pagesWorkflow] = await Promise.all([
  readFile(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/Sidebar.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/views/StashVaultsView.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/game/vault-progression.ts', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8'),
]);

assert.match(app, /import\s+\{\s*StashVaultsView\s*\}\s+from\s+['"]\.\/components\/views\/StashVaultsView['"]/);
assert.match(app, /activeRoute\s*===\s*['"]stash-vaults['"]\s*&&\s*<StashVaultsView\s*\/>/);
assert.match(sidebar, /id:\s*['"]stash-vaults['"]/);
assert.match(view, /role="tablist"/);
assert.match(view, /role="tab"/);
assert.match(view, /aria-selected=\{selected\}/);
for (const label of ['Protected Vault', 'Inventory Vault', 'Equipment Vault']) {
  assert.ok(view.includes(label) || progression.includes(label), `Expected vault label: ${label}`);
}
assert.match(view, /does not move real items, deduct resources, or persist upgrades to the server/);
assert.match(progression, /Server persistence and atomic transactions are required for production/);
assert.match(pagesWorkflow, /npm run lint/);
assert.match(pagesWorkflow, /npm run build/);
assert.match(pagesWorkflow, /test -s dist\/index\.html/);

console.log('Vault UI smoke checks passed: app import/route, sidebar entry, accessible tabs, all three vaults, demo-only boundary, and Pages validation steps.');
