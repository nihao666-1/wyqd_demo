import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const resultPageUrl = new URL('../src/views/regulatory/RegulatoryResult.vue', import.meta.url);
const workbenchUrl = new URL('../src/views/regulatory/RegulatoryWorkbench.vue', import.meta.url);
const layoutUrl = new URL('../src/components/layout/AppLayout.vue', import.meta.url);
const cssUrl = new URL('../src/styles/layout.css', import.meta.url);
const routerUrl = new URL('../src/router/index.js', import.meta.url);

function read(url) {
  return fs.readFileSync(url, 'utf8');
}

test('监管案例舆情分析结果页编译并包含目标图全部功能区域', () => {
  const source = read(resultPageUrl);
  const parsed = parse(source, { filename: 'RegulatoryResult.vue' });
  assert.deepEqual(parsed.errors, []);

  const script = compileScript(parsed.descriptor, { id: 'RegulatoryResult.vue' });
  const template = compileTemplate({
    id: 'RegulatoryResult.vue',
    filename: 'RegulatoryResult.vue',
    source: parsed.descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings }
  });
  assert.deepEqual(template.errors, []);

  for (const marker of [
    'data-regulatory-result-page',
    'data-result-region="filters"',
    'data-result-region="metrics"',
    'data-result-region="charts"',
    'data-result-region="focus-table"',
    'data-result-region="process-flow"',
    'data-result-region="history"',
    'data-result-region="focus-detail"'
  ]) {
    assert.match(source, new RegExp(marker));
  }
});

test('监管结果页保留目标图文字、数量、表格列和右侧详情块', () => {
  const source = read(resultPageUrl);

  for (const label of [
    '监管案例舆情分析',
    '被分析单位',
    '指定业务',
    '审计期间',
    '监管机构',
    '风险主题',
    '舆情来源',
    '新建案例舆情分析',
    '监管案例',
    '舆情风险',
    '监管关注点',
    '审计建议',
    '已引用到任务',
    '监管关注点趋势',
    '风险主题分布',
    '案例来源分布',
    '高频处罚原因TOP5',
    '审计检查建议',
    '历史分析任务',
    '关注点详情',
    '综合结论',
    '相关监管案例',
    '处罚依据',
    '相似点分析',
    '人工处理'
  ]) {
    assert.match(source, new RegExp(label));
  }

  for (const value of ['58', '24', '126', '32', '18', 'FG-2025-0001', '适当性管理', '客户适当性不足']) {
    assert.match(source, new RegExp(value));
  }

  for (const header of ['关注点编号', '风险主题', '关联案例/舆情', '业务线', '风险等级', '相似度', '建议检查内容', '引用状态', '操作']) {
    assert.match(source, new RegExp(`<th[^>]*>${header}<\\/th>`));
  }
});

test('监管结果路由拥有专用 shell、面包屑和可构建工作台文件', () => {
  const layout = read(layoutUrl);
  const css = read(cssUrl);
  const router = read(routerUrl);

  assert.ok(fs.existsSync(workbenchUrl), 'RegulatoryWorkbench.vue must exist so router import builds');
  assert.match(router, /import RegulatoryResult from ['"]\.\.\/views\/regulatory\/RegulatoryResult\.vue['"]/);
  assert.match(router, /path:\s*['"]\/regulatory\/result['"][^}]*component:\s*RegulatoryResult/s);
  assert.match(layout, /const isRegulatoryResultRoute = computed\(\(\) => route\.path === ['"]\/regulatory\/result['"]\)/);
  assert.match(layout, /['"]regulatory-result-shell['"]:\s*isRegulatoryResultRoute/);
  assert.match(layout, /v-else-if="isRegulatoryResultRoute" class="task-breadcrumb"><span>审计工作台<\/span><i>\/<\/i><strong>专项审计分析<\/strong><\/div>/);
  assert.match(layout, /isRegulatoryResultRoute[^}]*item\.path === ['"]\/regulatory\/workbench['"]/s);
  assert.match(css, /\.regulatory-result-shell \.sidebar\s*\{[^}]*width:\s*203px[^}]*flex:\s*0 0 203px/s);
  assert.match(css, /\.regulatory-result-shell \.main\s*\{[^}]*height:\s*994px/s);
  assert.match(css, /--regulatory-result-scale/);
});
