const validMaterialSources = new Set(['local', 'fileCenter', 'simulation']);
const expenseSubAbilityMap = {
  analysis: 'expense-analysis',
  audit: 'expense-analysis',
  overview: 'expense-analysis',
  comprehensive: 'expense-analysis',
  'expense-analysis': 'expense-analysis',
  '费用审计分析': 'expense-analysis',
  '费用综合分析': 'expense-analysis',
  anomaly: 'expense-anomaly',
  monitor: 'expense-anomaly',
  'expense-anomaly': 'expense-anomaly',
  '费用异常监控': 'expense-anomaly',
  trend: 'expense-trend',
  usage: 'expense-trend',
  'expense-trend': 'expense-trend',
  '费用趋势分析': 'expense-trend'
};
const capabilityEntryMap = {
  regulatory: { capabilityId: 'regulatory', taskType: '专项审计' },
  'regulatory-analysis': { capabilityId: 'regulatory', taskType: '专项审计' },
  'regulatory-public-opinion': { capabilityId: 'regulatory', taskType: '专项审计' },
  '监管案例舆情分析': { capabilityId: 'regulatory', taskType: '专项审计' },
  supervision: { capabilityId: 'supervision', taskType: '专项审计' },
  'supervision-share': { capabilityId: 'supervision', taskType: '专项审计' },
  '监督共享信息分析': { capabilityId: 'supervision', taskType: '专项审计' },
  expense: { capabilityId: 'expense', taskType: '费用审计' },
  'expense-audit': { capabilityId: 'expense', taskType: '费用审计' },
  '费用审计': { capabilityId: 'expense', taskType: '费用审计' }
};

function resolveCapabilityEntry(query = {}) {
  const raw = String(query.capability || query.ability || query.preselect || '').trim();
  return capabilityEntryMap[raw] || null;
}

function resolveExpenseSubAbility(query = {}) {
  const raw = String(query.expenseSubAbility || query.subAbility || query.expenseAbility || '').trim();
  return expenseSubAbilityMap[raw] || '';
}

export function resolveTaskCreateEntry(query = {}) {
  const source = validMaterialSources.has(query.source) ? query.source : 'local';
  const capabilityEntry = resolveCapabilityEntry(query);
  const expenseSubAbility = capabilityEntry?.capabilityId === 'expense' ? resolveExpenseSubAbility(query) : '';
  const baseEntry = capabilityEntry
    ? { source, ...capabilityEntry, ...(expenseSubAbility ? { expenseSubAbility } : {}) }
    : { source };

  if (query.phase === 'ability') return { step: 0, stage: 'ability', ...baseEntry };
  if (query.phase === 'basic') return { step: 1, stage: 'basic', ...baseEntry };
  if (query.phase === 'materials') return { step: 2, stage: 'materials', ...baseEntry };
  if (query.phase === 'parse') return { step: 3, stage: 'parsing', ...baseEntry };
  if (query.phase === 'confirm' || query.phase === 'template') {
    return { step: 4, stage: 'template', ...baseEntry };
  }

  return { step: 0, stage: 'ability', ...baseEntry };
}
