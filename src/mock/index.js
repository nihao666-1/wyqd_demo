import { taskStates } from '../domain/stateMachines/taskState.js';
import { fileStates } from '../domain/stateMachines/fileState.js';
import { reportStates } from '../domain/stateMachines/reportState.js';

export const currentUser = {
  userId: 'U-001',
  name: '王审计',
  role: '审计人员',
  departmentId: 'D-SH-AUDIT',
  companyScope: ['C-SH'],
  departmentScope: ['D-SH-AUDIT', 'D-SH-BROKER', 'D-SH-FINANCE'],
  actionPermissions: ['create', 'upload', 'confirm', 'lock', 'export', 'view', 'download']
};

export const organizations = [
  { orgId: 'C-SH', orgName: '上海分公司', orgType: '分公司', parentId: '' },
  { orgId: 'D-SH-AUDIT', orgName: '审计部', orgType: '部门', parentId: 'C-SH' },
  { orgId: 'D-SH-BROKER', orgName: '经纪业务部', orgType: '部门', parentId: 'C-SH' },
  { orgId: 'D-SH-FINANCE', orgName: '计划财务部', orgType: '部门', parentId: 'C-SH' }
];

export const dataSources = [
  { sourceId: 'DS-OA', sourceName: 'OA审批', syncStatus: '已同步', lastSyncAt: '2026-07-08 09:30', fieldCoverage: '96%', recordCount: 1260 },
  { sourceId: 'DS-FEE', sourceName: '费控/报销', syncStatus: '已同步', lastSyncAt: '2026-07-08 09:35', fieldCoverage: '98%', recordCount: 3420 },
  { sourceId: 'DS-BUDGET', sourceName: '预算系统', syncStatus: '已同步', lastSyncAt: '2026-07-08 09:40', fieldCoverage: '93%', recordCount: 380 },
  { sourceId: 'DS-INVOICE', sourceName: '发票平台/OCR', syncStatus: '部分缺失', lastSyncAt: '2026-07-08 09:42', fieldCoverage: '89%', recordCount: 2980 },
  { sourceId: 'DS-CONTRACT', sourceName: '合同系统', syncStatus: '已同步', lastSyncAt: '2026-07-08 09:45', fieldCoverage: '92%', recordCount: 420 },
  { sourceId: 'DS-LEDGER', sourceName: '财务总账/凭证', syncStatus: '已同步', lastSyncAt: '2026-07-08 09:48', fieldCoverage: '95%', recordCount: 1460 },
  { sourceId: 'DS-HR', sourceName: 'HR/组织职级', syncStatus: '已同步', lastSyncAt: '2026-07-08 09:50', fieldCoverage: '99%', recordCount: 860 }
];

export const tasks = [
  {
    taskId: 'TASK-2026-001',
    taskName: '上海分公司二季度费用异常审计',
    auditObjects: ['上海分公司'],
    effectiveDepartments: ['经纪业务部', '计划财务部'],
    auditPeriod: '2026Q2',
    selectedCapabilities: ['费用异常审计', '审计报告生成'],
    owner: '王审计',
    status: taskStates.CONFIRM_PENDING,
    currentStep: '候选异常确认',
    updatedAt: '2026-07-08 10:18'
  },
  {
    taskId: 'TASK-2026-002',
    taskName: '监督共享资料汇总分析',
    auditObjects: ['上海分公司'],
    effectiveDepartments: ['经纪业务部'],
    auditPeriod: '2026Q1',
    selectedCapabilities: ['监督共享信息汇总'],
    owner: '王审计',
    status: taskStates.MATERIAL,
    currentStep: '资料导入',
    updatedAt: '2026-07-08 09:50'
  },
  {
    taskId: 'TASK-2026-003',
    taskName: '营业部常规审计报告',
    auditObjects: ['上海分公司'],
    effectiveDepartments: ['审计部'],
    auditPeriod: '2026H1',
    selectedCapabilities: ['审计报告生成'],
    owner: '李复核',
    status: taskStates.CONFIRMED,
    currentStep: '报告锁定',
    updatedAt: '2026-07-07 17:20'
  }
];

