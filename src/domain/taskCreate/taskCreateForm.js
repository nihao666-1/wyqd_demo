export const initialTaskCreateForm = {
  taskName: '',
  auditedUnit: '上海分公司',
  auditStart: '2025-01-01',
  auditEnd: '2025-03-31',
  taskType: '常规审计',
  owner: '',
  participants: [],
  auditScope: '经纪业务部、计划财务部',
  description: '',
  dataScope: ['财务数据', '费用明细', '制度文件', '监管案例', '共享信息'],
  riskLevel: '常规'
};

export const taskTypeProfiles = {
  '常规审计': {
    abilities: ['制度查询', '制度变更', '制度比对', '监管案例舆情分析', '审计规范生成', '监督共享信息分析', '费用审计', '报告生成', '报告审核'],
    materials: ['审计通知书', '财务报表', '费用明细台账'],
    template: '常规审计报告模板'
  },
  '专项审计': {
    abilities: ['监督共享信息分析', '审计规范生成'],
    materials: ['专项审计方案', '业务台账'],
    template: '专项审计报告模板'
  },
  '制度比对': {
    abilities: ['制度查询', '制度变更', '制度比对'],
    materials: ['新旧制度版本', '适用范围说明'],
    template: '制度差异分析模板'
  },
  '费用审计': {
    abilities: ['费用审计', '报告生成'],
    materials: ['费用明细台账', '预算执行情况表', '发票清单'],
    template: '费用审计分析模板'
  }
};

const materialRequirementsByTaskType = {
  '常规审计': [
    { name: '财务报表', required: true },
    { name: '费用明细台账', required: true },
    { name: '相关制度文件', required: true },
    { name: '预算执行情况表', required: false },
    { name: '监管通报与案例库', required: false }
  ],
  '专项审计': [
    { name: '专项审计方案', required: true },
    { name: '业务台账', required: true },
    { name: '相关制度文件', required: true },
    { name: '预算执行情况表', required: false },
    { name: '监管通报与案例库', required: false }
  ],
  '制度比对': [
    { name: '新旧制度版本', required: true },
    { name: '适用范围说明', required: true },
    { name: '相关制度文件', required: true },
    { name: '历史报告', required: false },
    { name: '监管通报与案例库', required: false }
  ],
  '费用审计': [
    { name: '财务报表', required: true },
    { name: '费用明细台账', required: true },
    { name: '相关制度文件', required: true },
    { name: '预算执行情况表', required: false },
    { name: '监管通报与案例库', required: false }
  ]
};

const materialSelectionBlueprint = [
  { id: 'financial-statement', name: '财务报表（2025年Q1）', required: true, blocking: true, abilities: ['费用审计', '报告生成'] },
  { id: 'expense-ledger', name: '费用明细台账（2025年Q1）', required: true, blocking: true, abilities: ['费用审计'] },
  { id: 'policy-files', name: '相关制度文件（最新版）', required: true, abilities: ['制度查询', '制度比对'], source: '文件中心', uploadStatus: '已上传', parseStatus: '待解析' },
  { id: 'budget-execution', name: '预算执行情况表', required: true, abilities: ['费用审计'], source: '历史任务复用', uploadStatus: '已上传', parseStatus: '待解析' },
  { id: 'regulatory-library', name: '监管案例与舆情库', required: true, abilities: ['监管案例舆情分析'] },
  { id: 'audit-workpapers', name: '审计底稿与工作底稿', required: false, abilities: ['报告生成', '报告审核'], source: '文件中心', uploadStatus: '已选择' },
  { id: 'fixed-assets', name: '固定资产明细表', required: false, abilities: ['费用审计'] },
  { id: 'contract-summary', name: '合同清单及摘要', required: false, abilities: ['费用审计', '制度比对'] },
  { id: 'supplementary', name: '其他补充资料', required: false, abilities: [] }
];

const materialSourceLabels = {
  local: '本地上传',
  fileCenter: '文件中心',
  history: '历史任务复用',
  simulation: '平台资料复用'
};

const requiredFieldMessages = {
  taskName: '请输入任务名称',
  auditedUnit: '请选择被审计单位',
  taskType: '请选择任务类型',
  owner: '请选择负责人'
};

export function validateTaskCreateForm(form) {
  const errors = Object.fromEntries(
    Object.entries(requiredFieldMessages)
      .filter(([field]) => {
        const value = form[field];
        return typeof value === 'string' ? !value.trim() : !value;
      })
      .map(([field, message]) => [field, message])
  );
  if (!form.auditStart || !form.auditEnd) errors.auditPeriod = '请选择完整的审计期间';
  return errors;
}

export function getTaskTypeProfile(taskType) {
  return Object.hasOwn(taskTypeProfiles, taskType)
    ? taskTypeProfiles[taskType]
    : taskTypeProfiles['常规审计'];
}

export function getTaskMaterialRequirements(taskType) {
  const type = Object.hasOwn(materialRequirementsByTaskType, taskType) ? taskType : '常规审计';
  return materialRequirementsByTaskType[type].map((item) => ({ ...item }));
}

export function createMaterialSelectionRows(taskType, selectedAbilities = []) {
  const typeAbilities = getTaskTypeProfile(taskType).abilities;
  const activeAbilities = selectedAbilities.length ? selectedAbilities : typeAbilities;
  return materialSelectionBlueprint.map((item) => ({
    id: item.id,
    name: item.name,
    required: item.required,
    blocking: Boolean(item.blocking),
    ability: item.abilities.find((ability) => activeAbilities.includes(ability)) || item.abilities[0] || '通用',
    source: item.source || '—',
    uploadStatus: item.uploadStatus || '未上传',
    parseStatus: item.parseStatus || '—'
  }));
}

export function applyMaterialSource(rows, ids, source) {
  const selected = new Set(ids);
  const label = materialSourceLabels[source] || materialSourceLabels.local;
  return rows.map((row) => selected.has(row.id)
    ? { ...row, source: label, uploadStatus: '已上传', parseStatus: '待解析' }
    : { ...row }
  );
}

export function getMaterialSelectionProgress(rows) {
  const requiredRows = rows.filter((row) => row.required);
  const optionalRows = rows.filter((row) => !row.required);
  const isUploaded = (row) => row.uploadStatus === '已上传';
  const isCompleted = (row) => isUploaded(row) || (!row.required && row.uploadStatus === '已选择');
  const requiredCompleted = requiredRows.filter(isCompleted).length;
  const optionalCompleted = optionalRows.filter(isCompleted).length;
  const blockingItems = requiredRows.filter((row) => row.blocking && !isCompleted(row));
  return {
    required: { completed: requiredCompleted, total: requiredRows.length },
    optional: { completed: optionalCompleted, total: optionalRows.length },
    uploadedFiles: rows.filter(isUploaded).length,
    percentage: requiredRows.length ? Math.round((requiredCompleted / requiredRows.length) * 100) : 0,
    blockingItems,
    canProceed: blockingItems.length === 0
  };
}

export function createTaskDraftSnapshot(form, profile, materials = []) {
  return {
    ...form,
    participants: [...form.participants],
    materials: materials.map((item) => ({ ...item })),
    recommendedProfile: {
      ...profile,
      abilities: [...profile.abilities],
      materials: [...profile.materials]
    }
  };
}

export function filterTaskPersonnel(directory, { query = '', owner = '' } = {}) {
  const keyword = query.trim().toLocaleLowerCase('zh-CN');
  return directory.filter((person) => {
    if (!person.active || person.name === owner) return false;
    if (!keyword) return true;
    return `${person.name}${person.department}`.toLocaleLowerCase('zh-CN').includes(keyword);
  });
}
