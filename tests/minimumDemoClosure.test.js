import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(path) {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('任务提交生成演示任务并进入任务详情', () => {
  const store = source('../src/store/index.js');
  const page = source('../src/views/tasks/TaskCreate.vue');

  assert.match(store, /submitDemoTask\(payload = \{\}\)/);
  assert.match(page, /store\.submitDemoTask/);
  assert.match(page, /router\.push\(\{ path: '\/tasks\/detail'/);
});

test('监管分析提供确认、锁定和导出闭环', () => {
  const page = source('../src/views/regulatory/RegulatoryResult.vue');

  assert.match(page, /handleRegulatoryAction\('confirm'\)/);
  assert.match(page, /handleRegulatoryAction\('lock'\)/);
  assert.match(page, /handleRegulatoryAction\('export'\)/);
  assert.match(page, /regulatoryResultState/);
});

test('审计规范生成配置可直接进入结果审阅', () => {
  const page = source('../src/views/audit-standard/AuditStandardGenerate.vue');

  assert.match(page, /to="\/audit-standard\/draft"/);
  assert.match(page, /开始生成演示结果/);
});

test('费用综合分析提供生成、确认和导出演示闭环', () => {
  const store = source('../src/store/index.js');
  const page = source('../src/views/expense/ExpenseAuditOverview.vue');

  assert.match(store, /handleExpenseOverviewAction\(action\)/);
  assert.match(page, /handleExpenseOverviewAction\('analyze'\)/);
  assert.match(page, /handleExpenseOverviewAction\('confirm'\)/);
  assert.match(page, /handleExpenseOverviewAction\('export'\)/);
});

test('报告模块以分析确认、生成、审核和导出形成最小闭环', () => {
  const store = source('../src/store/index.js');
  const business = source('../src/views/audit-report/AuditedEntityBusinessAnalysis.vue');
  const report = source('../src/views/audit-report/AuditReportWorkbench.vue');

  assert.match(store, /handleBusinessAnalysisAction\(action\)/);
  assert.match(store, /handleReportDemoAction\(action\)/);
  assert.match(business, /handleBusinessAnalysisAction\('confirm'\)/);
  assert.match(report, /handleReportDemoAction\('generate'\)/);
  assert.match(report, /handleReportDemoAction\('review'\)/);
  assert.match(report, /handleReportDemoAction\('export'\)/);
});

test('文件中心的最小演示动作产生可见状态而非仅提示', () => {
  const store = source('../src/store/index.js');
  const page = source('../src/views/files/FileCenter.vue');

  assert.match(store, /handleFileDemoAction\(action, payload = \{\}\)/);
  assert.match(page, /handleFileAction\('upload'\)/);
  assert.match(page, /handleFileAction\('add', file\)/);
  assert.match(page, /handleFileAction\('download', file\)/);
});
