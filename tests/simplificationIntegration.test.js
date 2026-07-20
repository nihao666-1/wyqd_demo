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
const auditPolicyUrl = new URL('../src/views/audit-standard/AuditStandardPolicy.vue', import.meta.url);
const auditReportWorkbenchUrl = new URL('../src/views/audit-report/AuditReportWorkbench.vue', import.meta.url);

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
    ['/regulatory/new', "/regulatory/workbench', query: { action: 'create' }"],
    ['/regulatory/data-fetch', "/regulatory/result', query: { panel: 'fetch' }"],
    ['/regulatory/history', "/regulatory/result', query: { tab: 'history' }"],
    ['/audit-standard/upload', "/audit-standard/library', query: { action: 'upload' }"],
    ['/audit-standard/diff', "/audit-standard/library', query: { panel: 'diff' }"],
    ['/audit-standard/precheck', "/audit-standard/generate', query: { step: 'precheck' }"],
    ['/expense/usage/new', "/expense/workbench', query: { action: 'create-usage' }"],
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
  const router = read(routerUrl);
  const auditPolicy = read(auditPolicyUrl);
  const auditReportWorkbench = read(auditReportWorkbenchUrl);

  const knowledgeGroup = layout.slice(
    layout.indexOf("label: '审计知识库'"),
    layout.indexOf("label: '费用智能化审计'")
  );
  const auditReportGroup = layout.slice(
    layout.indexOf("label: '审计报告智能化'"),
    layout.indexOf("label: '文件中心'")
  );

  assert.match(knowledgeGroup, /label: '制度查询与比对'/);
  assert.match(knowledgeGroup, /label: '监管案例与舆情分析'/);
  assert.match(knowledgeGroup, /label: '审计规范智能化'/);
  assert.match(knowledgeGroup, /label: '监督共享信息分析'/);
  assert.match(auditReportGroup, /label: '报告生成', path: '\/audit-report\/workbench', mode: 'generate'/);
  assert.match(auditReportGroup, /label: '报告智能审核', path: '\/audit-report\/workbench\?mode=review', mode: 'review'/);
  assert.match(auditReportGroup, /label: '模板管理', path: '\/audit-report\/template'/);
  assert.match(layout, /function isReportChildActive\(child\)/);
  assert.match(layout, /isAuditReportSection/);
  assert.doesNotMatch(layout, /label: '审计制度'|label: '专项审计分析'/);
  assert.doesNotMatch(layout, /RouterLink to="\/demo-guide"[\s\S]*收起导航/);
  assert.match(layout, /@click="toggleSidebar"/);
  assert.match(layout, /v-if="showDemoControls"/);
  assert.match(layout, /import\.meta\.env\.DEV \|\| route\.query\.demo === '1'/);
  assert.doesNotMatch(layout, /aria-label="通知"[\s\S]*faBell/);
  assert.doesNotMatch(layout, /aria-label="帮助"[\s\S]*faCircleQuestion/);
  assert.match(router, /path: '\/audit-standard\/workbench'[\s\S]*redirect: '\/audit-standard\/policy'/);
  assert.match(auditPolicy, /data-page="audit-policy-assistant"/);
  assert.match(auditPolicy, /审计制度智能体/);
  assert.match(auditPolicy, /历史会话/);
  assert.match(auditPolicy, /新会话/);
  assert.match(auditPolicy, /清空会话/);
  assert.match(auditPolicy, /推荐问题/);
  assert.match(auditPolicy, /制度查询结果/);
  assert.match(auditPolicy, /制度比对结果/);
  assert.match(auditPolicy, /runSuggestion/);
  assert.match(auditPolicy, /submitQuestion/);
  assert.doesNotMatch(auditReportWorkbench, /class="mode-switch"/);
  assert.match(auditReportWorkbench, /const activeMode = computed\(\(\) => route\.query\.mode === 'review' \? 'review' : 'generate'\)/);
  compileVue(layoutUrl);
  compileVue(auditPolicyUrl);
  compileVue(auditReportWorkbenchUrl);
});

test('dashboard stays a personal overview while task center owns complete task management', () => {
  const workbench = read(workbenchUrl);
  const taskList = read(taskListUrl);

  for (const section of ['能力指标概览', '我的待办', '风险提醒', '最近访问', '快捷入口']) {
    assert.match(workbench, new RegExp(`data-workbench-section="${section}"`));
  }
  assert.match(workbench, /v-for="item in capabilityMetrics"/);
  assert.match(workbench, /class="metric-card workbench-metric capability-card"/);
  assert.match(workbench, /class="capability-status-grid"/);
  assert.match(workbench, />查看明细/);
  assert.doesNotMatch(workbench, /class="overview-strip"/);
  assert.match(workbench, /const recentVisitTasks = recentAuditTasks\.slice\(0, 4\)/);
  assert.doesNotMatch(workbench, /<h3>最近生成结果<\/h3>/);
  assert.doesNotMatch(workbench, /<h3>系统通知<\/h3>/);
  assert.doesNotMatch(workbench, /<h3>最近操作日志<\/h3>/);
  assert.doesNotMatch(workbench, /<h3>任务流程预览<\/h3>[\s\S]*<h3>新手引导<\/h3>/);
  assert.doesNotMatch(workbench, /primaryTo:\s*'\/(?!tasks(?:\/detail)?')/);
  const recentTaskBlock = workbench.match(/const recentAuditTasks = \[([\s\S]*?)\];/)[1];
  assert.doesNotMatch(recentTaskBlock, /to:\s*'\/(?!tasks(?:\/detail)?')/);

  assert.match(taskList, /class="create-task-inline" to="\/tasks\/create"/);
  assert.match(taskList, /aria-label="任务筛选"/);
  assert.match(taskList, /class="status-tabs"/);
  assert.match(taskList, /class="pagination"/);
  assert.doesNotMatch(taskList, /class="task-rail"/);
  assert.doesNotMatch(taskList, /今日待办与提醒|失败任务|最近操作日志|快捷入口/);
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
