import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

function source(file) {
  return readFileSync(new URL(`../src/views/tasks/${file}`, import.meta.url), 'utf8');
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
    compilerOptions: { bindingMetadata: script.bindings }
  });
  assert.deepEqual(template.errors, []);
}

test('能力配置组件包含八个配置组和全部关键字段', () => {
  const content = source('TaskTemplateOutputCardGrid.vue');
  for (const marker of [
    'policyKnowledge', 'policyCompare', 'regulatoryAnalysis', 'auditStandard',
    'supervisionAnalysis', 'expenseAudit', 'reportGeneration', 'reportReview'
  ]) {
    assert.match(content, new RegExp(`data-config-group="${marker}"`));
  }
  for (const label of [
    '知识库范围', '生效时间', '比对规则', '风险等级阈值', '审计规范模板',
    '报告框架', '费用规则版本', '报告类型', '报告模板', '检查规则'
  ]) {
    assert.match(content, new RegExp(label));
  }
  assert.match(content, /grid-template-columns:minmax\(0,45fr\) minmax\(0,55fr\)/);
});

test('提交确认组件包含任务能力资料输出和风险五区', () => {
  const content = source('TaskCreateConfirmationAside.vue');
  for (const section of ['task', 'capabilities', 'materials', 'outputs', 'risk']) {
    assert.match(content, new RegExp(`data-confirm-section="${section}"`));
  }
  assert.match(content, /提交前确认/);
  assert.match(content, /所需资料/);
  assert.match(content, /输出结果/);
});

test('确认提交组合组件默认高亮第5步并包含四项全局设置和三项底部动作', () => {
  const content = source('TaskCreateTemplateOutputStep.vue');
  assert.match(content, /currentStep:\s*\{ type: Number, default: 4 \}/);
  for (const marker of [
    'aiGeneratedLabel', 'multiModelReview', 'saveProcessVersions', 'exportAuditTrail'
  ]) {
    assert.match(content, new RegExp(marker));
  }
  for (const label of ['保存草稿', '上一步', '提交任务']) {
    assert.match(content, new RegExp(label));
  }
  assert.match(content, /data-step="template-output"/);
  assert.match(content, /request-submit/);
  assert.match(content, /validateTemplateOutputSettings/);
  assert.match(content, /validation-alert/);
});

test('创建任务后三步底部操作区保持当前步骤左侧和按钮右侧', () => {
  const taskCreate = source('TaskCreate.vue');
  const parsing = source('MaterialParsingWorkspace.vue');
  const templateOutput = source('TaskCreateTemplateOutputStep.vue');

  assert.match(taskCreate, /<footer[^>]*class="create-footer"[^>]*:class="\{ 'materials-footer': step === 2 \}"[\s\S]*<p>当前步骤 <strong>\{\{ step \+ 1 \}\}<\/strong> \/ 5<\/p>[\s\S]*保存草稿[\s\S]*上一步[\s\S]*下一步：解析资料/);
  assert.doesNotMatch(taskCreate, /\.materials-footer p\s*\{\s*display:\s*none/);
  assert.doesNotMatch(taskCreate, /\.materials-footer>div\s*\{\s*display:grid;grid-template-columns:minmax\(0,1fr\) 170px 280px;width:100%;margin-left:0\}/);

  assert.match(parsing, /<footer class="parsing-flow-footer">[\s\S]*<p>当前步骤 <strong>4<\/strong> \/ 5[\s\S]*<\/p>[\s\S]*<div class="parsing-footer-actions">[\s\S]*保存草稿[\s\S]*上一步[\s\S]*下一步：模板与输出设置/);
  assert.match(parsing, /\.parsing-flow-footer\s*\{[^}]*justify-content:space-between/s);
  assert.match(parsing, /\.parsing-footer-actions\s*\{[^}]*display:flex/s);

  assert.match(templateOutput, /<footer class="step4-actions">[\s\S]*<p class="step4-current-step">当前步骤 <strong>\{\{ currentStep \+ 1 \}\}<\/strong> \/ 5[\s\S]*<\/p>[\s\S]*<div class="step4-action-buttons">[\s\S]*保存草稿[\s\S]*上一步[\s\S]*提交任务/);
  assert.match(templateOutput, /\.step4-actions\s*\{[^}]*justify-content:space-between/s);
  assert.match(templateOutput, /\.step4-action-buttons\s*\{[^}]*display:flex/s);
});

test('复选单选组和资料清单提供原生分组及表格语义', () => {
  assert.match(source('TaskTemplateOutputCardGrid.vue'), /h\('fieldset'/);
  assert.match(source('TaskCreateConfirmationAside.vue'), /<table/);
});

test('三个新增Vue组件均可独立完成SFC编译', () => {
  for (const file of [
    'TaskTemplateOutputCardGrid.vue',
    'TaskCreateConfirmationAside.vue',
    'TaskCreateTemplateOutputStep.vue'
  ]) {
    compileComponent(file);
  }
});
