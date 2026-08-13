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
    ['overview', '任务概览'], ['materials', '输入资料'], ['analysis', '分析过程'],
    ['results', '生成结果'], ['outputs', '输出文件'], ['timeline', '任务时间线'],
    ['export-records', '导出记录'],
  ].map(([id, label]) => Object.freeze({ id, label, active: id === 'timeline' }))),
  materials: Object.freeze([
    { name: '内部制度汇编（2025Q1）.pdf', type: '制度文件', status: '已锁定', owner: '合规部', time: '2025-04-10 10:02' },
    { name: '外部监管法规清单.xlsx', type: '法规清单', status: '已锁定', owner: '审计管理员', time: '2025-04-10 10:05' },
    { name: '费用明细台账（2025Q1）.xlsx', type: '业务数据', status: '已锁定', owner: '财务部', time: '2025-04-10 10:08' },
    { name: '监督共享文件包.zip', type: '共享资料', status: '已锁定', owner: '监督办公室', time: '2025-04-10 10:12' },
  ]),
  analysis: Object.freeze([
    { phase: '资料解析', status: '已完成', owner: '系统', time: '2025-04-10 12:18', note: '全部输入资料完成解析' },
    { phase: '能力执行', status: '已完成', owner: '系统', time: '2025-04-24 14:10', note: '制度、费用、监督共享能力完成' },
    { phase: '人工确认', status: '已完成', owner: '审计员A', time: '2025-04-25 10:20', note: '异常与差异结果已确认' },
    { phase: '复核归档', status: '已归档', owner: '审计管理员', time: summary.archivedAt, note: '复核通过并生成归档包' },
  ]),
  recordTabs: Object.freeze([
    { id: 'all', label: '全部', count: 16 },
    { id: 'change', label: '修改', count: 5 },
    { id: 'review', label: '复核', count: 5 },
    { id: 'export', label: '导出', count: 6 },
  ]),
  operationRecords: Object.freeze([
    { id: 'REC-1', category: 'change', taskId: ARCHIVED_TASK_ID, taskName: '上海分公司Q1常规审计任务', taskType: '常规审计', organization: '上海分公司', period: '2025Q1', stage: '创建任务', status: '已完成', riskCount: '-', nextStep: '上传审计资料', creator: '审计管理员', updatedAt: '2025-04-10 09:15', action: '查看' },
    { id: 'REC-2', category: 'change', taskId: ARCHIVED_TASK_ID, taskName: '上海分公司Q1资料解析', taskType: '常规审计', organization: '上海分公司', period: '2025Q1', stage: '资料解析', status: '解析中', riskCount: '1', nextStep: '等待资料解析完成', creator: '系统', updatedAt: '2025-04-10 12:18', action: '查看' },
    { id: 'REC-3', category: 'change', taskId: ARCHIVED_TASK_ID, taskName: '制度差异清单', taskType: '制度比对', organization: '上海分公司', period: '2025Q1', stage: '人工确认', status: '已完成', riskCount: '12', nextStep: '保存确认版本', creator: '审计员A', updatedAt: '2025-04-25 10:20', action: '查看' },
    { id: 'REC-4', category: 'change', taskId: ARCHIVED_TASK_ID, taskName: '费用异常汇总', taskType: '费用审计', organization: '上海分公司', period: '2025Q1', stage: '保存版本', status: '已完成', riskCount: '6', nextStep: '提交复核', creator: '审计员A', updatedAt: '2025-04-25 10:25', action: '对比' },
    { id: 'REC-5', category: 'change', taskId: ARCHIVED_TASK_ID, taskName: '审计报告终稿', taskType: '报告生成', organization: '上海分公司', period: '2025Q1', stage: '报告修订', status: '已完成', riskCount: '0', nextStep: '复核报告内容', creator: '审计员A', updatedAt: '2025-04-27 16:20', action: '查看' },
    { id: 'REC-6', category: 'review', taskId: ARCHIVED_TASK_ID, taskName: '审计报告复核', taskType: '报告审核', organization: '审计部', period: '2025Q1', stage: '人工复核', status: '待复核', riskCount: '8', nextStep: '复核AI生成的问题清单', creator: '审计员A', updatedAt: '2025-04-27 16:30', action: '查看' },
    { id: 'REC-7', category: 'review', taskId: ARCHIVED_TASK_ID, taskName: '报告格式复核', taskType: '报告审核', organization: '审计部', period: '2025Q1', stage: '复核修订', status: '已完成', riskCount: '2', nextStep: '确认修订内容', creator: '审计员A', updatedAt: '2025-04-27 16:42', action: '查看' },
    { id: 'REC-8', category: 'review', taskId: ARCHIVED_TASK_ID, taskName: '引用依据复核', taskType: '依据复核', organization: '审计部', period: '2025Q1', stage: '依据核对', status: '已完成', riskCount: '-', nextStep: '确认引用链路', creator: '审计员A', updatedAt: '2025-04-27 16:45', action: '查看' },
    { id: 'REC-9', category: 'review', taskId: ARCHIVED_TASK_ID, taskName: '归档前复核', taskType: '归档复核', organization: '审计部', period: '2025Q1', stage: '复核通过', status: '已通过', riskCount: '0', nextStep: '允许归档', creator: '审计管理员', updatedAt: '2025-04-28 16:20', action: '查看' },
    { id: 'REC-10', category: 'review', taskId: ARCHIVED_TASK_ID, taskName: '任务归档确认', taskType: '归档复核', organization: '审计部', period: '2025Q1', stage: '归档确认', status: '已归档', riskCount: '-', nextStep: '生成归档包', creator: '审计管理员', updatedAt: summary.archivedAt, action: '查看' },
    { id: 'REC-11', category: 'export', taskId: ARCHIVED_TASK_ID, taskName: '上海分公司Q1审计报告.docx', taskType: 'Word报告', organization: '上海分公司', period: '2025Q1', stage: '导出文件', status: '已完成', riskCount: '-', nextStep: '已标识AI生成', creator: '审计管理员', updatedAt: '2025-04-28 16:31', action: '下载' },
    { id: 'REC-12', category: 'export', taskId: ARCHIVED_TASK_ID, taskName: '上海分公司Q1审计报告.pdf', taskType: 'PDF报告', organization: '上海分公司', period: '2025Q1', stage: '导出文件', status: '已完成', riskCount: '-', nextStep: '已标识AI生成', creator: '审计管理员', updatedAt: '2025-04-28 16:31', action: '下载' },
    { id: 'REC-13', category: 'export', taskId: ARCHIVED_TASK_ID, taskName: '制度差异清单.xlsx', taskType: 'Excel报表', organization: '上海分公司', period: '2025Q1', stage: '导出文件', status: '已完成', riskCount: '-', nextStep: '已标识AI生成', creator: '审计员A', updatedAt: '2025-04-28 16:32', action: '下载' },
    { id: 'REC-14', category: 'export', taskId: ARCHIVED_TASK_ID, taskName: '费用异常汇总.xlsx', taskType: 'Excel报表', organization: '上海分公司', period: '2025Q1', stage: '导出文件', status: '已完成', riskCount: '-', nextStep: '已标识AI生成', creator: '审计员A', updatedAt: '2025-04-28 16:32', action: '下载' },
    { id: 'REC-15', category: 'export', taskId: ARCHIVED_TASK_ID, taskName: '监督共享分析报告.docx', taskType: 'Word报告', organization: '上海分公司', period: '2025Q1', stage: '导出文件', status: '已完成', riskCount: '-', nextStep: '已标识AI生成', creator: '审计员A', updatedAt: '2025-04-28 16:33', action: '下载' },
    { id: 'REC-16', category: 'export', taskId: ARCHIVED_TASK_ID, taskName: '操作日志包.zip', taskType: '日志包', organization: '上海分公司', period: '2025Q1', stage: '导出归档', status: '已归档', riskCount: '-', nextStep: '归档完成', creator: '审计管理员', updatedAt: '2025-04-28 16:33', action: '下载' },
  ]),
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
