import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const fillPages = new Map([
  ['../src/views/regulatory/RegulatoryWorkbench.vue', 'special-audit-page route-fill-page'],
  ['../src/views/regulatory/RegulatoryResult.vue', 'reg-result-page route-fill-page'],
  ['../src/views/regulatory/RegulatoryHistory.vue', 'regulatory-history-page route-fill-page'],
  ['../src/views/audit-standard/AuditStandardWorkbench.vue', 'audit-standard-workbench-page route-fill-page'],
  ['../src/views/audit-standard/AuditStandardDraft.vue', 'audit-standard-result-page route-fill-page'],
  ['../src/views/audit-standard/AuditStandardDiff.vue', 'audit-standard-diff-page route-fill-page'],
  ['../src/views/audit-standard/AuditStandardLibrary.vue', 'audit-standard-library-page route-fill-page'],
  ['../src/views/audit-standard/AuditStandardPolicy.vue', 'audit-standard-policy-page route-fill-page']
]);

const naturalPages = [
  '../src/views/regulatory/RegulatoryNew.vue',
  '../src/views/regulatory/RegulatoryDataFetch.vue',
  '../src/views/audit-standard/AuditStandardGenerate.vue',
  '../src/views/audit-standard/AuditStandardUpload.vue',
  '../src/views/audit-standard/AuditStandardPrecheck.vue'
];

test('batch B workspaces opt into fill while forms remain content driven', () => {
  for (const [path, className] of fillPages) {
    const source = read(path);
    assert.match(source, new RegExp(`class="${className}"`), path);
    assert.match(source, /height:\s*0/);
    assert.match(source, /min-height:\s*0/);
    assert.doesNotMatch(source, /\bzoom\s*:/);
    assert.doesNotMatch(source, /transform:\s*scale\(/);
  }

  for (const path of naturalPages) {
    const source = read(path);
    assert.doesNotMatch(source, /route-fill-page/, path);
    assert.doesNotMatch(source, /\bzoom\s*:/);
    assert.doesNotMatch(source, /transform:\s*scale\(/);
  }
});

test('batch B result pages keep overflow inside their main and detail regions', () => {
  const result = read('../src/views/regulatory/RegulatoryResult.vue');
  const draft = read('../src/views/audit-standard/AuditStandardDraft.vue');

  assert.match(result, /\.reg-result-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*hidden/s);
  assert.match(result, /\.reg-result-main\s*\{[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(result, /\.focus-detail\s*\{[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(draft, /\.audit-standard-result-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  const diff = read('../src/views/audit-standard/AuditStandardDiff.vue');
  const policy = read('../src/views/audit-standard/AuditStandardPolicy.vue');
  const workbench = read('../src/views/regulatory/RegulatoryWorkbench.vue');
  assert.match(diff, /:deep\(\.table-wrap\)\s*\{[^}]*display:\s*flex[^}]*flex:\s*1/s);
  assert.match(policy, /\.audit-standard-policy-page > \.section-grid > div\s*\{[^}]*display:\s*grid[^}]*grid-template-rows:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(policy, /:deep\(\.table-wrap\)\s*\{[^}]*display:\s*flex[^}]*flex:\s*1/s);
  assert.match(workbench, /\.special-empty-main\s*\{[^}]*grid-template-rows:\s*auto auto minmax\(0,\s*1fr\)/s);
  assert.match(workbench, /\.empty-recent-panel\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
});

test('regulatory result page keeps dense result sections content driven', () => {
  const result = read('../src/views/regulatory/RegulatoryResult.vue');

  assert.match(result, /\.reg-result-main\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column[^}]*gap:\s*10px/s);
  assert.match(result, /\.reg-result-main > \*\s*\{[^}]*flex:\s*0 0 auto/s);
  assert.doesNotMatch(result, /\.reg-result-main\s*\{[^}]*grid-template-rows:[^}]*minmax\(145px,\s*1fr\)/s);
  assert.match(result, /\.filter-strip\s*\{[^}]*min-height:\s*74px/s);
  assert.match(result, /\.metric-strip\s*\{[^}]*min-height:\s*88px/s);
  assert.match(result, /\.chart-grid\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(result, /\.history-card\s*\{[^}]*align-self:\s*start/s);
});

test('special audit data mode keeps analysis entry cards compact on tall screens', () => {
  const workbench = read('../src/views/regulatory/RegulatoryWorkbench.vue');

  assert.match(workbench, /@media \(min-width:1181px\) and \(min-height:900px\)/);
  assert.match(workbench, /\.page-grid\s*\{[^}]*height:\s*100%[^}]*align-items:\s*stretch/s);
  assert.match(workbench, /\.main-stack\s*\{[^}]*min-height:\s*0[^}]*grid-template-rows:\s*auto 312px minmax\(220px,\s*\.55fr\) minmax\(300px,\s*\.5fr\)/s);
  assert.match(workbench, /\.ability-card\s*\{[^}]*min-height:\s*312px/s);
  assert.match(workbench, /\.chart-grid\s*\{[^}]*min-height:\s*220px/s);
  assert.match(workbench, /\.ability-card\s*\{[^}]*grid-template-rows:\s*auto auto minmax\(76px,\s*1fr\) auto auto/s);
  assert.match(workbench, /\.chart-grid article\s*\{[^}]*min-height:\s*0[^}]*display:\s*flex[^}]*flex-direction:\s*column[^}]*overflow:\s*hidden/s);
  assert.match(workbench, /\.trend svg\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*flex:\s*1 1 0/s);
  assert.match(workbench, /\.donut-layout\s*\{[^}]*min-height:\s*0[^}]*flex:\s*1 1 0/s);
  assert.match(workbench, /\.bar-list\s*\{[^}]*min-height:\s*0[^}]*flex:\s*1 1 0[^}]*align-content:\s*center/s);
  assert.match(workbench, /@media \(max-width:1500px\)\{[\s\S]*?\.ability-card dl\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\) minmax\(130px,1\.35fr\)\}/);
  assert.match(workbench, /\.recent-panel\s*\{[^}]*display:\s*flex[^}]*min-height:\s*300px[^}]*flex-direction:\s*column/s);
  assert.match(workbench, /\.table-wrap\s*\{[^}]*min-height:\s*182px[^}]*flex:\s*1[^}]*overflow:\s*auto/s);
  assert.match(workbench, /\.side-stack\s*\{[^}]*min-height:\s*0[^}]*grid-template-rows:\s*minmax\(0,\s*1fr\) minmax\(210px,\s*\.45fr\)/s);
  assert.match(workbench, /\.info-panel\s*\{[^}]*grid-template-rows:\s*auto repeat\(5,\s*minmax\(90px,\s*1fr\)\)/s);
  assert.match(workbench, /\.pending-panel\s*\{[^}]*display:\s*flex[^}]*min-height:\s*210px[^}]*flex-direction:\s*column/s);
  assert.match(workbench, /@media \(max-width:1500px\)\{[\s\S]*?\.page-grid\{grid-template-columns:minmax\(0,1fr\) 270px;gap:10px\}/);
});

