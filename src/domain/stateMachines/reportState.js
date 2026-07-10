export const reportStates = {
  NOT_GENERATED: '未生成',
  SOURCE_SELECTING: '来源选择中',
  GAP_PENDING: '待补充',
  GENERATING: '生成中',
  DRAFT_PENDING: '待确认',
  CONFIRMED: '已确认',
  LOCKED: '已锁定',
  RETURNED: '已回传',
  DIFFED: '已比对',
  ARCHIVED: '已归档'
};

export function getReportActionDisabledReason(report, action) {
  if (action === 'preview' && report.status === reportStates.NOT_GENERATED) return 'DRAFT_NOT_GENERATED';
  if (action === 'confirm' && report.status !== reportStates.DRAFT_PENDING) return 'DRAFT_NOT_GENERATED';
  if (action === 'lock' && report.status !== reportStates.CONFIRMED) return 'DRAFT_NOT_CONFIRMED';
  if (['export', 'callback'].includes(action) && report.status !== reportStates.LOCKED) return 'REPORT_NOT_LOCKED';
  if (action === 'diff' && report.status !== reportStates.RETURNED) return 'REPORT_NOT_LOCKED';
  return '';
}
