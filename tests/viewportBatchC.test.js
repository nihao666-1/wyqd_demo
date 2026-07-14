import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const naturalPages = [
  '../src/views/supervision/SupervisionUpload.vue',
  '../src/views/supervision/SupervisionFolderPreview.vue',
  '../src/views/supervision/SupervisionFieldEdit.vue',
  '../src/views/supervision/SupervisionMetadata.vue',
  '../src/views/supervision/SupervisionPrecheck.vue',
  '../src/views/supervision/SupervisionReportSourceSelect.vue'
];

test('batch C opts the three supervision workspaces into the shared fill contract', () => {
  const workbench = read('../src/views/supervision/SupervisionWorkbench.vue');
  const draft = read('../src/views/supervision/SupervisionReportDraft.vue');
  const result = read('../src/views/supervision-result/SupervisionShareResult.vue');

  assert.match(workbench, /class="supervision-workbench-page route-fill-page"/);
  assert.match(workbench, /\.supervision-workbench-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(workbench, /\.business-card\s*\{[^}]*grid-template-rows:\s*auto auto minmax\(0, 1fr\)/s);
  assert.match(workbench, /\.business-card \.btn\s*\{[^}]*align-self:\s*end/s);
  assert.match(draft, /class="supervision-report-draft-page route-fill-page"/);
  assert.match(draft, /\.supervision-report-draft-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(result, /class="supervision-page route-fill-page"/);
  assert.match(result, /\.supervision-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
});

test('batch C leaves short import forms content driven and forbids whole-page scaling', () => {
  for (const path of naturalPages) {
    const source = read(path);
    assert.doesNotMatch(source, /route-fill-page/, path);
    assert.doesNotMatch(source, /\bzoom\s*:/, path);
    assert.doesNotMatch(source, /transform:\s*scale\(/, path);
  }
});

test('supervision result stretches at the two priority baselines and keeps detail scrolling internal', () => {
  const layout = read('../src/styles/layout.css');
  const result = read('../src/views/supervision-result/SupervisionShareResult.vue');

  assert.match(layout, /\.supervision-result-shell\s*\{[^}]*height:\s*var\(--shell-viewport-height\)[^}]*min-height:\s*var\(--shell-viewport-height\)/s);
  assert.match(layout, /\.supervision-result-shell \.main\s*\{[^}]*height:\s*var\(--shell-viewport-height\)[^}]*min-height:\s*0[^}]*overflow:\s*hidden/s);
  assert.match(result, /\.supervision-board\s*\{[^}]*min-height:\s*100%/s);
  assert.match(result, /\.source-detail-panel\s*\{[^}]*height:\s*100%[^}]*min-height:\s*0/s);
  assert.match(result, /\.detail-content\s*\{[^}]*overflow-y:\s*auto/s);
  assert.doesNotMatch(`${layout}\n${result}`, /\bzoom\s*:/);
  assert.doesNotMatch(`${layout}\n${result}`, /transform:\s*scale\(/);
});
