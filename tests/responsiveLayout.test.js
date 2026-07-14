import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const appLayout = read('../src/components/layout/AppLayout.vue');
const layoutCss = read('../src/styles/layout.css');
const materialParsing = read('../src/views/tasks/MaterialParsingWorkspace.vue');
const supervisionResult = read('../src/views/supervision-result/SupervisionShareResult.vue');
const regulatoryResult = read('../src/views/regulatory/RegulatoryResult.vue');
const reportDraft = read('../src/views/audit-report/AuditReportDraft.vue');
const auditStandardDraft = read('../src/views/audit-standard/AuditStandardDraft.vue');
const auditGenerationWorkspace = read('../src/views/audit-standard/result/AuditGenerationWorkspace.vue');
const auditResultFooter = read('../src/views/audit-standard/result/AuditResultFooter.vue');
const archivedTask = read('../src/views/tasks/TaskDetailArchived.vue');
const archiveSidebar = read('../src/views/tasks/TaskArchiveSidebar.vue');

test('shared layout exposes a flexible route content region', () => {
  assert.match(appLayout, /<div class="route-content">\s*<RouterView\s*\/>\s*<\/div>/);
  assert.match(layoutCss, /--shell-viewport-height:\s*100vh/);
  assert.match(layoutCss, /--shell-sidebar-width:\s*clamp\(/);
  assert.match(layoutCss, /--shell-page-gutter:\s*clamp\(/);
  assert.match(layoutCss, /@supports\s*\(height:\s*100dvh\)/);
  assert.match(layoutCss, /\.main\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(layoutCss, /\.route-content\s*\{[^}]*flex:\s*1[^}]*min-width:\s*0[^}]*min-height:\s*0/s);
});

test('shared shell uses native responsive sizing without whole-page scaling', () => {
  assert.match(layoutCss, /\.app-shell[\s\S]*min-height:\s*var\(--shell-viewport-height\)/);
  assert.match(layoutCss, /\.sidebar\s*\{[^}]*width:\s*var\(--shell-sidebar-width\)[^}]*height:\s*var\(--shell-viewport-height\)/s);
  assert.doesNotMatch(layoutCss, /\bzoom\s*:/);
  assert.doesNotMatch(layoutCss, /transform:\s*scale\(/);
  assert.match(layoutCss, /@media \(min-width: 901px\) and \(max-width: 1366px\)[\s\S]*\.nav-label,[\s\S]*display:\s*initial/);
});

test('large workspaces are not capped to legacy screenshot heights', () => {
  assert.match(materialParsing, /\.workspace-grid\s*\{[^}]*height:\s*calc\(var\(--shell-viewport-height[^}]*max-height:\s*none/s);
  assert.match(materialParsing, /\.center-stack\s*\{[^}]*grid-template-rows:\s*minmax\(417px,\s*1fr\)/s);
  assert.doesNotMatch(materialParsing, /(?:height|max-height):\s*711px/);
  assert.doesNotMatch(supervisionResult, /\.supervision-page\s*\{[^}]*height:\s*928px/s);
  assert.doesNotMatch(regulatoryResult, /\.reg-result-page\s*\{[^}]*height:\s*927px/s);
  assert.match(reportDraft, /\.source-rail\s*\{[^}]*height:\s*auto[^}]*align-self:\s*stretch/s);
  assert.doesNotMatch(reportDraft, /\.source-rail\s*\{[^}]*height:\s*778px/s);
  assert.match(auditStandardDraft, /\.audit-standard-result-page\s*\{[^}]*min-height:\s*calc\(var\(--shell-viewport-height/s);
  assert.doesNotMatch(auditStandardDraft, /\.audit-standard-result-page\s*\{[^}]*height:\s*933px/s);
  assert.match(auditStandardDraft, /\.audit-standard-result-page\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(auditStandardDraft, /\.result-stage\s*\{[^}]*flex:\s*1[^}]*grid-template-columns:\s*minmax\(0,1fr\)\s+minmax\(300px,360px\)/s);
  assert.match(auditGenerationWorkspace, /\.generation-workspace\s*\{[^}]*height:\s*auto[^}]*min-height:\s*628px/s);
  assert.match(auditGenerationWorkspace, /\.generation-workspace\s*\{[^}]*grid-template-rows:\s*309px\s+minmax\(309px,1fr\)/s);
  assert.match(auditGenerationWorkspace, /\.draft-row\s*\{[^}]*grid-template-columns:\s*minmax\(0,3fr\)\s+minmax\(184px,1fr\)/s);
  assert.match(auditGenerationWorkspace, /\.standard-table-panel\s*\{[^}]*grid-template-rows:\s*33px\s+minmax\(242px,1fr\)\s+33px/s);
  assert.match(auditResultFooter, /\.audit-result-footer\s*\{[^}]*grid-template-columns:\s*minmax\(0,1\.7fr\)\s+minmax\(300px,1fr\)/s);
  assert.doesNotMatch(archivedTask, /\.archive-page\s*\{[^}]*width:\s*1372px[^}]*min-height:\s*933px/s);
  assert.match(archivedTask, /\.archive-lower\s*\{[^}]*align-items:\s*stretch/s);
  assert.doesNotMatch(archiveSidebar, /\.archive-sidebar\s*\{[^}]*height:\s*864px/s);
  assert.match(reportDraft, /\.report-generation-page\s*\{[^}]*min-height:\s*calc\(var\(--shell-viewport-height/s);
});
