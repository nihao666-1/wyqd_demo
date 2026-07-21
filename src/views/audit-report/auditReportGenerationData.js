export const auditReportGenerationSnapshot = {
  task: {
    unit: '上海分公司',
    period: '2025Q1（2025-01-01 ～ 2025-03-31）',
    reportType: '营业部常规审计报告',
    template: '常规审计报告模板 V2.0',
    status: '草稿生成中',
    updatedAt: '2025-04-28 14:12:35'
  },
  config: {
    taskName: '上海分公司 Q1 常规审计任务',
    reportType: '营业部常规审计报告',
    reportTemplate: '常规审计报告模板 V2.0',
    formatTemplate: '正式报告格式模板 V1.3',
    outputFormats: ['Word（.docx）', 'PDF（.pdf）'],
    aiLabel: true,
    modelReview: true
  },
  steps: [
    { id: 'read', label: '读取资料', state: 'done', badge: '已完成' },
    { id: 'chapters', label: '生成章节', state: 'done', badge: '已完成' },
    { id: 'evidence', label: '插入依据', state: 'active', badge: '进行中（68%）' },
    { id: 'attachments', label: '生成附件', state: 'waiting', badge: '等待中' },
    { id: 'edit', label: '人工编辑', state: 'waiting', badge: '等待中' },
    { id: 'save', label: '保存版本', state: 'waiting', badge: '等待中' }
  ],
  progress: {
    percent: 68,
    elapsed: '00:02:18',
    remaining: '00:01:02',
    model: '审计大模型 V2.3',
    parallel: '2 / 6'
  },
  logs: [
    { time: '14:09:12', text: '资料读取完成，共解析 35 份文件', tone: 'success' },
    { time: '14:09:45', text: '章节结构生成完成，共 8 个章节', tone: 'success' },
    { time: '14:10:21', text: '已插入依据 156 条，命中率 92%', tone: 'active' },
    { time: '14:11:04', text: '正在成附件（问题清单、差异清单、底稿索引）...', tone: 'info' },
    { time: '14:11:30', text: '正在优化内容与格式排版...', tone: 'info' }
  ],
  readiness: [
    { title: '制度比对结果', status: '已引用', countLabel: '引用条款：36 条', tone: 'red' },
    { title: '费用审计结果', status: '已引用', countLabel: '引用条款：42 条', tone: 'green' },
    { title: '监督共享资料', status: '已引用', countLabel: '引用条款：28 条', tone: 'green' },
    { title: '审计问题清单', status: '待确认', countLabel: '问题数量：23 条', tone: 'orange' }
  ],
  chapters: [
    { title: '一、基本情况', active: true },
    { title: '二、审计发现的主要问题' },
    { title: '三、审计意见及整改要求' },
    { title: '四、重要事项说明' },
    { title: '五、内部控制及合规管理评价' },
    { title: '六、审计底稿索引' },
    { title: '七、附件材料' },
    { title: '八、其他说明' }
  ],
  sources: [
    {
      index: 1,
      type: '制度条款',
      title: '《证券公司客户适当性管理办法（2023年修订）》',
      excerpt: '第六条 公司应建立客户适当性管理制度，确保不同业务、部门之间的信息隔离……',
      match: '98%',
      source: '公司制度库',
      version: 'V2.1'
    },
    {
      index: 2,
      type: '费用异常',
      title: '费用违规报销-差旅费超标',
      excerpt: '发现金额 28,650.00 元，超过标准限额 85%，未提供充分审批依据……',
      match: '96%',
      source: '费用审计结果',
      version: 'V1.5'
    },
    {
      index: 3,
      type: '监督共享资料',
      title: '监管关注点-客户信息管理',
      excerpt: '监管部门提示：个别营业部在客户信息管理方面存在流程执行不到位……',
      match: '92%',
      source: '监管共享平台',
      version: 'V1.0'
    }
  ],
  outputs: [
    { name: 'Word草稿', type: 'W', size: '1.2MB', tone: 'word' },
    { name: 'PDF预览', type: 'PDF', size: '2.3MB', tone: 'pdf' },
    { name: '附件包', type: 'ZIP', size: '5.6MB', tone: 'zip' },
    { name: 'Excel视角清单', type: 'X', size: '256KB', tone: 'excel' },
    { name: '问题清单', type: 'X', size: '144KB', tone: 'excel' }
  ],
  versions: [
    { id: 'V0.1', label: '任务创建', time: '04-28 09:15', state: 'muted' },
    { id: 'V0.5', label: '章节生成完成', time: '04-28 10:20', state: 'muted' },
    { id: 'V0.9', label: '内容生成完成', time: '04-28 14:05', state: 'active' },
    { id: 'V1.0', label: '人工编辑草稿', time: '当前版本', state: 'current' }
  ],
  exportHistory: {
    title: '导出记录（近 7 天）',
    status: '暂无导出记录'
  },
  officialCompare: {
    emptyHint: '上传线下定稿后的正式报告后，系统会与当前生成稿进行内容、结构、依据和风险差异比对。',
    latestResult: '暂未回传正式报告。',
    checkItems: ['内容差异', '结构差异', '依据差异', '风险提示'],
    summary: [
      { label: '内容差异', value: '--', hint: '等待上传', tone: 'muted' },
      { label: '结构差异', value: '--', hint: '等待上传', tone: 'muted' },
      { label: '依据差异', value: '--', hint: '等待上传', tone: 'muted' },
      { label: '风险提示', value: '--', hint: '等待上传', tone: 'muted' }
    ],
    records: [
      { name: '当前生成稿 V1.0', status: '等待正式报告回传' }
    ]
  },
  chapterStats: {
    references: '18 条',
    issues: '2 条',
    words: '1,256 字',
    lastEdited: '14:11:05'
  }
};

export function getAuditReportGenerationSnapshot() {
  return structuredClone(auditReportGenerationSnapshot);
}
