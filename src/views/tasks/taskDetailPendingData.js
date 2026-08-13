export const taskDetailMeta = {
  id: 'TASK-20250428001',
  title: '上海分公司 Q1 常规审计任务',
  status: '结果待确认',
  phaseStatus: '结果待确认',
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
  { id: 'outputs', label: '输出文件' },
  { id: 'timeline', label: '任务时间线' },
  { id: 'export-records', label: '导出记录' }
];

export const inputMaterials = [
  {
    id: 'MAT-1',
    name: '内部制度汇编（2025Q1）.pdf',
    type: '制度文件',
    parseStatus: '解析完成',
    source: '制度库',
    version: 'V2025.03',
    relation: '制度查询、制度比对、审计规范生成',
    owner: '合规部',
    parsedAt: '2025-04-28 09:22:18'
  },
  {
    id: 'MAT-2',
    name: '外部监管法规清单.xlsx',
    type: '法规清单',
    parseStatus: '解析完成',
    source: '法规库',
    version: '2025-04 快照',
    relation: '制度查询、制度比对',
    owner: '审计管理员',
    parsedAt: '2025-04-28 09:25:41'
  },
  {
    id: 'MAT-3',
    name: '费用明细台账（2025Q1）.xlsx',
    type: '业务数据',
    parseStatus: '解析完成',
    source: '费控系统',
    version: 'TASK 锁定快照',
    relation: '费用审计、报告生成',
    owner: '财务部',
    parsedAt: '2025-04-28 09:31:08'
  },
  {
    id: 'MAT-4',
    name: '监督共享文件包.zip',
    type: '共享资料',
    parseStatus: '部分异常',
    source: '监督共享文件中心',
    version: '2025Q1 批次',
    relation: '监督共享信息分析、审计规范生成',
    owner: '监督办公室',
    parsedAt: '2025-04-28 09:38:22'
  }
];

export const analysisStages = [
  { key: 'created', label: '创建任务', state: 'completed', time: '2025-04-28 09:15:32', detail: '任务基础信息已保存' },
  { key: 'material-parse', label: '资料解析', state: 'completed', time: '2025-04-28 09:38:22', detail: '核心文件已解析，异常文件进入时间线' },
  { key: 'capability-run', label: '能力执行', state: 'completed', time: '2025-04-28 14:10:20', detail: '业务能力完成结构化分析' },
  { key: 'result-confirm', label: '结果确认', state: 'active', time: '当前阶段', detail: '待人工确认、排除或补充说明' },
  { key: 'review-export', label: '复核与导出', state: 'pending', time: '待开始', detail: '确认后提交复核并生成输出文件' }
];

export const versionTimeline = [
  { id: 'V0.9', label: 'V0.9 生成完成', time: '2025-04-28 14:10:20', status: 'completed', note: '系统' },
  { id: 'V1.0', label: 'V1.0 思维核保存', time: '当前版本', status: 'current', note: '待保存' },
  { id: 'V1.1', label: 'V1.1 待复核', time: '--', status: 'future', note: '--' },
  { id: 'V1.2', label: 'V1.2 归档版本', time: '--', status: 'future', note: '--' }
];

export const outputFiles = [
  { id: 'OUT-1', category: '制度比对结果', type: 'Excel', name: '制度差异清单.xlsx', tone: 'excel', generatedAt: '2025-04-28 14:10', exported: false },
  { id: 'OUT-2', category: '分析结果', type: 'Excel', name: '费用异常汇总.xlsx', tone: 'excel', generatedAt: '2025-04-28 14:12', exported: false },
  { id: 'OUT-3', category: '审计规范', type: 'Excel', name: '审计规范与建议.xlsx', tone: 'excel', generatedAt: '2025-04-28 14:18', exported: false },
  { id: 'OUT-4', category: '报告', type: 'Word', name: '审计报告草稿.docx', tone: 'word', generatedAt: '2025-04-28 14:30', exported: false },
  { id: 'OUT-5', category: '报告', type: 'PDF', name: '审计报告预览.pdf', tone: 'pdf', generatedAt: '2025-04-28 14:31', exported: false }
];

export const initialOperationLogs = [
  { id: 'LOG-1', time: '15:02:18', operator: '系统', type: '生成报告', action: '九类能力生成完成', result: '进入待确认' },
  { id: 'LOG-2', time: '15:04:26', operator: '审计管理员', type: '操作记录', action: '查看制度缺失依据', result: '已打开追溯' }
];

export const timelineFilters = [
  '全部', '创建任务', '上传文件', '解析文件', '确认结果', '排除结果', '生成报告', '导出文件', '提交复核', '执行异常'
].map((label) => ({ label, value: label === '全部' ? 'all' : label }));

export const timelineEvents = [
  { id: 'TL-1', type: '创建任务', time: '2025-04-28 09:15:32', operator: '审计管理员', title: '创建任务', detail: '上海分公司 Q1 常规审计任务创建成功', result: '成功' },
  { id: 'TL-2', type: '上传文件', time: '2025-04-28 09:18:04', operator: '审计管理员', title: '上传输入资料', detail: '上传制度、费用、监督共享文件', result: '成功' },
  { id: 'TL-3', type: '解析文件', time: '2025-04-28 09:38:22', operator: '系统', title: '解析文件', detail: '3 类文件解析完成，1 个共享文件存在章节缺失', result: '部分异常' },
  { id: 'TL-4', type: '生成报告', time: '2025-04-28 14:30:00', operator: '系统', title: '生成报告草稿', detail: '根据确认前结果生成审计报告草稿', result: '成功' },
  { id: 'TL-5', type: '执行异常', time: '2025-04-28 14:36:12', operator: '系统', title: '共享资料解析异常', detail: '监督共享文件包中 2 个附件缺少章节元数据', result: '待处理' }
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
