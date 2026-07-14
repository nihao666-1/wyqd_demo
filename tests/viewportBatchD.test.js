import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('batch D expense workspaces opt into fill without page scaling', () => {
  const expectations = new Map([
    ['../src/views/expense/ExpenseWorkbench.vue', /expense-(?:empty|data-entry)-page route-fill-page/],
    ['../src/views/expense/ExpenseAuditOverview.vue', /expense-audit-overview-page route-fill-page/],
    ['../src/views/expense/ExpenseUsageDashboard.vue', /expense-trend-page route-fill-page/],
    ['../src/views/expense/ExpenseUsageDrilldown.vue', /expense-usage-drilldown-page route-fill-page/],
    ['../src/views/expense/ExpenseUsageReport.vue', /expense-usage-report-page route-fill-page/],
    ['../src/views/expense/components/ExpenseAnomalyMonitorPage.vue', /expense-monitor-page route-fill-page/]
  ]);

  for (const [path, rootClass] of expectations) {
    const source = read(path);
    assert.match(source, rootClass, path);
    assert.doesNotMatch(source, /\bzoom\s*:/, path);
    assert.doesNotMatch(source, /transform:\s*scale\(/, path);
  }
});

test('batch D expense roots fill remaining height and own their overflow', () => {
  const overview = read('../src/views/expense/ExpenseAuditOverview.vue');
  const workbench = read('../src/views/expense/ExpenseWorkbench.vue');
  const trend = read('../src/views/expense/ExpenseUsageDashboard.vue');
  const monitor = read('../src/views/expense/components/ExpenseAnomalyMonitorPage.vue');
  const drilldown = read('../src/views/expense/ExpenseUsageDrilldown.vue');
  const report = read('../src/views/expense/ExpenseUsageReport.vue');

  assert.match(overview, /\.expense-audit-overview-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*hidden/s);
  assert.match(overview, /\.overview-main\s*\{[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(overview, /\.overview-main\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(overview, /\.exception-section\s*\{[^}]*display:\s*flex[^}]*flex:\s*1[^}]*flex-direction:\s*column/s);
  assert.match(overview, /\.exception-section table\s*\{[^}]*height:\s*100%/s);
  assert.match(workbench, /@media \(min-width:\s*1701px\)[\s\S]*\.expense-empty-main\s*\{[^}]*grid-template-rows:\s*auto auto auto minmax\(0,\s*1fr\)/s);
  assert.match(workbench, /@media \(min-width:\s*1701px\)[\s\S]*\.expense-task-panel\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(trend, /\.expense-trend-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(trend, /@media \(min-width:\s*1501px\)[\s\S]*\.trend-main\s*\{[^}]*height:\s*100%[^}]*grid-template-rows:\s*auto auto auto auto minmax\(0,\s*1fr\)/s);
  assert.match(trend, /@media \(min-width:\s*1501px\)[\s\S]*\.trend-detail\s*\{[^}]*display:\s*flex[^}]*min-height:\s*0[^}]*flex-direction:\s*column/s);
  assert.match(trend, /@media \(min-width:\s*1501px\)[\s\S]*\.detail-scroll\s*\{[^}]*flex:\s*1[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(monitor, /\.expense-monitor-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(monitor, /@media\s*\(min-width:\s*901px\)[\s\S]*\.expense-monitor-body\s*\{[^}]*height:\s*100%[^}]*min-height:\s*0/s);
  assert.match(monitor, /@media\s*\(min-width:\s*901px\)[\s\S]*\.expense-main-column\s*\{[^}]*min-height:\s*0[^}]*grid-template-rows:\s*auto minmax\(336px,\s*1fr\)[^}]*align-content:\s*stretch/s);
  assert.match(drilldown, /class="panel source-detail-panel"/);
  assert.match(drilldown, /\.source-detail-panel\s*\{[^}]*display:\s*flex[^}]*flex:\s*1/s);
  assert.match(report, /\.expense-usage-report-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(report, /:deep\(\.table-wrap\)\s*\{[^}]*display:\s*flex[^}]*flex:\s*1/s);
  assert.match(report, /:deep\(\.table-wrap > table\)\s*\{[^}]*height:\s*100%/s);
});

test('new expense task remains a natural-height form', () => {
  const source = read('../src/views/expense/ExpenseUsageNew.vue');
  assert.doesNotMatch(source, /route-fill-page/);
  assert.doesNotMatch(source, /\bzoom\s*:/);
  assert.doesNotMatch(source, /transform:\s*scale\(/);
});
