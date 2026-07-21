import test from 'node:test';
import assert from 'node:assert/strict';
import { getAuditReportGenerationSnapshot } from '../src/views/audit-report/auditReportGenerationData.js';

test('报告生成执行页快照覆盖参考图核心区域', () => {
  const snapshot = getAuditReportGenerationSnapshot();

  assert.equal(snapshot.task.unit, '上海分公司');
  assert.equal(snapshot.task.status, '草稿生成中');
  assert.equal(snapshot.config.outputFormats.length, 2);
  assert.equal(snapshot.config.aiLabel, true);
  assert.equal(snapshot.config.modelReview, true);
  assert.equal(snapshot.steps.length, 6);
  assert.equal(snapshot.steps[2].state, 'active');
  assert.equal(snapshot.progress.percent, 68);
  assert.equal(snapshot.logs.length, 5);
  assert.equal(snapshot.readiness.length, 4);
  assert.equal(snapshot.chapters.length, 8);
  assert.equal(snapshot.sources.length, 3);
  assert.equal(snapshot.outputs.length, 5);
  assert.equal(snapshot.versions.at(-1).id, 'V1.0');
  assert.equal(snapshot.officialCompare.summary.length, 4);
  assert.equal(snapshot.officialCompare.checkItems.length, 4);
  assert.equal(snapshot.officialCompare.records.length, 1);
  assert.equal(snapshot.exportHistory.title, '导出记录（近 7 天）');
});

test('报告生成执行页快照返回隔离副本', () => {
  const first = getAuditReportGenerationSnapshot();
  const second = getAuditReportGenerationSnapshot();

  first.sources[0].title = 'changed';
  first.outputs.push({ name: 'extra' });
  first.officialCompare.records.push({ name: 'extra', status: 'changed' });

  assert.equal(second.sources[0].title, '《证券公司客户适当性管理办法（2023年修订）》');
  assert.equal(second.outputs.length, 5);
  assert.equal(second.officialCompare.records.length, 1);
});