export const uploadSession = {
  uploadId: 'UP-SUP-001',
  sourceModule: '监督共享',
  status: fileStates.UPLOADED,
  fileCount: 8,
  successCount: 5,
  failedCount: 1,
  duplicateCount: 1,
  formatErrorCount: 1
};

export const folderTree = [
  {
    name: '监督共享资料',
    path: '/监督共享资料',
    type: 'folder',
    children: [
      { name: '经纪业务部', path: '/监督共享资料/经纪业务部', type: 'folder' },
      { name: '风险事项台账.xlsx', path: '/监督共享资料/经纪业务部/风险事项台账.xlsx', type: 'file', status: '上传成功' },
      { name: '整改跟踪表.xlsx', path: '/监督共享资料/经纪业务部/整改跟踪表.xlsx', type: 'file', status: '重复文件' },
      { name: '临时说明.tmp', path: '/监督共享资料/经纪业务部/临时说明.tmp', type: 'file', status: '格式异常' }
    ]
  }
];

export const fileAssets = [
  {
    assetId: 'FA-001',
    fileName: '风险事项台账.xlsx',
    folderPath: '/监督共享资料/经纪业务部',
    fileType: '监督共享台账',
    sourceModule: '监督共享',
    ownerDepartment: '经纪业务部',
    effectiveDepartments: ['经纪业务部'],
    dataPeriod: '2026Q1',
    tags: ['风险事项', '整改跟踪'],
    parseStatus: '解析成功',
    referenceCount: 2,
    referenceStatus: '引用锁定',
    validityStatus: '有效',
    adaptOrg: '上海分公司',
    adaptDepartment: '经纪业务部'
  },
  {
    assetId: 'FA-002',
    fileName: '营业部审计资料包.zip',
    folderPath: '/报告资料/营业部',
    fileType: '报告资料',
    sourceModule: '审计报告',
    ownerDepartment: '审计部',
    effectiveDepartments: ['审计部'],
    dataPeriod: '2026H1',
    tags: ['报告资料'],
    parseStatus: '待补字段',
    referenceCount: 0,
    referenceStatus: '可引用',
    validityStatus: '有效',
    adaptOrg: '',
    adaptDepartment: ''
  }
];

export const expenseRules = Array.from({ length: 27 }, (_, index) => ({
  ruleId: `R-${String(index + 1).padStart(2, '0')}`,
  ruleNo: index + 1,
  ruleName: [
    '招待人均超600', '酒水单瓶超500', '同饭店同日多票', '餐饮发票连号', '节假日敏感词',
    '高档场所', '餐饮无小票', '小票高档菜酒烟', '陪餐人数超比例', '礼品茶叶超600',
    '会议培训餐费超50', '外地培训未审批', '加班车费时间异常', '加班餐费超50', '通讯费超月度限额',
    '景区住宿敏感词', '领导住宿超标准', '员工住宿超规定', '交通伙补超200', '本市住宿未审批',
    '补贴未扣减', '负责人报销车辆费', '高档办公用品', '合同付款不一致', '预算执行超预算',
    '超预算未审批', '预算调剂未审批'
  ][index],
  category: index < 10 ? '业务招待/餐饮' : index < 12 ? '会议培训' : index < 15 ? '加班补贴通讯' : index < 21 ? '差旅住宿' : index === 21 ? '车辆费用' : index === 22 ? '采购办公' : index === 23 ? '合同付款' : '预算合规',
  status: '启用',
  dataDependencies: ['费控/报销', '发票平台/OCR', 'OA审批', '预算系统'].slice(0, (index % 4) + 1)
}));

export const expenseAnomalies = [
  {
    anomalyId: 'AN-001',
    ruleId: 'R-01',
    type: '招待人均超标',
    department: '经纪业务部',
    employee: '张某',
    amount: 12800,
    riskLevel: '高',
    status: '待确认',
    evidence: ['报销单 BX-2026-1881', '餐饮小票 OCR-771', 'OA审批 OA-2031'],
    remediation: '核实招待人数，超标准部分建议退回或补充专项说明。'
  },
  {
    anomalyId: 'AN-002',
    ruleId: 'R-24',
    type: '合同付款不一致',
    department: '计划财务部',
    employee: '李某',
    amount: 56000,
    riskLevel: '中',
    status: '待补充',
    evidence: ['合同 HT-2026-009', '付款凭证 PZ-7721'],
    remediation: '补充合同付款条件确认材料。'
  }
];

