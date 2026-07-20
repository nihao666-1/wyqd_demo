import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const layout = read('../src/components/layout/AppLayout.vue');
const router = read('../src/router/index.js');
const files = read('../src/views/files/FileCenter.vue');

test('sidebar does not expose administration centers', () => {
  assert.doesNotMatch(layout, /label: '系统管理'|label: '配置中心'|label: '记录中心'/);
  assert.doesNotMatch(layout, /基础配置|AI安全策略|集成管理|操作审计/);
});

test('administration URLs are no longer accessible', () => {
  for (const path of ['/system', '/config', '/records']) {
    assert.match(router, new RegExp(`path: '${path.replace('/', '\\/')}', redirect: '\\/workbench'`));
  }
  assert.doesNotMatch(router, /SystemManagement/);
});

test('file center is one asset workspace without redundant functional tabs', () => {
  assert.doesNotMatch(files, /文件中心功能|const topTabs|activeTopTab/);
  assert.doesNotMatch(files, />文件查询<|>文件详情<|>引用关系<|>解析状态<\/button>/);
  assert.match(files, /文件资产/);
  assert.doesNotMatch(files, /\/system|系统操作审计/);
});
