const abilitySeeds = [
  { id: 1, name: '制度查询', summaryLabel: '审计依据', summaryValue: '86 条', fileName: '制度查询结果清单.xlsx', fileType: 'xlsx', baseStatus: 'confirmed' },
  { id: 2, name: '制度变更', summaryLabel: '变更条目', summaryValue: '35 条', fileName: '制度变更摘要.xlsx', fileType: 'xlsx', baseStatus: 'confirmed' },
  { id: 3, name: '制度比对', summaryLabel: '差异项', summaryValue: '5 项（缺失 2 错误 3）', fileName: '制度差异清单.xlsx', fileType: 'xlsx', baseStatus: 'pending' },
  { id: 4, name: '监管案例舆情分析', summaryLabel: '监管关注点', summaryValue: '12 条', fileName: '监管关注点清单.xlsx', fileType: 'xlsx', baseStatus: 'pending' },
  { id: 5, name: '审计规范生成', summaryLabel: '规范条目', summaryValue: '186 条', fileName: '审计规范与建议.xlsx', fileType: 'xlsx', baseStatus: 'confirmed' },
  { id: 6, name: '监管共享信息分析', summaryLabel: '问题项', summaryValue: '8 项', fileName: '共享信息分析报告.docx', fileType: 'docx', baseStatus: 'pending' },
  { id: 7, name: '费用审计', summaryLabel: '异常', summaryValue: '6 条（高风险 3 条）', fileName: '费用异常汇总.xlsx', fileType: 'xlsx', baseStatus: 'pending' },
  { id: 8, name: '报告生成', summaryLabel: '报告草稿', summaryValue: '1 份', fileName: '审计报告草稿.docx', fileType: 'docx', baseStatus: 'pending' },
  { id: 9, name: '报告审核', summaryLabel: '审核问题', summaryValue: '0 条', fileName: '', fileType: '', baseStatus: 'awaiting_upload' }
];

const itemSeeds = [
  { id: 'CONF-001', abilityId: 3, itemType: '制度缺失', summary: '外部监管要求“客户回访频率每年至少一次”，内部制度未明确', risk: 'high', sourceLabel: '《证券公司客户适当性管理办法》第十六条', decision: '请选择处理意见', evidenceId: 'EVD-001' },
  { id: 'CONF-002', abilityId: 7, itemType: '超预算未审批', summary: '市场部一季度差旅费超预算 28,650.00 元，超限 85% 且未见审批', risk: 'high', sourceLabel: '费用报销管理办法 第55条', decision: '请选择处理意见', evidenceId: 'EVD-002' },
  { id: 'CONF-003', abilityId: 4, itemType: '监管关注点', summary: '近半年多起客户适当性管理不到位处罚案例，需复核重点流程', risk: 'high', sourceLabel: '监管案例库（2023-2025）', decision: '请选择处理意见', evidenceId: 'EVD-003' },
  { id: 'CONF-004', abilityId: 6, itemType: '整改事项', summary: '合规部共享文件反映客户信息更新不完整问题', risk: 'medium', sourceLabel: '合规部共享文件-2025Q1', decision: '请选择处理意见', evidenceId: 'EVD-004' },
  { id: 'CONF-005', abilityId: 8, itemType: '来源不足', summary: '报告第二章引用描述，缺少费用异常明细引用', risk: 'medium', sourceLabel: '审计报告草稿 V0.9', decision: '请选择处理意见', evidenceId: 'EVD-005' },
  { id: 'CONF-006', abilityId: 3, itemType: '制度表述错误', summary: '适当性回访对象范围与现行监管条款不一致', risk: 'high', sourceLabel: '内部制度第8.2条', decision: '请选择处理意见', evidenceId: 'EVD-006' },
  { id: 'CONF-007', abilityId: 3, itemType: '制度表述错误', summary: '制度仍引用已失效的旧版风险等级分类', risk: 'medium', sourceLabel: '制度变更摘要 第12项', decision: '请选择处理意见', evidenceId: 'EVD-007' },
  { id: 'CONF-008', abilityId: 4, itemType: '舆情风险', summary: '客户投诉中“风险揭示不足”关键词频次上升', risk: 'medium', sourceLabel: '舆情分析样本 2025Q1', decision: '请选择处理意见', evidenceId: 'EVD-008' },
  { id: 'CONF-009', abilityId: 4, itemType: '处罚案例', summary: '同业因客户信息更新不及时被采取监管措施', risk: 'high', sourceLabel: '监管案例 2024-117', decision: '请选择处理意见', evidenceId: 'EVD-009' },
  { id: 'CONF-010', abilityId: 6, itemType: '重复整改', summary: '客户回访台账问题与上一年度整改事项重复', risk: 'medium', sourceLabel: '整改跟踪台账 2024', decision: '请选择处理意见', evidenceId: 'EVD-010' },
  { id: 'CONF-011', abilityId: 6, itemType: '数据不一致', summary: '共享客户清单与 CRM 有效客户数量不一致', risk: 'medium', sourceLabel: '共享信息分析报告 第3节', decision: '请选择处理意见', evidenceId: 'EVD-011' },
  { id: 'CONF-012', abilityId: 7, itemType: '票据异常', summary: '三笔会议费发票日期与会议签到日期不一致', risk: 'high', sourceLabel: '费用异常汇总 第2组', decision: '请选择处理意见', evidenceId: 'EVD-012' },
  { id: 'CONF-013', abilityId: 7, itemType: '供应商集中', summary: '培训费用连续由同一供应商承接且缺少比价记录', risk: 'medium', sourceLabel: '费用异常汇总 第4组', decision: '请选择处理意见', evidenceId: 'EVD-013' },
  { id: 'CONF-014', abilityId: 7, itemType: '附件缺失', summary: '两笔业务招待费未关联来访名单和审批附件', risk: 'medium', sourceLabel: '费用异常汇总 第6组', decision: '请选择处理意见', evidenceId: 'EVD-014' },
  { id: 'CONF-015', abilityId: 8, itemType: '结论待确认', summary: '报告整改建议尚未指定责任部门和完成时限', risk: 'medium', sourceLabel: '审计报告草稿 第5章', decision: '请选择处理意见', evidenceId: 'EVD-015' }
];

