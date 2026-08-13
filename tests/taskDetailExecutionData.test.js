import test from 'node:test';
import assert from 'node:assert/strict';
import { getTaskDetailExecutionSnapshot } from '../src/views/tasks/taskDetailExecutionData.js';

test('生成中详情快照完整复现设计图的数据区域', () => {
  const snapshot = getTaskDetailExecutionSnapshot('TASK-20250428001');

  assert.equal(snapshot.task.id, 'TASK-20250428001');
  assert.equal(snapshot.task.status, '能力执行中');
  assert.equal(snapshot.task.phaseStatus, '能力执行中');
  assert.equal('progress' in snapshot.task, false);
  assert.equal(snapshot.task.version, 'V0.9');
  assert.deepEqual(snapshot.tabs.map((tab) => tab.label), [
    '任务概览', '输入资料', '分析过程', '生成结果', '输出文件', '任务时间线'
  ]);
  assert.equal(snapshot.activeTab, 'analysis');
  assert.equal(snapshot.stages.length, 6);
  assert.equal(snapshot.stages[2].state, 'active');
  assert.equal(snapshot.stages.some((stage) => /%/.test(stage.detail)), false);
  assert.deepEqual(snapshot.summary.map((item) => item.value), [4, 3, 2, 0]);
  assert.equal(snapshot.capabilities.length, 9);
  assert.deepEqual(snapshot.capabilities.map((item) => item.name), [
    '制度查询', '制度变更', '制度比对', '监管案例舆情分析', '审计规范生成',
    '监督共享信息分析', '费用审计', '报告生成', '报告审核'
  ]);
  assert.equal(snapshot.capabilities.some((item) => 'progress' in item), false);
  assert.equal(snapshot.logs.length, 6);
  assert.equal(snapshot.modelExecution.steps.length, 4);
  assert.equal(snapshot.sources.length, 4);
  assert.equal(snapshot.pendingItems.length, 2);
  assert.deepEqual(snapshot.timelineFilters.map((item) => item.label), ['全部', '创建任务', '上传文件', '解析文件', '确认结果', '排除结果', '生成报告', '导出文件', '提交复核', '执行异常']);
});

test('快照读取返回隔离副本且未知任务稳定回退到目标任务', () => {
  const first = getTaskDetailExecutionSnapshot('UNKNOWN');
  const second = getTaskDetailExecutionSnapshot();

  first.capabilities[0].phaseDetail = '被测试修改';
  assert.equal(second.task.id, 'TASK-20250428001');
  assert.equal(second.capabilities[0].phaseDetail, '已生成');
});

test('其他生成中任务复用执行结构但保留自己的任务身份和进度', () => {
  const snapshot = getTaskDetailExecutionSnapshot('TASK-20250425004');

  assert.equal(snapshot.task.id, 'TASK-20250425004');
  assert.equal(snapshot.task.name, '固定资产审计');
  assert.equal(snapshot.task.owner, '王磊');
  assert.equal(snapshot.task.phaseStatus, '能力执行中');
  assert.equal('progress' in snapshot.task, false);
  assert.equal(snapshot.stages[2].detail, '09:45 开始');
});

test('生成中详情快照可以读取前端新建任务的实时进度', () => {
  const snapshot = getTaskDetailExecutionSnapshot('TASK-20260721001', [{
    id: 'TASK-20260721001',
    name: '监管案例舆情分析任务',
    organization: '上海分公司',
    period: '2025Q1',
    type: '专项审计',
    status: '生成中',
    statusKey: 'generating',
    owner: '王审计',
    updatedAt: '2026/7/21 17:30:09',
    progress: 78,
    source: 'created'
  }]);

  assert.equal(snapshot.task.id, 'TASK-20260721001');
  assert.equal(snapshot.task.name, '监管案例舆情分析任务');
  assert.equal(snapshot.task.type, '专项审计');
  assert.equal(snapshot.task.owner, '王审计');
  assert.equal(snapshot.task.phaseStatus, '能力执行中');
  assert.equal('progress' in snapshot.task, false);
  assert.equal(snapshot.stages[2].detail, '09:45 开始');
});
