export const capabilityDefinitions = [
  { id: 'policy-query', name: '制度查询', groupKey: 'policyKnowledge' },
  { id: 'policy-change', name: '制度变更', groupKey: 'policyKnowledge' },
  { id: 'policy-compare', name: '制度比对', groupKey: 'policyCompare' },
  { id: 'regulatory', name: '监管案例舆情分析', groupKey: 'regulatoryAnalysis' },
  { id: 'standard', name: '审计规范生成', groupKey: 'auditStandard' },
  { id: 'supervision', name: '监督共享信息分析', groupKey: 'supervisionAnalysis' },
  { id: 'expense', name: '费用审计', groupKey: 'expenseAudit' },
  { id: 'report-generate', name: '报告生成', groupKey: 'reportGeneration' },
  { id: 'report-review', name: '报告审核', groupKey: 'reportReview' }
];

export const configurationGroups = [
  { key: 'policyKnowledge', title: '制度查询 / 制度变更', capabilityIds: ['policy-query', 'policy-change'] },
  { key: 'policyCompare', title: '制度比对', capabilityIds: ['policy-compare'] },
  { key: 'regulatoryAnalysis', title: '监管案例舆情分析', capabilityIds: ['regulatory'] },
  { key: 'auditStandard', title: '审计规范生成', capabilityIds: ['standard'] },
  { key: 'supervisionAnalysis', title: '监督共享信息分析', capabilityIds: ['supervision'] },
  { key: 'expenseAudit', title: '费用审计', capabilityIds: ['expense'] },
  { key: 'reportGeneration', title: '报告生成', capabilityIds: ['report-generate'] },
  { key: 'reportReview', title: '报告审核', capabilityIds: ['report-review'] }
];

export const referenceTaskSummary = {
  taskName: '上海分公司 Q1 常规审计任务',
  auditedUnit: '上海分公司',
  auditPeriod: '2025-01-01 ～ 2025-03-31',
  taskType: '常规审计',
  owner: '张三'
};

export const referenceMaterials = [
  { id: 'financial-statement', name: '财务报表（2025年Q1）', status: '已就绪', source: '本地上传' },
  { id: 'expense-ledger', name: '费用明细台账（2025年Q1）', status: '缺少 3 份', source: '本地上传' },
  { id: 'policy-files', name: '相关制度文件（最新版本）', status: '已就绪', source: '文件中心' },
  { id: 'budget-execution', name: '预算执行情况表', status: '已就绪', source: '本地上传' },
  { id: 'regulatory-library', name: '监管案例与舆情库', status: '已就绪', source: '文件中心' }
];

const defaultSettings = {
  policyKnowledge: {
    knowledgeScope: '全部制度库',
    effectiveTime: '最新有效',
    outputFormats: ['PDF', 'Excel'],
    citeToTask: true
  },
  policyCompare: {
    externalScope: '证监会+自律规则',
    internalScope: '公司制度库（全量）',
    rules: ['缺失识别', '口径差异', '时限差异'],
    output: 'Excel（差异清单）'
  },
  regulatoryAnalysis: {
    caseSource: '证监会+交易所',
    sentimentSource: '新闻+监管通报',
    riskThreshold: '中风险及以上',
    output: '监管关注点清单'
  },
  auditStandard: {
    template: '常规审计规范模板 V2.1',
    output: 'Excel',
    includeKeyPoints: true
  },
  supervisionAnalysis: {
    framework: '监督共享分析报告模板',
    taxonomy: '监管标签体系 V1.0',
    outputFormats: ['Excel', 'Word 报告']
  },
  expenseAudit: {
    ruleVersion: '费用规则库 V2.1',
    anomalyType: '全部异常类型',
    output: '异常汇总 Excel'
  },
  reportGeneration: {
    reportType: '常规审计',
    reportTemplate: '常规审计报告模板 V2.2',
    formatTemplate: '证券行业格式模板 V2.0',
    outputFormats: ['Word', 'PDF']
  },
  reportReview: {
    rules: ['字体规范', '格式规范', '标题编号', '文字优化'],
    output: '审核问题清单（Excel）'
  },
  global: {
    aiGeneratedLabel: true,
    multiModelReview: true,
    saveProcessVersions: true,
    exportAuditTrail: true
  }
};

