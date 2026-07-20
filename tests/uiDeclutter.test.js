import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('workbench uses a compact summary instead of repeating module status cards', () => {
  const source = read('src/views/workbench/WorkbenchHome.vue');

  assert.match(source, /class="overview-strip"/);
  assert.match(source, /v-for="item in overviewStats"/);
  assert.match(source, />最近访问</);
});

test('analysis entry pages keep primary actions and remove explanatory side rails', () => {
  const regulatory = read('src/views/regulatory/RegulatoryWorkbench.vue');
  const supervision = read('src/views/supervision/SupervisionWorkbench.vue');

  assert.doesNotMatch(regulatory, /<aside class="side-stack"/);
  assert.doesNotMatch(regulatory, /const materials = \[/);
  assert.doesNotMatch(supervision, /MetricGrid/);
  assert.match(supervision, /class="action-list"/);
});

test('expense and file details stay closed until the user asks to view them', () => {
  const expense = read('src/views/expense/ExpenseAuditOverview.vue');
  const files = read('src/views/files/FileCenter.vue');

  assert.match(expense, /route\.query\.detail/);
  assert.match(expense, /<aside v-if="selectedAnomaly" class="detail-drawer"/);
  assert.match(files, /route\.query\.detail/);
  assert.match(files, /<aside v-if="selectedFile" class="reference-rail"/);
});

test('report generation keeps the core workflow without duplicate progress furniture', () => {
  const source = read('src/views/audit-report/AuditReportWorkbench.vue');

  assert.doesNotMatch(source, />章节级重新生成</);
  assert.doesNotMatch(source, />保存版本</);
  assert.doesNotMatch(source, /class="gen-bottom"/);
});
