import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse } from '@vue/compiler-sfc';

function componentSource(name) {
  const source = fs.readFileSync(new URL(`../src/views/tasks/${name}`, import.meta.url), 'utf8');
  const parsed = parse(source, { filename: name });
  assert.deepEqual(parsed.errors, []);
  return source;
}

test('左侧执行区包含流程、四项汇总、3×3能力卡和执行明细', () => {
  const source = componentSource('TaskCapabilityExecutionGrid.vue');

  for (const region of ['stage-summary', 'capability-grid', 'execution-table']) {
    assert.match(source, new RegExp(`data-detail-region="${region}"`));
  }
  assert.match(source, /emit\('view-log', capability\)/);
  assert.match(source, /emit\('view-result', capability\)/);
  assert.match(source, /emit\('run-background', capability\)/);
  assert.match(source, /<table/);
  assert.match(source, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)\s+minmax\(0,\s*1\.18fr\)/);
});

test('右侧执行栏包含日志、模型步骤、来源、失败和待处理事项', () => {
  const source = componentSource('TaskExecutionLogRail.vue');

  for (const region of ['execution-log', 'failure-retry', 'pending-reminders']) {
    assert.match(source, new RegExp(`data-detail-region="${region}"`));
  }
  assert.match(source, /v-for="log in visibleLogs"/);
  assert.match(source, /v-for="\(step, index\) in modelExecution\.steps"/);
  assert.match(source, /emit\('show-all-logs'\)/);
  assert.match(source, /emit\('view-source', source\)/);
  assert.match(source, /emit\('handle-pending', item\)/);
  assert.match(source, /暂无失败项/);
});

test('右侧执行栏使用与效果图一致的紧凑分区间距', () => {
  const source = componentSource('TaskExecutionLogRail.vue');

  assert.match(source, /\.task-detail-execution-rail\s*\{[^}]*gap:\s*3px/s);
});

test('能力矩阵、明细表和右栏使用参考图的小字号层级而非过度缩小', () => {
  const grid = componentSource('TaskCapabilityExecutionGrid.vue');
  const rail = componentSource('TaskExecutionLogRail.vue');

  assert.match(grid, /\.task-detail-capability-heading h3\s*\{[^}]*font-size:\s*15px/s);
  assert.match(grid, /\.task-detail-capability-heading p\s*\{[^}]*font-size:\s*11px/s);
  assert.match(grid, /\.task-detail-table-section th,\.task-detail-table-section td\s*\{[^}]*font-size:\s*10px/s);
  assert.match(rail, /\.task-detail-live-logs li\s*\{[^}]*font-size:\s*10px/s);
  assert.match(rail, /\.task-detail-source-snapshot dl>div\s*\{[^}]*font-size:\s*10px/s);
});
