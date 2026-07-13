export const EXPENSE_RESULT_TABS = Object.freeze([
  Object.freeze({ id: 'over-budget', label: '超预算未审批' }),
  Object.freeze({ id: 'violation', label: '费用违规报销' }),
  Object.freeze({ id: 'suspected', label: '疑似不合规报销' }),
  Object.freeze({ id: 'summary', label: '异常汇总' }),
  Object.freeze({ id: 'remediation', label: '整改建议' })
]);

export const EXPENSE_MONITOR_TABS = Object.freeze([
  Object.freeze({ id: 'all', label: '全部异常' }),
  Object.freeze({ id: 'high-risk', label: '高风险' }),
  Object.freeze({ id: 'pending', label: '待确认' }),
  Object.freeze({ id: 'supplement', label: '待补充' }),
  Object.freeze({ id: 'confirmed', label: '已确认' }),
  Object.freeze({ id: 'excluded', label: '已排除' })
]);

const FILTER_KEYS = [
  'organization',
  'period',
  'expenseCategory',
  'type',
  'riskLevel',
  'department',
  'employee',
  'status',
  'dataSource'
];

const numericValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const sumBy = (rows, key) => rows.reduce((total, row) => total + numericValue(row[key]), 0);

const compareLabels = (left, right) => String(left).localeCompare(String(right), 'zh-CN');

const aggregate = (rows, labelKey, valueForRow) => {
  const totals = new Map();
  for (const row of rows) {
    const label = row[labelKey] ?? '';
    totals.set(label, (totals.get(label) ?? 0) + valueForRow(row));
  }
  return Array.from(totals, ([label, value]) => ({ label, value }));
};

const sortByValue = (items) => items.sort(
  (left, right) => right.value - left.value || compareLabels(left.label, right.label)
);

export function createExpenseFilters() {
  return {
    organization: '',
    period: '',
    expenseCategory: '',
    type: '',
    riskLevel: '',
    department: '',
    employee: '',
    status: '',
    dataSource: ''
  };
}

export function filterExpenseRows(rows, filters, tab) {
  return rows.filter((row) => {
    const matchesFilters = FILTER_KEYS.every((key) => {
      if (!filters[key]) return true;
      if (key === 'employee') {
        const keyword = String(filters[key]).trim();
        return !keyword || `${row.employee || ''}${row.employeeNo || ''}`.includes(keyword);
      }
      return row[key] === filters[key];
    });
    if (!matchesFilters) return false;
    if (tab === 'all') return true;
    if (tab === 'high-risk') return row.riskLevel === '高';
    if (tab === 'pending') return row.status === '待确认';
    if (tab === 'supplement') return row.status === '待补充';
    if (tab === 'confirmed') return row.status === '已确认';
    if (tab === 'excluded') return row.status === '已排除';
    if (tab === 'summary') return true;
    if (tab === 'remediation') return Boolean(row.remediation?.trim());
    return row.resultTab === tab;
  });
}

export function deriveExpenseTabCounts(rows) {
  return Object.fromEntries(EXPENSE_RESULT_TABS.map((tab) => [
    tab.id,
    filterExpenseRows(rows, createExpenseFilters(), tab.id).length
  ]));
}

export function deriveExpenseMetrics(rows) {
  const totalExpense = sumBy(rows, 'amount');
  const totalBudget = sumBy(rows, 'budgetAmount');

  return {
    totalExpense,
    budgetUsageRate: totalBudget ? Math.round((totalExpense / totalBudget) * 10000) / 100 : 0,
    anomalyAmount: totalExpense,
    anomalyCount: rows.length,
    highRiskCount: rows.filter((row) => row.riskLevel === '高').length,
    pendingCount: rows.filter((row) => row.status === '待确认').length,
    pendingAmount: sumBy(rows.filter((row) => row.status === '待确认'), 'amount'),
    supplementCount: rows.filter((row) => row.status === '待补充').length,
    supplementAmount: sumBy(rows.filter((row) => row.status === '待补充'), 'amount'),
    confirmedCount: rows.filter((row) => row.status === '已确认').length,
    confirmedAmount: sumBy(rows.filter((row) => row.status === '已确认'), 'amount'),
    excludedCount: rows.filter((row) => row.status === '已排除').length,
    excludedAmount: sumBy(rows.filter((row) => row.status === '已排除'), 'amount'),
    highRiskAmount: sumBy(rows.filter((row) => row.riskLevel === '高'), 'amount')
  };
}

