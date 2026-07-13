import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARCHIVED_TASK_ID,
  archivedAllowedActions,
  archivedTaskDetail,
  isArchivedReadAction,
  isArchivedTask,
} from '../src/domain/taskDetail/archivedTaskDetail.js';
import { metricDefinitions, taskRows } from '../src/views/tasks/taskCenterData.js';

test('目标任务在任务中心与详情中统一为已归档', () => {
  const task = taskRows.find((row) => row.id === ARCHIVED_TASK_ID);

  assert.ok(task);
  assert.equal(task.statusKey, 'archived');
  assert.equal(task.status, '已归档');
  assert.equal(task.phase, '报告归档');
  assert.equal(task.progress, 100);
  assert.equal(task.updatedAt, '2025-04-28 16:30');
  assert.equal(isArchivedTask(task), true);
  assert.equal(isArchivedTask(taskRows.find((row) => row.id !== ARCHIVED_TASK_ID)), false);
});

test('归档快照包含参考图要求的全部成果和全过程记录', () => {
  assert.equal(archivedTaskDetail.outcomes.length, 6);
  assert.equal(archivedTaskDetail.versions.length, 5);
  assert.equal(archivedTaskDetail.exports.length, 6);
  assert.equal(archivedTaskDetail.reviews.length, 1);
  assert.equal(archivedTaskDetail.timeline.length, 8);
  assert.equal(archivedTaskDetail.tabs.length, 11);
  assert.equal(archivedTaskDetail.tabs.find((tab) => tab.active)?.label, '版本记录');
});

test('归档摘要在头部表格时间线和侧栏中保持一致', () => {
  const { summary } = archivedTaskDetail;

  assert.deepEqual(summary, {
    finalVersion: 'V1.2',
    archivedAt: '2025-04-28 16:30',
    reviewStatus: '已通过',
    exportCount: 6,
  });
  assert.equal(archivedTaskDetail.versions.at(-1).version, summary.finalVersion);
  assert.equal(archivedTaskDetail.versions.at(-1).createdAt, summary.archivedAt);
  assert.equal(archivedTaskDetail.exports.length, summary.exportCount);
  assert.equal(archivedTaskDetail.timeline.at(-1).occurredAt, summary.archivedAt);
  assert.equal(archivedTaskDetail.sidebar.version, summary.finalVersion);
  assert.equal(archivedTaskDetail.sidebar.archivedAt, summary.archivedAt);
});

test('已归档页面只开放查看下载复制和引用类动作', () => {
  assert.deepEqual(archivedAllowedActions, [
    'view-report',
    'download-archive',
    'copy-task',
    'view-reference',
    'download-file',
    'export-log',
  ]);
  for (const forbidden of ['edit', 'save', 'delete', 'overwrite', 'regenerate', 'unlock']) {
    assert.equal(archivedAllowedActions.includes(forbidden), false);
  }

  for (const label of ['查看报告', '下载归档包', '复制任务', '查看引用关系', '导出日志', '对比V1.2']) {
    assert.equal(isArchivedReadAction(label), true);
  }
  for (const label of ['编辑报告', '保存版本', '删除任务', '重新生成', '解锁申请']) {
    assert.equal(isArchivedReadAction(label), false);
  }
});

test('任务中心指标随目标任务归档状态同步', () => {
  const countFor = (statusKey) => taskRows.filter((task) => task.statusKey === statusKey).length;
  const metricFor = (label) => metricDefinitions.find((metric) => metric.label === label)?.count;

  assert.equal(metricFor('执行中'), countFor('generating'));
  assert.equal(metricFor('已归档'), countFor('archived'));
});
