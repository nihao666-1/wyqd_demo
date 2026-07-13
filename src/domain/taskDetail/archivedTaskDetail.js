export const ARCHIVED_TASK_ID = 'TASK-20250428001';

export const archivedAllowedActions = Object.freeze([
  'view-report',
  'download-archive',
  'copy-task',
  'view-reference',
  'download-file',
  'export-log',
]);

const summary = Object.freeze({
  finalVersion: 'V1.2',
  archivedAt: '2025-04-28 16:30',
  reviewStatus: '已通过',
  exportCount: 6,
});

export const archivedTaskDetail = Object.freeze({
  id: ARCHIVED_TASK_ID,
  title: '上海分公司 Q1 常规审计任务',
  summary,
  metadata: Object.freeze([
    { label: '任务编号', value: ARCHIVED_TASK_ID, className: 'task-id' },
    { label: '任务类型', value: '常规审计' },
    { label: '被审计单位', value: '上海分公司' },
    { label: '审计期间', value: '2025Q1（2025-01-01 ~ 2025-03-31）', className: 'period' },
    { label: '负责人', value: '审计管理员' },
    { label: '创建时间', value: '2025-04-10 09:15:32' },
    { label: '归档时间', value: summary.archivedAt },
    { label: '最终版本', value: summary.finalVersion },
    { label: '复核状态', value: summary.reviewStatus, tone: 'success' },
    { label: '导出文件', value: `${summary.exportCount} 份` },
  ]),
  tabs: Object.freeze([
    '任务概览', '输入资料', '分析过程', '生成结果', '智能体会话', '报告与附件',
    '修改记录', '复核记录', '版本记录', '导出记录', '操作留痕',
  ].map((label) => Object.freeze({ label, active: label === '版本记录' }))),
  outcomes: Object.freeze([
    { title: '最终报告', count: 1, unit: '份', format: 'Word / PDF', icon: 'document', tone: 'blue' },
    { title: '审计规范', count: 1, unit: '份', format: 'Excel', icon: 'sheet', tone: 'green' },
    { title: '制度差异清单', count: 1, unit: '份', format: 'Excel', icon: 'list', tone: 'orange' },
    { title: '费用异常汇总', count: 1, unit: '份', format: 'Excel', icon: 'currency', tone: 'blue' },
    { title: '监察共享报告', count: 1, unit: '份', format: 'Word', icon: 'folder', tone: 'green' },
    { title: '审核问题清单', count: 1, unit: '份', format: 'Excel', icon: 'review', tone: 'purple' },
  ]),
  versions: Object.freeze([
    { version: 'V0.1', objectType: '任务', objectName: '任务创建', creator: '审计管理员', createdAt: '2025-04-10 09:15', change: '创建审计任务并提交', status: '已完成' },
    { version: 'V0.9', objectType: '结果', objectName: '生成结果', creator: '系统', createdAt: '2025-04-24 14:10', change: '模型生成分析结果', status: '已完成' },
    { version: 'V1.0', objectType: '结果', objectName: '人工确认', creator: '审计员A', createdAt: '2025-04-25 10:20', change: '确认异常与差异', status: '已完成' },
    { version: 'V1.1', objectType: '报告', objectName: '复核修订', creator: '审计员A', createdAt: '2025-04-27 16:48', change: '复核修订报告内容', status: '已完成' },
    { version: summary.finalVersion, objectType: '归档', objectName: '归档版本', creator: '审计管理员', createdAt: summary.archivedAt, change: '通过复核并归档', status: '已归档', final: true },
  ]),
  exports: Object.freeze([
    { file: '上海分公司Q1审计报告.docx', type: 'Word报告', version: summary.finalVersion, exporter: '审计管理员', exportedAt: '2025-04-28 16:31', aiLabel: '已标识' },
    { file: '上海分公司Q1审计报告.pdf', type: 'PDF报告', version: summary.finalVersion, exporter: '审计管理员', exportedAt: '2025-04-28 16:31', aiLabel: '已标识' },
    { file: '制度差异清单.xlsx', type: 'Excel报表', version: summary.finalVersion, exporter: '审计员A', exportedAt: '2025-04-28 16:32', aiLabel: '已标识' },
    { file: '费用异常汇总.xlsx', type: 'Excel报表', version: summary.finalVersion, exporter: '审计员A', exportedAt: '2025-04-28 16:32', aiLabel: '已标识' },
    { file: '监察共享分析报告.docx', type: 'Word报告', version: summary.finalVersion, exporter: '审计员A', exportedAt: '2025-04-28 16:33', aiLabel: '已标识' },
    { file: '操作日志包.zip', type: '日志包', version: summary.finalVersion, exporter: '审计管理员', exportedAt: '2025-04-28 16:33', aiLabel: '已标识' },
  ]),
  reviews: Object.freeze([
    {
      reviewer: '审计员A',
      reviewedAt: '2025-04-27 16:48',
      opinion: '已对报告内容、格式及引用依据进行全面复核，符合审计规范和公司要求。',
      conclusion: '通过',
      note: '允许归档并导出。',
    },
  ]),
  timeline: Object.freeze([
    { label: '创建任务', occurredAt: '2025-04-10 09:15' },
    { label: '上传资料', occurredAt: '2025-04-10 10:02' },
    { label: '解析成功', occurredAt: '2025-04-10 12:18' },
    { label: '生成分析', occurredAt: '2025-04-24 14:10' },
    { label: '人工确认', occurredAt: '2025-04-25 10:20' },
    { label: '保存版本', occurredAt: '2025-04-25 10:25' },
    { label: '提交复核', occurredAt: '2025-04-27 16:48' },
    { label: '导出归档', occurredAt: summary.archivedAt, archive: true },
  ]),
  relations: Object.freeze([
    { title: '关联任务', text: '上海分公司 Q1 常规审计任务', status: '已归档' },
    { title: '引用结果统计', text: '制度条款 236 条 / 费用异常 87 条 / 共享文件 384 份' },
    { title: '被引用情况', text: '报告引用 3 次 / 其他任务引用 1 次', link: true },
  ]),
  sidebar: Object.freeze({
    version: summary.finalVersion,
    archivedAt: summary.archivedAt,
    archivedBy: '审计管理员',
    note: '复核通过，归档留存。',
    relatedFileCount: 18,
    fileGroups: Object.freeze([
      { label: '制度文件', count: 6 },
      { label: '费用数据', count: 4 },
      { label: '监察共享文件', count: 5 },
      { label: '报告与附件', count: 3 },
    ]),
    references: Object.freeze([
      { label: '报告引用', value: '3 次' },
      { label: '任务引用', value: '1 次' },
    ]),
    permissions: Object.freeze([
      '审计中心 / 合规法务部（可查看）',
      '其他部门（受限）',
    ]),
    downloads: Object.freeze([
      { time: '04-29 09:16', user: '审计员A', file: 'Word报告', result: '成功' },
      { time: '04-29 09:15', user: '审计员A', file: 'PDF报告', result: '成功' },
      { time: '04-28 16:33', user: '系统', file: '日志包', result: '成功' },
    ]),
  }),
});

export function isArchivedTask(task) {
  return task?.id === ARCHIVED_TASK_ID && task.statusKey === 'archived';
}

export function isArchivedReadAction(label) {
  return /^(查看|下载|复制|导出|对比)/.test(String(label || ''));
}
