import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const layout = fs.readFileSync(new URL('../src/components/layout/AppLayout.vue', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/styles/layout.css', import.meta.url), 'utf8');

test('任务详情使用独立应用壳和正确面包屑', () => {
  assert.match(layout, /'task-detail-shell': isTaskDetailRoute/);
  assert.match(layout, /const isTaskDetailRoute = computed\(\(\) => route\.path === '\/tasks\/detail'\)/);
  assert.match(layout, /v-else-if="isTaskDetailRoute" class="task-breadcrumb"/);
  assert.match(layout, /<span>任务中心<\/span><i>\/<\/i><strong>任务详情<\/strong>/);
  assert.match(layout, /class="global-data-mode"/);
});

test('生成中任务壳尺寸规则与其他详情状态隔离', () => {
  assert.match(layout, /'task-generating-shell': isGeneratingTaskDetail/);
  assert.match(layout, /const isGeneratingTaskDetail = computed/);
  assert.match(css, /\.task-generating-shell \.sidebar\s*\{/);
  assert.match(css, /\.task-generating-shell \.topbar\s*\{/);
  assert.match(css, /\.task-generating-shell \.sidebar\s*\{[^}]*flex:\s*0 0 208px/s);
});

test('生成中任务壳复刻侧栏品牌、通知角标与底部导航节奏', () => {
  assert.match(layout, /!isEmptyMode \|\| isTaskDetailRoute" class="notice-dot"/);
  assert.match(css, /\.task-generating-shell \.brand strong\s*\{[^}]*font-size:\s*21px/s);
  assert.match(css, /\.task-generating-shell \.brand\s*\{[^}]*min-height:\s*55px[^}]*margin-bottom:\s*24px[^}]*background:\s*#cf0000/s);
  assert.match(css, /\.task-generating-shell \.bottom-nav\s*\{[^}]*min-height:\s*129px/s);
  assert.match(css, /\.task-generating-shell \.topbar\s*\{[^}]*padding:\s*0 4px 0 16px/s);
});

test('生成中壳与内容共享任务状态判断且缩放后侧栏覆盖视口高度', () => {
  assert.match(layout, /import \{ taskRows \} from '\.\.\/\.\.\/views\/tasks\/taskCenterData\.js'/);
  assert.match(layout, /import \{ resolveTaskDetailView \} from '\.\.\/\.\.\/domain\/taskDetail\/taskDetailViewState\.js'/);
  assert.match(layout, /const detailView = computed\(\(\) => resolveTaskDetailView\(route\.query, selectedTask\.value\)\)/);
  assert.match(layout, /detailView\.value === 'generating'/);
  assert.match(css, /\.task-detail-shell\.task-detail-scaled \.sidebar\s*\{[^}]*height:\s*calc\(100vh \/ var\(--task-detail-scale\)\)/s);
});