test('special audit data mode keeps the earlier fill hooks for empty mode', () => {
  const workbench = read('../src/views/regulatory/RegulatoryWorkbench.vue');

  assert.match(workbench, /\.special-empty-main\s*\{[^}]*grid-template-rows:\s*auto auto minmax\(0,\s*1fr\)/s);
  assert.match(workbench, /\.empty-recent-panel\s*\{[^}]*display:\s*flex[^}]*min-height:\s*0[^}]*flex-direction:\s*column/s);
  assert.match(workbench, /\.empty-table-wrap\s*\{[^}]*display:\s*flex[^}]*min-height:\s*0[^}]*flex:\s*1[^}]*flex-direction:\s*column/s);
});

test('shared business page primitives use viewport scale tokens', () => {
  const components = read('../src/styles/components.css');
  assert.match(components, /\.page-head\s*\{[^}]*gap:\s*var\(--ui-space-5\)[^}]*padding:\s*var\(--ui-space-6\)/s);
  assert.match(components, /\.page-head h2\s*\{[^}]*font-size:\s*var\(--ui-font-xl\)/s);
  assert.match(components, /\.btn\s*\{[^}]*min-height:\s*var\(--ui-control-md\)[^}]*font-size:\s*var\(--ui-font-sm\)/s);
  assert.match(components, /\.panel\s*\{[^}]*padding:\s*var\(--ui-space-5\)[^}]*margin-bottom:\s*var\(--ui-space-5\)/s);
  assert.match(components, /th,\s*td\s*\{[^}]*font-size:\s*var\(--ui-font-sm\)/s);
});
