import test from 'node:test';
import assert from 'node:assert/strict';
import { getTaskCenterRows, paginateTaskRows } from '../src/domain/taskCenter/taskListState.js';

const rows = [
  { id: 'T-001', name: '费用审计', organization: '上海分公司', type: '费用审计', statusKey: 'confirming', riskCount: 4 },
  { id: 'T-002', name: '制度执行审计', organization: '上海分公司', type: '常规审计', statusKey: 'running', riskCount: 1 },
  { id: 'T-003', name: '失败任务', organization: '经纪业务部', type: '专项审计', statusKey: 'failed', riskCount: 0 }
];

test('异常任务 Tab 只展示失败或异常状态任务', () => {
  assert.deepEqual(getTaskCenterRows(rows, { keyword: '', organization: '全部', type: '全部', status: '全部' }, 'abnormal').map((row) => row.id), ['T-003']);
});

test('分页返回当前页与总页数', () => {
  assert.deepEqual(paginateTaskRows(rows, 2, 2), { rows: [rows[2]], page: 2, totalPages: 2 });
});
