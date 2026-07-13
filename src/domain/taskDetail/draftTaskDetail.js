export const DRAFT_TASK_ID = 'TASK-20250428001';

export const draftTaskDetail = Object.freeze({
  id: DRAFT_TASK_ID,
  title: '上海分公司 Q1 常规审计任务',
  organization: '上海分公司',
  period: '2025Q1',
  type: '常规审计',
  owner: '张三',
  status: '草稿',
  version: '--',
  createdAt: '2025-04-28 09:15:32',
  materials: Object.freeze([]),
  tabs: Object.freeze([
    ['overview', '任务概览'], ['materials', '输入资料'], ['analysis', '分析过程'],
    ['results', '生成结果'], ['agent', '智能体会话'], ['reports', '报告与附件'],
    ['changes', '修改记录'], ['reviews', '复核记录'], ['versions', '版本记录'],
    ['exports', '导出记录'], ['logs', '操作留痕']
  ].map(([id, label]) => Object.freeze({ id, label }))),
  requiredMaterials: Object.freeze([
    { name: '财务报表（2025Q1）', status: '未上传' },
    { name: '费用明细台账（2025Q1）', status: '未上传' },
    { name: '相关制度文件（最新版本）', status: '未上传' }
  ]),
  outputs: Object.freeze([
    { name: '制度差异分析报告', status: '待生成' },
    { name: '费用审计分析报告', status: '待生成' },
    { name: '审计报告（草稿）', status: '待生成' }
  ]),
  capabilities: Object.freeze([
    { id: 'policy-compare', name: '制度比对', tone: 'green', description: '对比内外部制度差异，生成差异清单与风险提示。', output: '差异清单（Excel）' },
    { id: 'expense-audit', name: '费用审计', tone: 'orange', description: '识别费用异常交易，生成异常汇总与整改建议。', output: '异常汇总报告（Excel）' },
    { id: 'report-generate', name: '报告生成', tone: 'blue', description: '基于分析结果生成审计报告草稿与附件。', output: '审计报告（Word/PDF）' }
  ]),
  timeline: Object.freeze(['创建任务', '上传资料', '解析资料', '生成分析', '人工确认', '保存版本', '导出归档']
    .map((label, index) => Object.freeze({ label, complete: index === 0, state: index === 0 ? '已完成' : '待开始', occurredAt: index === 0 ? '2025-04-28 09:15:32' : '' }))),
  logs: Object.freeze([{ time: '2025-04-28 09:15:32', operator: '审计管理员', action: '创建任务', result: '成功' }])
});

export function resolveTaskDetailMode({ explicitState = '', statusKey = '', tab = '' } = {}) {
  if (['draft', 'generating', 'pending', 'archived'].includes(explicitState)) return explicitState;
  if (statusKey === 'archived') return 'archived';
  if (statusKey === 'generating') return 'generating';
  if (['confirming', 'reviewing', 'completed'].includes(statusKey) || ['results', 'reviews'].includes(tab)) return 'pending';
  return 'draft';
}
