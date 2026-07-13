import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const componentDir = new URL('../src/views/tasks/task-detail-draft/', import.meta.url);

function componentUrl(file) {
  if (file === 'TaskDetail.vue') return new URL('../src/views/tasks/TaskDetail.vue', import.meta.url);
  if (file === 'TaskDetailDraft.vue') return new URL('../src/views/tasks/TaskDetailDraft.vue', import.meta.url);
  return new URL(file, componentDir);
}

function source(file) {
  return readFileSync(componentUrl(file), 'utf8');
}

function draftTaskDataSource() {
  return readFileSync(new URL('../src/domain/taskDetail/draftTaskDetail.js', import.meta.url), 'utf8');
}

function compileComponent(file) {
  const filename = componentUrl(file).pathname;
  const parsed = parse(source(file), { filename });
  assert.deepEqual(parsed.errors, []);
  const script = compileScript(parsed.descriptor, { id: file });
  const template = compileTemplate({
    id: file,
    filename,
    source: parsed.descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings }
  });
  assert.deepEqual(template.errors, []);
}

test('草稿主区以组件区块渲染三个资料入口、三能力和七步流程', () => {
  const content = source('TaskDetailDraftOverview.vue');

  assert.match(content, /<section class="task-detail-draft-overview">/);
  assert.doesNotMatch(content, /<main class="task-detail-draft-overview">/);
  assert.match(content, /v-for="capability in task\.capabilities"/);
  assert.match(content, /v-for="step in task\.timeline"/);
  assert.equal((content.match(/<button\b/g) || []).length, 3);

  for (const marker of ['local', 'fileCenter', 'simulation']) {
    assert.match(content, new RegExp(`data-source="${marker}"`));
    assert.match(content, new RegExp(`@click="emit\\('open-material-source', '${marker}'\\)"`));
  }
  for (const label of ['任务已创建，尚未添加资料', '制度比对', '费用审计', '报告生成', '创建任务', '导出归档']) {
    assert.match(content, new RegExp(label));
  }
  assert.match(content, /<style scoped>\r?\n\.task-detail-draft-overview \{\r?\n/);
  compileComponent('TaskDetailDraftOverview.vue');
});

test('草稿右栏包含资料输出阻断和当前任务日志', () => {
  const content = source('TaskDetailDraftRail.vue');
  for (const label of ['下一步提示', '待补充资料', '所需输出', '阻断项', '操作留痕', '全部日志', '10 条/页']) assert.match(content, new RegExp(label));
  assert.doesNotMatch(content, /DataTable/);
  assert.match(content, /path: '\/records'/);
  assert.match(content, /query: \{ taskId: task\.id \}/);
  compileComponent('TaskDetailDraftRail.vue');
});

test('草稿页包含任务头、11标签、75比25双栏和删除确认', () => {
  const content = source('TaskDetailDraft.vue');
  const dataContent = draftTaskDataSource();

  for (const label of ['继续编辑', '上传资料', '删除草稿']) assert.match(content, new RegExp(label));
  assert.equal((content.match(/data-top-action/g) || []).length, 3);

  for (const label of ['任务编号', '被审计单位', '审计期间', '任务类型', '负责人', '状态', '当前版本']) {
    assert.match(content, new RegExp(label));
  }
  assert.equal((content.match(/data-task-meta/g) || []).length, 7);

  for (const label of ['任务概览', '输入资料', '分析过程', '生成结果', '智能体会话', '报告与附件', '修改记录', '复核记录', '版本记录', '导出记录', '操作留痕']) {
    assert.match(dataContent, new RegExp(label));
  }
  assert.match(content, /role="tablist"/);
  assert.match(content, /role="tab"/);
  assert.match(content, /role="tabpanel"/);
  assert.match(content, /v-for="tab in task\.tabs"/);
  assert.match(content, /:aria-selected="activeTab === tab\.id"/);
  assert.doesNotMatch(content, /:tabindex=/);
  assert.match(content, /activeTab = ref\('overview'\)/);

  assert.match(content, /TaskDetailDraftOverview/);
  assert.match(content, /TaskDetailDraftRail/);
  assert.match(content, /@open-material-source="openMaterialSource"/);
  assert.match(content, /@edit-materials="openMaterialSource\('local'\)"/);

  assert.match(content, /deleteOpen = ref\(false\)/);
  assert.match(content, /role="dialog"/);
  assert.match(content, /ref="deleteDialog"/);
  assert.match(content, /ref="cancelDeleteButton"/);
  assert.match(content, /ref="confirmDeleteButton"/);
  assert.match(content, /@keydown\.esc\.stop\.prevent="closeDelete"/);
  assert.match(content, /@keydown\.tab="trapDeleteFocus"/);
  assert.match(content, /function trapDeleteFocus\(event\)/);
  assert.match(content, /event\.shiftKey/);
  assert.match(content, /cancelDeleteButton\.value\?\.focus\(\)/);
  assert.match(content, /emit\('delete-draft', task\.value\.id\)/);
  assert.match(content, /router\.push\('\/tasks'\)/);

  assert.match(content, /grid-template-columns:minmax\(0,1fr\) clamp\(286px,25%,405px\)/);
  compileComponent('TaskDetailDraft.vue');
});

test('草稿页资料入口统一进入创建页资料阶段', () => {
  const content = source('TaskDetailDraft.vue');
  assert.match(content, /path: '\/tasks\/create'/);
  assert.match(content, /query: \{ phase: 'materials', source \}/);
  assert.match(content, /query: \{ phase: 'confirm' \}/);
  assert.match(content, /router\.push\(materialRoute\(source\)\)/);
});

test('TaskDetail按草稿生成中待确认归档分派且保留现有实现', () => {
  const content = source('TaskDetail.vue');

  assert.match(content, /import TaskDetailDraft from '\.\/TaskDetailDraft\.vue'/);
  assert.match(content, /import \{ resolveTaskDetailMode \} from '\.\.\/\.\.\/domain\/taskDetail\/draftTaskDetail\.js'/);
  assert.match(content, /const detailMode = computed/);
  assert.match(content, /const showDraftState = computed\(\(\) => detailMode\.value === 'draft'\)/);
  assert.match(content, /explicitState: String\(route\.query\.state \|\| ''\)/);
  assert.match(content, /statusKey: selectedTask\.value\?\.statusKey \|\| ''/);
  assert.match(content, /tab: String\(route\.query\.tab \|\| ''\)/);
  assert.match(content, /<template v-if="showDraftState">\s*<TaskDetailDraft \/>\s*<\/template>\s*<template v-else>/);
  assert.match(content, /<TaskDetailArchived v-if="showArchivedState"/);
  assert.match(content, /<TaskDetailGenerating v-if="showGeneratingState"/);
  assert.match(content, /class="pending-task-detail"/);
});
