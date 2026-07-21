import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceSubmittedTaskRow, buildSubmittedTaskRow } from '../src/domain/taskCreate/taskSubmission.js';

test('提交任务快照生成任务中心可展示的模拟任务记录', () => {
  const row = buildSubmittedTaskRow({
    taskName: '监管案例舆情分析任务',
    auditedUnit: '上海分公司',
    auditStart: '2025-01-01',
    taskType: '专项审计',
    owner: '李审计'
  }, {
    now: '2026/7/21 16:30:00',
    createdCount: 2,
    currentUser: '审计管理员',
    date: new Date('2026-07-21T08:30:00.000Z')
  });

  assert.deepEqual(row, {
    id: 'TASK-20260721003',
    name: '监管案例舆情分析任务',
    organization: '上海分公司',
    period: '2025Q1',
    type: '专项审计',
    phase: '生成分析',
    status: '生成中',
    statusKey: 'generating',
    owner: '李审计',
    creator: '审计管理员',
    updatedAt: '2026/7/21 16:30:00',
    progress: 12,
    riskCount: 0,
    action: '继续执行',
    source: 'created'
  });
});

test('新建任务按后台模拟节点推进并在 100% 后进入待确认', () => {
  const initial = buildSubmittedTaskRow({
    taskName: '监管案例舆情分析任务',
    auditedUnit: '上海分公司',
    auditStart: '2025-01-01',
    taskType: '专项审计'
  }, {
    now: '2026/7/21 16:30:00',
    currentUser: '审计管理员',
    date: new Date('2026-07-21T08:30:00.000Z')
  });

  const first = advanceSubmittedTaskRow(initial, { now: '2026/7/21 16:30:03' });
  const second = advanceSubmittedTaskRow(first, { now: '2026/7/21 16:30:06' });
  const third = advanceSubmittedTaskRow(second, { now: '2026/7/21 16:30:09' });
  const completed = advanceSubmittedTaskRow(third, { now: '2026/7/21 16:30:12' });

  assert.deepEqual([first.progress, second.progress, third.progress, completed.progress], [30, 55, 78, 100]);
  assert.equal(completed.phase, '人工确认');
  assert.equal(completed.status, '待确认');
  assert.equal(completed.statusKey, 'confirming');
  assert.equal(completed.action, '处理');
  assert.equal(completed.updatedAt, '2026/7/21 16:30:12');
});
