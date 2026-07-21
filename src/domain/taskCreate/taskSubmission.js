function quarterFromDate(value) {
  const month = Number(String(value || '').slice(5, 7));
  if (!Number.isFinite(month) || month < 1 || month > 12) return 'Q1';
  return `Q${Math.floor((month - 1) / 3) + 1}`;
}

export const submittedTaskProgressSteps = [12, 30, 55, 78, 100];

const submittedTaskPhaseMap = {
  30: '资料解析',
  55: '能力执行',
  78: '风险提取',
  100: '人工确认'
};

export function buildSubmittedTaskRow(payload = {}, { now = '', createdCount = 0, currentUser = '审计管理员', date = new Date() } = {}) {
  const dateKey = date.toISOString().slice(0, 10).replace(/-/g, '');
  const sequence = String(createdCount + 1).padStart(3, '0');
  const taskId = `TASK-${dateKey}${sequence}`;
  const year = String(payload.auditStart || '').slice(0, 4) || '2025';

  return {
    id: taskId,
    name: payload.taskName?.trim() || `${payload.auditedUnit || '上海分公司'}审计任务`,
    organization: payload.auditedUnit || '上海分公司',
    period: `${year}${quarterFromDate(payload.auditStart)}`,
    type: payload.taskType || '常规审计',
    phase: '生成分析',
    status: '生成中',
    statusKey: 'generating',
    owner: payload.owner || currentUser,
    creator: currentUser,
    updatedAt: now,
    progress: 12,
    riskCount: 0,
    action: '继续执行',
    source: 'created'
  };
}

export function advanceSubmittedTaskRow(row = {}, { now = '' } = {}) {
  if (row.source !== 'created' || row.statusKey !== 'generating') return row;

  const currentProgress = Number(row.progress) || 0;
  const nextProgress = submittedTaskProgressSteps.find((step) => step > currentProgress) || 100;
  const isComplete = nextProgress >= 100;

  return {
    ...row,
    phase: submittedTaskPhaseMap[nextProgress] || row.phase,
    status: isComplete ? '待确认' : '生成中',
    statusKey: isComplete ? 'confirming' : 'generating',
    updatedAt: now || row.updatedAt,
    progress: nextProgress,
    action: isComplete ? '处理' : '继续执行'
  };
}