export const reportDraft = {
  draftId: 'RD-001',
  taskId: 'TASK-2026-001',
  reportType: '常规审计报告',
  templateName: '营业部常规审计报告模板 V2.1',
  status: reportStates.NOT_GENERATED,
  sourceTraceStatus: '部分缺失',
  chapters: [
    { chapterId: 'CH-1', title: '一、审计范围', sourceStatus: '来源完整' },
    { chapterId: 'CH-2', title: '二、费用异常总体情况', sourceStatus: '来源完整' },
    { chapterId: 'CH-3', title: '三、整改建议', sourceStatus: '依据不足' }
  ]
};

export const gapItems = [
  { gapId: 'GAP-001', chapter: '三、整改建议', gapType: '关键资料', required: true, status: '待补充', resolution: '补充整改责任部门说明' },
  { gapId: 'GAP-002', chapter: '附件', gapType: '可选资料', required: false, status: '可说明', resolution: '填写缺口说明后可生成提示草稿' }
];

export const operationLogs = [
  { logId: 'LOG-001', operator: '王审计', action: '创建任务', targetType: '任务', targetId: 'TASK-2026-001', result: '成功', createdAt: '2026-07-08 09:00' },
  { logId: 'LOG-002', operator: '王审计', action: '上传文件夹', targetType: '上传批次', targetId: 'UP-SUP-001', result: '成功', createdAt: '2026-07-08 09:20' },
  { logId: 'LOG-003', operator: '系统', action: '删除阻断', targetType: '文件资产', targetId: 'FA-001', result: '被阻断', reason: 'ASSET_REFERENCED', createdAt: '2026-07-08 09:35' }
];

export const versionRecords = [
  { versionId: 'V-REP-001', objectType: '报告', objectName: '营业部常规审计报告', versionNo: 'V1.0', status: '已锁定', createdBy: '李复核', createdAt: '2026-07-07 17:20' },
  { versionId: 'V-STD-001', objectType: '审计规范', objectName: '费用报销审计规范', versionNo: 'V2.1', status: '有效', createdBy: '配置管理员', createdAt: '2026-07-06 14:10' }
];

export const exportRecords = [
  { exportId: 'EXP-001', objectType: '报告', objectName: '营业部常规审计报告', format: 'Word', exportedBy: '李复核', exportedAt: '2026-07-07 17:35' },
  { exportId: 'EXP-002', objectType: '费用异常清单', objectName: '上海分公司费用异常明细', format: 'Excel', exportedBy: '王审计', exportedAt: '2026-07-08 10:12' }
];

export const callbackRecords = [
  { callbackId: 'CB-001', reportName: '营业部常规审计报告', lockedVersion: 'V1.0', offlineFile: '营业部常规审计报告_线下修改稿.docx', status: '待比对' }
];

export const checkIssues = [
  { issueId: 'CHK-001', type: '标题层级', severity: '高', location: '第3页 二级标题', status: '待定位' },
  { issueId: 'CHK-002', type: '字号', severity: '中', location: '第5页 表格说明', status: '待定位' },
  { issueId: 'CHK-003', type: '编号连续性', severity: '中', location: '第8页 第三节', status: '待定位' },
  { issueId: 'CHK-004', type: '页眉页脚', severity: '低', location: '第12页 页脚', status: '待定位' }
];

export const recheckRecords = [];

export const regulatoryFindings = [
  { findingId: 'REG-001', type: '监管关注点', title: '客户适当性留痕不完整', riskLevel: '高', source: '监管通报 2026-03', adoptStatus: '待确认' },
  { findingId: 'REG-002', type: '舆情风险提示', title: '营业部投诉集中于产品说明', riskLevel: '中', source: '公开舆情快照', adoptStatus: '待确认' },
  { findingId: 'REG-003', type: '检查建议候选', title: '抽查高风险产品销售录音录像', riskLevel: '中', source: '历史检查建议库', adoptStatus: '已纳入' }
];

