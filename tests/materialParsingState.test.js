import test from 'node:test';
import assert from 'node:assert/strict';
import {
  batchRetryParsing,
  batchSkipParsing,
  canContinueParsing,
  createMaterialParsingBatch,
  getParsingSummary,
  getSelectedFile,
  mapParsingField,
  replaceParsingFile,
  retryParsingFile,
  skipParsingFile
} from '../src/domain/taskCreate/materialParsingState.js';

const requiredFileFields = [
  'id',
  'name',
  'type',
  'ability',
  'uploadStatus',
  'parseStatus',
  'pagesOrTables',
  'metadataStatus',
  'referenceStatus',
  'folderPath',
  'selectedDetail',
  'size',
  'uploadedAt',
  'failureReason',
  'missingFields',
  'impactAbilities',
  'blocksSubmission',
  'mappings',
  'blockers',
  'suggestions',
  'sourceRequirements',
  'visibleInTable'
];

function assertImmutableTransition(transform) {
  const files = createMaterialParsingBatch();
  const snapshot = structuredClone(files);
  const updated = transform(files);

  assert.notEqual(updated, files);
  assert.deepEqual(files, snapshot);
  updated.forEach((file, index) => assert.notEqual(file, files[index]));
  return { files, updated };
}

test('初始批次提供 14 个完整文件对象和四阶段汇总', () => {
  const files = createMaterialParsingBatch();

  assert.equal(files.length, 14);
  assert.equal(new Set(files.map((file) => file.id)).size, 14);
  files.forEach((file) => {
    requiredFileFields.forEach((field) => assert.ok(Object.hasOwn(file, field), file.id + ' 缺少 ' + field));
    assert.equal(file.selectedDetail.size, file.size);
    assert.equal(file.selectedDetail.uploadedAt, file.uploadedAt);
    assert.equal(file.folderPath.startsWith('/上海分公司 Q1 审计资料/'), true);
  });
  assert.equal(getSelectedFile(files, 'legacy-contracts').selectedDetail.folderPath, '/财务资料/费用明细');

  assert.deepEqual(getParsingSummary(files), {
    total: 14,
    success: 8,
    parsing: 2,
    abnormal: 3,
    pending: 1
  });
  assert.deepEqual([...new Set(files.map((file) => file.parseStatus))].sort(), ['待处理', '解析中', '解析异常', '解析成功'].sort());
  assert.equal(files.some((file) => file.missingFields.length > 0), true);
});

test('解析批次保留上一步已上传资料的能力来源', () => {
  const files = createMaterialParsingBatch([
    { id: 'expense-source', name: '费用明细台账', ability: '费用审计', uploadStatus: '已上传' },
    { id: 'unused-source', name: '未上传资料', ability: '费用审计', uploadStatus: '未上传' }
  ]);
  const expenseFile = getSelectedFile(files, 'expense-ledger-q1');

  assert.deepEqual(expenseFile.sourceRequirements, [
    { id: 'expense-source', name: '费用明细台账', ability: '费用审计', uploadStatus: '已上传' }
  ]);
});

test('按 id 返回选中文件，未命中时返回 null', () => {
  const files = createMaterialParsingBatch();

  assert.equal(getSelectedFile(files, 'expense-ledger-q1')?.name, '费用明细台账_2025Q1.xlsx');
  assert.equal(getSelectedFile(files, 'not-found'), null);
});

test('失败文件重新解析时清除失败原因且不变异输入', () => {
  const { updated } = assertImmutableTransition((files) => retryParsingFile(files, 'invoice-list'));
  const retried = getSelectedFile(updated, 'invoice-list');

  assert.equal(retried.parseStatus, '解析中');
  assert.equal(retried.failureReason, '');
  assert.equal(retried.blocksSubmission, true);
  assert.deepEqual(retried.blockers, ['文件正在重新解析']);
});

test('替换文件更新名称并进入解析中且不变异输入', () => {
  const { updated } = assertImmutableTransition((files) => replaceParsingFile(files, 'invoice-list', '发票清单_修订.xlsx'));
  const replacement = getSelectedFile(updated, 'invoice-list');

  assert.equal(replacement.name, '发票清单_修订.xlsx');
  assert.equal(replacement.parseStatus, '解析中');
  assert.equal(replacement.failureReason, '');
  assert.equal(replacement.selectedDetail.name, '发票清单_修订.xlsx');
});

test('跳过阻断文件后解除该文件阻断且不变异输入', () => {
  const { updated } = assertImmutableTransition((files) => skipParsingFile(files, 'duplicate-policy'));
  const skipped = getSelectedFile(updated, 'duplicate-policy');

  assert.equal(skipped.parseStatus, '待处理');
  assert.equal(skipped.blocksSubmission, false);
  assert.deepEqual(skipped.blockers, []);
  assert.equal(skipped.visibleInTable, true);
});

test('补齐必填字段映射后更新匹配状态并解除字段阻断', () => {
  const { updated } = assertImmutableTransition((files) => mapParsingField(files, 'legacy-contracts', '金额(元)', '费用金额'));
  const mapped = getSelectedFile(updated, 'legacy-contracts');
  const mapping = mapped.mappings.find((item) => item.source === '金额(元)');

  assert.deepEqual(mapping, {
    source: '金额(元)',
    target: '费用金额',
    confidence: 100,
    status: '已匹配',
    required: true
  });
  assert.deepEqual(mapped.missingFields, []);
  assert.equal(mapped.parseStatus, '解析成功');
  assert.equal(mapped.metadataStatus, '完整');
  assert.equal(mapped.blocksSubmission, false);
  assert.deepEqual(mapped.blockers, []);
  assert.deepEqual(getParsingSummary(updated), {
    total: 14,
    success: 9,
    parsing: 2,
    abnormal: 2,
    pending: 1
  });
});

test('批量重新解析处理解析异常文件', () => {
  const { updated } = assertImmutableTransition(batchRetryParsing);

  assert.equal(getSelectedFile(updated, 'invoice-list').parseStatus, '解析中');
  assert.equal(getSelectedFile(updated, 'legacy-contracts').parseStatus, '解析中');
  assert.equal(getSelectedFile(updated, 'duplicate-policy').parseStatus, '解析中');
  assert.equal(getSelectedFile(updated, 'financial-statement').parseStatus, '解析成功');
});

test('批量跳过处理解析异常文件并回到待处理', () => {
  const { updated } = assertImmutableTransition(batchSkipParsing);

  assert.equal(getSelectedFile(updated, 'invoice-list').parseStatus, '待处理');
  assert.equal(getSelectedFile(updated, 'legacy-contracts').parseStatus, '待处理');
  assert.equal(getSelectedFile(updated, 'duplicate-policy').parseStatus, '待处理');
  assert.equal(getSelectedFile(updated, 'in-progress-workpapers').parseStatus, '解析中');
});

test('继续门禁由文件阻断状态派生', () => {
  const files = createMaterialParsingBatch();

  assert.equal(canContinueParsing(files), false);
  assert.equal(canContinueParsing(batchSkipParsing(files)), true);
});
