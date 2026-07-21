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

export const auditPersonnel = [
  { userId: 'U-001', name: '王审计', department: '审计部', title: '审计经理', active: true },
  { userId: 'U-002', name: '李审计', department: '审计部', title: '高级审计师', active: true },
  { userId: 'U-003', name: '陈晨', department: '审计部', title: '审计师', active: true },
  { userId: 'U-004', name: '赵复核', department: '风险管理部', title: '复核经理', active: true },
  { userId: 'U-005', name: '周财务', department: '计划财务部', title: '财务经理', active: true },
  { userId: 'U-006', name: '已离岗人员', department: '审计部', title: '审计师', active: false }
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

const baseExpenseAnomalies = [
  {
    anomalyId: 'FY-202504280002',
    ruleId: 'R-01',
    resultTab: 'violation',
    organization: '上海分公司',
    period: '2025Q1',
    expenseCategory: '业务招待费',
    type: '费用违规报销',
    department: '销售部',
    employee: '李娜',
    dataSource: '费控系统',
    occurredAt: '2025-03-18',
    voucherNo: '记-2025-001267',
    amount: 17850,
    budgetAmount: 15000,
    riskLevel: '高',
    status: '待确认',
    evidence: ['报销单 BX-2025-1881', '餐饮小票 OCR-771', 'OA审批 OA-2031'],
    basis: '费用报销管理办法（2024版）第55条',
    remediation: '核实接待人数与事前审批，超标准部分退回并纳入月度复核。',
    exclusionReason: '',
    supplementNote: ''
  },
  {
    anomalyId: 'FY-202504280007',
    ruleId: 'R-26',
    resultTab: 'over-budget',
    organization: '上海分公司',
    period: '2025Q1',
    expenseCategory: '业务招待费',
    type: '超预算未审批',
    department: '市场部',
    employee: '张伟',
    dataSource: '预算系统',
    occurredAt: '2025-03-16',
    voucherNo: '记-2025-001316',
    amount: 12650,
    budgetAmount: 10000,
    riskLevel: '高',
    status: '待确认',
    evidence: ['预算执行单 YS-2025-031', '报销单 BX-2025-2811'],
    basis: '预算管理办法第18条',
    remediation: '补办预算调剂审批并追溯部门负责人责任。',
    exclusionReason: '',
    supplementNote: ''
  },
  {
    anomalyId: 'FY-202504280012', ruleId: 'R-07', resultTab: 'violation', organization: '上海分公司', period: '2025Q1', expenseCategory: '办公费', type: '费用违规报销', department: '综合管理部', employee: '刘洋', dataSource: '财务系统', occurredAt: '2025-03-12', voucherNo: '记-2025-001352', amount: 8760, budgetAmount: 12000, riskLevel: '中', status: '待补充', evidence: ['报销单 BX-2025-2732', '发票 FP-88319'], basis: '费用报销管理办法第56条', remediation: '补充采购比价与验收材料。', exclusionReason: '', supplementNote: ''
  },
  {
    anomalyId: 'FY-202504280015', ruleId: 'R-19', resultTab: 'suspected', organization: '上海分公司', period: '2025Q1', expenseCategory: '会议费', type: '疑似不合规报销', department: '技术部', employee: '王磊', dataSource: '发票平台', occurredAt: '2025-02-10', voucherNo: '记-2025-001372', amount: 6320, budgetAmount: 8000, riskLevel: '中', status: '待确认', evidence: ['会议费发票 FP-99201', '会议通知 HY-221'], basis: '会议培训费管理细则第12条', remediation: '核验参会名单与会议发生日期。', exclusionReason: '', supplementNote: ''
  },
  {
    anomalyId: 'FY-202504280021', ruleId: 'R-16', resultTab: 'suspected', organization: '上海分公司', period: '2025Q1', expenseCategory: '差旅费', type: '疑似不合规报销', department: '运营部', employee: '周敏', dataSource: '费控系统', occurredAt: '2025-02-08', voucherNo: '记-2025-001389', amount: 5480, budgetAmount: 7200, riskLevel: '低', status: '已确认', evidence: ['酒店发票 FP-77102', '出差申请 OA-8902'], basis: '差旅费管理办法第23条', remediation: '纳入同类住宿记录持续监控。', exclusionReason: '', supplementNote: '已核验出差申请，确认存在住宿标准偏差。'
  },
  {
    anomalyId: 'FY-202504280033', ruleId: 'R-25', resultTab: 'over-budget', organization: '上海分公司', period: '2025Q1', expenseCategory: '培训费', type: '超预算未审批', department: '人力资源部', employee: '陈晨', dataSource: '预算系统', occurredAt: '2025-03-29', voucherNo: '记-2025-001421', amount: 23100, budgetAmount: 18000, riskLevel: '高', status: '待确认', evidence: ['培训合同 HT-2025-077', '预算执行单 YS-2025-028'], basis: '预算管理办法第18条', remediation: '补充预算调剂和供应商比价说明。', exclusionReason: '', supplementNote: ''
  },
  {
    anomalyId: 'FY-202504280041', ruleId: 'R-14', resultTab: 'violation', organization: '上海分公司', period: '2025Q1', expenseCategory: '交通费', type: '费用违规报销', department: '销售部', employee: '孙强', dataSource: '费控系统', occurredAt: '2025-03-25', voucherNo: '记-2025-001447', amount: 3980, budgetAmount: 5000, riskLevel: '低', status: '已排除', evidence: ['打车行程单 XC-12881', '加班审批 OA-8812'], basis: '加班交通费细则第8条', remediation: '', exclusionReason: '已核验夜间加班审批和行程，属于正常报销。', supplementNote: ''
  },
  {
    anomalyId: 'FY-202504280055', ruleId: 'R-24', resultTab: 'suspected', organization: '上海分公司', period: '2025Q1', expenseCategory: '合同付款', type: '疑似不合规报销', department: '计划财务部', employee: '吴迪', dataSource: '财务系统', occurredAt: '2025-03-21', voucherNo: '记-2025-001502', amount: 41200, budgetAmount: 45000, riskLevel: '高', status: '待补充', evidence: ['合同 HT-2025-009', '付款凭证 PZ-7721'], basis: '合同付款管理细则第9条', remediation: '补充合同付款节点确认材料。', exclusionReason: '', supplementNote: ''
  }
];

const employeeNumbers = {
  张伟: '100123',
  李娜: '100128',
  刘洋: '100136',
  王磊: '100142',
  周敏: '100151',
  陈晨: '100159',
  孙强: '100168',
  吴迪: '100177'
};

const ruleNames = {
  'R-01': '费用报销管理办法规则 V1.5',
  'R-07': '凭证完整性规则 V1.2',
  'R-14': '无合理用途规则 V1.1',
  'R-16': '差旅费报销标准规则 V1.6',
  'R-19': '不合规报销规则 V1.3',
  'R-24': '审批流程规则 V1.4',
  'R-25': '预算控制规则 V2.0',
  'R-26': '超预算未审批规则 V2.1'
};

export const expenseAnomalies = baseExpenseAnomalies.map((row, index) => ({
  ...row,
  displayId: `AY20250428${String(index + 1).padStart(4, '0')}`,
  employeeNo: employeeNumbers[row.employee] || `100${120 + index}`,
  location: row.location || '上海',
  attachment: row.attachment || `发票_202503${String(index + 12).padStart(2, '0')}.pdf`,
  ruleName: ruleNames[row.ruleId] || `${row.type}规则`,
  evidenceStatus: row.status === '待补充' || index % 3 === 2 ? '不完整' : '完整'
}));

export const expenseAuditContext = {
  organization: '上海分公司',
  period: '2025Q1（2025-01-01 ～ 2025-03-31）',
  periodLabel: '2025年Q1（2025-01 ~ 2025-03）',
  dataSources: '费控 / 预算 / 财务 / 审批',
  taskStatus: '待确认',
  snapshotAt: '2025-04-28 10:30',
  ruleVersion: 'V2.1（最新）',
  expectedAt: '2025-04-28 15:00',
  progress: 82,
  charts: {
    trend: [
      { label: '2025-01', actual: 3500000, budget: 4520000 },
      { label: '2025-02', actual: 4050000, budget: 4860000 },
      { label: '2025-03', actual: 4306230.45, budget: 5200000 }
    ],
    categoryStructure: [
      { label: '差旅费', value: 3680000 },
      { label: '业务招待费', value: 2410000 },
      { label: '办公费', value: 1982000 },
      { label: '会议费', value: 1270000 },
      { label: '培训费', value: 940000 },
      { label: '其他', value: 2574230.45 }
    ],
    employeeRanking: [
      { label: '张伟', value: 28650 },
      { label: '李娜', value: 24780.5 },
      { label: '王磊', value: 21430.3 },
      { label: '刘洋', value: 19850.2 },
      { label: '陈晨', value: 18920.1 },
      { label: '赵敏', value: 17680.4 },
      { label: '周强', value: 16540.8 },
      { label: '吴迪', value: 15320.6 },
      { label: '孙悦', value: 14880.3 },
      { label: '黄凯', value: 13950.4 }
    ],
    monitorTrend: [
      { label: '2025-01', count: 58, amount: 1250000, yoyAmount: 1620000 },
      { label: '2025-02', count: 71, amount: 1720000, yoyAmount: 1420000 },
      { label: '2025-03', count: 86, amount: 2050000, yoyAmount: 1240000 }
    ],
    departmentHeatmap: [
      { department: '市场部', low: 8, medium: 12, high: 19 },
      { department: '销售部', low: 6, medium: 14, high: 21 },
      { department: '综合管理部', low: 11, medium: 18, high: 16 },
      { department: '技术部', low: 9, medium: 10, high: 15 },
      { department: '运营部', low: 5, medium: 6, high: 8 },
      { department: '其他', low: 3, medium: 5, high: 4 }
    ],
    anomalyDistribution: [
      { label: '超预算未审批', value: 105, percent: 34.31 },
      { label: '费用违规报销', value: 83, percent: 27.12 },
      { label: '疑似不合规报销', value: 60, percent: 19.61 },
      { label: '虚假发票', value: 29, percent: 9.48 },
      { label: '无合理用途', value: 20, percent: 6.54 },
      { label: '其他', value: 9, percent: 2.94 }
    ],
    ruleRanking: [
      { label: '超预算未审批规则', value: 96 },
      { label: '费用报销管理办法规则', value: 78 },
      { label: '差旅费报销标准规则', value: 62 },
      { label: '发票合规性规则', value: 58 },
      { label: '无合理用途规则', value: 41 },
      { label: '预算控制规则', value: 33 },
      { label: '审批流程规则', value: 28 },
      { label: '凭证完整性规则', value: 23 },
      { label: '费用归属规则', value: 19 },
      { label: '其他规则', value: 12 }
    ]
  },
  metrics: {
    totalExpense: 12856230.45,
    budgetUsageRate: 82.45,
    anomalyAmount: 1256780.32,
    anomalyCount: 306,
    pendingCount: 86,
    pendingAmount: 1025430,
    highRiskCount: 48,
    highRiskAmount: 658240,
    supplementCount: 23,
    supplementAmount: 232560,
    confirmedCount: 112,
    confirmedAmount: 2356780,
    excludedCount: 37,
    excludedAmount: 186420
  },
  tabCounts: {
    all: 306,
    'high-risk': 48,
    pending: 86,
    supplement: 23,
    confirmed: 112,
    excluded: 37,
    'over-budget': 86,
    violation: 64,
    suspected: 58,
    summary: 256,
    remediation: 18
  }
};

export const expenseOutputs = [
  { outputId: 'EO-001', name: '费用异常汇总Excel', type: 'Excel', size: '64KB', tone: 'excel' },
  { outputId: 'EO-002', name: '费用综合分析报告', type: 'Word', size: '248KB', tone: 'word' },
  { outputId: 'EO-003', name: '整改建议清单', type: 'Excel', size: '32KB', tone: 'excel' },
  { outputId: 'EO-004', name: '报销明细台账（关联）', type: 'Excel', size: '156KB', tone: 'excel' },
  { outputId: 'EO-005', name: '导出记录', type: '记录', size: '共 3 条记录', tone: 'folder' }
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

export const expenseTrendAnalysis = {
  filters: {
    organizations: ['上海分公司', '北京分公司', '深圳分公司'],
    periods: ['本年累计（2025-01 ~ 2025-04）', '近 6 个月', '近 12 个月'],
    categories: ['全部', '业务招待费', '市场推广费', '差旅费', '会议费', '其他'],
    departments: ['全部', '市场部', '销售部', '技术部', '综合管理部', '运营部'],
    budgetScopes: ['年度预算', '季度预算', '专项预算'],
    sources: ['全部', '费控系统', '预算系统', '财务总账', 'OA 审批']
  },
  metrics: [
    { key: 'total', label: '本期费用总额', value: '12,856,230.45', unit: '元', hint: '环比：+8.62%', trend: '同比：+11.35%', tone: 'blue', icon: '趋' },
    { key: 'mom', label: '环比增长', value: '8.62', unit: '%', hint: '较上期 +1,025,430.00 元', trend: '', tone: 'green', icon: '环' },
    { key: 'yoy', label: '同比增长', value: '11.35', unit: '%', hint: '较去年同期 +1,309,820.45 元', trend: '', tone: 'orange', icon: '同' },
    { key: 'budget', label: '预算使用率', value: '82.45', unit: '%', hint: '预算 15,600,000.00 元', trend: '', tone: 'blue', icon: '预' },
    { key: 'warning', label: '趋势预警', value: '6', unit: '项', hint: '较上月 +2 项', trend: '', tone: 'red', icon: '警' }
  ],
  monthlyTrend: [
    { month: '2025-01', actual: 558, budget: 482, growth: 8 },
    { month: '2025-02', actual: 764, budget: 701, growth: 22 },
    { month: '2025-03', actual: 548, budget: 632, growth: 14 },
    { month: '2025-04', actual: 789, budget: 742, growth: 26 }
  ],
  categoryTrend: [
    { month: '2025-01', business: 260, marketing: 130, travel: 180, meeting: 90, other: 70 },
    { month: '2025-02', business: 300, marketing: 210, travel: 220, meeting: 120, other: 95 },
    { month: '2025-03', business: 285, marketing: 195, travel: 210, meeting: 110, other: 90 },
    { month: '2025-04', business: 335, marketing: 175, travel: 240, meeting: 125, other: 105 }
  ],
  departmentRanking: [
    { department: '市场部', amount: 2856300 },
    { department: '销售部', amount: 2134500 },
    { department: '技术部', amount: 1876200 },
    { department: '综合管理部', amount: 1532800 },
    { department: '运营部', amount: 1288400 },
    { department: '上海营业部', amount: 1074200 },
    { department: '合规风控部', amount: 862300 },
    { department: '人力资源部', amount: 645800 },
    { department: '财务部', amount: 523600 },
    { department: '行政部', amount: 456130 }
  ],
  employeeOutliers: [
    { employee: '张敏', amount: 4.45, frequency: 24.8, level: '异常' },
    { employee: '李伟', amount: 3.86, frequency: 19.1, level: '异常' },
    { employee: '王磊', amount: 3.12, frequency: 16.8, level: '关注' },
    { employee: '赵晴', amount: 2.74, frequency: 13.6, level: '关注' },
    { employee: '陈晨', amount: 2.18, frequency: 11.2, level: '关注' },
    { employee: '孙强', amount: 1.54, frequency: 8.3, level: '正常' },
    { employee: '吴迪', amount: 1.21, frequency: 5.6, level: '正常' },
    { employee: '周琪', amount: 0.92, frequency: 4.8, level: '正常' },
    { employee: '刘洋', amount: 0.68, frequency: 3.2, level: '正常' },
    { employee: '许璐', amount: 0.48, frequency: 2.4, level: '正常' }
  ],
  warningSummary: [
    { type: '金额异常增长', count: 2, amount: '1,256,780.32', mom: '+28.63%', yoy: '+34.21%', owner: '市场部、销售部', note: '费用金额增幅超过预设阈值（20%）' },
    { type: '预算偏差超限', count: 2, amount: '956,420.18', mom: '+18.52%', yoy: '+22.37%', owner: '技术部、运营部', note: '预算偏差率超过 ±10%' },
    { type: '单笔大额费用', count: 1, amount: '126,300.00', mom: '+56.23%', yoy: '+48.62%', owner: '销售部', note: '单笔费用超过 5 万元' },
    { type: '员工离群预警', count: 1, amount: '86,420.00', mom: '+42.18%', yoy: '+39.75%', owner: '市场部（张敏）', note: '员工费用显著高于同岗平均水平' }
  ],
  structureChange: [
    { category: '业务招待费', last: 28.12, current: 29.85, change: '+1.73' },
    { category: '市场推广费', last: 23.45, current: 25.17, change: '+1.72' },
    { category: '差旅费', last: 20.36, current: 18.92, change: '-1.44' },
    { category: '会议费', last: 11.28, current: 10.54, change: '-0.74' },
    { category: '其他', last: 16.79, current: 15.52, change: '-1.27' }
  ],
  detailRows: [
    { period: '2025-04', category: '业务招待费', department: '市场部', amount: '1,285,630.00', mom: '+12.36%', yoy: '+18.72%', budgetDiff: '+185,630.00', budgetRate: '+16.87%', judgement: '上升' },
    { period: '2025-04', category: '市场推广费', department: '销售部', amount: '1,174,520.00', mom: '+9.85%', yoy: '+15.23%', budgetDiff: '+134,520.00', budgetRate: '+12.93%', judgement: '上升' },
    { period: '2025-04', category: '差旅费', department: '技术部', amount: '968,430.00', mom: '-3.21%', yoy: '-5.62%', budgetDiff: '-31,570.00', budgetRate: '-3.16%', judgement: '平稳' },
    { period: '2025-04', category: '会议费', department: '综合管理部', amount: '538,210.00', mom: '-8.75%', yoy: '-4.18%', budgetDiff: '-61,790.00', budgetRate: '-10.30%', judgement: '下降' },
    { period: '2025-04', category: '其他', department: '运营部', amount: '423,450.00', mom: '+6.14%', yoy: '+8.37%', budgetDiff: '+23,450.00', budgetRate: '+5.85%', judgement: '上升' }
  ],
  forecast: [
    { period: '2025-05', expected: '13,680,000.00', trend: 'up', usage: '87.69%' },
    { period: '2025-06', expected: '14,250,000.00', trend: 'up', usage: '91.35%' },
    { period: '2025-07', expected: '14,820,000.00', trend: 'up', usage: '95.00%' }
  ],
  insights: {
    conclusions: [
      '本期费用总额较上期增长 8.62%，较去年同期增长 11.35%。',
      '预算使用率为 82.45%，较上期上升 5.21 个百分点。',
      '市场推广费、业务招待费增长显著，需重点关注预算执行。'
    ],
    causes: [
      '市场部 4 月业务招待类单笔大额支出增加，主要用于客户活动。',
      '销售部市场推广费投放增加，结合业务增长策略。',
      '技术部差旅费下降，受出差计划优化影响。'
    ],
    budgetNotes: [
      '2 个部门预算偏差率超过 10%，主要为市场部、技术部。',
      '偏差原因涉及预算编制偏低与实际项目投入增加。'
    ],
    recommendations: [
      '建议加强市场部、销售部费用预算控制。',
      '持续关注大额费用审批合规性及投放效果。',
      '优化费用结构，提升预算使用效率。'
    ]
  }
};

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
  workbench: { state: 'empty', title: '暂无新的待办任务', description: '可先创建审计任务，系统将按资料准备、分析确认和报告锁定路径推进。' },
  taskList: { state: 'empty', title: '当前筛选条件下无任务', description: '请调整覆盖部门、创建人或任务状态；无权限任务不会出现在列表中。' },
  taskDetail: { state: 'running', title: '任务正在办理中', description: '费用异常待确认、报告草稿待审核，所有资料和结果均沉淀在任务台账中。' },
  fileCenter: { state: 'locked', title: '存在引用锁定文件', description: '已被报告或规范引用的文件不能直接修改、失效或删除，只能申请解锁并回退草稿。' },
  reportSource: { state: 'blocked', title: '关键资料缺口未处理', description: '来源预检前可以选择资料；关键资料缺失时不能生成正式报告草稿。' },
  expenseCandidates: { state: 'running', title: '候选异常待人工处理', description: '确认、排除、待补充和整改建议会形成行状态变化并写入记录中心。' }
};

export const expenseEvidenceChains = [
  ...expenseAnomalies.map((row, index) => ({
    anomalyId: row.anomalyId,
    basicInfo: `${row.department}${row.employee}，${row.type}，金额 ${row.amount.toLocaleString('zh-CN')} 元，风险等级${row.riskLevel}。`,
    vouchers: row.evidence,
    evidenceFiles: row.type === '超预算未审批'
      ? [
          { type: 'pdf', name: '费用报销单_001245.pdf' },
          { type: 'excel', name: '预算控制表_202503.xlsx' },
          { type: 'pdf', name: '超预算对比报告_202503.pdf' }
        ]
      : row.evidence.map((name, fileIndex) => ({ type: fileIndex % 2 ? 'excel' : 'pdf', name: `${name.replace(/\s+/g, '_')}.${fileIndex % 2 ? 'xlsx' : 'pdf'}` })),
    approvalChain: index % 2 === 0 ? ['提交申请　张伟　2025-03-15 09:12', '部门经理审批　李强（已驳回）　2025-03-15 10:05', '驳回原因：超预算未说明', '重新提交　张伟　2025-03-15 10:20', '未走完审批流程'] : ['提交申请', '部门负责人审批', '财务复核退回一次', '二次提交待核验'],
    approvalSteps: index % 2 === 0
      ? [
          { label: '提交申请', person: row.employee, time: '2025-03-15 09:12', state: 'done' },
          { label: '部门经理审批', person: '李强（已驳回）', time: '2025-03-15 10:05', state: 'reject', note: '驳回原因：超预算未说明' },
          { label: '重新提交', person: row.employee, time: '2025-03-15 10:20', state: 'reject' },
          { label: '未走完审批流程', person: '', time: '', state: 'todo' }
        ]
      : [
          { label: '提交申请', person: row.employee, time: `${row.occurredAt} 09:18`, state: 'done' },
          { label: '部门负责人审批', person: '部门负责人', time: `${row.occurredAt} 10:02`, state: 'done' },
          { label: '财务复核', person: '计划财务部', time: `${row.occurredAt} 10:35`, state: 'todo' }
        ],
    ruleHit: `规则 ${row.ruleName}：${row.basis}。`,
    ruleDescription: row.type === '超预算未审批' ? '超过预算标准，未按规定审批的费用报销。' : '命中费用报销管理规则，需要核验凭证、审批和预算依据。',
    similarRecords: [
      { anomalyId: 'FY-202503120045', date: '2025-03-12', amount: 21350, riskLevel: '高风险' },
      { anomalyId: 'FY-202503050022', date: '2025-03-05', amount: 18600, riskLevel: '高风险' }
    ],
    manualHandling: row.supplementNote || row.exclusionReason || '待人工确认并补充处理意见。'
  }))
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
    description: '可先创建审计任务，任务创建后将在此跟踪资料准备、分析确认和报告锁定流程。',
    primaryAction: '创建第一个审计任务',
    secondaryAction: '查看已有任务'
  }
};

export const mockDb = {
  currentUser,
  organizations,
  auditPersonnel,
  dataSources,
  tasks,
  uploadSession,
  folderTree,
  fileAssets,
  expenseRules,
  expenseAnomalies,
  expenseAuditContext,
  expenseOutputs,
  reportDraft,
  gapItems,
  operationLogs,
  versionRecords,
  exportRecords,
  callbackRecords,
  checkIssues,
  recheckRecords,
  regulatoryFindings,
  standardSources,
  standardDraft,
  standardVersions,
  standardDiffItems,
  expenseUsageMetrics,
  expenseUsageBreakdown,
  expenseTrendAnalysis,
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