export const regulatoryHistory = [
  { historyId: 'RH-001', taskName: '上海分公司适当性监管线索分析', period: '2026Q2', status: '已锁定', exportedAt: '2026-07-06 16:20', referenceCount: 2 },
  { historyId: 'RH-002', taskName: '营业部投诉舆情风险分析', period: '2026Q1', status: '待确认', exportedAt: '-', referenceCount: 0 }
];

export const standardSources = [
  { sourceId: 'STD-S-001', sourceType: '内部规章制度', title: '费用报销管理办法', scope: '上海分公司', period: '2025-2026', version: 'V2.1', status: '可引用' },
  { sourceId: 'STD-S-002', sourceType: '外部法规', title: '证券公司内部控制指引', scope: '全公司', period: '现行有效', version: '2026版', status: '可引用' },
  { sourceId: 'STD-S-003', sourceType: '案例库', title: '费用舞弊检查案例', scope: '审计部', period: '2024-2026', version: '案例集 V1.4', status: '可引用' }
];

export const standardDraft = {
  draftId: 'STD-D-001',
  mode: '0-1 生成',
  title: '费用报销审计规范草稿',
  status: '待确认',
  defectSummary: '缺少合同付款一致性章节，已形成缺点分析。',
  chapters: [
    { chapterId: 'STD-CH-1', source: '内部规章制度', draft: '审计目标：核验费用报销真实性、合规性和预算匹配性。', suggestion: '补充预算调剂审批核验。' },
    { chapterId: 'STD-CH-2', source: '外部法规', draft: '审计程序：抽查审批链、发票、合同和付款凭证。', suggestion: '增加高风险供应商筛选条件。' },
    { chapterId: 'STD-CH-3', source: '案例库', draft: '关注事项：重复报销、拆单报销、超标准接待。', suggestion: '补充小票 OCR 核验。' }
  ]
};

export const standardVersions = [
  { versionId: 'STD-V-001', standardName: '费用报销审计规范', versionNo: 'V2.1', status: '当前有效', referenceCount: 4, createdAt: '2026-06-20' },
  { versionId: 'STD-V-002', standardName: '费用报销审计规范', versionNo: 'V2.2', status: '待入库', referenceCount: 0, createdAt: '2026-07-08' }
];

export const standardDiffItems = [
  { diffId: 'SD-001', section: '审计范围', changeType: '新增', summary: '新增合同付款一致性核验范围。' },
  { diffId: 'SD-002', section: '审计程序', changeType: '修改', summary: '将抽样比例从 10% 调整为按风险等级分层抽样。' },
  { diffId: 'SD-003', section: '附件', changeType: '新增', summary: '新增发票 OCR 核验字段清单。' }
];

export const expenseUsageMetrics = [
  { label: '费用总额', value: '865.4万', hint: '较上期 +8.6%' },
  { label: '预算执行率', value: '91.2%', hint: '预算 948.7万' },
  { label: '预算偏差', value: '-83.3万', hint: '未超总预算' },
  { label: '人均费用', value: '1.84万', hint: '经纪业务部偏高' }
];

export const expenseUsageBreakdown = [
  { itemId: 'EU-001', dimension: '费用类别', name: '业务招待费', amount: '216.5万', ratio: '25.0%', trend: '+12.8%', source: '费控/报销、发票 OCR' },
  { itemId: 'EU-002', dimension: '部门', name: '经纪业务部', amount: '342.1万', ratio: '39.5%', trend: '+9.4%', source: '预算系统、财务总账' },
  { itemId: 'EU-003', dimension: '员工', name: '张某', amount: '18.6万', ratio: '2.1%', trend: '+31.0%', source: '费控/报销、OA审批' },
  { itemId: 'EU-004', dimension: '供应商', name: '上海某会务服务有限公司', amount: '74.2万', ratio: '8.6%', trend: '+16.2%', source: '合同系统、付款凭证' }
];

