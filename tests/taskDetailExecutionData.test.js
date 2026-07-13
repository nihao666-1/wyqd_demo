import test from 'node:test';
import assert from 'node:assert/strict';
import { getTaskDetailExecutionSnapshot } from '../src/views/tasks/taskDetailExecutionData.js';

test('生成中详情快照完整复现设计图的数据区域', () => {
  const snapshot = getTaskDetailExecutionSnapshot('TASK-20250428001');

  assert.equal(snapshot.task.id, 'TASK-20250428001');
  assert.equal(snapshot.task.status, '生成中');
  assert.equal(snapshot.task.progress, 63);
  assert.equal(snapshot.task.version, 'V0.9');
  assert.equal(snapshot.tabs.length, 11);
  assert.equal(snapshot.activeTab, 'analysis');
  assert.equal(snapshot.stages.length, 6);
  assert.equal(snapshot.stages[2].state, 'active');
  assert.deepEqual(snapshot.summary.map((item) => item.value), [4, 3, 2, 0]);
  assert.equal(snapshot.capabilities.length, 9);
  assert.deepEqual(snapshot.capabilities.map((item) => item.name), [
    '制度查询', '制度变更', '制度比对', '监管案例舆情分析', '审计规范生成',
    '监督共享信息分析', '费用审计', '报告生成', '报告审核'
  ]);
  assert.deepEqual(snapshot.capabilities.map((item) => item.progress), [100, 100, 78, 64, 52, 100, 81, 0, 0]);
  assert.equal(snapshot.logs.length, 6);
  assert.equal(snapshot.modelExecution.steps.length, 4);
  assert.equal(snapshot.sources.length, 4);
  assert.equal(snapshot.pendingItems.length, 2);
});

test('快照读取返回隔离副本且未知任务稳定回退到目标任务', () => {
  const first = getTaskDetailExecutionSnapshot('UNKNOWN');
  const second = getTaskDetailExecutionSnapshot();

  first.capabilities[0].progress = 0;
  assert.equal(second.task.id, 'TASK-20250428001');
  assert.equal(second.capabilities[0].progress, 100);
});

test('其他生成中任务复用执行结构但保留自己的任务身份和进度', () => {
  const snapshot = getTaskDetailExecutionSnapshot('TASK-20250425004');

  assert.equal(snapshot.task.id, 'TASK-20250425004');
  assert.equal(snapshot.task.name, '固定资产审计');
  assert.equal(snapshot.task.owner, '王磊');
  assert.equal(snapshot.task.progress, 78);
  assert.equal(snapshot.stages[2].detail, '进行中（78%）');
});
