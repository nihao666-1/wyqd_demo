import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const taskCreatePath = new URL('../src/views/tasks/TaskCreate.vue', import.meta.url);
const appLayoutPath = new URL('../src/components/layout/AppLayout.vue', import.meta.url);

test('创建流程以独立组件承载第5步确认提交阶段', async () => {
  const source = await readFile(taskCreatePath, 'utf8');

  assert.match(source, /import TaskCreateTemplateOutputStep from ['"]\.\/TaskCreateTemplateOutputStep\.vue['"]/);
  assert.match(source, /createTemplateOutputSettings\(\)/);
  assert.match(source, /step === 4 && stepFourStage === ['"]template['"]/);
  assert.match(source, /<TaskCreateTemplateOutputStep/);
  assert.match(source, /:current-step="4"/);
  assert.match(source, /@request-submit="submitTemplateTask"/);
});

test('确认提交阶段使用confirm查询态和整页缩放shell', async () => {
  const [taskCreate, appLayout] = await Promise.all([
    readFile(taskCreatePath, 'utf8'),
    readFile(appLayoutPath, 'utf8')
  ]);

  assert.match(taskCreate, /query\.phase === ['"]confirm['"]/);
  assert.match(taskCreate, /step\.value = 4; stepFourStage\.value = ['"]template['"]/);
  assert.match(taskCreate, /syncStepFourQuery\(['"]confirm['"]\)/);
  assert.match(appLayout, /task-template-shell/);
  assert.match(appLayout, /isTemplatePhase/);
});

test('常规审计参考场景包含九项能力和报告审核', async () => {
  const source = await readFile(taskCreatePath, 'utf8');

  assert.match(source, /id: ['"]report-review['"]/);
  assert.match(source, /name: ['"]报告审核['"]/);
});