export const reportTemplates = [
  { templateId: 'TPL-001', name: '营业部常规审计报告模板', version: 'V2.1', status: '已发布', referenceCount: 6, styleStatus: '规则已绑定' },
  { templateId: 'TPL-002', name: '经营审计报告模板', version: 'V1.8', status: '待发布', referenceCount: 0, styleStatus: '待绑定检查规则' }
];

export const templateDiffItems = [
  { diffId: 'TD-001', node: '目录结构', changeType: '新增章节', summary: '新增整改跟踪章节。' },
  { diffId: 'TD-002', node: '标题样式', changeType: '修改样式', summary: '二级标题字号从小四改为四号。' },
  { diffId: 'TD-003', node: '检查规则', changeType: '新增绑定', summary: '绑定编号连续性和页眉页脚检查。' }
];

export const reportDiffItems = [
  { diffId: 'RDIFF-001', section: '二、费用异常总体情况', changeType: '线下新增', summary: '新增一段对高风险异常的说明。', decision: '待确认' },
  { diffId: 'RDIFF-002', section: '三、整改建议', changeType: '线下修改', summary: '整改期限由 30 日调整为 20 日。', decision: '形成新版本' },
  { diffId: 'RDIFF-003', section: '附件', changeType: '格式调整', summary: '表格列宽和页眉被修改。', decision: '仅归档' }
];

export const supervisionReportSources = [
  { sourceId: 'SUP-RS-001', fileName: '风险事项台账.xlsx', adaptOrg: '上海分公司', adaptDepartment: '经纪业务部', dataPeriod: '2026Q1', tags: '风险事项、整改跟踪', referenceStatus: '可引用', permissionScope: '权限内' },
  { sourceId: 'SUP-RS-002', fileName: '监督检查汇总.docx', adaptOrg: '上海分公司', adaptDepartment: '计划财务部', dataPeriod: '2026Q1', tags: '监督检查', referenceStatus: '可引用', permissionScope: '权限内' },
  { sourceId: 'SUP-RS-003', fileName: '跨部门投诉明细.xlsx', adaptOrg: '上海分公司', adaptDepartment: '客户服务部', dataPeriod: '2026Q1', tags: '投诉', referenceStatus: '不可引用', permissionScope: '无部门权限' }
];

export const capabilityCatalog = [
  { capabilityId: 'CAP-01', capabilityName: '制度查询', module: '审计规范智能化', input: '制度名称、适用部门、时间范围', dataNeed: '制度库、法规库', output: '制度条款清单', deposit: '任务详情 / 分析过程', state: '结构化查询' },
  { capabilityId: 'CAP-02', capabilityName: '制度变更', module: '审计规范智能化', input: '制度版本、变更周期', dataNeed: '制度库、版本记录', output: '变更影响清单', deposit: '任务详情 / 版本记录', state: '待确认' },
  { capabilityId: 'CAP-03', capabilityName: '制度比对', module: '审计规范智能化', input: '内外部制度版本', dataNeed: '内部制度、外部法规', output: '差异分析结果', deposit: '任务详情 / 生成结果', state: '待确认' },
  { capabilityId: 'CAP-04', capabilityName: '监管案例舆情分析', module: '监管案例舆情分析', input: '单位、业务范围、风险标签', dataNeed: '监管案例、舆情快照、历史建议', output: '监管关注点和候选建议', deposit: '任务详情 / 生成结果', state: '已接入' },
  { capabilityId: 'CAP-05', capabilityName: '审计规范生成', module: '审计规范智能化', input: '0-1、1-2、上传标准规范', dataNeed: '制度库、法规库、案例库、模板库', output: '审计规范草稿和版本差异', deposit: '任务详情 / 报告与附件', state: '已接入' },
  { capabilityId: 'CAP-06', capabilityName: '监督共享信息分析', module: '监督共享信息汇总分析', input: '库内共享文件、机构、部门、周期、标签', dataNeed: '监督共享文件中心', output: '发现事项、整改事项、合规事项、风险提示', deposit: '任务详情 / 生成结果', state: '已接入' },
  { capabilityId: 'CAP-07', capabilityName: '费用审计', module: '费用智能化审计', input: '费控、OA、预算、发票、合同、HR 快照', dataNeed: '27 条费用规则和数据快照', output: '费用综合看板、候选异常、整改建议', deposit: '任务详情 / 分析过程', state: '已接入' },
  { capabilityId: 'CAP-08', capabilityName: '报告生成', module: '审计报告智能化', input: '报告模板、来源资料、费用结果、风险事项', dataNeed: '模板库、文件中心、费用快照', output: '报告草稿、锁定版本、导出记录', deposit: '任务详情 / 报告与附件', state: '已接入' },
  { capabilityId: 'CAP-09', capabilityName: '报告审核', module: '审计报告智能化', input: '报告草稿、来源依据、审核规则', dataNeed: '报告草稿、来源快照、规范检查规则', output: '审核建议、采纳记录、复核记录', deposit: '任务详情 / 复核记录', state: '已接入' }
];

