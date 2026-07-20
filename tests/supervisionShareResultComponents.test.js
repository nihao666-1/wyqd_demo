import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const componentDir = new URL('../src/views/supervision-result/', import.meta.url);
const resultUrl = new URL('SupervisionShareResult.vue', componentDir);
const resultSource = readFileSync(resultUrl, 'utf8');

function compileComponent(url) {
  const filename = url.pathname;
  const parsed = parse(readFileSync(url, 'utf8'), { filename });
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

test('P0 simplified supervision result keeps one consolidated page and removes split subcomponents', () => {
  const removedComponents = [
    'SupervisionShareHeader.vue',
    'SupervisionSourceFilters.vue',
    'SupervisionExtractionWorkspace.vue',
    'SupervisionTagResultTable.vue',
    'SupervisionReportOutline.vue',
    'SupervisionSourceDetail.vue',
    'SupervisionOutputPanel.vue',
    'SupervisionVersionTimeline.vue'
  ];

  for (const filename of removedComponents) {
    assert.equal(existsSync(new URL(filename, componentDir)), false, `${filename} should be removed in the simplified P0 page`);
    assert.doesNotMatch(resultSource, new RegExp(`from ['"]./${filename.replace('.vue', '')}['"]`));
  }
});

test('consolidated supervision result preserves the expected page regions and actions', () => {
  for (const marker of [
    'data-supervision-result-page',
    'data-result-region="source-filters"',
    'data-result-region="task-meta"',
    'data-result-region="extraction-progress"',
    'data-result-region="tag-results"',
    'data-result-region="report-outline"',
    'data-result-region="outputs"',
    'data-result-region="version-timeline"',
    'data-result-region="source-detail"',
    'createSupervisionExcelExport',
    'createSupervisionWordExport',
    'downloadSupervisionExport',
    'restartExtraction',
    'referenceResultRow',
    'saveSupervisionVersion'
  ]) {
    assert.match(resultSource, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('consolidated supervision result compiles as a Vue SFC', () => {
  compileComponent(resultUrl);
});
