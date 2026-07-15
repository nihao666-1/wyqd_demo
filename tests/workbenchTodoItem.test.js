import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workbench = readFileSync(
  new URL('../src/views/workbench/WorkbenchHome.vue', import.meta.url),
  'utf8'
);

test('workbench todo items use two compact rows with both actions visible', () => {
  assert.match(workbench, /class="todo-heading"[\s\S]*item\.title[\s\S]*class="status-tag"/);
  assert.match(workbench, /class="todo-support"[\s\S]*item\.meta[\s\S]*去处理[\s\S]*查看详情/);
  assert.match(workbench, /\.todo-item\s*\{[^}]*grid-template-rows:\s*auto auto[^}]*min-height:\s*44px/s);
  assert.match(workbench, /\.todo-heading,\s*\.todo-support\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) auto/s);
  assert.match(workbench, /\.todo-item \.row-actions\s*\{[^}]*flex-wrap:\s*nowrap/s);
  assert.match(workbench, /\.workbench-page \.todo-item \.btn\s*\{[^}]*min-height:\s*18px[^}]*padding:\s*1px 6px/s);
  assert.match(workbench, /\.todo-item \.status-tag\s*\{[^}]*min-height:\s*18px[^}]*line-height:\s*16px/s);
});