export const capabilityRuns = [
  { runId: 'RUN-01', capabilityName: '监督共享信息分析', status: '已入库', owner: '王审计', source: '风险事项台账.xlsx', output: '3 条风险提示、2 条整改事项', nextAction: '选择来源生成报告' },
  { runId: 'RUN-02', capabilityName: '费用审计', status: '待确认', owner: '王审计', source: '费控/OA/预算快照', output: '2 条候选异常、1 条待补充', nextAction: '处理候选异常' },
  { runId: 'RUN-03', capabilityName: '报告生成', status: '草稿待确认', owner: '李复核', source: '模板 V2.1、费用结果、监督共享资料', output: '营业部常规审计报告草稿', nextAction: '审核建议处理' },
  { runId: 'RUN-04', capabilityName: '制度比对', status: '待启动', owner: '王审计', source: '内部制度 V2.1、外部法规 2026', output: '未生成', nextAction: '进入审计规范模块' }
];

export const taskDetailTabs = [
  { tabKey: 'overview', label: '任务概览', count: 4, status: '进行中' },
  { tabKey: 'materials', label: '输入资料', count: 8, status: '2 个引用锁定' },
  { tabKey: 'analysis', label: '分析过程', count: 4, status: '1 个待确认' },
  { tabKey: 'results', label: '生成结果', count: 6, status: '草稿待确认' },
  { tabKey: 'reports', label: '报告与附件', count: 3, status: '报告未锁定' },
  { tabKey: 'changes', label: '修改记录', count: 2, status: '已记录' },
  { tabKey: 'reviews', label: '复核记录', count: 2, status: '待复核' },
  { tabKey: 'versions', label: '版本记录', count: 2, status: '可追溯' },
  { tabKey: 'exports', label: '导出记录', count: 2, status: '可下载' },
  { tabKey: 'logs', label: '操作留痕', count: 24, status: '全流程' }
];

export const pageStates = {
  workbench: { state: 'empty', title: '暂无新的待办任务', description: '新员工或新系统上线时，可先创建审计任务，也可查看示例任务理解资料准备、分析确认和报告锁定路径。' },
  taskList: { state: 'empty', title: '当前筛选条件下无任务', description: '请调整覆盖部门、创建人或任务状态；无权限任务不会出现在列表中。' },
  taskDetail: { state: 'running', title: '任务正在办理中', description: '费用异常待确认、报告草稿待审核，所有资料和结果均沉淀在任务台账中。' },
  fileCenter: { state: 'locked', title: '存在引用锁定文件', description: '已被报告或规范引用的文件不能直接修改、失效或删除，只能申请解锁并回退草稿。' },
  reportSource: { state: 'blocked', title: '关键资料缺口未处理', description: '来源预检前可以选择资料；关键资料缺失时不能生成正式报告草稿。' },
  expenseCandidates: { state: 'running', title: '候选异常待人工处理', description: '确认、排除、待补充和整改建议会形成行状态变化并写入记录中心。' }
};

