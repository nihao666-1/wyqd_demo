import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const workbenchUrl = new URL('../src/views/expense/ExpenseWorkbench.vue', import.meta.url);
const layoutUrl = new URL('../src/components/layout/AppLayout.vue', import.meta.url);

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
  assert.match(content, /class="expense-empty-page"/);
  assert.match(content, /\.expense-empty-layout\s*\{[\s\S]*grid-template-columns:minmax\(0,1fr\) 292px/);
  assert.match(content, /\.expense-metrics-strip\s*\{[\s\S]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(content, /\.expense-entry-grid\s*\{[\s\S]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(content, /@media \(max-width: 1199px\)/);
  assert.match(content, /@media \(max-width: 760px\)/);
  assert.doesNotMatch(content, /MetricGrid|DataTable|store\.db\.dataSources|expenseAnomalies/);
  compileVue(workbenchUrl);
});

test('布局为费用空白页提供专用壳层面包屑和二级导航', () => {
  const content = read(layoutUrl);
  assert.match(content, /'expense-empty-shell': isExpenseWorkbenchRoute/);
  assert.match(content, /const isExpenseWorkbenchRoute = computed\(\(\) => route\.path === '\/expense\/workbench'\)/);
  assert.match(content, /v-else-if="isExpenseWorkbenchRoute" class="task-breadcrumb"/);
  assert.match(content, /审计工作台<\/span><i>\/<\/i><strong>费用审计分析<\/strong>/);
  assert.match(content, /const isExpenseSection = computed/);
  assert.match(content, /item\.children && isExpenseSection/);
  assert.match(content, /费用异常监控/);
  assert.match(content, /费用趋势分析/);
  assert.match(content, /!isExpenseWorkbenchRoute/);
  compileVue(layoutUrl);
});

