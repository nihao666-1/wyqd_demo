import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXPENSE_MONITOR_TABS,
  EXPENSE_RESULT_TABS,
  applyExpenseDecision,
  createExpenseFilters,
  deriveExpenseCharts,
  deriveExpenseMetrics,
  deriveExpenseMonitorTabCounts,
  filterExpenseRows,
  paginateExpenseRows
} from '../src/domain/expense/expenseAnomalyState.js';

const rows = [
  {
    anomalyId: 'A-1', resultTab: 'over-budget', organization: '总部', period: '2026-01',
    expenseCategory: '差旅费', dataSource: '报销系统',
    type: '超预算未审批', ruleName: '超预算未审批规则', department: '审计部', employee: '张三', employeeNo: '1001',
    amount: 120, budgetAmount: 100, riskLevel: '高', status: '待确认', remediation: '补充审批',
    exclusionReason: '', supplementNote: ''
  },
  {
    anomalyId: 'A-2', resultTab: 'violation', organization: '总部', period: '2026-01',
    expenseCategory: '招待费', dataSource: '报销系统',
    type: '费用违规报销', ruleName: '费用报销管理办法规则', department: '财务部', employee: '李四', employeeNo: '1002',
    amount: 80, budgetAmount: 100, riskLevel: '中', status: '已确认', remediation: '',
    exclusionReason: '', supplementNote: ''
  },
  {
    anomalyId: 'A-3', resultTab: 'suspected', organization: '分公司', period: '2026-02',
    expenseCategory: '差旅费', dataSource: '发票系统',
    type: '疑似不合规报销', ruleName: '审批流程规则', department: '审计部', employee: '张三', employeeNo: '1001',
    amount: 300, budgetAmount: 200, riskLevel: '高', status: '待补充', remediation: '核验行程',
    exclusionReason: '', supplementNote: ''
  }
];

test('保留历史结果页签并新增监控页签', () => {
  assert.equal(EXPENSE_RESULT_TABS.length, 5);
  assert.deepEqual(EXPENSE_MONITOR_TABS.map(({ id, label }) => ({ id, label })), [
    { id: 'all', label: '全部异常' },
    { id: 'high-risk', label: '高风险' },
    { id: 'pending', label: '待确认' },
    { id: 'supplement', label: '待补充' },
    { id: 'confirmed', label: '已确认' },
    { id: 'excluded', label: '已排除' }
  ]);
});

test('默认筛选兼容总览页六筛选和监控页筛选', () => {
  const first = createExpenseFilters();
  const second = createExpenseFilters();
  assert.deepEqual(first, {
    organization: '', period: '', expenseCategory: '', type: '', riskLevel: '', department: '', employee: '', status: '', dataSource: ''
  });
  assert.notEqual(first, second);
});

test('费用行同时满足筛选条件和监控页签条件', () => {
  assert.deepEqual(filterExpenseRows(rows, { ...createExpenseFilters(), organization: '总部' }, 'all').map((row) => row.anomalyId), ['A-1', 'A-2']);
  assert.deepEqual(filterExpenseRows(rows, { ...createExpenseFilters(), employee: '1001' }, 'high-risk').map((row) => row.anomalyId), ['A-1', 'A-3']);
  assert.deepEqual(filterExpenseRows(rows, createExpenseFilters(), 'supplement').map((row) => row.anomalyId), ['A-3']);
  assert.deepEqual(filterExpenseRows(rows, createExpenseFilters(), 'confirmed').map((row) => row.anomalyId), ['A-2']);
});

test('监控页签数量从同一分析范围派生', () => {
  const analysisRows = filterExpenseRows(rows, { ...createExpenseFilters(), organization: '总部' }, 'all');
  assert.deepEqual(deriveExpenseMonitorTabCounts(analysisRows), {
    all: 2,
    'high-risk': 1,
    pending: 1,
    supplement: 0,
    confirmed: 1,
    excluded: 0
  });
});

test('指标同时包含监控卡片和兼容汇总字段', () => {
  assert.deepEqual(deriveExpenseMetrics(rows), {
    totalExpense: 500,
    budgetUsageRate: 125,
    anomalyAmount: 500,
    anomalyCount: 3,
    highRiskCount: 2,
    pendingCount: 1,
    pendingAmount: 120,
    supplementCount: 1,
    supplementAmount: 300,
    confirmedCount: 1,
    confirmedAmount: 80,
    excludedCount: 0,
    excludedAmount: 0,
    highRiskAmount: 420
  });
});

test('图表派生监控趋势热力类型占比和规则排行', () => {
  const charts = deriveExpenseCharts(rows);
  assert.deepEqual(charts.trend, [
    { label: '2026-01', actual: 200, budget: 200 },
    { label: '2026-02', actual: 300, budget: 200 }
  ]);
  assert.deepEqual(charts.categoryStructure, [
    { label: '差旅费', value: 420 },
    { label: '招待费', value: 80 }
  ]);
  assert.deepEqual(charts.employeeRanking, [
    { label: '张三', value: 420 },
    { label: '李四', value: 80 }
  ]);
  assert.deepEqual(charts.monitorTrend, [
    { label: '2026-01', count: 2, amount: 200, yoyAmount: 164 },
    { label: '2026-02', count: 1, amount: 300, yoyAmount: 246 }
  ]);
  assert.deepEqual(charts.departmentHeatmap, [
    { department: '审计部', low: 0, medium: 0, high: 2 },
    { department: '财务部', low: 0, medium: 1, high: 0 }
  ]);
  assert.deepEqual(charts.anomalyDistribution, [
    { label: '超预算未审批', value: 1 },
    { label: '费用违规报销', value: 1 },
    { label: '疑似不合规报销', value: 1 }
  ]);
  assert.deepEqual(charts.ruleRanking, [
    { label: '超预算未审批规则', value: 1 },
    { label: '费用报销管理办法规则', value: 1 },
    { label: '审批流程规则', value: 1 }
  ]);
  assert.deepEqual({
    monitorTrend: charts.monitorTrend,
    departmentHeatmap: charts.departmentHeatmap
  }, {
    monitorTrend: [
      { label: '2026-01', count: 2, amount: 200, yoyAmount: 164 },
      { label: '2026-02', count: 1, amount: 300, yoyAmount: 246 }
    ],
    departmentHeatmap: [
      { department: '审计部', low: 0, medium: 0, high: 2 },
      { department: '财务部', low: 0, medium: 1, high: 0 }
    ]
  });
});

test('分页返回边界内页码并为空结果固定第一页', () => {
  assert.deepEqual(paginateExpenseRows(rows, 99, 2), {
    rows: [rows[2]], total: 3, totalPages: 2, page: 2
  });
  assert.deepEqual(paginateExpenseRows([], 4, 2), {
    rows: [], total: 0, totalPages: 0, page: 1
  });
});

test('异常决策规则保持原有状态门槛', () => {
  const input = rows[0];
  assert.equal(applyExpenseDecision(input, 'exclude', { reason: '   ' }).ok, false);
  assert.equal(applyExpenseDecision({ ...rows[2], supplementNote: '' }, 'confirm', {}).ok, false);
  assert.equal(applyExpenseDecision({ ...rows[2], supplementNote: '已补充' }, 'confirm', {}).row.status, '已确认');
  assert.equal(applyExpenseDecision({ ...rows[0], status: '已排除' }, 'confirm', {}).ok, false);
});
