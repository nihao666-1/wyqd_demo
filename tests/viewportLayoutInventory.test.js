import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routerSource = readFileSync(new URL('../src/router/index.js', import.meta.url), 'utf8');

const fillRoutes = [
  '/workbench',
  '/tasks',
  '/tasks/detail/supervision-share',
  '/files',
  '/files/detail',
  '/config',
  '/records',
  '/regulatory/workbench',
  '/regulatory/result',
  '/regulatory/history',
  '/audit-standard/workbench',
  '/audit-standard/draft',
  '/audit-standard/diff',
  '/audit-standard/library',
  '/audit-standard/policy',
  '/supervision/workbench',
  '/supervision/report/draft',
  '/expense/workbench',
  '/expense/audit/overview',
  '/expense/usage/dashboard',
  '/expense/usage/drilldown',
  '/expense/usage/report',
  '/expense/anomaly/dashboard',
  '/audit-report/workbench',
  '/audit-report/template',
  '/audit-report/template-diff',
  '/audit-report/gap-list',
  '/audit-report/draft',
  '/audit-report/diff',
  '/audit-report/check-result'
];

const naturalRoutes = [
  '/empty-start',
  '/demo-guide',
  '/regulatory/new',
  '/regulatory/data-fetch',
  '/audit-standard/generate',
  '/audit-standard/upload',
  '/audit-standard/precheck',
  '/supervision/import/upload',
  '/supervision/import/folder-preview',
  '/supervision/import/field-edit',
  '/supervision/import/metadata',
  '/supervision/import/precheck',
  '/supervision/report/source-select',
  '/expense/usage/new',
  '/audit-report/template-upload',
  '/audit-report/source-select',
  '/audit-report/material/import',
  '/audit-report/material/folder-preview',
  '/audit-report/material/field-edit',
  '/audit-report/material/metadata',
  '/audit-report/material/precheck',
  '/audit-report/material/supplement-preview',
  '/audit-report/offline-upload',
  '/audit-report/check-upload'
];

const conditionalRoutes = ['/tasks/create', '/tasks/detail'];

test('every component route has exactly one viewport layout classification', () => {
  const componentRoutes = [...routerSource.matchAll(/\{\s*path:\s*'([^']+)'\s*,\s*component:/g)]
    .map((match) => match[1]);
  const redirectRoutes = new Set(
    [...routerSource.matchAll(/\{\s*path:\s*'([^']+)'\s*,\s*redirect:/g)].map((match) => match[1])
  );
  const classifiedRoutes = [...fillRoutes, ...naturalRoutes, ...conditionalRoutes];

  assert.equal(componentRoutes.length, 56);
  assert.equal(new Set(classifiedRoutes).size, classifiedRoutes.length);
  assert.deepEqual([...classifiedRoutes].sort(), [...componentRoutes].sort());
  assert.equal(classifiedRoutes.some((route) => redirectRoutes.has(route)), false);
});

test('conditional routes remain limited to query or state driven task flows', () => {
  assert.deepEqual(conditionalRoutes, ['/tasks/create', '/tasks/detail']);
});
