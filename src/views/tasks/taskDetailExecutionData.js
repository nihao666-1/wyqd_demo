import { taskRows } from './taskCenterData.js';

export const taskDetailExecutionSnapshot = {
  task: {
    id: 'TASK-20250428001',
    name: '上海分公司 Q1 常规审计任务',
    status: '生成中',
    organization: '上海分公司',
    period: '2025Q1（2025-01-01 ～ 2025-03-31）',
    type: '常规审计',
    owner: '张三',
    createdAt: '2025-04-28 09:15:32',
    progress: 63,
    version: 'V0.9'
  },
  activeTab: 'analysis',
  tabs: [
    { key: 'overview', label: '任务概览' },
    { key: 'materials', label: '输入资料' },
    { key: 'analysis', label: '分析过程' },
    { key: 'results', label: '生成结果' },
    { key: 'agent-chat', label: '智能体会话' },
    { key: 'reports', label: '报告与附件' },
    { key: 'changes', label: '修改记录' },
    { key: 'reviews', label: '复核记录' },
    { key: 'versions', label: '版本记录' },
    { key: 'exports', label: '导出记录' },
    { key: 'logs', label: '操作留痕' }
  ],
  stages: [
    { key: 'submit', label: '提交任务', detail: '04-28 09:15', state: 'completed' },
    { key: 'parse', label: '文件解析', detail: '04-28 09:22', state: 'completed' },
    { key: 'execute', label: '能力执行', detail: '进行中（63%）', state: 'active' },
    { key: 'confirm', label: '结果确认', detail: '待开始', state: 'pending' },
    { key: 'report', label: '报告生成', detail: '待开始', state: 'pending' },
    { key: 'review-export', label: '复核导出', detail: '待开始', state: 'pending' }
  ],
  // The source visual shows 4/3/2/0 even though its card snapshot reads 3/4/2/0.
  // Keep the visible design snapshot verbatim instead of silently rewriting the reference.
  summary: [
    { key: 'completed', label: '已完成能力', value: 4, unit: '项', tone: 'success' },
    { key: 'running', label: '进行中', value: 3, unit: '项', tone: 'running' },
    { key: 'pending', label: '待执行', value: 2, unit: '项', tone: 'pending' },
    { key: 'failed', label: '失败', value: 0, unit: '项', tone: 'failed' }
  ],
  capabilities: [
    {
      id: 'policy-search', index: 1, name: '制度查询', description: '检索制度条款与审计依据',
      status: 'completed', statusLabel: '已完成', progress: 100, currentStep: '检索制度条款', dependency: '',
      input: '制度文件 36 份', output: '审计依据清单.xlsx', actions: ['view-log', 'view-result']
    },
    {
      id: 'policy-change', index: 2, name: '制度变更', description: '识别制度变更内容与影响',
      status: 'completed', statusLabel: '已完成', progress: 100, currentStep: '生成变更时间轴', dependency: '',
      input: '制度版本 18 份', output: '制度变更清单.xlsx', actions: ['view-log', 'view-result']
    },
    {
      id: 'policy-compare', index: 3, name: '制度比对', description: '比对内外部制度差异',
      status: 'running', statusLabel: '进行中', progress: 78, currentStep: '匹配差异', dependency: '',
      input: '外部制度 15 份 / 内部制度 23 份', output: '差异清单.xlsx', actions: ['view-log', 'run-background']
    },
    {
      id: 'regulatory-analysis', index: 4, name: '监管案例舆情分析', description: '提取监管关注点与舆情风险',
      status: 'running', statusLabel: '进行中', progress: 64, currentStep: '提取监管关注点', dependency: '',
      input: '案例库 58 条 / 舆情 24 条', output: '监管关注点清单.xlsx', actions: ['view-log', 'run-background']
    },
    {
      id: 'audit-standard', index: 5, name: '审计规范生成', description: '生成审计规范与检查建议',
      status: 'running', statusLabel: '进行中', progress: 52, currentStep: '生成审计条目', dependency: '',
      input: '共享文件 384 份', output: '监督共享分析报告.docx', actions: ['view-log', 'run-background']
    },
    {
      id: 'supervision-share', index: 6, name: '监督共享信息分析', description: '提取标签并生成汇总分析',
      status: 'completed', statusLabel: '已完成', progress: 100, currentStep: '生成汇总分析', dependency: '',
      input: '监督共享文件 384 份', output: '监督共享汇总.xlsx', actions: ['view-log', 'view-result']
    },
    {
      id: 'expense-audit', index: 7, name: '费用审计', description: '识别费用异常与风险',
      status: 'running', statusLabel: '进行中', progress: 81, currentStep: '确认异常结果', dependency: '',
      input: '费用数据 12,856 条', output: '费用异常汇总.xlsx', actions: ['view-log', 'run-background']
    },
    {
      id: 'report-generate', index: 8, name: '报告生成', description: '生成审计报告草稿',
      status: 'pending', statusLabel: '待执行', progress: 0, currentStep: '等待依赖', dependency: '费用审计确认完成',
      input: '—', output: '审计报告草稿.docx', actions: []
    },
    {
      id: 'report-review', index: 9, name: '报告审核', description: '审核报告格式与内容',
      status: 'pending', statusLabel: '待执行', progress: 0, currentStep: '等待依赖', dependency: '上传报告',
      input: '—', output: '审核问题清单.xlsx', actions: []
    }
  ],
  logs: [
    { id: 'log-1', time: '09:45:12', capabilityId: 'policy-compare', capability: '制度比对', message: '开始匹配差异', tone: 'success', actor: '系统' },
    { id: 'log-2', time: '09:45:05', capabilityId: 'audit-standard', capability: '审计规范生成', message: '生成条目中', tone: 'running', actor: '系统' },
    { id: 'log-3', time: '09:45:01', capabilityId: 'expense-audit', capability: '费用审计', message: '异常识别完成', tone: 'running', actor: '系统' },
    { id: 'log-4', time: '09:44:58', capabilityId: 'regulatory-analysis', capability: '监管案例舆情分析', message: '提取中', tone: 'neutral', actor: '系统' },
    { id: 'log-5', time: '09:44:42', capabilityId: 'policy-compare', capability: '制度比对', message: '已解析 15/23 份制度', tone: 'neutral', actor: '系统' },
    { id: 'log-6', time: '09:44:30', capabilityId: 'audit-standard', capability: '审计规范生成', message: '生成 156 条条目', tone: 'neutral', actor: '系统' }
  ],
  modelExecution: {
    capabilityId: 'policy-compare', title: '制度比对 - 匹配差异', status: '进行中', activeStep: 2,
    steps: ['读取制度', '抽取条款', '匹配差异', '生成结果']
  },
  sources: [
    { id: 'external-policy', label: '外部制度', value: '15 份（已解析 15 份）' },
    { id: 'internal-policy', label: '内部制度', value: '23 份（已解析 12 份）' },
    { id: 'regulatory-cases', label: '监管案例', value: '58 条' },
    { id: 'expense-data', label: '费用数据', value: '12,856 条' }
  ],
  failures: [],
  pendingItems: [
    { id: 'pending-report', title: '报告生成', description: '需等待费用审计确认完成后自动开始', status: '待开始', tone: 'orange' },
    { id: 'pending-review', title: '报告审核', description: '需先上传报告后执行审核', status: '待开始', tone: 'blue' }
  ]
};

export function getTaskDetailExecutionSnapshot(taskId, rows = taskRows) {
  const snapshot = structuredClone(taskDetailExecutionSnapshot);
  const task = rows.find((row) => row.id === taskId && row.statusKey === 'generating');

  if (!task) return snapshot;

  snapshot.task = {
    ...snapshot.task,
    id: task.id,
    name: task.name,
    organization: task.organization,
    type: task.type,
    owner: task.owner,
    createdAt: task.updatedAt,
    progress: task.progress,
  };
  snapshot.stages[2].detail = `进行中（${task.progress}%）`;
  return snapshot;
}
