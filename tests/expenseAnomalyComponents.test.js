import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const overviewUrl = new URL('../src/views/expense/ExpenseAuditOverview.vue', import.meta.url);
const dashboardUrl = new URL('../src/views/expense/ExpenseAnomalyDashboard.vue', import.meta.url);
const monitorUrl = new URL('../src/views/expense/components/ExpenseAnomalyMonitorPage.vue', import.meta.url);
const monitorAnalysisUrl = new URL('../src/views/expense/components/ExpenseAuditAnalysis.vue', import.meta.url);
const monitorTableUrl = new URL('../src/views/expense/components/ExpenseAnomalyTable.vue', import.meta.url);
const anomalyStateUrl = new URL('../src/domain/expense/expenseAnomalyState.js', import.meta.url);
const layoutUrl = new URL('../src/components/layout/AppLayout.vue', import.meta.url);
const routerUrl = new URL('../src/router/index.js', import.meta.url);
const taskDetailUrl = new URL('../src/views/tasks/TaskDetail.vue', import.meta.url);
const generatingDetailUrl = new URL('../src/views/tasks/TaskDetailGenerating.vue', import.meta.url);
const read = (url) => readFileSync(url, 'utf8');

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

test('费用审计分析总览页是独立主页面，不再包装异常监控页', () => {
  const overview = read(overviewUrl);
  for (const text of ['费用审计分析', '被审计单位', '审计期间', '费用类别', '数据来源']) assert.match(overview, new RegExp(text));
  for (const text of ['费用总额', '预算使用率', '异常金额', '异常笔数']) assert.match(overview, new RegExp(text));
  for (const text of ['预算执行趋势', '费用类别结构', '人均费用排行（TOP10）', '异常类型分布']) assert.match(overview, new RegExp(text));
  for (const text of ['超预算未审批', '费用违规报销', '疑似不合规报销', '整改建议']) assert.match(overview, new RegExp(text));
  for (const text of ['费用异常详情', '审批链路', '规则命中', '人工处理']) assert.match(overview, new RegExp(text));
  assert.doesNotMatch(overview, /ExpenseAnomalyMonitorPage|EXPENSE_MONITOR_TABS|费用异常监控页/);
  compileVue(overviewUrl);
});

test('费用异常监控页保留为费用审计分析下的独立子页面', () => {
  const dashboard = read(dashboardUrl);
  const monitor = [
    read(monitorUrl),
    read(monitorAnalysisUrl),
    read(monitorTableUrl),
    read(anomalyStateUrl)
  ].join('\n');
  assert.match(dashboard, /ExpenseAnomalyMonitorPage/);
  assert.doesNotMatch(dashboard, /ExpenseAuditOverview/);
  for (const text of ['费用异常监控', '异常类型', '风险等级', '处理状态', '待确认异常', '高风险异常', '规则命中排行（TOP10）']) assert.match(monitor, new RegExp(text));
  compileVue(dashboardUrl);
  compileVue(monitorUrl);
});

test('费用审计分析和异常监控使用分离路由与面包屑', () => {
  const layout = read(layoutUrl);
  const router = read(routerUrl);
  assert.match(router, /import ExpenseAuditOverview from '\.\.\/views\/expense\/ExpenseAuditOverview\.vue'/);
  assert.match(router, /\{ path: '\/expense\/audit\/overview', component: ExpenseAuditOverview, meta: \{ title: '费用综合分析' \} \}/);
  assert.match(router, /\{ path: '\/expense\/anomaly\/dashboard', component: ExpenseAnomalyDashboard, meta: \{ title: '费用异常分析' \} \}/);
  assert.match(layout, /v-else-if="isExpenseAuditOverview" class="task-breadcrumb"><span>费用智能化审计<\/span><i>\/<\/i><strong>费用综合分析<\/strong><\/div>/);
  assert.match(layout, /v-else-if="isExpenseAnomalyMonitor" class="task-breadcrumb"><span>费用智能化审计<\/span><i>\/<\/i><strong>费用异常分析<\/strong><\/div>/);
  assert.match(layout, /\{ label: '费用综合分析', path: '\/expense\/audit\/overview'/);
  assert.match(layout, /\{ label: '费用异常分析', path: '\/expense\/anomaly\/dashboard'/);
});

test('任务详情费用审计查看结果进入总览页而不是异常监控页', () => {
  const pending = read(taskDetailUrl);
  const generating = read(generatingDetailUrl);
  assert.match(pending, /ability\.name === '费用审计'/);
  assert.match(pending, /path: '\/expense\/audit\/overview', query: \{ taskId: route\.query\.taskId \}/);
  assert.match(generating, /capability\.id === 'expense-audit'/);
  assert.match(generating, /router\.push\(\{ path: '\/expense\/audit\/overview'/);
});
