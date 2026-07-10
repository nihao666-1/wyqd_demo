export const taskStates = {
  DRAFT: '草稿',
  MATERIAL: '待资料',
  PARSE_PENDING: '待解析',
  PARSING: '解析中',
  GENERATE_PENDING: '待生成',
  GENERATING: '生成中',
  CONFIRM_PENDING: '待确认',
  CONFIRMED: '已确认',
  LOCKED: '已锁定',
  ARCHIVED: '已归档',
  FAILED: '失败'
};

const transitions = {
  [taskStates.DRAFT]: [taskStates.MATERIAL],
  [taskStates.MATERIAL]: [taskStates.PARSE_PENDING],
  [taskStates.PARSE_PENDING]: [taskStates.PARSING],
  [taskStates.PARSING]: [taskStates.GENERATE_PENDING, taskStates.FAILED],
  [taskStates.GENERATE_PENDING]: [taskStates.GENERATING],
  [taskStates.GENERATING]: [taskStates.CONFIRM_PENDING, taskStates.FAILED],
  [taskStates.CONFIRM_PENDING]: [taskStates.CONFIRMED, taskStates.GENERATE_PENDING],
  [taskStates.CONFIRMED]: [taskStates.LOCKED, taskStates.GENERATE_PENDING],
  [taskStates.LOCKED]: [taskStates.ARCHIVED, taskStates.CONFIRM_PENDING],
  [taskStates.FAILED]: [taskStates.MATERIAL, taskStates.GENERATE_PENDING]
};

export function canTransitionTask(from, to) {
  return (transitions[from] || []).includes(to);
}

export function getTaskDisabledReason(task, action) {
  if (action === 'generate' && task.status !== taskStates.GENERATE_PENDING) return 'SOURCE_NOT_PRECHECKED';
  if (action === 'confirm' && task.status !== taskStates.CONFIRM_PENDING) return 'DRAFT_NOT_GENERATED';
  if (action === 'lock' && task.status !== taskStates.CONFIRMED) return 'DRAFT_NOT_CONFIRMED';
  if (action === 'export' && task.status !== taskStates.LOCKED) return 'REPORT_NOT_LOCKED';
  return '';
}
