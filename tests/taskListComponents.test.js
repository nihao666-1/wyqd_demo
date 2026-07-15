import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/views/tasks/TaskList.vue', import.meta.url), 'utf8');

test('创建任务入口与五个指标同排并保持轻量卡片样式', () => {
  assert.doesNotMatch(source, /<header class="task-center-header">/);
  assert.match(source, /class="metric-strip"[\s\S]*v-for="metric in metricDefinitions"[\s\S]*class="create-task-tile" to="\/tasks\/create"/);
  assert.match(source, /<TaskIcon name="create"/);
  assert.match(source, /\.metric-strip\{[^}]*grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(source, /\.create-task-tile\{[^}]*border:1px solid var\(--red\)[^}]*background:#fff/);
});

test('任务列表在侧栏布局下保留操作列宽并防止右侧卡片被拉伸', () => {
  assert.match(source, /table\{[^}]*min-width:1360px[^}]*table-layout:fixed/);
  assert.match(source, /th:nth-child\(12\)\{width:10%\}/);
  assert.doesNotMatch(source, /th:last-child\{width:9%\}/);
  assert.match(source, /<td class="operation-cell"><span class="operation-actions"><RouterLink[\s\S]*<\/span><\/td>/);
  assert.doesNotMatch(source, /\.operation-cell\{[^}]*display:flex/);
  assert.match(source, /\.operation-cell\{[^}]*min-width:120px[^}]*white-space:nowrap/);
  assert.match(source, /\.operation-actions\{[^}]*display:flex[^}]*gap:8px/);
  assert.match(source, /\.operation-actions a\{[^}]*flex:0 0 auto/);
  assert.match(source, /\.task-rail\{[^}]*align-content:start/);
});
