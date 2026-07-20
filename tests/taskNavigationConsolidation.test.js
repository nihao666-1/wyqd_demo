import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const layout = read('../src/components/layout/AppLayout.vue');
const router = read('../src/router/index.js');
const workbench = read('../src/views/workbench/WorkbenchHome.vue');

test('task management is no longer exposed as a top-level navigation item', () => {
  assert.doesNotMatch(layout, /label: '任务中心',\s*path: '\/tasks'/);
  assert.match(layout, /isTaskSection && item\.path === '\/workbench'/);
});

test('full task management remains available as a workbench secondary page', () => {
  assert.match(router, /path: '\/tasks', component: TaskList/);
  assert.match(workbench, /<h3>最近访问<\/h3>/);
  assert.match(workbench, /recentVisitTasks\.slice\(0, 3\)/);
  assert.match(workbench, /<RouterLink class="btn" to="\/tasks">全部任务<\/RouterLink>/);
  assert.match(workbench, /<RouterLink class="btn" to="\/tasks">查看全部<\/RouterLink>/);
});

test('task list and detail breadcrumbs belong to the audit workbench', () => {
  assert.match(layout, /<span>审计工作台<\/span><i>\/<\/i><strong>全部任务<\/strong>/);
  assert.match(layout, /<span>审计工作台<\/span><i>\/<\/i><strong>任务详情<\/strong>/);
  assert.doesNotMatch(layout, /<span>任务中心<\/span>/);
});
