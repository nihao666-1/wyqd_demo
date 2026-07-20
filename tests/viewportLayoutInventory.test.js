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
  '/materials/import',
  '/regulatory/workbench',
  '/regulatory/result',
  '/audit-standard/draft',
  '/audit-standard/library',
  '/audit-standard/policy',
  '/supervision/workbench',
  '/supervision/report/draft',
  '/expense/audit/overview',
  '/expense/usage/dashboard',
  '/expense/anomaly/dashboard',
  '/audit-report/workbench',
  '/audit-report/business-analysis',
  '/audit-report/template',
  '/audit-report/gap-list',
  '/audit-report/draft',
  '/audit-report/check-result'
];

const naturalRoutes = [
  '/demo-guide',
  '/audit-standard/generate',
  '/supervision/report/source-select',
  '/audit-report/source-select',
];

const conditionalRoutes = ['/tasks/create', '/tasks/detail'];

test('every component route has exactly one viewport layout classification', () => {
  const componentRoutes = [...routerSource.matchAll(/\{\s*path:\s*'([^']+)'\s*,\s*component:/g)]
    .map((match) => match[1]);
  const redirectRoutes = new Set(
    [...routerSource.matchAll(/\{\s*path:\s*'([^']+)'\s*,\s*redirect:/g)].map((match) => match[1])
  );
  const classifiedRoutes = [...fillRoutes, ...naturalRoutes, ...conditionalRoutes];

  assert.equal(componentRoutes.length, 28);
  assert.equal(new Set(classifiedRoutes).size, classifiedRoutes.length);
  assert.deepEqual([...classifiedRoutes].sort(), [...componentRoutes].sort());
  assert.equal(classifiedRoutes.some((route) => redirectRoutes.has(route)), false);
  assert.match(routerSource, /\{\s*path:\s*'\/empty-start'\s*,\s*redirect:\s*'\/workbench'\s*\}/);
});

test('conditional routes remain limited to query or state driven task flows', () => {
  assert.deepEqual(conditionalRoutes, ['/tasks/create', '/tasks/detail']);
});
