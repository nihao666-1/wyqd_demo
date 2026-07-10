import test from 'node:test';
import assert from 'node:assert/strict';
import { draftTaskDetail, resolveTaskDetailMode } from '../src/domain/taskDetail/draftTaskDetail.js';

test('草稿详情快照严格对应参考图', () => {
  assert.equal(draftTaskDetail.id, 'TASK-20250428001');
  assert.equal(draftTaskDetail.status, '草稿');
  assert.equal(draftTaskDetail.version, '--');
  assert.deepEqual(draftTaskDetail.materials, []);
  assert.deepEqual(draftTaskDetail.tabs.map(({ label }) => label), [
    '任务概览', '输入资料', '分析过程', '生成结果', '智能体会话', '报告与附件',
    '修改记录', '复核记录', '版本记录', '导出记录', '操作留痕'
  ]);
  assert.deepEqual(draftTaskDetail.capabilities.map(({ name }) => name), ['制度比对', '费用审计', '报告生成']);
  assert.equal(draftTaskDetail.timeline.length, 7);
  assert.equal(draftTaskDetail.timeline.filter(({ complete }) => complete).length, 1);
  assert.equal(draftTaskDetail.logs.length, 1);
});

test('详情模式优先显式 state，再按任务状态分派，无上下文时为草稿', () => {
  assert.equal(resolveTaskDetailMode({ explicitState: 'archived', statusKey: 'draft' }), 'archived');
  assert.equal(resolveTaskDetailMode({ explicitState: '', statusKey: 'generating' }), 'generating');
  assert.equal(resolveTaskDetailMode({ explicitState: '', statusKey: 'confirming' }), 'pending');
  assert.equal(resolveTaskDetailMode({ explicitState: '', statusKey: '', tab: '' }), 'draft');
});
