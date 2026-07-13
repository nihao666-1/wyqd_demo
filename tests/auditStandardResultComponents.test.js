import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const resultDir = new URL('../src/views/audit-standard/result/', import.meta.url);
const pageUrl = new URL('../src/views/audit-standard/AuditStandardDraft.vue', import.meta.url);

const resultComponents = [
  'AuditStandardResultHeader.vue',
  'AuditGenerationConditions.vue',
  'AuditGenerationWorkspace.vue',
  'AuditEvidenceTrace.vue',
  'AuditResultFooter.vue',
  'AuditStandardActionDialogs.vue'
];

function source(url) {
  return readFileSync(url, 'utf8');
}

function componentSource(file) {
  return source(new URL(file, resultDir));
}

function compileSfc(url) {
  const content = source(url);
  const filename = url.pathname;
  const parsed = parse(content, { filename });
  assert.deepEqual(parsed.errors, []);
  const script = compileScript(parsed.descriptor, { id: filename });
  const template = compileTemplate({
    id: filename,
    filename,
    source: parsed.descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings }
  });
  assert.deepEqual(template.errors, []);
  return content;
}

function resultBundle() {
  return [source(pageUrl), ...resultComponents.map(componentSource)].join('\n');
}

test('结果页编排六个专属组件并标记效果图十个功能区域', () => {
  const page = source(pageUrl);
  for (const component of resultComponents.map((file) => file.replace('.vue', ''))) {
    assert.match(page, new RegExp(`import ${component}`));
    assert.match(page, new RegExp(`<${component}`));
  }

  const bundle = resultBundle();
  for (const region of [
    'result-page',
    'title-actions',
    'task-meta',
    'generation-conditions',
    'generation-progress',
    'standard-draft',
    'evidence-trace',
    'export-records',
    'version-timeline',
    'quick-actions'
  ]) {
    assert.match(bundle, new RegExp(`data-audit-region=["']${region}["']`));
  }
});

test('生成条件、六步进度和四类来源完整性与原图一致', () => {
  const conditions = componentSource('AuditGenerationConditions.vue');
  for (const label of [
    '审计规范模板', '内外规制度范围', '监管案例范围', '风险事项',
    '历史规范版本', '输出格式', '开始生成规范', '提示说明'
  ]) {
    assert.match(conditions, new RegExp(label));
  }

  const workspace = componentSource('AuditGenerationWorkspace.vue');
  for (const step of ['选择模板', '匹配来源', '生成条目', '生成重点建议', '人工审阅', '导出入库']) {
    assert.match(workspace, new RegExp(step));
  }
  for (const sourceType of ['内部制度', '外部法规', '监管案例', '风险事项']) {
    assert.match(workspace, new RegExp(sourceType));
  }
  for (const marker of ['data-generation-log', 'data-generation-progress', '186 / 320', '58%', '并行能力']) {
    assert.match(workspace, new RegExp(marker));
  }
});

test('规范草稿表、重点建议和来源追溯提供完整人工处理入口', () => {
  const workspace = componentSource('AuditGenerationWorkspace.vue');
  for (const column of ['条目编号', '条目名称', '条目类型', '风险等级', '生成来源', '确认状态', '操作']) {
    assert.match(workspace, new RegExp(column));
  }
  for (const action of ['查看依据', '编辑条目', '确认', '排除']) {
    assert.match(workspace, new RegExp(action));
  }
  for (const marker of ['data-standard-table', 'data-standard-suggestions', 'data-pagination', '审计重点建议']) {
    assert.match(workspace, new RegExp(marker));
  }
  assert.match(workspace, /\.table-scroll th,\.table-scroll td\{[^}]*font-size:8px/);

  const trace = componentSource('AuditEvidenceTrace.vue');
  for (const label of [
    '来源依据追溯', '制度条款详情', '关联文件', '人工处理', '同类条款',
    '智能体会话记录', '版本历史', '流程追溯', '确认引用', '替换来源', '确认引庇', '查看原文'
  ]) {
    assert.match(trace, new RegExp(label));
  }
  for (const phase of ['创建任务', '上传资料', '资料解析', '能力执行', '结果确认', '保存版本', '提交复核', '导出归档']) {
    assert.match(trace, new RegExp(phase));
  }
});

