import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const reportTablePages = [
  '../src/views/audit-report/AuditReportGapList.vue',
  '../src/views/audit-report/AuditReportTemplate.vue'
];

const deletedReportStepPages = [
  '../src/views/audit-report/AuditReportDiff.vue',
  '../src/views/audit-report/AuditReportTemplateDiff.vue'
];

test('report table pages fill the route without page-level scaling', () => {
  for (const path of reportTablePages) {
    const source = read(path);
    assert.match(source, /audit-report-[\w-]+-page route-fill-page/, path);
    assert.match(source, /height:\s*0/, path);
    assert.match(source, /min-height:\s*0/, path);
    assert.doesNotMatch(source, /\bzoom\s*:/, path);
    assert.doesNotMatch(source, /transform:\s*scale\(/, path);
  }
});

test('report table pages stretch their data region instead of a blank card', () => {
  for (const path of reportTablePages) {
    const source = read(path);
    assert.match(source, /\.report-table-panel\s*\{[^}]*display:\s*flex[^}]*flex:\s*1/s, path);
    assert.match(source, /:deep\(\.table-wrap\)\s*\{[^}]*display:\s*flex[^}]*flex:\s*1/s, path);
    assert.match(source, /:deep\(\.table-wrap > table\)\s*\{[^}]*height:\s*100%/s, path);
  }

  for (const path of deletedReportStepPages) {
    assert.equal(existsSync(new URL(path, import.meta.url)), false, `${path} should be removed after report route consolidation`);
  }
});

test('report workbench keeps generate and review modes without legacy empty template rail', () => {
  const workbench = read('../src/views/audit-report/AuditReportWorkbench.vue');
  const review = read('../src/views/audit-report/AuditReportCheckResult.vue');

  assert.match(workbench, /report-ai-page route-fill-page/);
  assert.match(workbench, /\.report-ai-page\s*\{[^}]*display:\s*flex[^}]*height:\s*0[^}]*min-height:\s*0/s);
  assert.match(workbench, /activeMode === 'generate'/);
  assert.match(workbench, /activeMode === 'review'|<template v-else>/);
  assert.match(workbench, /to="\/audit-report\/template"/);
  assert.match(workbench, /to="\/materials\/import\?scene=audit-report"/);
  assert.doesNotMatch(workbench, /activeMode === 'empty'|template-rail|reportTypes|formatTemplates|mode-empty/);

  assert.match(review, /report-review-page route-fill-page/);
  assert.match(review, /\.report-review-page\s*\{[^}]*display:\s*flex[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(review, /@media \(min-width:\s*1701px\)[\s\S]*\.review-layout\s*\{[^}]*flex:\s*1[^}]*grid-template-rows:\s*minmax\(0,\s*1fr\) auto/s);
  assert.match(review, /@media \(min-width:\s*1701px\)[\s\S]*\.workbench-panel\s*\{[^}]*height:\s*auto[^}]*flex:\s*1/s);
  assert.match(review, /\.version-panel\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*2/s);
  assert.match(review, /@media \(min-width:\s*1200px\) and \(max-width:\s*1700px\)[\s\S]*\.workbench-panel\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)[^}]*height:\s*auto/s);
  assert.match(review, /@media \(min-width:\s*1200px\) and \(max-width:\s*1700px\)[\s\S]*\.issue-table\s*\{[^}]*min-width:\s*780px/s);
  assert.match(review, /@media \(min-width:\s*1701px\) and \(max-width:\s*2150px\)[\s\S]*\.issue-table th:nth-child\(3\)[\s\S]*display:\s*none/s);
});

test('report draft owns its vertical scrolling without extending the document', () => {
  const draft = read('../src/views/audit-report/AuditReportDraft.vue');

  assert.match(draft, /report-generation-page route-fill-page/);
  assert.match(draft, /\.report-generation-page\s*\{[^}]*height:\s*0[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.doesNotMatch(draft, /\bzoom\s*:/);
  assert.doesNotMatch(draft, /transform:\s*scale\(/);
});
