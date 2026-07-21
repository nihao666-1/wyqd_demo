import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const workbenchUrl = new URL('../src/views/expense/ExpenseWorkbench.vue', import.meta.url);
const layoutUrl = new URL('../src/components/layout/AppLayout.vue', import.meta.url);
const routerUrl = new URL('../src/router/index.js', import.meta.url);

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

function getCssRule(content, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `missing CSS rule: ${selector}`);
  return match[1];
}

test('费用审计空白页包含红框拆分的全部核心区域', () => {
  const content = read(workbenchUrl);
  for (const text of [
    '费用审计分析',
    '费用数据快照',
    '综合分析任务',
    '异常监控任务',
    '趋势预警',
    '导出报表',
    '暂无费用审计数据',
    '新建综合分析',
    '新建异常监控',
    '新建趋势分析',
    '费用分析任务',
    '暂无费用分析任务',
    '所需数据源',
    '数据接入指引'
  ]) {
    assert.match(content, new RegExp(text));
  }
});

test('费用审计空白页任务表和数据源文案与设计一致', () => {
  const content = read(workbenchUrl);
  for (const heading of ['任务编号', '分析类型', '被审计单位', '审计期间', '数据来源', '状态', '输出结果', '操作']) {
    assert.match(content, new RegExp(`<th scope="col">${heading}</th>`));
  }
  for (const source of ['费用审批流程', '费控数据', '预算数据', '财务凭证', '固定资产台账']) {
    assert.match(content, new RegExp(source));
  }
  assert.equal((content.match(/必需/g) || []).length, 4);
  assert.equal((content.match(/可选/g) || []).length, 1);
});

test('费用审计空白页使用专用响应式网格并避免真实任务数据', () => {
  const content = read(workbenchUrl);
  assert.match(content, /class="expense-empty-page[^\"]*"/);
  assert.match(content, /\.expense-empty-layout\s*\{[\s\S]*grid-template-columns:minmax\(0,1fr\) 320px/);
  assert.match(content, /\.expense-metrics-strip\s*\{[\s\S]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(content, /\.expense-entry-grid\s*\{[\s\S]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(content, /@media \(max-width: 1199px\)/);
  assert.match(content, /@media \(max-width: 760px\)/);
  assert.doesNotMatch(content, /MetricGrid|DataTable|store\.db\.dataSources|expenseAnomalies/);
  compileVue(workbenchUrl);
});

test('费用审计有数据态复用空白页主体骨架', () => {
  const content = read(workbenchUrl);
  const dataHeroRule = getCssRule(content, '.expense-data-mode-page .expense-data-hero h1');
  assert.match(content, /class="expense-empty-page expense-data-mode-page route-fill-page"/);
  assert.match(content, /<section class="expense-metrics-strip" aria-label="费用审计关键指标">/);
  assert.match(content, /<section class="expense-empty-hero expense-data-hero"/);
  assert.match(content, /<section class="expense-entry-grid" aria-label="费用审计分析入口">/);
  assert.match(content, /<section class="expense-task-panel expense-data-task-panel"/);
  assert.match(content, /<aside class="expense-source-panel" aria-labelledby="expense-data-source-title">/);
  assert.match(dataHeroRule, /font-size:28px/);
  assert.doesNotMatch(content, /expense-data-entry-page|expense-data-grid|expense-data-workspace/);
});

test('费用审计有数据态保留真实任务和已接入数据源', () => {
  const content = read(workbenchUrl);
  for (const text of [
    '费用分析任务',
    '费用数据快照',
    '综合分析任务',
    '查看费用总览',
    '已接入 12,856 条消费明细和报销单据。',
    '已接入 1,482 张凭证、发票和附件。',
    'EXP-20260715002'
  ]) {
    assert.match(content, new RegExp(text));
  }
  assert.match(content, /source: '费控 \/ 审批链路'/);
  assert.match(content, /<span class="source-badge" :class="\{ optional: source\.optional \}">\{\{ source\.badge \}\}<\/span>/);
});

test('费用审计有数据态宽屏任务行保持紧凑高度', () => {
  const content = read(workbenchUrl);
  assert.match(
    content,
    /@media \(min-width: 1701px\)[\s\S]*?\.expense-data-task-panel \.expense-table-wrap table,\s*\.expense-data-task-panel \.expense-table-wrap tbody,\s*\.expense-data-task-panel \.expense-table-wrap tr\s*\{\s*height:\s*auto;\s*\}/
  );
  assert.match(
    content,
    /@media \(min-width: 1701px\)[\s\S]*?\.expense-data-task-panel \.expense-table-wrap td\s*\{\s*height:\s*42px;\s*\}/
  );
});

test('布局为费用空白页提供专用壳层面包屑和二级导航', () => {
  const content = read(layoutUrl);
  assert.match(content, /'expense-empty-shell': isExpenseWorkbenchRoute/);
  assert.match(content, /const isExpenseWorkbenchRoute = computed\(\(\) => route\.path === '\/expense\/workbench'\)/);
  assert.match(content, /v-else-if="isExpenseWorkbenchRoute" class="task-breadcrumb"/);
  assert.match(content, /审计工作台<\/span><i>\/<\/i><strong>费用审计分析<\/strong>/);
  assert.match(content, /const isExpenseSection = computed/);
  assert.match(content, /isExpenseSection\.value && item\.path === '\/expense\/workbench'/);
  assert.match(content, /费用异常监控/);
  assert.match(content, /费用趋势分析/);
  assert.match(content, /class="global-data-mode"/);
  compileVue(layoutUrl);
});

test('费用审计新建类入口进入创建审计任务并预选费用审计', () => {
  const content = read(workbenchUrl);
  const router = read(routerUrl);

  assert.equal((content.match(/path:\s*'\/tasks\/create', query: \{ capability: 'expense' \}/g) || []).length, 3);
  assert.match(router, /path:\s*['"]\/expense\/usage\/new['"][\s\S]*redirect:\s*\{\s*path:\s*['"]\/tasks\/create['"],\s*query:\s*\{\s*capability:\s*['"]expense['"]\s*\}\s*\}/);
});