function cloneAbility(ability) {
  return { ...ability };
}

function cloneItem(item) {
  return {
    ...item,
    disposition: 'pending',
    note: '',
    linkedToReport: false
  };
}

function updateItem(state, itemId, updater) {
  const index = state.items.findIndex((item) => item.id === itemId);
  if (index < 0) return state;
  const current = state.items[index];
  const updated = updater(current);
  if (updated === current) return state;
  const items = state.items.slice();
  items[index] = updated;
  return markResultDirty({ ...state, items });
}

export function markResultDirty(state) {
  if (state.draftState === 'dirty' && state.version.saved === false) return state;
  return {
    ...state,
    draftState: 'dirty',
    version: { ...state.version, saved: false }
  };
}

export function createTaskResultState() {
  return {
    phase: 'generated_pending_confirmation',
    draftState: 'dirty',
    abilities: abilitySeeds.map(cloneAbility),
    items: itemSeeds.map(cloneItem),
    selectedItemId: 'CONF-001',
    version: {
      number: 'V1.0',
      status: 'draft',
      saved: false
    }
  };
}

export function getPendingCount(state) {
  return state.items.filter((item) => item.disposition === 'pending').length;
}

export function getAbilityStatus(state, abilityId) {
  const ability = state.abilities.find((item) => item.id === abilityId);
  if (!ability) return 'pending';
  if (ability.baseStatus === 'awaiting_upload') return 'awaiting_upload';
  const items = state.items.filter((item) => item.abilityId === abilityId);
  if (!items.length) return ability.baseStatus;
  if (items.some((item) => item.disposition === 'pending')) return 'pending';
  if (items.every((item) => item.disposition === 'excluded')) return 'excluded';
  return 'confirmed';
}

export function confirmItem(state, itemId) {
  return updateItem(state, itemId, (item) => {
    if (item.disposition !== 'pending') return item;
    return { ...item, disposition: 'confirmed', decision: '确认该事项' };
  });
}

export function excludeItem(state, itemId, note = '') {
  return updateItem(state, itemId, (item) => {
    if (item.disposition !== 'pending') return item;
    return { ...item, disposition: 'excluded', decision: '排除该事项', note: String(note).slice(0, 200) };
  });
}

export function saveItemNote(state, itemId, note) {
  const normalized = note == null ? '' : String(note).trim().slice(0, 200);
  return updateItem(state, itemId, (item) => {
    const disposition = item.disposition === 'annotated' && !normalized
      ? 'pending'
      : item.disposition === 'pending' && normalized
        ? 'annotated'
        : item.disposition;
    if (item.note === normalized && item.disposition === disposition) return item;
    return { ...item, note: normalized, disposition };
  });
}

export function confirmAbility(state, abilityId) {
  let changed = false;
  const items = state.items.map((item) => {
    if (item.abilityId !== abilityId || item.disposition !== 'pending') return item;
    changed = true;
    return { ...item, disposition: 'confirmed', decision: '确认该事项' };
  });
  return changed ? markResultDirty({ ...state, items }) : state;
}

export function canSubmitReview(state) {
  return getPendingCount(state) === 0 && state.version.saved === true;
}

export function paginateItems(items, page, pageSize) {
  const safeSize = Math.max(1, Number(pageSize) || 10);
  const totalPages = Math.max(1, Math.ceil(items.length / safeSize));
  const safePage = Math.min(totalPages, Math.max(1, Number(page) || 1));
  const start = (safePage - 1) * safeSize;
  return items.slice(start, start + safeSize);
}
