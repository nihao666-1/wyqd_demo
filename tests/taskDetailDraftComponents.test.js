import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const componentDir = new URL('../src/views/tasks/task-detail-draft/', import.meta.url);

function source(file) {
  return readFileSync(new URL(file, componentDir), 'utf8');
}

function compileComponent(file) {
  const filename = new URL(file, componentDir).pathname;
  const parsed = parse(source(file), { filename });
  assert.deepEqual(parsed.errors, []);
  const script = compileScript(parsed.descriptor, { id: file });
  const template = compileTemplate({
    id: file,
    filename,
    source: parsed.descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings }
  });
  assert.deepEqual(template.errors, []);
}

test('草稿主区包含三个资料入口、三能力和七步流程', () => {
  const content = source('TaskDetailDraftOverview.vue');
  for (const marker of ['local', 'fileCenter', 'simulation']) {
    assert.match(content, new RegExp(`data-source="${marker}"`));
  }
  for (const label of ['任务已创建，尚未添加资料', '制度比对', '费用审计', '报告生成', '创建任务', '导出归档']) {
    assert.match(content, new RegExp(label));
  }
  compileComponent('TaskDetailDraftOverview.vue');
});
