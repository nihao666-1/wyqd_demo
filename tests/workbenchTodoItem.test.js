import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workbench = readFileSync(
  new URL('../src/views/workbench/WorkbenchHome.vue', import.meta.url),
  'utf8'
);

test('workbench todo items use cleaner two-row layout with a single primary action', () => {
  assert.match(workbench, /:to="\{ path: '\/tasks', query: \{ view: 'todo', scope: 'mine' \} \}"/);
  assert.match(workbench, /class="todo-copy"[\s\S]*class="todo-heading"/);
  assert.match(workbench, /class="todo-heading"[\s\S]*item\.title[\s\S]*class="status-tag"/);
  assert.match(workbench, /item\.meta[\s\S]*去处理/);
  assert.doesNotMatch(workbench, /class="todo-priority-dot"/);
  assert.doesNotMatch(workbench, /item\.priority/);
  assert.doesNotMatch(workbench, /class="todo-detail-link"[\s\S]*查看详情/);
  assert.match(workbench, /\.todo-item\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) 72px[^}]*min-height:\s*58px/s);
  assert.match(workbench, /\.workbench-page \.todo-item \.btn\s*\{[^}]*min-height:\s*26px[^}]*padding:\s*4px 10px/s);
  assert.match(workbench, /\.todo-item \.status-tag\s*\{[^}]*min-height:\s*18px[^}]*line-height:\s*16px/s);
});

test('workbench risk reminders use inline status without leading severity logo', () => {
  assert.match(workbench, /class="risk-heading"[\s\S]*risk\.title[\s\S]*class="status-tag"[\s\S]*risk\.status/);
  assert.doesNotMatch(workbench, /class="risk-level"/);
  assert.doesNotMatch(workbench, /risk\.level/);
  assert.match(workbench, /\.risk-item\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) auto/s);
  assert.match(workbench, /\.risk-heading\s*\{[^}]*display:\s*flex[^}]*gap:\s*8px/s);
  assert.match(workbench, /status:\s*'高风险'/);
  assert.match(workbench, /status:\s*'中风险'/);
});

test('workbench keeps client-required capability cards and removes simulated task progress', () => {
  assert.match(workbench, /class="metric-card workbench-metric capability-card"/);
  assert.match(workbench, /capabilityMetrics/);
  assert.match(workbench, /\.workbench-metrics\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
  assert.doesNotMatch(workbench, /当前用户个人工作台/);
  assert.doesNotMatch(workbench, /class="personal-scope-strip"/);
  assert.match(workbench, /\.workbench-page\.has-data\s*\{[^}]*grid-template-rows:\s*auto\s*auto\s*auto[^}]*align-content:\s*start/s);
  assert.match(workbench, /<h3>最近审计任务<\/h3>[\s\S]*class="panel-actions"[\s\S]*创建审计任务[\s\S]*任务列表/);
  assert.doesNotMatch(workbench, /<th>进度<\/th>/);
  assert.doesNotMatch(workbench, /task\.progress/);
  assert.doesNotMatch(workbench, /class="progress-cell"/);
});
