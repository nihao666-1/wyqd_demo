import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const routerUrl = new URL('../src/router/index.js', import.meta.url);
const layoutUrl = new URL('../src/components/layout/AppLayout.vue', import.meta.url);
const workbenchUrl = new URL('../src/views/workbench/WorkbenchHome.vue', import.meta.url);
const taskListUrl = new URL('../src/views/tasks/TaskList.vue', import.meta.url);
const configUrl = new URL('../src/views/config/ConfigCenter.vue', import.meta.url);
const materialImportUrl = new URL('../src/views/materials/MaterialImportWorkspace.vue', import.meta.url);

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

test('legacy short-step routes redirect into consolidated workspaces', () => {
  const router = read(routerUrl);

  const redirects = [
    ['/regulatory/new', "/tasks/create', query: { capability: 'regulatory' }"],
    ['/regulatory/data-fetch', "/regulatory/result', query: { panel: 'fetch' }"],
    ['/regulatory/history', "/regulatory/result', query: { tab: 'history' }"],
    ['/audit-standard/upload', "/audit-standard/library', query: { action: 'upload' }"],
    ['/audit-standard/diff', "/audit-standard/library', query: { panel: 'diff' }"],
    ['/audit-standard/precheck', "/audit-standard/generate', query: { step: 'precheck' }"],
    ['/expense/usage/new', "/tasks/create', query: { capability: 'expense' }"],
    ['/expense/usage/drilldown', "/expense/usage/dashboard', query: { panel: 'drilldown' }"],
    ['/expense/usage/report', "/expense/usage/dashboard', query: { panel: 'report' }"],
    ['/audit-report/template-upload', "/audit-report/template', query: { action: 'upload' }"],
    ['/audit-report/template-diff', "/audit-report/template', query: { panel: 'diff' }"],
    ['/audit-report/offline-upload', "/audit-report/draft', query: { action: 'offline-upload' }"],
    ['/audit-report/diff', "/audit-report/draft', query: { panel: 'diff' }"],
    ['/audit-report/check-upload', "/audit-report/workbench', query: { mode: 'review' }"]
  ];

  for (const [from, target] of redirects) {
    assert.match(router, new RegExp(`path: '${from}'[\\s\\S]*redirect: \\{ path: '${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  }

  for (const component of [
    'RegulatoryNew',
    'RegulatoryDataFetch',
    'RegulatoryHistory',
    'AuditStandardUpload',
    'AuditStandardDiff',
    'AuditStandardPrecheck',
    'ExpenseUsageNew',
    'ExpenseUsageDrilldown',
    'ExpenseUsageReport',
    'AuditReportTemplateUpload',
    'AuditReportTemplateDiff',
    'AuditReportOfflineUpload',
    'AuditReportDiff',
    'AuditReportCheckUpload'
  ]) {
    assert.doesNotMatch(router, new RegExp(`component: ${component}\\b`));
  }

  for (const deletedPath of [
    '../src/views/regulatory/RegulatoryNew.vue',
    '../src/views/regulatory/RegulatoryDataFetch.vue',
    '../src/views/regulatory/RegulatoryHistory.vue',
    '../src/views/audit-standard/AuditStandardUpload.vue',
    '../src/views/audit-standard/AuditStandardDiff.vue',
    '../src/views/audit-standard/AuditStandardPrecheck.vue',
    '../src/views/audit-report/AuditReportTemplateUpload.vue',
    '../src/views/audit-report/AuditReportTemplateDiff.vue',
    '../src/views/audit-report/AuditReportOfflineUpload.vue',
    '../src/views/audit-report/AuditReportDiff.vue',
    '../src/views/audit-report/AuditReportCheckUpload.vue'
  ]) {
    assert.equal(existsSync(new URL(deletedPath, import.meta.url)), false, `${deletedPath} should be physically removed`);
  }
});

test('supervision and report material routes share one import workspace', () => {
  const router = read(routerUrl);
  const materialImport = read(materialImportUrl);

  assert.match(router, /path: '\/materials\/import'[\s\S]*component: MaterialImportWorkspace/);
  assert.match(router, /path: '\/supervision\/import\/upload'[\s\S]*scene: 'supervision'/);
  assert.match(router, /path: '\/audit-report\/material\/import'[\s\S]*scene: 'audit-report'/);
  assert.match(materialImport, /const sceneConfigs =/);
  assert.match(materialImport, /scene: 'task'|task'/);
  assert.match(materialImport, /scene: 'supervision'|supervision'/);
  assert.match(materialImport, /scene: 'audit-report'|audit-report'/);
  assert.match(materialImport, /afterCompleteRoute/);
  for (const deletedPath of [
    '../src/views/supervision/SupervisionUpload.vue',
    '../src/views/supervision/SupervisionFolderPreview.vue',
    '../src/views/supervision/SupervisionFieldEdit.vue',
    '../src/views/supervision/SupervisionMetadata.vue',
    '../src/views/supervision/SupervisionPrecheck.vue',
    '../src/views/audit-report/AuditReportMaterialImport.vue',
    '../src/views/audit-report/AuditReportMaterialFolderPreview.vue',
    '../src/views/audit-report/AuditReportMaterialFieldEdit.vue',
    '../src/views/audit-report/AuditReportMaterialMetadata.vue',
    '../src/views/audit-report/AuditReportMaterialPrecheck.vue',
    '../src/views/audit-report/AuditReportSupplementPreview.vue'
  ]) {
    assert.equal(existsSync(new URL(deletedPath, import.meta.url)), false, `${deletedPath} should be physically removed`);
  }
  compileVue(materialImportUrl);
});

test('navigation is grouped and no longer exposes demo-guide as collapse behavior', () => {
  const layout = read(layoutUrl);

  assert.match(layout, /label: '制度与规范'/);
  assert.match(layout, /label: '制度查询'/);
  assert.match(layout, /label: '制度比对'/);
  assert.match(layout, /label: '规范生成'/);
  assert.match(layout, /label: '规范库'/);
  assert.doesNotMatch(layout, /label: '审计知识库'/);
  assert.doesNotMatch(layout, /RouterLink to="\/demo-guide"[\s\S]*收起导航/);
  assert.match(layout, /@click="toggleSidebar"/);
  assert.match(layout, /v-if="showDemoControls"/);
  assert.match(layout, /import\.meta\.env\.DEV \|\| route\.query\.demo === '1'/);
  assert.doesNotMatch(layout, /aria-label="通知"[\s\S]*faBell/);
  assert.doesNotMatch(layout, /aria-label="帮助"[\s\S]*faCircleQuestion/);
  compileVue(layoutUrl);
});

test('report intelligence navigation exposes the three phase-one subitems only', () => {
  const layout = read(layoutUrl);

  assert.match(layout, /label: '报告智能化'[\s\S]*children:\s*\[/);
  assert.match(layout, /label: '报告生成'[\s\S]*mode: 'generate'/);
  assert.match(layout, /label: '报告审核'[\s\S]*mode: 'review'/);
  assert.match(layout, /label: '模板管理'[\s\S]*path: '\/audit-report\/template'/);
  assert.doesNotMatch(layout, /label: '资料导入'[\s\S]*item\.path === '\/audit-report\/workbench'/);
});

test('dashboard and task center remove duplicate rail content without touching core task creation', () => {
  const workbench = read(workbenchUrl);
  const taskList = read(taskListUrl);
  const taskEmpty = read(new URL('../src/views/tasks/TaskCenterEmptyState.vue', import.meta.url));

  assert.match(workbench, /核心指标|legacyWorkbenchMetricLabels/);
  assert.doesNotMatch(workbench, /<h3>快捷入口<\/h3>/);
  assert.doesNotMatch(workbench, /<h3>系统通知<\/h3>/);
  assert.doesNotMatch(workbench, /<h3>最近操作日志<\/h3>/);
  assert.doesNotMatch(workbench, /<h3>快速引导<\/h3>/);
  assert.match(workbench, /<h3>办理路径<\/h3>/);
  assert.doesNotMatch(workbench, /<h3>任务流程预览<\/h3>[\s\S]*<h3>新手引导<\/h3>/);

  assert.match(taskList, /class="create-task-inline" to="\/tasks\/create"/);
  assert.doesNotMatch(taskList, /class="task-rail"/);
  assert.doesNotMatch(taskList, /今日待办与提醒|失败任务|最近操作日志|快捷入口/);
  assert.doesNotMatch(taskEmpty, /任务办理流程|推荐演示路径/);
  assert.match(taskEmpty, /任务流转节点/);
  assert.match(taskList, /table\{[^}]*min-width:1180px/);
  assert.match(taskList, /td\{[^}]*font-size:11px/);
});

test('config center removes duplicated records mode and keeps records in record center', () => {
  const layout = read(layoutUrl);
  const config = read(configUrl);

  assert.doesNotMatch(layout, /\/config\?mode=records/);
  assert.doesNotMatch(config, /currentMode === 'records'/);
  assert.doesNotMatch(config, /版本记录', '操作留痕', '导出记录', '复核记录/);
  assert.match(config, /模板配置/);
  assert.match(config, /规则配置/);
  assert.match(config, /标签配置/);
  assert.match(config, /权限配置/);
  assert.match(config, /系统参数/);
  compileVue(configUrl);
});