export function cloneTemplateOutputSettings(settings) {
  return JSON.parse(JSON.stringify(settings));
}

export function createTemplateOutputSettings() {
  return cloneTemplateOutputSettings(defaultSettings);
}

export function getVisibleSettingGroups(selectedCapabilityIds = []) {
  const selected = new Set(selectedCapabilityIds);
  return configurationGroups.filter((group) => group.capabilityIds.some((id) => selected.has(id)));
}

function normalizeMaterial(row) {
  const status = row.status || (row.uploadStatus === '已上传' ? '已就绪' : row.required ? '未就绪' : '可选');
  return {
    id: row.id,
    name: row.name,
    status,
    source: row.source || '—'
  };
}

function outputForCapability(id, settings) {
  const policyCompareFormat = settings.policyCompare.output.includes('Word') ? 'Word' : 'Excel';
  const expenseOutput = settings.expenseAudit.output === '异常汇总 Excel' ? '费用异常汇总（Excel）' : settings.expenseAudit.output;
  const outputs = {
    'policy-query': `审计制度清单（${settings.policyKnowledge.outputFormats.join('/')}）`,
    'policy-change': '制度变更摘要（PDF）',
    'policy-compare': `缺失点与差错清单（${policyCompareFormat}）`,
    regulatory: `${settings.regulatoryAnalysis.output}（Excel）`,
    standard: `审计规范与整改建议（${settings.auditStandard.output}）`,
    supervision: `监督共享分析报告（${settings.supervisionAnalysis.outputFormats.map((item) => item.replace(' 报告', '')).join('/')}）`,
    expense: expenseOutput,
    'report-generate': `审计报告草稿（${settings.reportGeneration.outputFormats.join('/')}）`,
    'report-review': settings.reportReview.output
  };
  return outputs[id];
}

export function createPreSubmitSummary({
  taskSummary = referenceTaskSummary,
  selectedCapabilityIds = capabilityDefinitions.map((item) => item.id),
  materials = referenceMaterials,
  settings = createTemplateOutputSettings()
} = {}) {
  const selected = new Set(selectedCapabilityIds);
  const capabilities = capabilityDefinitions
    .filter((item) => selected.has(item.id))
    .map((item) => ({ id: item.id, name: item.name }));
  const normalizedMaterials = materials.map(normalizeMaterial);
  const missingCount = normalizedMaterials.filter((item) => item.status.includes('缺少') || item.status.includes('未就绪')).length;
  const risks = missingCount
    ? [`当前存在 ${missingCount} 项资料未就绪，将影响部分能力执行与结果生成。建议在提交前补充完整资料以确保分析质量。`]
    : [];

  return {
    task: { ...referenceTaskSummary, ...taskSummary },
    capabilities,
    materials: normalizedMaterials,
    outputs: capabilities.map((item) => ({ capabilityId: item.id, label: outputForCapability(item.id, settings) })),
    risks
  };
}

export function validateTemplateOutputSettings(settings, selectedCapabilityIds = []) {
  const selected = new Set(selectedCapabilityIds);
  const errors = {};

  if ((selected.has('policy-query') || selected.has('policy-change')) && !settings.policyKnowledge.outputFormats.length) {
    errors['policyKnowledge.outputFormats'] = '请至少选择一种制度输出格式';
  }
  if (selected.has('report-generate')) {
    if (!settings.reportGeneration.reportTemplate.trim()) {
      errors['reportGeneration.reportTemplate'] = '请选择报告模板';
    }
    if (!settings.reportGeneration.outputFormats.length) {
      errors['reportGeneration.outputFormats'] = '请至少选择一种报告输出格式';
    }
  }
  if (selected.has('report-review') && !settings.reportReview.rules.length) {
    errors['reportReview.rules'] = '请至少选择一项报告审核规则';
  }

  return errors;
}
