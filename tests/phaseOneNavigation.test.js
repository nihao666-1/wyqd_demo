import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const layout = read('../src/components/layout/AppLayout.vue');
const router = read('../src/router/index.js');
const files = read('../src/views/files/FileCenter.vue');

test('phase one sidebar exposes only five business modules and keeps file center unchanged', () => {
  for (const label of ['审计工作台', '审计知识库', '费用智能化审计', '审计报告智能化', '文件中心']) {
    assert.match(layout, new RegExp(`label: '${label}'`));
  }
  assert.doesNotMatch(layout, /label: '系统管理'|path: '\/system'/);
  assert.doesNotMatch(layout, /label: '审计制度'|label: '专项审计分析'|label: '费用审计分析'|label: '报告智能化'/);
  assert.match(files, /文件资产/);
  assert.doesNotMatch(files, /资料中心/);
});

test('knowledge base consolidates policy and analysis capabilities under four children', () => {
  for (const label of ['制度查询与比对', '监管案例与舆情分析', '审计规范智能化', '监督共享信息分析']) {
    assert.match(layout, new RegExp(`label: '${label}'`));
  }
  assert.doesNotMatch(layout, /label: '专项审计入口'|label: '规范库'/);
});

test('expense and report navigation reflect phase one business boundaries', () => {
  assert.match(layout, /label: '费用综合分析', path: '\/expense\/audit\/overview'/);
  assert.match(layout, /label: '费用异常分析', path: '\/expense\/anomaly\/dashboard'/);
  assert.doesNotMatch(layout, /label: '费用审计入口'|label: '费用趋势分析'/);
  for (const label of ['被审计单位业务分析', '报告生成', '报告智能审核', '模板管理']) {
    assert.match(layout, new RegExp(`label: '${label}'`));
  }
  assert.match(router, /path: '\/audit-report\/business-analysis'/);
});

test('removed administration URLs return users to the audit workbench', () => {
  for (const path of ['/system', '/config', '/records']) {
    assert.match(router, new RegExp(`path: '${path.replace('/', '\\/')}', redirect: '\\/workbench'`));
  }
  assert.doesNotMatch(router, /SystemManagement/);
  assert.doesNotMatch(files, /to="\/system/);
});
