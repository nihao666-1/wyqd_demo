import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveTaskCreateEntry } from '../src/domain/taskCreate/taskCreateEntry.js';

test('资料入口解析三种来源并保持旧 parse 和 confirm 兼容', () => {
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'materials', source: 'local' }), {
    step: 2,
    stage: 'materials',
    source: 'local'
  });
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'materials', source: 'fileCenter' }), {
    step: 2,
    stage: 'materials',
    source: 'fileCenter'
  });
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'materials', source: 'simulation' }), {
    step: 2,
    stage: 'materials',
    source: 'simulation'
  });
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'parse' }), {
    step: 3,
    stage: 'parsing',
    source: 'local'
  });
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'confirm' }), {
    step: 4,
    stage: 'template',
    source: 'local'
  });
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'template' }), {
    step: 4,
    stage: 'template',
    source: 'local'
  });
});

test('未知入口回到基础信息且无效资料来源回退本地上传', () => {
  assert.deepEqual(resolveTaskCreateEntry(), { step: 0, stage: 'ability', source: 'local' });
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'unknown', source: 'fileCenter' }), {
    step: 0,
    stage: 'ability',
    source: 'fileCenter'
  });
  assert.deepEqual(resolveTaskCreateEntry({ phase: 'materials', source: 'invalid' }), {
    step: 2,
    stage: 'materials',
    source: 'local'
  });
});

test('创建页由入口解析结果初始化并只自动补齐一次模拟资料', () => {
  const content = readFileSync(new URL('../src/views/tasks/TaskCreate.vue', import.meta.url), 'utf8');

  assert.match(content, /import \{ resolveTaskCreateEntry \} from ['"]\.\.\/\.\.\/domain\/taskCreate\/taskCreateEntry\.js['"]/);
  assert.match(content, /const taskCreateEntry = resolveTaskCreateEntry\(route\.query\)/);
  assert.match(content, /const step = ref\(taskCreateEntry\.step\)/);
  assert.match(content, /const stepFourStage = ref\(taskCreateEntry\.stage\)/);
  assert.match(content, /const materialSource = ref\(taskCreateEntry\.source\)/);
  assert.match(content, /const selectedIds = ref\(getInitialSelectedCapabilityIds\(taskCreateEntry\)\)/);
  assert.match(content, /if \(nextEntry\.taskType\) form\.taskType = nextEntry\.taskType/);
  assert.match(content, /shouldAutoFillSimulation\.value = false/);
});

test('专项和费用入口会进入选择能力并携带预选能力', () => {
  assert.deepEqual(resolveTaskCreateEntry({ capability: 'regulatory' }), {
    step: 0,
    stage: 'ability',
    source: 'local',
    capabilityId: 'regulatory',
    taskType: '专项审计'
  });
  assert.deepEqual(resolveTaskCreateEntry({ ability: 'supervision-share', source: 'fileCenter' }), {
    step: 0,
    stage: 'ability',
    source: 'fileCenter',
    capabilityId: 'supervision',
    taskType: '专项审计'
  });
  assert.deepEqual(resolveTaskCreateEntry({ preselect: 'expense-audit' }), {
    step: 0,
    stage: 'ability',
    source: 'local',
    capabilityId: 'expense',
    taskType: '费用审计'
  });
});
