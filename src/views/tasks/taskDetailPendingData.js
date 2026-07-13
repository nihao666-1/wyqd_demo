export const taskDetailMeta = {
  id: 'TASK-20250428001',
  title: '上海分公司 Q1 常规审计任务',
  status: '待确认',
  organization: '上海分公司',
  period: '2025-01-01 至 2025-03-31',
  type: '常规审计',
  owner: '张三',
  createdAt: '2025-04-28 09:15:32',
  updatedAt: '2025-04-28 15:02:18',
  creator: '审计管理员'
};

export const taskDetailTabs = [
  { id: 'overview', label: '任务概览' },
  { id: 'materials', label: '输入资料' },
  { id: 'analysis', label: '分析过程' },
  { id: 'results', label: '生成结果' },
  { id: 'session', label: '智能体会话' },
  { id: 'reports', label: '报告与附件' },
  { id: 'changes', label: '修改记录' },
  { id: 'reviews', label: '复核记录' },
  { id: 'versions', label: '版本记录' },
  { id: 'exports', label: '导出记录' },
  { id: 'logs', label: '操作留痕' }
];

export const versionTimeline = [
  { id: 'V0.9', label: 'V0.9 生成完成', time: '2025-04-28 14:10:20', status: 'completed', note: '系统' },
  { id: 'V1.0', label: 'V1.0 思维核保存', time: '当前版本', status: 'current', note: '待保存' },
  { id: 'V1.1', label: 'V1.1 待复核', time: '--', status: 'future', note: '--' },
  { id: 'V1.2', label: 'V1.2 归档版本', time: '--', status: 'future', note: '--' }
];

export const outputFiles = [
  { id: 'OUT-1', type: 'Excel', name: '制度差异清单.xlsx', tone: 'excel', exported: false },
  { id: 'OUT-2', type: 'Excel', name: '费用异常汇总.xlsx', tone: 'excel', exported: false },
  { id: 'OUT-3', type: 'Word', name: '审计报告草稿.docx', tone: 'word', exported: false },
  { id: 'OUT-4', type: 'PDF', name: '审计报告预览.pdf', tone: 'pdf', exported: false }
];

export const initialOperationLogs = [
  { id: 'LOG-1', time: '15:02:18', operator: '系统', action: '九类能力生成完成', result: '进入待确认' },
  { id: 'LOG-2', time: '15:04:26', operator: '审计管理员', action: '查看制度缺失依据', result: '已打开追溯' }
];

export function evidenceForItem(item) {
  return {
    clauseTitle: item?.id === 'CONF-001' ? '《证券公司客户适当性管理办法》' : item?.sourceLabel || '相关审计依据',
    clauseNumber: item?.id === 'CONF-001' ? '第十六条' : '关联条款',
    effectiveState: '现行有效',
    effectiveDate: '2023-07-01',
    clauseText: item?.id === 'CONF-001'
      ? '证券公司应当持续了解客户信息，及时更新客户信息，客户回访频率至少每年一次。'
      : item?.summary || '当前事项对应的审计依据和业务事实。',
    sourceFile: item?.id === 'CONF-001' ? '适当性管理办法_2023版.pdf' : '审计依据汇编.pdf',
    pageNumber: item?.id === 'CONF-001' ? 12 : 1,
    quote: item?.id === 'CONF-001'
      ? '……应当持续了解客户信息，及时更新客户信息，客户回访频率至少每年一次。'
      : item?.summary || '',
    similarClauses: [
      '《证券期货投资者适当性管理办法》第十四条',
      '《基金销售机构投资者适当性管理实施指引》第十一条'
    ],
    applicability: '外部监管强制要求，内部制度未明确回访频率。',
    relatedFiles: [
      { id: 'FILE-1', name: item?.sourceLabel || '制度依据文件', detail: '来源文件 · 已锁定引用' },
      { id: 'FILE-2', name: '内部制度比对结果.xlsx', detail: '差异定位 · 当前版本' }
    ],
    session: {
      id: 'SESSION-20250428-03',
      title: '制度比对智能体会话',
      summary: '模型完成外部条款与内部制度逐条比对，并保留判断链路。'
    },
    snapshots: [
      { version: 'V0.9', content: '模型首次识别该事项', time: '14:10:20' },
      { version: 'V1.0', content: '等待人工确认', time: '15:02:18' }
    ]
  };
}
