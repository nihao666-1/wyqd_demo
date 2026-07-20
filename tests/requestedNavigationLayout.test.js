import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const filesUrl = new URL('../src/views/files/FileCenter.vue', import.meta.url);
const recordsUrl = new URL('../src/views/records/RecordCenter.vue', import.meta.url);
const configUrl = new URL('../src/views/config/ConfigCenter.vue', import.meta.url);
const regulatoryWorkbenchUrl = new URL('../src/views/regulatory/RegulatoryWorkbench.vue', import.meta.url);
const expenseWorkbenchUrl = new URL('../src/views/expense/ExpenseWorkbench.vue', import.meta.url);
const expenseOverviewUrl = new URL('../src/views/expense/ExpenseAuditOverview.vue', import.meta.url);
const expenseAnomalyUrl = new URL('../src/views/expense/components/ExpenseAnomalyMonitorPage.vue', import.meta.url);
const expenseAnomalyAnalysisUrl = new URL('../src/views/expense/components/ExpenseAuditAnalysis.vue', import.meta.url);
const expenseTrendUrl = new URL('../src/views/expense/ExpenseUsageDashboard.vue', import.meta.url);
const supervisionResultUrl = new URL('../src/views/supervision-result/SupervisionShareResult.vue', import.meta.url);
const taskEmptyUrl = new URL('../src/views/tasks/TaskCenterEmptyState.vue', import.meta.url);
const layoutUrl = new URL('../src/components/layout/AppLayout.vue', import.meta.url);
const layoutCssUrl = new URL('../src/styles/layout.css', import.meta.url);

function read(url) {
  return readFileSync(url, 'utf8');
}

function compileVue(url) {
  const filename = url.pathname;
  const parsed = parse(read(url), { filename });
  assert.deepEqual(parsed.errors, []);
  const script = compileScript(parsed.descriptor, { id: filename });
  const template = compileTemplate({
    id: filename,
    filename,
    source: parsed.descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings }
  });
  assert.deepEqual(template.errors, []);
}

test('files config and records pages remove the redundant local title bands', () => {
  const files = read(filesUrl);
  const records = read(recordsUrl);
  const config = read(configUrl);

  assert.doesNotMatch(files, /page-title-row/);
  assert.doesNotMatch(records, /record-page-head/);
  assert.doesNotMatch(config, /page-head/);

  compileVue(filesUrl);
  compileVue(recordsUrl);
  compileVue(configUrl);
});

test('config center exposes configuration and parameter workspaces while records stay separate', () => {
  const config = read(configUrl);
  assert.match(config, /class="config-page route-fill-page"/);
  assert.equal((config.match(/class="table-scroll"/g) || []).length, 2);
  assert.equal((config.match(/<\/div>\s*<footer class="pager">/g) || []).length, 2);
  assert.doesNotMatch(config, /currentMode === 'records'/);
  assert.match(config, /\.config-page\s*\{[^}]*(?:^|\n)\s*height:\s*0;[^}]*overflow:\s*hidden/ms);
  assert.match(config, /\.config-page\.mode-initial[\s\S]*grid-template-rows:\s*auto auto minmax\(0,\s*1fr\)/);
  assert.match(config, /\.config-page\.mode-params[\s\S]*grid-template-rows:\s*auto minmax\(0,\s*1fr\)/);
  assert.match(config, /\.right-card\s*\{[^}]*overflow-x:\s*hidden[^}]*overflow-y:\s*auto/s);
  assert.match(config, /\.trace-side \.mini-table th,[\s\S]*\.param-side \.mini-table td\s*\{[^}]*white-space:\s*normal/s);
  compileVue(configUrl);
});

