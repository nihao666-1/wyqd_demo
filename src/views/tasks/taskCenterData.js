export const statusGuide = [
  { key: 'draft', label: '草稿', detail: '任务创建中，尚未提交。', icon: 'draft', tone: 'orange' },
  { key: 'pending-parse', label: '待解析', detail: '资料已上传，等待系统解析。', icon: 'parse', tone: 'blue' },
  { key: 'parsing', label: '解析中', detail: '资料解析中，请耐心等待。', icon: 'parse', tone: 'azure' },
  { key: 'pending-generate', label: '待生成', detail: '资料解析完成，等待模型生成。', icon: 'report', tone: 'yellow' },
  { key: 'generating', label: '生成中', detail: '模型正在生成分析结果。', icon: 'generate', tone: 'green' },
  { key: 'confirming', label: '待确认', detail: '结果已生成，等待人工确认。', icon: 'confirm', tone: 'purple' },
  { key: 'reviewing', label: '待复核', detail: '已确认，等待管理员复核。', icon: 'ability', tone: 'orange' },
  { key: 'completed', label: '已完成', detail: '任务已完成并生成报告。', icon: 'complete', tone: 'teal' },
  { key: 'archived', label: '已归档', detail: '任务已归档，资料已固化。', icon: 'archive', tone: 'gray' }
];

export const metricDefinitions = [
  { label: '全部任务', icon: 'tasks', tone: 'red', count: 28, filter: '全部' },
  { label: '执行中', icon: 'generate', tone: 'blue', count: 5, filter: '执行中' },
  { label: '待确认', icon: 'confirm', tone: 'orange', count: 9, filter: '待确认' },
  { label: '已归档', icon: 'archive', tone: 'green', count: 12, filter: '已归档' },
  { label: '失败/异常', icon: 'failed', tone: 'red', count: 2, filter: '失败/异常' }
];

