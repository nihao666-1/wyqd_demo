import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const pageUrl = new URL('../src/views/audit-report/AuditReportDraft.vue', import.meta.url);
const layoutUrl = new URL('../src/components/layout/AppLayout.vue', import.meta.url);
const layoutCssUrl = new URL('../src/styles/layout.css', import.meta.url);

function source(url) {
  return readFileSync(url, 'utf8');
}

function compileSfc(url) {
  const content = source(url);
  const parsed = parse(content, { filename: url.pathname });
  assert.deepEqual(parsed.errors, []);
  const script = compileScript(parsed.descriptor, { id: url.pathname });
  const template = compileTemplate({
    id: url.pathname,
    filename: url.pathname,
    source: parsed.descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings }
  });
  assert.deepEqual(template.errors, []);
}

test('报告生成页标记参考图八个红框功能区域', () => {
  const page = source(pageUrl);

  for (const region of [
    'report-generation-page',
    'title-actions',
    'task-meta',
    'generation-config',
    'generation-progress',
    'draft-editor',
    'source-rail',
    'output-version'
  ]) {
    assert.match(page, new RegExp(`data-report-region="${region}"`));
  }
});

test('报告生成页覆盖关键动作和真实图标组件', () => {
  const page = source(pageUrl);

  for (const action of ['开始生成', '章节级重新生成', '查看来源', '替换来源', '保存版本', '提交复核', '导出报告']) {
    assert.match(page, new RegExp(action));
  }
  assert.match(page, /FontAwesomeIcon/);
  assert.doesNotMatch(page, /[✓⌄▣▤▧⇩×]/);
});

test('依据来源可关闭并由查看来源动作重新打开', () => {
  const page = source(pageUrl);

  assert.match(page, /<aside\s+v-if="sourceRailOpen"[^>]*class="source-rail"/);
  assert.match(page, /@click="sourceRailOpen = false"/);
  assert.match(page, /v-if="!sourceRailOpen"[^>]*class="reopen-source"/);
  assert.match(page, /function viewSource\(\)[\s\S]*sourceRailOpen\.value = true/);
});

test('窄桌面通过响应式重排而不是整页缩放', () => {
  const page = source(pageUrl);

  assert.match(page, /@media \(max-width:1400px\)/);
  assert.match(page, /\.report-generation-grid\{grid-template-columns:minmax\(180px,220px\) minmax\(0,1fr\)\}/);
  assert.doesNotMatch(page, /\bzoom\s*:/);
  assert.doesNotMatch(page, /transform:scale\(/);
});

test('报告工作区保留功能尺寸下限并利用可用视口高度', () => {
  const page = source(pageUrl);

  assert.match(page, /\.report-generation-page\{[^}]*min-height:calc\(var\(--shell-viewport-height/);
  assert.match(page, /\.report-generation-grid\{[^}]*grid-template-columns:minmax\(180px,220px\) minmax\(0,1fr\) minmax\(280px,326px\)/);
  assert.match(page, /\.report-generation-grid\{[^}]*min-height:654px[^}]*flex:1/);
  assert.match(page, /\.source-rail\{[^}]*height:auto[^}]*min-height:654px[^}]*align-self:stretch/);
  assert.match(page, /\.generation-center\{[^}]*grid-template-rows:minmax\(334px,1\.05fr\) minmax\(306px,\.95fr\)/);
});

test('底部输出区按参考图拆为输出、版本、导出记录三块', () => {
  const page = source(pageUrl);

  assert.match(page, /class="bottom-row" data-report-region="output-version"/);
  assert.match(page, /<div class="output-panel">/);
  assert.match(page, /<div class="version-panel">/);
  assert.match(page, /<aside class="export-history-panel">/);
  assert.match(page, /snapshot\.exportHistory\.title/);
  assert.doesNotMatch(page, /class="export-empty"/);
});

test('报告生成页专属 shell 接入面包屑和报告智能化激活', () => {
  const layout = source(layoutUrl);
  const css = source(layoutCssUrl);

  assert.match(layout, /isAuditReportGeneration/);
  assert.match(layout, /route\.path === '\/audit-report\/draft'/);
  assert.match(layout, /<strong>报告生成<\/strong>/);
  assert.match(layout, /item\.path === '\/audit-report\/workbench'/);
  assert.match(css, /\.audit-report-generation-shell/);
  assert.match(css, /\.audit-report-generation-shell \.sidebar[\s\S]*width:\s*var\(--shell-sidebar-width\)/s);
  assert.match(css, /\.audit-report-generation-shell \.topbar\s*\{[^}]*height:\s*56px/s);
});

test('报告生成页 Vue SFC 可编译', () => {
  compileSfc(pageUrl);
});