test('knowledge base navigation links to the existing analysis pages', () => {
  const layout = read(layoutUrl);
  const workbench = read(regulatoryWorkbenchUrl);

  assert.match(layout, /label: '审计知识库'[\s\S]*path: '\/regulatory\/workbench'[\s\S]*path: '\/audit-standard\/generate'[\s\S]*path: '\/supervision\/workbench'/);
  assert.match(layout, /const isKnowledgeSection = computed\(\(\) =>[\s\S]*isSupervisionShareResultRoute\.value/);

  assert.match(workbench, /to: '\/regulatory\/result'/);
  assert.match(workbench, /to: '\/tasks\/detail\/supervision-share'/);
  assert.match(workbench, /inject\('store'\)/);
  assert.match(workbench, /const isEmptyMode = computed\(\(\) => store\.demoDataMode === 'empty'\)/);
  assert.match(workbench, /v-if="isEmptyMode"/);
  assert.match(workbench, /class="special-empty-page"/);
  assert.doesNotMatch(workbench, /<h1>专项审计分析<\/h1>/);
  assert.match(workbench, /special-empty-grid\s*\{[^}]*grid-template-columns:minmax\(0,1fr\) var\(--ui-panel-rail-lg\);[^}]*gap:var\(--ui-space-4\)/s);
  assert.match(workbench, /special-audit-page\s*\{[^}]*box-sizing:border-box; width:100%;[^}]*height:0; min-height:0;[^}]*padding:var\(--ui-space-3\)/s);
  assert.doesNotMatch(workbench, /@media \(max-width:1700px\)\{\.special-empty-grid\{grid-template-columns:1fr\}/);

  compileVue(layoutUrl);
  compileVue(regulatoryWorkbenchUrl);
});

