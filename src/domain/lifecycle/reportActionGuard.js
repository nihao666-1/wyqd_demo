import { getReportActionDisabledReason } from '../stateMachines/reportState.js';

export function guardReportAction(report, action) {
  const reason = getReportActionDisabledReason(report, action);
  const messages = {
    DRAFT_NOT_GENERATED: '报告草稿尚未生成，不能执行该操作。',
    DRAFT_NOT_CONFIRMED: '报告草稿尚未确认，不能锁定。',
    REPORT_NOT_LOCKED: '报告尚未锁定，不能导出、回传或比对。'
  };
  return {
    allowed: !reason,
    reason,
    message: messages[reason] || ''
  };
}
