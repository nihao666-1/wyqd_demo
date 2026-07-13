import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const componentDir = new URL('../src/views/tasks/task-detail/', import.meta.url);

function source(file) {
  return readFileSync(new URL(file, componentDir), 'utf8');
}

function taskDataSource() {
  return readFileSync(new URL('../src/views/tasks/taskDetailPendingData.js', import.meta.url), 'utf8');
}

function compileComponent(file) {
  const filename = new URL(file, componentDir).pathname;
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

test('任务头包含四项顶部动作、五个指标和十一项页签', () => {
  const content = source('TaskDetailHeader.vue');
  for (const action of ['保存版本', '提交复核', '导出结果', '归档任务']) {
    assert.match(content, new RegExp(action));
  }
  assert.equal((content.match(/data-summary-metric/g) || []).length, 5);
  const dataContent = taskDataSource();
  for (const tab of ['任务概览', '输入资料', '分析过程', '生成结果', '智能体会话', '报告与附件', '修改记录', '复核记录', '版本记录', '导出记录', '操作留痕']) {
    assert.match(dataContent, new RegExp(tab));
  }
});

test('能力结果网格包含卡片标记和完整操作', () => {
  const content = source('CapabilityResultGrid.vue');
  assert.match(content, /data-ability-card/);
  for (const action of ['查看结果', '查看依据', '确认', '排除', '上传报告', '执行检查']) {
    assert.match(content, new RegExp(action));
  }
});

test('待确认表包含八列、人工处理动作和分页', () => {
  const content = source('PendingConfirmationTable.vue');
  for (const column of ['来源能力', '事项类型', '事项摘要', '风险等级', '依据来源', '处理意见', '状态', '操作']) {
    assert.match(content, new RegExp(column));
  }
  for (const marker of ['data-confirmation-table', 'data-pagination', '查看依据', '编辑说明']) {
    assert.match(content, new RegExp(marker));
  }
});

test('版本导出预览包含两个功能区和文件卡', () => {
  const content = source('VersionExportPreview.vue');
  for (const marker of ['data-version-preview', 'data-export-preview', '版本时间线', '输出文件预览', '更多文件']) {
    assert.match(content, new RegExp(marker));
  }
});

test('追溯栏包含五个标签和人工处理区', () => {
  const content = source('EvidenceTracePanel.vue');
  for (const tab of ['source', 'files', 'session', 'versions', 'logs']) {
    assert.match(content, new RegExp(`data-trace-tab="${tab}"`));
  }
  for (const marker of ['依据与追溯', '人工处理', '确认该事项', '排除并说明', '引用到报告']) {
    assert.match(content, new RegExp(marker));
  }
});

test('五个任务详情组件均可独立完成 SFC 编译', () => {
  for (const file of [
    'TaskDetailHeader.vue',
    'CapabilityResultGrid.vue',
    'PendingConfirmationTable.vue',
    'VersionExportPreview.vue',
    'EvidenceTracePanel.vue'
  ]) {
    compileComponent(file);
  }
});