test('expense result pages remove the redundant local title bands', () => {
  const overview = read(expenseOverviewUrl);
  const anomaly = read(expenseAnomalyUrl);
  const trend = read(expenseTrendUrl);

  assert.doesNotMatch(overview, /overview-title-row|<h1>费用审计分析<\/h1>/);
  assert.doesNotMatch(anomaly, /expense-page-title|<h1[^>]*>费用异常监控<\/h1>/);
  assert.doesNotMatch(trend, /expense-trend-title|<h1[^>]*>费用趋势分析<\/h1>/);

  assert.match(trend, /\.insight-rail\{position:relative;top:auto;[\s\S]*max-width:345px/s);
  assert.doesNotMatch(trend, /\.insight-rail\{position:sticky/);

  compileVue(expenseOverviewUrl);
  compileVue(expenseAnomalyUrl);
  compileVue(expenseTrendUrl);
});

test('supervision result keeps its content grid without whole-page scaling', () => {
  const css = read(layoutCssUrl);
  const result = read(supervisionResultUrl);

  assert.match(css, /\.supervision-result-shell\s*\{[^}]*width:\s*100%/s);
  assert.match(css, /\.supervision-result-shell \.main\s*\{[^}]*flex:\s*1 1 auto/s);
  assert.doesNotMatch(css, /html\.supervision-result-scaled \.supervision-result-shell\s*\{[^}]*zoom:\s*var\(--supervision-result-scale\)/s);
  assert.doesNotMatch(result, /\bPAGE_WIDTH\b/);
  assert.doesNotMatch(result, /\bscaleNeeded\b/);
  assert.doesNotMatch(result, /transform:\s*scale\(/);
  assert.match(result, /grid-template-rows:\s*64px 78px 176px minmax\(286px, 1\.12fr\) minmax\(120px, \.62fr\)/);
  assert.match(result, /\.filter-panel\s*\{[^}]*padding:\s*4px 12px 6px/s);
});

test('task special audit and expense shells inherit the same viewport-scaled shell tokens', () => {
  const css = read(layoutCssUrl);
  const components = read(new URL('../src/styles/components.css', import.meta.url));
  const expenseWorkbench = read(expenseWorkbenchUrl);

  assert.match(css, /--shell-sidebar-width:\s*var\(--ui-sidebar-width\)/);
  assert.match(css, /--shell-page-gutter:\s*var\(--ui-page-gutter\)/);
  assert.match(css, /\.app-shell \.sidebar\s*\{[^}]*width:\s*var\(--shell-sidebar-width\)[^}]*flex-basis:\s*var\(--shell-sidebar-width\)/s);
  assert.match(css, /\.app-shell \.brand\s*\{[^}]*min-height:\s*var\(--ui-topbar-height\)/s);
  assert.match(css, /\.app-shell \.sidebar a\s*\{[^}]*min-height:\s*var\(--ui-control-md\)[^}]*font-size:\s*var\(--ui-font-sm\)/s);
  assert.match(css, /\.app-shell \.topbar\s*\{[^}]*height:\s*var\(--ui-topbar-height\)/s);
  assert.match(css, /\.expense-section-shell \.bottom-nav,\s*\.expense-empty-shell \.bottom-nav,\s*\.expense-audit-result-shell \.bottom-nav,\s*\.expense-trend-shell \.bottom-nav\s*\{[^}]*min-height:\s*auto;[^}]*margin:\s*0 -8px -16px;[^}]*padding:\s*10px 12px 14px;/s);
  assert.doesNotMatch(components, /\.sidebar\s*\{\s*width:\s*(64|210)px/);
  assert.doesNotMatch(components, /@media \(max-width: 900px\)[\s\S]*\.sidebar \{ width: 264px; flex: 0 0 264px;/);
  assert.match(expenseWorkbench, /expense-empty-layout\{display:grid;grid-template-columns:minmax\(0,1fr\) 320px;gap:32px/);
  assert.match(expenseWorkbench, /expense-empty-page\{[^}]*box-sizing:border-box;width:100%;[^}]*padding:16px 56px 12px 8px/s);
  assert.match(expenseWorkbench, /@media \(max-width: 1700px\)\{\.expense-empty-layout\{grid-template-columns:1fr\}/);
});

test('expense detail and anomaly drawers avoid duplicate vertical scrollbars and overlap', () => {
  const overview = read(expenseOverviewUrl);
  const anomalyPage = read(expenseAnomalyUrl);
  const anomalyDrawer = read(new URL('../src/views/expense/components/ExpenseAnomalyDetailDrawer.vue', import.meta.url));

  assert.match(overview, /expense-audit-overview-page\{[^}]*min-height:calc\(100dvh - 58px\);overflow:visible/s);
  assert.match(overview, /overview-main\{min-width:0;overflow:visible/);
  assert.match(overview, /detail-drawer\{min-width:0;overflow:visible/);
  assert.match(anomalyPage, /expense-monitor-body\{display:grid;grid-template-columns:minmax\(0,1fr\) 320px;align-items:stretch;gap:16px/);
  assert.match(anomalyPage, /expense-main-column\{display:grid;min-width:0;gap:8px;align-content:start\}/);
  assert.match(anomalyDrawer, /expense-anomaly-drawer\{position:sticky;[^}]*grid-template-rows:auto minmax\(0,1fr\) auto;[^}]*width:320px;[^}]*height:100%;[^}]*align-self:stretch/s);
  assert.match(anomalyDrawer, /drawer-body\{min-height:0;overflow:auto/);
  assert.doesNotMatch(anomalyDrawer, /position:fixed;top:58px;right:0/);
});

test('task center and expense anomaly filters keep compact top panels', () => {
  const taskEmpty = read(taskEmptyUrl);
  const anomalyAnalysis = read(expenseAnomalyAnalysisUrl);

  assert.match(taskEmpty, /<section class="empty-filter-card" aria-label="全部任务筛选">/);
  assert.doesNotMatch(taskEmpty, /<h2 id="empty-task-title">任务中心<\/h2>/);
  assert.match(taskEmpty, /\.empty-filter-card\{padding:8px 10px 10px\}/);
  assert.match(taskEmpty, /\.empty-filter-grid\{gap:8px 12px;align-content:start\}/);
  assert.match(taskEmpty, /\.empty-filter-grid label\{gap:5px\}/);
  assert.match(anomalyAnalysis, /\.analysis-filters\{min-height:0;align-self:start;align-content:start;grid-auto-rows:max-content;padding:6px 14px 8px\}/);
  assert.match(anomalyAnalysis, /\.analysis-filters label\{gap:4px\}/);
  assert.match(anomalyAnalysis, /\.expense-analysis-panel\{gap:8px;align-self:start;align-content:start\}/);

  compileVue(taskEmptyUrl);
  compileVue(expenseAnomalyAnalysisUrl);
});
