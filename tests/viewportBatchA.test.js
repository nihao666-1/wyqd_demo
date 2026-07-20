import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const workbench = read('../src/views/workbench/WorkbenchHome.vue');
const taskList = read('../src/views/tasks/TaskList.vue');
const taskEmpty = read('../src/views/tasks/TaskCenterEmptyState.vue');
const fileCenter = read('../src/views/files/FileCenter.vue');
const fileDetail = read('../src/views/files/FileDetail.vue');
const recordCenter = read('../src/views/records/RecordCenter.vue');

test('batch A route pages opt into the remaining-height contract', () => {
  assert.match(workbench, /class="workbench-page route-fill-page"/);
  assert.match(taskList, /class="task-list-route route-fill-page"/);
  assert.match(fileCenter, /class="file-center route-fill-page"/);
  assert.match(fileDetail, /class="file-detail-page route-fill-page"/);
  assert.match(recordCenter, /class="record-center-page route-fill-page"/);

  for (const source of [workbench, taskList, taskEmpty, fileCenter, fileDetail, recordCenter]) {
    assert.doesNotMatch(source, /\bzoom\s*:/);
    assert.doesNotMatch(source, /transform:\s*scale\(/);
  }
});

test('batch A data workspaces fill their route and keep large collections internally scrollable', () => {
  assert.match(workbench, /\.workbench-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);

  assert.match(taskList, /\.task-list-route\s*\{[^}]*height:\s*0[^}]*overflow:\s*hidden/s);
  assert.match(taskList, /\.task-list-panel\s*\{[^}]*min-height:\s*0[^}]*display:\s*flex[^}]*flex:\s*1[^}]*flex-direction:\s*column/s);
  assert.match(taskList, /\.task-table-wrap\s*\{[^}]*flex:\s*1[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);

  assert.match(fileCenter, /\.file-center\s*\{[^}]*height:\s*0[^}]*min-height:\s*0/s);
  assert.match(fileCenter, /\.data-layout \.list-panel\s*\{[^}]*min-height:\s*0[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(fileCenter, /\.data-layout \.table-shell\s*\{[^}]*flex:\s*1[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);

  assert.match(fileDetail, /\.file-detail-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0/s);
  assert.match(fileDetail, /\.file-workflow-panel\s*\{[^}]*display:\s*flex[^}]*flex:\s*1/s);
  assert.match(fileDetail, /:deep\(\.file-workflow-panel \.table-wrap\)\s*\{[^}]*display:\s*flex[^}]*flex:\s*1/s);

  assert.match(recordCenter, /\.record-center-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0/s);
  assert.match(recordCenter, /\.record-center-page:not\(\.is-empty\) \.record-table-wrap\s*\{[^}]*flex:\s*1[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(recordCenter, /\.record-center-page:not\(\.is-empty\) \.record-side\s*\{[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
});

test('task center empty state fills the desktop route and keeps its create action compact', () => {
  assert.match(taskEmpty, /@media\s*\(min-width:\s*1025px\)\s*\{[\s\S]*\.empty-task-center\s*\{[^}]*height:\s*100%[^}]*min-height:\s*0/s);
  assert.match(taskEmpty, /\.empty-main-column\s*\{[^}]*grid-template-rows:\s*auto auto minmax\(0,\s*1fr\) auto[^}]*min-height:\s*0/s);
  assert.match(taskEmpty, /\.empty-list-card\s*\{[^}]*display:\s*flex[^}]*min-height:\s*0[^}]*flex-direction:\s*column/s);
  assert.match(taskEmpty, /\.empty-side-column\s*\{[^}]*grid-template-rows:\s*minmax\(0,\s*1fr\)[^}]*gap:\s*var\(--ui-space-4\)[^}]*padding-top:\s*0/s);
  assert.match(taskEmpty, /\.empty-create-button\s*\{[^}]*min-height:\s*var\(--ui-control-md\)[^}]*font-size:\s*var\(--ui-font-sm\)/s);
  assert.match(taskEmpty, /\.status-guide-card\s*\{[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(taskEmpty, /@media\s*\(min-width:\s*1025px\) and \(max-width:\s*1439px\)\s*\{[\s\S]*\.empty-metric-strip\s*\{[^}]*grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(taskEmpty, /@media\s*\(min-width:\s*1025px\) and \(max-width:\s*1439px\)\s*\{[\s\S]*\.empty-metric-card\s*\{[^}]*min-height:\s*92px/s);
  assert.match(taskEmpty, /@media\s*\(min-width:\s*1025px\) and \(max-width:\s*1439px\)\s*\{[\s\S]*\.empty-illustration\s*\{[^}]*display:\s*none/s);
});

test('batch A visible type, spacing, controls, and retained rails use shared scale tokens', () => {
  for (const source of [workbench, taskList, taskEmpty, fileCenter, fileDetail, recordCenter]) {
    assert.match(source, /var\(--ui-font-(?:xs|sm|md|lg|xl)\)/);
    assert.match(source, /var\(--ui-space-[1-6]\)/);
  }

  assert.match(taskList, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.doesNotMatch(taskList, /task-rail|var\(--ui-panel-rail-lg\)/);
  assert.match(fileCenter, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+var\(--ui-panel-rail-lg\)/);
  assert.match(recordCenter, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+var\(--ui-panel-rail-lg\)/);
});
