import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

function source(file) {
  return readFileSync(new URL(`../src/views/tasks/${file}`, import.meta.url), 'utf8');
}

function projectSource(path) {
  return readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');
}

function compileComponent(file) {
  const filename = new URL(`../src/views/tasks/${file}`, import.meta.url).pathname;
  const parsed = parse(source(file), { filename });
  assert.deepEqual(parsed.errors, []);
  const script = compileScript(parsed.descriptor, { id: file });
  const template = compileTemplate({
    id: file,
    filename,
    source: parsed.descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
}

test('归档详情五个专属组件均可独立完成 SFC 编译', () => {
  for (const file of [
    'TaskDetailArchived.vue',
    'TaskArchiveMain.vue',
    'TaskArchiveRecords.vue',
    'TaskArchiveReviewTrail.vue',
    'TaskArchiveSidebar.vue',
  ]) {
    compileComponent(file);
  }
});

test('归档详情包含参考图的九个区域和只读提示', () => {
  const shell = source('TaskDetailArchived.vue');
  const main = source('TaskArchiveMain.vue');
  const records = source('TaskArchiveRecords.vue');
  const trail = source('TaskArchiveReviewTrail.vue');
  const sidebar = source('TaskArchiveSidebar.vue');

  for (const region of ['header', 'metadata', 'tabs', 'notice']) {
    assert.match(shell, new RegExp(`data-archive-region="${region}"`));
  }
  for (const region of ['outcomes', 'relations']) assert.match(main, new RegExp(`data-archive-region="${region}"`));
  assert.match(records, /data-archive-region="records"/);
  assert.match(trail, /data-archive-region="review-trail"/);
  assert.match(sidebar, /data-archive-region="sidebar"/);
  assert.match(shell, /该任务已归档，所有结果不可修改，可查看、下载和复制任务。/);
});

test('归档详情按快照迭代全部成果记录和时间线', () => {
  const main = source('TaskArchiveMain.vue');
  const records = source('TaskArchiveRecords.vue');
  const trail = source('TaskArchiveReviewTrail.vue');

  assert.match(main, /v-for="outcome in archive.outcomes"/);
  assert.match(records, /v-for="version in archive.versions"/);
  assert.match(records, /v-for="record in archive.exports"/);
  assert.match(trail, /v-for="review in archive.reviews"/);
  assert.match(trail, /v-for="step in archive.timeline"/);
  assert.match(records, /:count="archive\.versions\.length"/);
  assert.match(records, /:count="archive\.exports\.length"/);
  assert.match(records, /`共 \$\{props\.count\} 条记录`/);
});

test('归档操作只保留查看下载复制且解锁申请禁用', () => {
  const shell = source('TaskDetailArchived.vue');
  const main = source('TaskArchiveMain.vue');
  const records = source('TaskArchiveRecords.vue');
  const trail = source('TaskArchiveReviewTrail.vue');
  const sidebar = source('TaskArchiveSidebar.vue');

  for (const label of ['查看报告', '下载归档包', '复制任务', '解锁申请']) {
    assert.match(shell, new RegExp(label));
  }
  assert.match(shell, /disabled[^>]*>\s*解锁申请/);
  assert.doesNotMatch(`${shell}${main}${records}${trail}${sidebar}`, />\s*(编辑|删除|重新生成|重新导出)\s*</);
  assert.match(sidebar, /查看引用关系/);
  assert.match(sidebar, /导出日志/);
});

test('归档详情提供语义表格时间线和可观察操作反馈', () => {
  const shell = source('TaskDetailArchived.vue');
  const records = source('TaskArchiveRecords.vue');
  const trail = source('TaskArchiveReviewTrail.vue');
  const sidebar = source('TaskArchiveSidebar.vue');

  assert.match(records, /<table class="archive-table version-table">/);
  assert.match(records, /<table class="archive-table export-table">/);
  assert.match(trail, /<ol class="archive-timeline"/);
  assert.match(sidebar, /<table class="download-table">/);
  assert.match(shell, /aria-live="polite"/);
  assert.match(shell, /aria-label="返回任务中心"/);
  assert.match(sidebar, /aria-label="关闭归档详情"/);
});

test('任务详情通过共享解析器分派到归档专属页', () => {
  const detail = source('TaskDetail.vue');

  assert.match(detail, /import TaskDetailArchived from '\.\/TaskDetailArchived\.vue'/);
  assert.match(detail, /import \{ resolveTaskDetailView \} from '\.\.\/\.\.\/domain\/taskDetail\/taskDetailViewState\.js'/);
  assert.match(detail, /<TaskDetailArchived v-if="showArchivedState"/);
  assert.match(detail, /const detailView = computed\(\(\) => resolveTaskDetailView\(route\.query, selectedTask\.value\)\)/);
  assert.match(detail, /const showArchivedState = computed/);
  assert.match(detail, /detailView\.value === 'archived'/);
  assert.match(detail, /<div v-else class="pending-task-detail"/);
});

test('应用壳只为归档详情启用专属类和紧凑面包屑', () => {
  const layout = projectSource('components/layout/AppLayout.vue');

  assert.match(layout, /'task-archived-shell': isArchivedTaskDetail/);
  assert.match(layout, /const isArchivedTaskDetail = computed/);
  assert.match(layout, /任务中心/);
  assert.match(layout, /任务详情/);
  assert.match(layout, /!isParsingPhase && !isTaskDetailRoute/);
});

test('归档壳层使用1600基准画布和0.85缩放下限', () => {
  const detail = source('TaskDetailArchived.vue');
  const main = source('TaskArchiveMain.vue');
  const layoutCss = projectSource('styles/layout.css');

  assert.match(detail, /window\.innerWidth \/ 1600/);
  assert.match(detail, /Math\.max\(0\.85/);
  assert.match(detail, /--task-archived-scale/);
  assert.match(main, /grid-template-columns: repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(layoutCss, /\.task-archived-shell \.sidebar\s*\{[^}]*width:\s*208px;[^}]*flex:\s*0 0 208px;/s);
  assert.match(layoutCss, /\.task-archived-shell \.topbar\s*\{[^}]*min-height:\s*62px;[^}]*margin:\s*0;/s);
  assert.match(layoutCss, /zoom:\s*var\(--task-archived-scale\)/);
  assert.match(layoutCss, /@media \(min-width: 1800px\)[\s\S]*\.task-archived-shell\s*\{[^}]*margin:\s*0 auto;/);
});
