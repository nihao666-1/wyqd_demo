import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const taskDetailUrl = new URL('../src/views/tasks/TaskDetail.vue', import.meta.url);
const appLayoutUrl = new URL('../src/components/layout/AppLayout.vue', import.meta.url);
const taskResultStateUrl = new URL('../src/domain/taskDetail/taskResultState.js', import.meta.url);

function compileSfc(url) {
  const content = readFileSync(url, 'utf8');
  const filename = url.pathname;
  const parsed = parse(content, { filename });
  assert.deepEqual(parsed.errors, []);
  const script = compileScript(parsed.descriptor, { id: filename });
  const template = compileTemplate({
    id: filename,
    filename,
    source: parsed.descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings }
  });
  assert.deepEqual(template.errors, []);
  return content;
}

test('任务详情能力 5 的查看结果携带 taskId 进入审计规范结果页', () => {
  const source = compileSfc(taskDetailUrl);

  assert.match(source, /import\s*\{[^}]*useRouter[^}]*\}\s*from ['"]vue-router['"]/s);
  assert.match(source, /const router = useRouter\(\)/);
  assert.match(source, /handleViewResult\(ability\)[\s\S]*ability\.id === 5/);
  assert.match(source, /path:\s*['"]\/audit-standard\/draft['"]/);
  assert.match(source, /query:\s*\{\s*taskId:\s*route\.query\.taskId\s*\}/);
  assert.match(source, /router\.push/);
});

test('审计规范结果页使用专属 shell、三段面包屑并保持任务中心激活', () => {
  const source = compileSfc(appLayoutUrl);

  assert.match(source, /isAuditStandardResult/);
  assert.match(source, /route\.path === ['"]\/audit-standard\/draft['"]/);
  assert.match(source, /audit-standard-result-shell/);
  for (const crumb of ['任务中心', '上海分公司Q1常规审计任务', '审计规范生成']) {
    assert.match(source, new RegExp(crumb));
  }
  assert.match(source, /isAuditStandardResult[\s\S]*item\.path === ['"]\/tasks['"]/);
  assert.match(source, /!isAuditStandardResult/);
});

test('任务详情入口和审计规范结果页统一显示 186 条', () => {
  const source = readFileSync(taskResultStateUrl, 'utf8');
  assert.match(source, /name:\s*['"]审计规范生成['"][^\n]*summaryValue:\s*['"]186 条['"]/);
});
