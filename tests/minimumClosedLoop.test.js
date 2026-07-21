import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function read(path) {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('task creation submit returns to a populated task center', () => {
  const source = read('../src/views/tasks/TaskCreate.vue');
  const list = read('../src/views/tasks/TaskList.vue');
  const store = read('../src/store/index.js');

  assert.match(source, /function submitTemplateTask\(\)[\s\S]*store\.submitCreatedTask\(payload\)[\s\S]*router\.push\('\/tasks'\)/);
  assert.match(source, /function submitTaskAndReturn\(\)[\s\S]*store\.submitCreatedTask\(payload\)[\s\S]*router\.push\('\/tasks'\)/);
  assert.match(store, /submitCreatedTask\(payload = \{\}\)[\s\S]*buildSubmittedTaskRow\(payload/);
  assert.match(store, /startCreatedTaskProgressSimulation\(\)[\s\S]*setInterval\(\(\) => this\.advanceCreatedTaskProgress\(\), this\.createdTaskProgressIntervalMs\)/);
  assert.match(store, /advanceCreatedTaskProgress\(\)[\s\S]*advanceSubmittedTaskRow\(task/);
  assert.match(store, /this\.db\.latestCreatedTaskId = row\.id/);
  assert.match(list, /const allTaskRows = computed\(\(\) => \[\.\.\.\(store\.db\.createdTasks \|\| \[\]\), \.\.\.taskRows\]\)/);
  assert.match(list, /task\.statusKey === 'generating'/);
  assert.match(list, /state: 'generating'/);
});

test('report workbench mode changes follow the URL and key actions advance the report flow', () => {
  const source = read('../src/views/audit-report/AuditReportWorkbench.vue');

  assert.match(source, /import \{ useRoute, useRouter \} from 'vue-router'/);
  assert.match(source, /watch\(\s*\(\) => route\.query\.mode[\s\S]*activeMode\.value = resolveReportMode\(\)/);
  assert.match(source, /function startReportGeneration\(\)[\s\S]*router\.push\('\/audit-report\/draft'\)/);
  assert.match(source, /function submitGeneratedReportForReview\(\)[\s\S]*router\.push\(\{ path: '\/audit-report\/workbench', query: \{ mode: 'review' \} \}\)/);
  assert.doesNotMatch(source, /to="\/materials\/import\?scene=audit-report"[\s\S]*资料导入/);
});
