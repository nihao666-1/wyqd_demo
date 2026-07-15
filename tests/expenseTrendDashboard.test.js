import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import { expenseTrendAnalysis } from '../src/mock/index.js';

const dashboardUrl = new URL('../src/views/expense/ExpenseUsageDashboard.vue', import.meta.url);
const layoutUrl = new URL('../src/components/layout/AppLayout.vue', import.meta.url);
const routerUrl = new URL('../src/router/index.js', import.meta.url);
const mockUrl = new URL('../src/mock/index.js', import.meta.url);
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

test('费用趋势 mock 数据覆盖截图全部区域', () => {
  assert.equal(expenseTrendAnalysis.metrics.length, 5);
  assert.equal(expenseTrendAnalysis.monthlyTrend.length, 4);
  assert.equal(expenseTrendAnalysis.departmentRanking.length, 10);
  assert.equal(expenseTrendAnalysis.detailRows.length, 5);
  assert.equal(expenseTrendAnalysis.forecast.length, 3);
  for (const key of ['conclusions', 'causes', 'budgetNotes', 'recommendations']) {
    assert.ok(expenseTrendAnalysis.insights[key].length >= 2);
  }
  const mock = read(mockUrl);
  assert.match(mock, /expenseTrendAnalysis,/);
});

test('布局为费用趋势页提供专用壳层面包屑和导航状态', () => {
  const layout = read(layoutUrl);
  const css = read(layoutCssUrl);
  assert.match(layout, /'expense-trend-shell': isExpenseTrendResult/);
  assert.match(layout, /const isExpenseTrendResult = computed\(\(\) => route\.path === '\/expense\/usage\/dashboard'\)/);
  assert.match(layout, /费用审计分析<\/span><i>\/<\/i><strong>费用趋势分析<\/strong>/);
  assert.match(layout, /class="global-data-mode"/);
  assert.match(css, /\.expense-trend-shell \.sidebar \{[\s\S]*width: var\(--shell-sidebar-width\)/);
  assert.match(css, /\.expense-trend-shell \.topbar \{[\s\S]*height: var\(--ui-topbar-height\)/);
  compileVue(layoutUrl);
});

test('费用趋势路由必须指向趋势看板组件而不是新建任务页', () => {
  const router = read(routerUrl);
  assert.match(router, /import ExpenseUsageDashboard from '\.\.\/views\/expense\/ExpenseUsageDashboard\.vue'/);
  assert.match(router, /\{ path: '\/expense\/usage\/dashboard', component: ExpenseUsageDashboard, meta: \{ title: '费用趋势分析' \} \}/);
  assert.doesNotMatch(router, /\{ path: '\/expense\/usage\/dashboard', component: ExpenseUsageNew/);
});

test('费用趋势页包含红框拆分的主内容和右侧洞察栏', () => {
  const content = read(dashboardUrl);
  for (const text of [
    '费用趋势分析',
    '被审计单位',
    '对比周期',
    '费用类别',
    '预算口径',
    '本期费用总额',
    '环比增长',
    '同比增长',
    '预算使用率',
    '趋势预警',
    '费用月度趋势与预算对比',
    '费用类别趋势',
    '部门费用排行（TOP10）',
    '员工费用离群分析',
    '趋势预警摘要',
    '费用结构变化（占比%）',
    '费用趋势明细',
    '趋势分析洞察',
    '异常波动原因',
    '预测结果（未来 3 个月）',
    '建议关注点',
    '生成趋势报告',
    '加入审计重点',
    '导出 Excel'
  ]) {
    assert.match(content, new RegExp(text));
  }
  assert.doesNotMatch(content, /PageHeader|MetricGrid|DataTable/);
});

test('费用趋势页锁定截图式紧凑布局和响应式降级', () => {
  const content = read(dashboardUrl);
  assert.match(content, /\.expense-trend-page\{[\s\S]*grid-template-columns:minmax\(0,1fr\) 345px/);
  assert.match(content, /\.trend-filter\{[\s\S]*min-height:54px/);
  assert.match(content, /\.metric-row\{[\s\S]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(content, /\.chart-row\{[\s\S]*grid-template-columns:1\.25fr 1fr \.92fr \.95fr/);
  assert.match(content, /\.summary-row\{[\s\S]*grid-template-columns:minmax\(0,2fr\) minmax\(270px,\.9fr\)/);
  assert.match(content, /\.trend-detail\{[\s\S]*min-height:254px/);
  assert.match(content, /@media\(max-width:1500px\)\{[\s\S]*\.expense-trend-page\{grid-template-columns:minmax\(0,1fr\)/);
  assert.match(content, /@media\(max-width:1199px\)\{[\s\S]*\.expense-trend-page\{grid-template-columns:1fr/);
  assert.match(content, /@media\(max-width:760px\)\{[\s\S]*\.trend-filter-row,\.chart-row,\.metric-row\{grid-template-columns:1fr/);
});

test('费用趋势四图使用受控高度和图表局部密度', () => {
  const content = read(dashboardUrl);
  assert.match(content, /item\.month\.slice\(0, 4\)/);
  assert.match(content, /item\.month\.slice\(5\)/);
  assert.match(content, /item\.actual \/ monthlyMax \* 72/);
  assert.match(content, /item\.business \/ categoryMax \* 84/);
  assert.match(content, /clamp\(8px, \$\{item\.amount \/ 5 \* 100\}%, calc\(100% - 8px\)\)/);
  assert.match(content, /\.chart-panel\s*\{[\s\S]*height:\s*clamp\(246px,\s*27vh,\s*286px\);[\s\S]*min-height:\s*0;[\s\S]*overflow:\s*hidden/);
  assert.match(content, /\.month-group small,\s*\.stack small\s*\{[\s\S]*font-size:\s*10px;[\s\S]*line-height:\s*12px/);
  assert.match(content, /\.rank-list\s*\{[\s\S]*gap:\s*clamp\(5px,\s*\.65vh,\s*7px\)/);
  assert.match(content, /\.rank-list div\s*\{[\s\S]*font-size:\s*12px;[\s\S]*line-height:\s*1\.25/);
});

test('费用趋势页核心按钮会产生反馈、跳转或导出', () => {
  const content = read(dashboardUrl);
  assert.match(content, /function queryTrend\(\)/);
  assert.match(content, /function resetFilters\(\)/);
  assert.match(content, /function drilldown\(row\)/);
  assert.match(content, /function exportExcel\(\)/);
  assert.match(content, /router\.push\('\/expense\/usage\/report'\)/);
  assert.match(content, /store\.setNotice\('趋势分析结论已加入本次审计重点清单。'\)/);
  assert.match(content, /anchor\.click\(\)/);
  compileVue(dashboardUrl);
});
