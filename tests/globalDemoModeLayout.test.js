import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const layoutUrl = new URL('../src/components/layout/AppLayout.vue', import.meta.url);
const expenseWorkbenchUrl = new URL('../src/views/expense/ExpenseWorkbench.vue', import.meta.url);
const fileCenterUrl = new URL('../src/views/files/FileCenter.vue', import.meta.url);
const recordCenterUrl = new URL('../src/views/records/RecordCenter.vue', import.meta.url);
const layoutCssUrl = new URL('../src/styles/layout.css', import.meta.url);

function read(url) {
  return readFileSync(url, 'utf8');
}

function compileVue(url) {
  const filename = url.pathname;
  const parsed = parse(read(url), { filename });
  assert.deepEqual(parsed.errors, []);
  const script = compileScript(parsed.descriptor, { id: filename });
  const template = compileTemplate({
    id: filename,
    filename,
    source: parsed.descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings }
  });
  assert.deepEqual(template.errors, []);
}

test('global demo data switch is always rendered from the shared layout', () => {
  const layout = read(layoutUrl);
  assert.match(layout, /<div class="global-data-mode" aria-label=/);
  assert.doesNotMatch(layout, /v-if="[^"]*global-data-mode/);
  assert.match(layout, /store\.setDemoDataMode\(mode\)/);
  compileVue(layoutUrl);
});

test('expense workbench switches empty and data entry states from the global demo mode', () => {
  const content = read(expenseWorkbenchUrl);
  assert.match(content, /inject\('store'\)/);
  assert.match(content, /const isEmptyMode = computed\(\(\) => store\.demoDataMode === 'empty'\)/);
  assert.match(content, /<template v-if="isEmptyMode">/);
  assert.match(content, /<template v-else>/);
  assert.match(content, /to="\/expense\/audit\/overview"/);
  assert.match(content, /to="\/expense\/anomaly\/dashboard"/);
  assert.match(content, /to="\/expense\/usage\/dashboard"/);
  compileVue(expenseWorkbenchUrl);
});

test('file and record centers consume the global demo data mode instead of local state', () => {
  const fileCenter = read(fileCenterUrl);
  const recordCenter = read(recordCenterUrl);

  assert.match(fileCenter, /inject\('store'\)/);
  assert.match(fileCenter, /const isEmptyMode = computed\(\(\) => store\.demoDataMode === 'empty'\)/);
  assert.match(fileCenter, /watch\(isEmptyMode, \(empty\) =>/);
  assert.doesNotMatch(fileCenter, /function switchMode\(mode\)/);
  assert.doesNotMatch(fileCenter, /const currentMode = ref\(/);
  assert.doesNotMatch(fileCenter, /page-title-row/);

  assert.match(recordCenter, /inject\('store'\)/);
  assert.match(recordCenter, /const isEmptyView = computed\(\(\) => store\.demoDataMode === 'empty'\)/);
  assert.doesNotMatch(recordCenter, /function setViewMode\(mode\)/);
  assert.doesNotMatch(recordCenter, /const initialView =/);
  assert.doesNotMatch(recordCenter, /const currentView = ref\(/);
  assert.doesNotMatch(recordCenter, /record-page-head/);

  compileVue(fileCenterUrl);
  compileVue(recordCenterUrl);
});

test('expense section shells use one stable shared frame size', () => {
  const css = read(layoutCssUrl);
  assert.match(css, /\.expense-section-shell,\s*\.expense-empty-shell,\s*\.expense-audit-result-shell,\s*\.expense-trend-shell\s*\{/);
  assert.match(css, /\.expense-section-shell \.sidebar,\s*\.expense-empty-shell \.sidebar,\s*\.expense-audit-result-shell \.sidebar,\s*\.expense-trend-shell \.sidebar\s*\{[\s\S]*width: 208px/);
  assert.match(css, /\.expense-section-shell \.topbar,\s*\.expense-empty-shell \.topbar,\s*\.expense-audit-result-shell \.topbar,\s*\.expense-trend-shell \.topbar\s*\{[\s\S]*height: 60px/);
  assert.doesNotMatch(css, /\.expense-empty-shell \.sidebar \{[\s\S]*width: 226px/);
  assert.doesNotMatch(css, /\.expense-trend-shell \.sidebar \{[\s\S]*width: 200px/);
});