export const expenseEvidenceChains = [
  { anomalyId: 'AN-001', basicInfo: '经纪业务部张某，业务招待费 12800 元，风险等级高。', vouchers: ['报销单 BX-2026-1881', '餐饮小票 OCR-771', '财务凭证 PZ-4021'], approvalChain: ['经办人提交', '部门负责人审批', '计划财务部复核', '分管领导未补充专项说明'], ruleHit: '规则 R-01：招待人均超过 600 元，且缺少接待人数说明。', similarRecords: ['2026-04 同供应商消费 3 次', '2026-05 同员工连续两笔接待报销'], manualHandling: '待确认，建议补充接待对象和人数说明。' },
  { anomalyId: 'AN-002', basicInfo: '计划财务部李某，合同付款 56000 元，风险等级中。', vouchers: ['合同 HT-2026-009', '付款凭证 PZ-7721', 'OA 审批 OA-6618'], approvalChain: ['经办人提交', '部门负责人审批', '财务复核退回一次', '二次提交通过'], ruleHit: '规则 R-24：合同付款节点与实际付款凭证不一致。', similarRecords: ['同供应商 2026Q1 有 2 次付款节点调整'], manualHandling: '待补充，需上传合同付款条件确认材料。' }
];

export const reportReviewItems = [
  { reviewId: 'RR-001', chapter: '二、费用异常总体情况', suggestion: '补充高风险异常金额口径说明', source: '费用异常 AN-001、预算快照', status: '待处理', decision: '未处理' },
  { reviewId: 'RR-002', chapter: '三、整改建议', suggestion: '依据不足段落应改为内容完整性提示，不进入正式结论', source: '资料缺口 GAP-001', status: '待处理', decision: '未处理' },
  { reviewId: 'RR-003', chapter: '附件', suggestion: '将监督共享风险事项台账列为附件来源', source: '风险事项台账.xlsx', status: '已采纳', decision: '采纳' }
];

export const policyLibrary = [
  { policyId: 'POL-001', name: '费用报销管理办法', version: 'V2.1', effectiveDept: '上海分公司', status: '现行有效', referenceStatus: '已被引用' },
  { policyId: 'POL-002', name: '业务招待费管理细则', version: 'V1.8', effectiveDept: '经纪业务部', status: '现行有效', referenceStatus: '可引用' }
];

export const policyChangeItems = [
  { changeId: 'PC-001', policyName: '费用报销管理办法', changeType: '新增', impact: '新增合同付款一致性检查条款', status: '待确认' },
  { changeId: 'PC-002', policyName: '业务招待费管理细则', changeType: '修改', impact: '接待人数说明从可选改为必填', status: '已确认' }
];

export const policyCompareItems = [
  { compareId: 'CMP-001', section: '招待费标准', internalRule: '人均 600 元以内', externalRule: '按公司内部标准执行', result: '一致', action: '引用到审计规范' },
  { compareId: 'CMP-002', section: '合同付款', internalRule: '付款节点需合同条款匹配', externalRule: '强调付款审批链完整', result: '存在补充要求', action: '生成规范优化建议' }
];

export const supervisionFindings = [
  { findingId: 'SF-001', type: '发现事项', title: '跨部门风险事项闭环不完整', source: '风险事项台账.xlsx', status: '待确认' },
  { findingId: 'SF-002', type: '整改事项', title: '整改责任部门未填写完成日期', source: '整改跟踪表.xlsx', status: '待补充' },
  { findingId: 'SF-003', type: '合规事项', title: '监督共享资料满足报告引用条件', source: '监督检查汇总.docx', status: '可引用' },
  { findingId: 'SF-004', type: '风险提示', title: '同类投诉集中于产品说明环节', source: '跨部门投诉明细.xlsx', status: '待确认' }
];

