import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTaskDetailView } from '../src/domain/taskDetail/taskDetailViewState.js';

const archivedTask = { id: 'TASK-20250428001', statusKey: 'archived' };

test('正式生成结果 URL 优先进入待确认页，即使同编号任务已归档', () => {
  assert.equal(resolveTaskDetailView({ tab: 'results' }, archivedTask), 'pending');
});

test('显式状态保持归档、生成中和待确认三个演示入口', () => {
  assert.equal(resolveTaskDetailView({ state: 'archived', tab: 'results' }, archivedTask), 'archived');
  assert.equal(resolveTaskDetailView({ state: 'generating', tab: 'results' }, archivedTask), 'generating');
  assert.equal(resolveTaskDetailView({ state: 'pending', tab: 'results' }, archivedTask), 'pending');
});

test('未指定生成结果页签时仍按任务自身状态分派', () => {
  assert.equal(resolveTaskDetailView({}, archivedTask), 'archived');
  assert.equal(resolveTaskDetailView({}, { statusKey: 'generating' }), 'generating');
  assert.equal(resolveTaskDetailView({}, { statusKey: 'pending' }), 'pending');
});