test('底部文件、版本和快捷区覆盖六张文件卡三个版本节点与三个入口', () => {
  const footer = componentSource('AuditResultFooter.vue');
  for (const file of ['差异清单', '费用异常汇总', '审计规范', '监管共享分析报告', '审计报告草稿', '审核问题清单']) {
    assert.match(footer, new RegExp(file));
  }
  for (const version of ['V0.1', 'V0.9', 'V1.0']) {
    assert.match(footer, new RegExp(version.replace('.', '\\.')));
  }
  for (const action of ['查看任务详情', '查看版本对比', '查看操作留痕']) {
    assert.match(footer, new RegExp(action));
  }
});

test('编辑与排除使用专属弹窗且排除原因是必填输入', () => {
  const dialogs = componentSource('AuditStandardActionDialogs.vue');
  for (const marker of ['data-edit-dialog', 'data-exclude-dialog', '编辑条目', '排除原因', '取消', '保存']) {
    assert.match(dialogs, new RegExp(marker));
  }
  assert.match(dialogs, /required/);
  assert.match(dialogs, /confirm-edit/);
  assert.match(dialogs, /confirm-exclude/);
  assert.match(dialogs, /@keydown\.tab="trapFocus"/);
  assert.match(dialogs, /function trapFocus/);
});

test('操作留痕入口展示动作、条目、原因、操作人和时间', () => {
  const page = source(pageUrl);
  const dialogs = componentSource('AuditStandardActionDialogs.vue');
  assert.match(page, /handleViewTrail/);
  assert.match(page, /:operation-trail="state\.operationTrail"/);
  for (const marker of ['data-operation-trail-dialog', '操作留痕', '动作', '条目', '原因 / 详情', '操作人', '时间']) {
    assert.match(dialogs, new RegExp(marker));
  }
});

test('来源追溯关闭后从页面移除并可通过入口重新打开', () => {
  const page = source(pageUrl);
  assert.match(page, /<AuditEvidenceTrace\s+v-if="traceVisible"/);
  assert.match(page, /v-if="!traceVisible"[^>]*class="reopen-trace"/);
  assert.match(page, /@close="traceVisible = false"/);
  assert.match(page, /@click="traceVisible = true"/);
});

test('结果页接入纯状态操作并提供保存、重新生成和导出 Excel 动作', () => {
  const page = source(pageUrl);
  assert.match(page, /import \{ createAuditStandardWorkbook \}/);
  assert.match(page, /createAuditStandardWorkbook\(state\.value\.items\)/);
  for (const stateFunction of [
    'createAuditStandardResultState',
    'selectStandardItem',
    'editStandardItem',
    'confirmStandardItem',
    'excludeStandardItem',
    'saveAuditStandardDraft',
    'regenerateAuditStandard',
    'exportAuditStandardExcel',
    'paginateStandardItems'
  ]) {
    assert.match(page, new RegExp(stateFunction));
  }
  for (const handler of [
    'handleViewEvidence', 'handleEditItem', 'handleConfirmItem', 'handleExcludeItem',
    'handleSaveDraft', 'handleRegenerate', 'handleExportExcel'
  ]) {
    assert.match(page, new RegExp(handler));
  }
  for (const action of ['返回任务', '重新生成', '保存草稿', '导出 Excel']) {
    assert.match(resultBundle(), new RegExp(action));
  }
});

test('结果页及六个专属组件均可完成 SFC 编译', () => {
  compileSfc(pageUrl);
  for (const file of resultComponents) {
    compileSfc(new URL(file, resultDir));
  }
});