export const fileAssetsExtended = [
  { assetId: 'FA-001', fileName: '风险事项台账.xlsx', assetCategory: '入库文件', sourceModule: '监督共享', taskName: '监督共享资料汇总分析', ownerDepartment: '经纪业务部', dataPeriod: '2026Q1', parseStatus: '解析成功', referenceCount: 2, referenceStatus: '引用锁定', validityStatus: '有效', versionNo: 'V1.0', permissionScope: '上海分公司 / 经纪业务部' },
  { assetId: 'FA-002', fileName: '营业部审计资料包.zip', assetCategory: '补充上传资料', sourceModule: '审计报告', taskName: '营业部常规审计报告', ownerDepartment: '审计部', dataPeriod: '2026H1', parseStatus: '待补字段', referenceCount: 0, referenceStatus: '可引用', validityStatus: '有效', versionNo: '草稿资料', permissionScope: '上海分公司 / 审计部' },
  { assetId: 'FA-003', fileName: '营业部常规审计报告.docx', assetCategory: '生成文件', sourceModule: '审计报告', taskName: '营业部常规审计报告', ownerDepartment: '审计部', dataPeriod: '2026H1', parseStatus: '已生成', referenceCount: 1, referenceStatus: '锁定版本', validityStatus: '有效', versionNo: 'V1.1', permissionScope: '上海分公司 / 审计部' },
  { assetId: 'FA-004', fileName: '线下修改稿_比对结果.docx', assetCategory: '回传文件', sourceModule: '审计报告', taskName: '营业部常规审计报告', ownerDepartment: '审计部', dataPeriod: '2026H1', parseStatus: '已比对', referenceCount: 1, referenceStatus: '归档引用', validityStatus: '有效', versionNo: 'V1.1-离线稿', permissionScope: '上海分公司 / 审计部' }
];

export const reviewRecords = [
  { reviewLogId: 'REV-001', objectName: '营业部常规审计报告草稿', reviewer: '李复核', action: '采纳审核建议', result: '成功', createdAt: '2026-07-08 16:30' },
  { reviewLogId: 'REV-002', objectName: '费用异常整改建议', reviewer: '任务负责人', action: '退回补充说明', result: '待补充', createdAt: '2026-07-08 16:42' }
];

export const permissionChangeLogs = [
  { permissionLogId: 'PERM-001', objectName: '风险事项台账.xlsx', operator: '配置管理员', before: '审计部可见', after: '审计部、经纪业务部可见', result: '成功', createdAt: '2026-07-08 15:10' },
  { permissionLogId: 'PERM-002', objectName: '费用报销管理办法 V2.1', operator: '配置管理员', before: '可失效', after: '引用锁定，不可失效', result: '被阻断', createdAt: '2026-07-08 15:35' }
];

export const roleJourneys = [
  { role: '审计人员', path: '创建任务 -> 准备资料 -> 执行能力 -> 处理候选结果 -> 生成报告', focus: '办理和确认' },
  { role: '复核人员', path: '查看报告草稿 -> 处理审核建议 -> 检查规范问题 -> 形成复核记录', focus: '复核和质量控制' },
  { role: '任务负责人', path: '查看任务详情 -> 审阅结果 -> 锁定报告 -> 导出和回传比对', focus: '闭环和归档' },
  { role: '配置管理员', path: '维护模板/规则/标签 -> 发布版本 -> 查看引用锁定', focus: '配置版本' },
  { role: '只读用户', path: '查看任务台账 -> 查看文件和记录 -> 下载授权范围内附件', focus: '查询追溯' }
];

export const emptyStates = {
  newUser: {
    title: '当前暂无待办任务',
    description: '可先创建审计任务，或查看示例任务了解资料准备、分析确认和报告锁定流程。',
    primaryAction: '创建第一个审计任务',
    secondaryAction: '查看示例任务'
  }
};

export const mockDb = {
  currentUser,
  organizations,
  dataSources,
  tasks,
  uploadSession,
  folderTree,
  fileAssets,
  expenseRules,
  expenseAnomalies,
  reportDraft,
  gapItems,
  operationLogs,
  versionRecords,
  exportRecords,
  callbackRecords,
  checkIssues,
  recheckRecords,
  regulatoryFindings,
  regulatoryHistory,
  standardSources,
  standardDraft,
  standardVersions,
  standardDiffItems,
  expenseUsageMetrics,
  expenseUsageBreakdown,
  reportTemplates,
  templateDiffItems,
  reportDiffItems,
  supervisionReportSources,
  capabilityCatalog,
  capabilityRuns,
  taskDetailTabs,
  pageStates,
  expenseEvidenceChains,
  reportReviewItems,
  policyLibrary,
  policyChangeItems,
  policyCompareItems,
  supervisionFindings,
  fileAssetsExtended,
  reviewRecords,
  permissionChangeLogs,
  roleJourneys,
  emptyStates
};
