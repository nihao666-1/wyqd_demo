import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const taskDetailUrl = new URL('../src/views/tasks/TaskDetail.vue', import.meta.url);
const appLayoutUrl = new URL('../src/components/layout/AppLayout.vue', import.meta.url);

function compileSfc(url) {
  const content = readFileSync(url, 'utf8');
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

test('任务详情编排五个专属组件并默认进入生成结果', () => {
  const source = compileSfc(taskDetailUrl);
  for (const component of [
    'TaskDetailHeader',
    'CapabilityResultGrid',
    'PendingConfirmationTable',
    'VersionExportPreview',
    'EvidenceTracePanel'
  ]) {
    assert.match(source, new RegExp(`import ${component}`));
    assert.match(source, new RegExp(`<${component}`));
  }
  assert.match(source, /ref\(['"]results['"]\)/);
});

test('页面接入状态模型和核心处理器', () => {
  const source = readFileSync(taskDetailUrl, 'utf8');
  for (const stateFunction of [
    'createTaskResultState',
    'getPendingCount',
    'getAbilityStatus',
    'confirmItem',
    'excludeItem',
    'saveItemNote',
    'confirmAbility',
    'canSubmitReview',
    'paginateItems'
  ]) {
    assert.match(source, new RegExp(stateFunction));
  }
  for (const handler of [
    'handleConfirmItem',
    'handleExcludeItem',
    'handleViewEvidence',
    'handleSaveVersion',
    'handleSubmitReview',
    'handleExportResults',
    'handleUploadReport',
    'handleRunCheck'
  ]) {
    assert.match(source, new RegExp(handler));
  }
});

test('任务详情应用壳提供专属 class、面包屑并隐藏数据模式开关', () => {
  const source = compileSfc(appLayoutUrl);
  assert.match(source, /task-detail-shell/);
  assert.match(source, /isTaskDetail/);
  assert.match(source, /任务中心/);
  assert.match(source, /任务详情/);
  assert.match(source, /!isTaskDetail/);
  assert.match(source, /resolveTaskDetailView/);
  assert.match(source, /detailView\.value === 'archived'/);
  assert.match(source, /detailView\.value === 'generating'/);
});