export const taskRows = [
  { id: 'TASK-20250428001', name: '上海分公司 Q1 常规审计任务', organization: '上海分公司', period: '2025Q1', type: '常规审计', phase: '报告归档', status: '已归档', statusKey: 'archived', owner: '审计管理员', creator: '审计管理员', updatedAt: '2025-04-28 16:30', progress: 100, riskCount: 0, action: '查看详情' },
  { id: 'TASK-20250427002', name: '费用报销专项审计', organization: '上海分公司', period: '2025Q1', type: '专项审计', phase: '审计规范生成', status: '待确认', statusKey: 'confirming', owner: '张伟', creator: '张伟', updatedAt: '2025-04-27 11:20', progress: 45, riskCount: 2, action: '处理' },
  { id: 'TASK-20250426003', name: '制度差异复核任务', organization: '上海分公司', period: '2025Q1', type: '制度比对', phase: '监督共享分析', status: '待确认', statusKey: 'confirming', owner: '李娜', creator: '李娜', updatedAt: '2025-04-26 16:50', progress: 100, riskCount: 1, action: '处理' },
  { id: 'TASK-20250425004', name: '固定资产审计', organization: '上海分公司', period: '2025Q1', type: '常规审计', phase: '生成分析', status: '生成中', statusKey: 'generating', owner: '王磊', creator: '王磊', updatedAt: '2025-04-25 10:11', progress: 78, riskCount: 3, action: '继续执行' },
  { id: 'TASK-20250423005', name: '合同合规性专项审计', organization: '上海分公司', period: '2025Q1', type: '专项审计', phase: '报告生成', status: '已归档', statusKey: 'archived', owner: '赵强', creator: '赵强', updatedAt: '2025-04-23 18:22', progress: 100, riskCount: 0, action: '查看日志' },
  { id: 'TASK-20250422006', name: '费用异常核查任务', organization: '上海分公司', period: '2025Q1', type: '费用审计', phase: '审计发现', status: '失败', statusKey: 'failed', owner: '刘洋', creator: '刘洋', updatedAt: '2025-04-22 09:48', progress: 30, riskCount: 5, action: '处理' },
  { id: 'TASK-20250421007', name: '采购流程审计', organization: '上海分公司', period: '2025Q1', type: '专项审计', phase: '文件解析', status: '生成中', statusKey: 'generating', owner: '陈晨', creator: '陈晨', updatedAt: '2025-04-21 15:33', progress: 92, riskCount: 1, action: '继续执行' },
  { id: 'TASK-20250420008', name: '内控合规性检查', organization: '上海分公司', period: '2025Q1', type: '常规审计', phase: '监督共享分析', status: '生成中', statusKey: 'generating', owner: '审计管理员', creator: '审计管理员', updatedAt: '2025-04-20 17:05', progress: 68, riskCount: 0, action: '查看详情' },
  { id: 'TASK-20250419009', name: '预算执行审计', organization: '计划财务部', period: '2025Q1', type: '费用审计', phase: '生成分析', status: '生成中', statusKey: 'generating', owner: '王磊', creator: '王磊', updatedAt: '2025-04-19 13:20', progress: 54, riskCount: 2, action: '继续执行' },
  { id: 'TASK-20250418010', name: '信息系统安全审计', organization: '经纪业务部', period: '2025Q1', type: '专项审计', phase: '资料校验', status: '生成中', statusKey: 'generating', owner: '张伟', creator: '张伟', updatedAt: '2025-04-18 10:18', progress: 38, riskCount: 0, action: '继续执行' },
  { id: 'TASK-20250417011', name: '营销费用专项审计', organization: '上海分公司', period: '2025Q1', type: '费用审计', phase: '人工确认', status: '待确认', statusKey: 'confirming', owner: '李娜', creator: '李娜', updatedAt: '2025-04-17 16:42', progress: 100, riskCount: 1, action: '处理' },
  { id: 'TASK-20250416012', name: '应收账款风险复核', organization: '计划财务部', period: '2025Q1', type: '专项审计', phase: '人工确认', status: '待确认', statusKey: 'confirming', owner: '赵强', creator: '赵强', updatedAt: '2025-04-16 11:12', progress: 100, riskCount: 2, action: '处理' },
  { id: 'TASK-20250415013', name: '印章使用合规审计', organization: '经纪业务部', period: '2025Q1', type: '常规审计', phase: '人工确认', status: '待确认', statusKey: 'confirming', owner: '陈晨', creator: '陈晨', updatedAt: '2025-04-15 09:30', progress: 100, riskCount: 0, action: '处理' },
  { id: 'TASK-20250414014', name: '客户适当性管理审计', organization: '上海分公司', period: '2025Q1', type: '专项审计', phase: '人工确认', status: '待确认', statusKey: 'confirming', owner: '王磊', creator: '王磊', updatedAt: '2025-04-14 14:48', progress: 100, riskCount: 1, action: '处理' },
  { id: 'TASK-20250413015', name: '信息披露流程审计', organization: '经纪业务部', period: '2025Q1', type: '常规审计', phase: '人工确认', status: '待确认', statusKey: 'confirming', owner: '张伟', creator: '张伟', updatedAt: '2025-04-13 10:36', progress: 100, riskCount: 0, action: '处理' },
  { id: 'TASK-20250412016', name: '数据权限专项核查', organization: '上海分公司', period: '2025Q1', type: '专项审计', phase: '人工确认', status: '待确认', statusKey: 'confirming', owner: '李娜', creator: '李娜', updatedAt: '2025-04-12 15:06', progress: 100, riskCount: 2, action: '处理' },
  { id: 'TASK-20250411017', name: '对公业务合规检查', organization: '计划财务部', period: '2025Q1', type: '常规审计', phase: '人工确认', status: '待确认', statusKey: 'confirming', owner: '赵强', creator: '赵强', updatedAt: '2025-04-11 11:28', progress: 100, riskCount: 1, action: '处理' },
  { id: 'TASK-20250410018', name: '投行业务归档审计', organization: '上海分公司', period: '2025Q1', type: '专项审计', phase: '报告归档', status: '已归档', statusKey: 'archived', owner: '陈晨', creator: '陈晨', updatedAt: '2025-04-10 16:18', progress: 100, riskCount: 0, action: '查看日志' },
  { id: 'TASK-20250409019', name: '员工行为管理审计', organization: '经纪业务部', period: '2025Q1', type: '常规审计', phase: '报告归档', status: '已归档', statusKey: 'archived', owner: '王磊', creator: '王磊', updatedAt: '2025-04-09 13:44', progress: 100, riskCount: 0, action: '查看日志' },
  { id: 'TASK-20250408020', name: '反洗钱专项审计', organization: '上海分公司', period: '2025Q1', type: '专项审计', phase: '报告归档', status: '已归档', statusKey: 'archived', owner: '张伟', creator: '张伟', updatedAt: '2025-04-08 09:56', progress: 100, riskCount: 1, action: '查看日志' },
  { id: 'TASK-20250407021', name: '客户投诉处理审计', organization: '计划财务部', period: '2025Q1', type: '常规审计', phase: '报告归档', status: '已归档', statusKey: 'archived', owner: '李娜', creator: '李娜', updatedAt: '2025-04-07 15:22', progress: 100, riskCount: 0, action: '查看日志' },
  { id: 'TASK-20250406022', name: '交易监控规则审计', organization: '经纪业务部', period: '2025Q1', type: '专项审计', phase: '报告归档', status: '已归档', statusKey: 'archived', owner: '赵强', creator: '赵强', updatedAt: '2025-04-06 10:42', progress: 100, riskCount: 0, action: '查看日志' },
  { id: 'TASK-20250405023', name: '自营业务合规审计', organization: '上海分公司', period: '2025Q1', type: '常规审计', phase: '报告归档', status: '已归档', statusKey: 'archived', owner: '陈晨', creator: '陈晨', updatedAt: '2025-04-05 14:20', progress: 100, riskCount: 1, action: '查看日志' },
  { id: 'TASK-20250404024', name: '采购合同归档检查', organization: '计划财务部', period: '2025Q1', type: '专项审计', phase: '报告归档', status: '已归档', statusKey: 'archived', owner: '王磊', creator: '王磊', updatedAt: '2025-04-04 11:38', progress: 100, riskCount: 0, action: '查看日志' },
  { id: 'TASK-20250403025', name: '费用预算执行审计', organization: '上海分公司', period: '2025Q1', type: '费用审计', phase: '报告归档', status: '已归档', statusKey: 'archived', owner: '张伟', creator: '张伟', updatedAt: '2025-04-03 16:09', progress: 100, riskCount: 0, action: '查看日志' },
  { id: 'TASK-20250402026', name: '系统变更管理审计', organization: '经纪业务部', period: '2025Q1', type: '常规审计', phase: '报告归档', status: '已归档', statusKey: 'archived', owner: '李娜', creator: '李娜', updatedAt: '2025-04-02 10:04', progress: 100, riskCount: 0, action: '查看日志' },
  { id: 'TASK-20250401027', name: '资管产品合规审计', organization: '计划财务部', period: '2025Q1', type: '专项审计', phase: '报告归档', status: '已归档', statusKey: 'archived', owner: '赵强', creator: '赵强', updatedAt: '2025-04-01 15:38', progress: 100, riskCount: 1, action: '查看日志' },
  { id: 'TASK-20250331028', name: '预算执行审计任务', organization: '上海分公司', period: '2025Q1', type: '费用审计', phase: '模型重试', status: '失败', statusKey: 'failed', owner: '刘洋', creator: '刘洋', updatedAt: '2025-03-31 17:20', progress: 20, riskCount: 4, action: '处理' }
].map((row) => ({ ...row, organization: '上海分公司' }));