export function deriveExpenseCharts(rows) {
  const trendByPeriod = new Map();
  for (const row of rows) {
    const label = row.period ?? '';
    const current = trendByPeriod.get(label) ?? { label, actual: 0, budget: 0 };
    current.actual += numericValue(row.amount);
    current.budget += numericValue(row.budgetAmount);
    trendByPeriod.set(label, current);
  }

  return {
    trend: Array.from(trendByPeriod.values()).sort((left, right) => compareLabels(left.label, right.label)),
    categoryStructure: sortByValue(aggregate(rows, 'expenseCategory', (row) => numericValue(row.amount))),
    employeeRanking: sortByValue(aggregate(rows, 'employee', (row) => numericValue(row.amount))).slice(0, 10),
    anomalyDistribution: sortByValue(aggregate(rows, 'type', () => 1)),
    monitorTrend: Array.from(trendByPeriod.values()).sort((left, right) => compareLabels(left.label, right.label)).map((item) => ({
      label: item.label,
      count: rows.filter((row) => (row.period ?? '') === item.label).length,
      amount: item.actual,
      yoyAmount: Math.round(item.actual * 0.82)
    })),
    departmentHeatmap: Array.from(new Set(rows.map((row) => row.department).filter(Boolean))).map((department) => ({
      department,
      low: rows.filter((row) => row.department === department && row.riskLevel === '低').length,
      medium: rows.filter((row) => row.department === department && row.riskLevel === '中').length,
      high: rows.filter((row) => row.department === department && row.riskLevel === '高').length
    })),
    ruleRanking: sortByValue(aggregate(rows, 'ruleName', () => 1)).slice(0, 10)
  };
}

export function deriveExpenseMonitorTabCounts(rows) {
  return Object.fromEntries(EXPENSE_MONITOR_TABS.map((tab) => [
    tab.id,
    filterExpenseRows(rows, createExpenseFilters(), tab.id).length
  ]));
}

export function paginateExpenseRows(rows, page, pageSize) {
  const total = rows.length;
  const totalPages = Math.ceil(total / pageSize);
  const normalizedPage = totalPages === 0
    ? 1
    : Math.min(Math.max(Math.trunc(page) || 1, 1), totalPages);
  const start = (normalizedPage - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    total,
    totalPages,
    page: normalizedPage
  };
}

const failedDecision = (error, row) => ({ ok: false, error, row });

export function applyExpenseDecision(row, action, payload = {}) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return failedDecision('费用异常记录无效', row);
  }
  if (!['confirm', 'exclude', 'supplement'].includes(action)) {
    return failedDecision('费用异常处理动作无效', row);
  }
  if (action === 'supplement') {
    const note = typeof payload.note === 'string' ? payload.note.trim() : '';
    if (!note) return failedDecision('补充说明不能为空', row);
    const previousNote = typeof row.supplementNote === 'string' ? row.supplementNote.trim() : '';
    return {
      ok: true,
      row: { ...row, supplementNote: previousNote ? `${previousNote}\n${note}` : note }
    };
  }

  if (row.status === '已确认' || row.status === '已排除') {
    return failedDecision('终态记录不可再次处理', row);
  }

  if (action === 'exclude') {
    const reason = typeof payload.reason === 'string' ? payload.reason.trim() : '';
    if (!reason) return failedDecision('排除原因不能为空', row);
    return { ok: true, row: { ...row, status: '已排除', exclusionReason: reason } };
  }

  if (row.status === '待补充' && !row.supplementNote?.trim()) {
    return failedDecision('请先补充说明再确认', row);
  }
  return { ok: true, row: { ...row, status: '已确认' } };
}
