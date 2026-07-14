import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse } from '@vue/compiler-sfc';

const source = fs.readFileSync(new URL('../src/views/tasks/TaskDetailGenerating.vue', import.meta.url), 'utf8');
const dispatcher = fs.readFileSync(new URL('../src/views/tasks/TaskDetail.vue', import.meta.url), 'utf8');
const parsed = parse(source, { filename: 'TaskDetailGenerating.vue' });

test('任务详情编排生成中驾驶舱而非旧通用台账', () => {
  assert.deepEqual(parsed.errors, []);
  assert.doesNotMatch(source, /import PageHeader|import PageState|import MetricGrid|import DataTable/);
  assert.match(source, /getTaskDetailExecutionSnapshot/);
  assert.match(source, /TaskCapabilityExecutionGrid/);
  assert.match(source, /TaskExecutionLogRail/);
  assert.match(source, /data-detail-region="task-header"/);
  assert.match(source, /snapshot\.task\.status/);
  assert.match(source, /snapshot\.task\.progress/);
  assert.match(source, /snapshot\.task\.version/);
});

test('任务详情包含目标操作、分析页签和确定性交互', () => {
  for (const label of ['后台运行', '暂停任务', '查看日志']) assert.match(source, new RegExp(label));
  assert.match(source, /ref\(snapshot\.activeTab\)/);
  assert.match(source, /function pauseTask\(/);
  assert.match(source, /function runInBackground\(/);
  assert.match(source, /function viewCapabilityLog\(/);
  assert.match(source, /function openDrawer\(/);
  assert.match(source, /aria-live="polite"/);
  assert.match(dispatcher, /import TaskDetailGenerating from '\.\/TaskDetailGenerating\.vue'/);
  assert.match(dispatcher, /<TaskDetailGenerating v-if="showGeneratingState"/);
  assert.match(dispatcher, /const showGeneratingState = computed/);
});

test('任务详情生成中页面使用自适应宽度并只在1200以下重排', () => {
  assert.match(source, /\.task-detail-generating-page\{[^}]*width:100%[^}]*max-width:none/s);
  assert.match(source, /\.task-detail-generating-workspace\{[^}]*grid-template-columns:minmax\(0,3\.23fr\) clamp\(300px,23\.4%,340px\)/s);
  assert.match(source, /task-detail-density-compact/);
  assert.match(source, /@media\(max-width:1199px\)/);
  assert.doesNotMatch(source, /const DESIGN_WIDTH|updateTaskDetailScale|viewportWidth \/ DESIGN_WIDTH|--task-detail-scale/);
  assert.doesNotMatch(source, /min-width:\s*1586px/);
});

test('任务头元数据、操作和页签字号匹配参考图层级', () => {
  assert.match(source, /\.task-detail-generating-metadata dt\s*\{[^}]*font-size:\s*10px/s);
  assert.match(source, /\.task-detail-generating-metadata dd\s*\{[^}]*font-size:\s*11px/s);
  assert.match(source, /\.task-detail-generating-actions button\s*\{[^}]*font-size:\s*12px/s);
  assert.match(source, /\.task-detail-generating-tabs button\s*\{[^}]*font-size:\s*13px/s);
});