export const taskTypes = ['全部', '常规审计', '专项审计', '制度比对', '费用审计'];
export const organizations = ['全部', '上海分公司', '经纪业务部', '计划财务部'];
export const owners = ['全部', '王审计', '张三', '李四', '赵六'];
export const statusOptions = ['全部', ...statusGuide.map((item) => item.label)];

export const flowSteps = [
  { title: '创建任务', detail: '填写基础信息\n明确审计任务', icon: 'create', tone: 'red' },
  { title: '选择能力', detail: '按需选择审计能力\n系统自动匹配资料', icon: 'ability', tone: 'orange' },
  { title: '上传资料', detail: '上传或选择资料\n智能校验完整性', icon: 'upload', tone: 'blue' },
  { title: '生成结果', detail: '模型生成分析结果\n查看风险与建议', icon: 'report', tone: 'green' },
  { title: '导出归档', detail: '生成报告并导出\n归档留存可追溯', icon: 'export', tone: 'purple' }
];

export const todayReminders = [
  { title: '费用报销专项审计', meta: '等待人工确认审计规范', taskId: 'TASK-20250427002', tone: 'danger' },
  { title: '制度差异复核任务', meta: '等待确认分析结果', taskId: 'TASK-20250426003', tone: 'warning' },
  { title: '固定资产审计-风险点', meta: '等待确认风险处理意见', taskId: 'TASK-20250425004', tone: 'warning' }
];

export const failedTasks = [
  { title: '费用异常核查任务', meta: '资料预检失败 · 等待处理', taskId: 'TASK-20250422006' },
  { title: '预算执行审计任务', meta: '模型调用异常 · 等待重试', taskId: 'TASK-20250331028' }
];

export const recentTaskLogs = [
  { action: '启动任务：上海分公司 Q1 常规审计任务', time: '14:35' },
  { action: '生成报告：固定资产审计', time: '11:20' },
  { action: '标记风险点：合同合规性专项审计', time: '10:02' },
  { action: '归档任务：采购流程审计', time: '09:48' }
  ,{ action: '更新资料：内控合规性检查', time: '09:15' }
];

export const taskQuickLinks = [
  { label: '模板管理', to: '/audit-report/template', tone: 'blue' },
  { label: '报表模板', to: '/audit-report/workbench', tone: 'purple' },
  { label: '知识库检索', to: '/audit-standard/library', tone: 'purple' },
  { label: '数据标签', to: '/files', tone: 'orange' },
  { label: '审计规则库', to: '/audit-standard/workbench', tone: 'blue' },
  { label: '系统监控', to: '/records', tone: 'green' }
];
