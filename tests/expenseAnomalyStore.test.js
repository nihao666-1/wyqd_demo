import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { expenseAnomalies, expenseAuditContext, expenseEvidenceChains, expenseOutputs } from '../src/mock/index.js';
import { mergePersistedExpenseAnomalies, store } from '../src/store/index.js';

let snapshot;
const clone = (value) => JSON.parse(JSON.stringify(value));

beforeEach(() => {
  snapshot = {
    anomalies: clone(store.db.expenseAnomalies),
    logs: clone(store.db.operationLogs),
    exports: clone(store.db.exportRecords),
    notice: store.notice
  };
  store.db.expenseAnomalies = clone(expenseAnomalies);
});

afterEach(() => {
  store.db.expenseAnomalies = snapshot.anomalies;
  store.db.operationLogs = snapshot.logs;
  store.db.exportRecords = snapshot.exports;
  store.notice = snapshot.notice;
});

test('费用审计 mock 提供筛选上下文输出记录和完整明细证据', () => {
  assert.equal(expenseAuditContext.organization, '上海分公司');
  assert.equal(expenseAuditContext.period, '2025Q1（2025-01-01 ～ 2025-03-31）');
  assert.equal(expenseOutputs.length, 5);
  assert.ok(expenseAnomalies.length >= 8);

  const required = ['anomalyId', 'resultTab', 'organization', 'period', 'expenseCategory', 'department', 'employee', 'dataSource', 'amount', 'budgetAmount', 'riskLevel', 'status', 'remediation', 'exclusionReason', 'supplementNote'];
  for (const row of expenseAnomalies) {
    for (const key of required) {
      assert.ok(Object.hasOwn(row, key), `${row.anomalyId} 缺少 ${key}`);
      assert.notEqual(row[key], undefined, `${row.anomalyId}.${key} 不能为 undefined`);
    }
    assert.match(row.occurredAt, /^2025-0[1-3]-\d{2}$/, `${row.anomalyId} 发生日期必须属于 2025Q1`);
    assert.ok(row.evidence.every((item) => !item.includes('2026')), `${row.anomalyId} 的证据年份必须与 2025Q1 一致`);
  }
  assert.equal(expenseAnomalies.find((row) => row.anomalyId === 'FY-202504280002').expenseCategory, '业务招待费');
  assert.deepEqual(
    expenseEvidenceChains.map((item) => item.anomalyId).sort(),
    expenseAnomalies.map((item) => item.anomalyId).sort()
  );
  assert.equal(new Set(expenseEvidenceChains.map((item) => item.anomalyId)).size, expenseEvidenceChains.length);
  for (const evidence of expenseEvidenceChains) {
    assert.ok(evidence.basicInfo.trim());
    assert.ok(evidence.ruleHit.trim());
    assert.ok(evidence.vouchers.length > 0);
    assert.ok(evidence.approvalChain.length > 0);
    assert.ok(evidence.similarRecords.length > 0);
  }
});

test('旧持久化异常补齐新字段并保留状态说明和额外记录', () => {
  const persistedRows = [
    { anomalyId: 'FY-202504280002', status: '已确认', supplementNote: '旧说明' },
    { anomalyId: 'AN-OLD', status: '已排除', exclusionReason: '历史记录' }
  ];
  const merged = mergePersistedExpenseAnomalies(expenseAnomalies, persistedRows);

  const normalized = merged.find((row) => row.anomalyId === 'FY-202504280002');
  assert.equal(normalized.status, '已确认');
  assert.equal(normalized.supplementNote, '旧说明');
  assert.equal(normalized.organization, '上海分公司');
  assert.equal(merged.find((row) => row.anomalyId === 'AN-OLD').exclusionReason, '历史记录');
});

test('确认异常遵守状态门槛并写入操作日志', () => {
  const row = store.db.expenseAnomalies.find((item) => item.status === '待确认');
  const before = store.db.operationLogs.length;
  const result = store.decideExpenseAnomaly(row.anomalyId, 'confirm');

  assert.equal(result.ok, true);
  assert.equal(store.db.expenseAnomalies.find((item) => item.anomalyId === row.anomalyId).status, '已确认');
  assert.equal(store.db.operationLogs.length, before + 1);
  assert.equal(store.db.operationLogs[0].targetId, row.anomalyId);
  assert.equal(store.db.operationLogs[0].action, '确认异常');
  assert.match(store.notice, /已确认/);
});

test('排除异常必须填写原因且失败不写日志', () => {
  const row = store.db.expenseAnomalies.find((item) => item.status === '待确认');
  const before = store.db.operationLogs.length;
  const failed = store.decideExpenseAnomaly(row.anomalyId, 'exclude', { reason: '   ' });

  assert.equal(failed.ok, false);
  assert.equal(store.db.operationLogs.length, before);

  const passed = store.decideExpenseAnomaly(row.anomalyId, 'exclude', { reason: '审批材料已补齐，规则误命中' });
  assert.equal(passed.ok, true);
  assert.equal(passed.row.exclusionReason, '审批材料已补齐，规则误命中');
  assert.equal(store.db.operationLogs[0].targetId, row.anomalyId);
  assert.equal(store.db.operationLogs[0].action, '排除异常');
});

test('补充说明与整改建议持久化在对应异常并写日志', () => {
  const row = store.db.expenseAnomalies.find((item) => item.status === '待补充');
  assert.equal(store.saveExpenseSupplement(row.anomalyId, '已上传补充审批截图').ok, true);
  assert.match(store.db.expenseAnomalies.find((item) => item.anomalyId === row.anomalyId).supplementNote, /补充审批截图/);
  assert.equal(store.db.operationLogs[0].action, '补充说明');
  assert.equal(store.db.operationLogs[0].targetId, row.anomalyId);

  assert.equal(store.saveExpenseRemediation(row.anomalyId, '补齐审批后纳入月度复核。').ok, true);
  assert.equal(store.db.expenseAnomalies.find((item) => item.anomalyId === row.anomalyId).remediation, '补齐审批后纳入月度复核。');
  assert.ok(store.db.operationLogs.some((log) => log.targetId === row.anomalyId && log.action === '保存整改建议'));
});

test('未知异常编号不会修改数据或伪造成功日志', () => {
  const beforeRows = clone(store.db.expenseAnomalies);
  const beforeLogs = store.db.operationLogs.length;
  const result = store.decideExpenseAnomaly('AN-NOT-FOUND', 'confirm');

  assert.equal(result.ok, false);
  assert.deepEqual(store.db.expenseAnomalies, beforeRows);
  assert.equal(store.db.operationLogs.length, beforeLogs);

  assert.equal(store.saveExpenseSupplement('AN-NOT-FOUND', '说明').ok, false);
  assert.equal(store.saveExpenseRemediation('AN-NOT-FOUND', '整改').ok, false);
  assert.deepEqual(store.db.expenseAnomalies, beforeRows);
  assert.equal(store.db.operationLogs.length, beforeLogs);
});

test('导出成功后新增费用异常 Excel 记录', () => {
  const before = store.db.exportRecords.length;
  const result = store.recordExpenseExport('上海分公司费用异常汇总_2025Q1.xls', 8);

  assert.equal(result.ok, true);
  assert.equal(store.db.exportRecords.length, before + 1);
  assert.deepEqual(store.db.exportRecords[0], {
    exportId: result.record.exportId,
    objectType: '费用异常汇总',
    objectName: '上海分公司费用异常汇总_2025Q1.xls',
    format: 'Excel',
    exportedBy: store.db.currentUser.name,
    exportedAt: result.record.exportedAt,
    rowCount: 8
  });
});
