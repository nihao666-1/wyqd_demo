const visibleItemSeeds = [
  ['费用报销审批权限验证', '控制测试', 'high', '内部制度+外部法规'],
  ['招待费报销合规性检查', '实质性', 'medium', '内部制度+监管案例'],
  ['差旅费报销审批执行检查', '实质性', 'medium', '外部法规'],
  ['费用审批流程穿行测试', '控制测试', 'high', '内部制度'],
  ['大额费用必要性测试', '实质性', 'high', '监管案例'],
  ['费用报销单据完整性检查', '实质性', 'medium', '内部制度'],
  ['预算控制执行有效性测试', '控制测试', 'medium', '内部制度+外部法规'],
  ['关联交易费用审计', '专项测试', 'high', '监管案例']
];

const itemTitlePool = [
  '发票真实性与重复报销检查', '合同付款一致性核验', '预算外支出审批检查',
  '差旅标准执行情况检查', '供应商集中度风险检查', '费用归属期间检查',
  '招待对象与业务关联检查', '会议费附件完整性检查', '培训费采购程序检查',
  '费用分摊合理性检查', '借款核销及时性检查', '异常拆单报销检查'
];

const sourceCards = [
  { id: 'internal', name: '内部制度', count: 24, unit: '份', completeness: 100, tone: 'green', icon: 'book' },
  { id: 'external', name: '外部法规', count: 15, unit: '份', completeness: 100, tone: 'blue', icon: 'scale' },
  { id: 'cases', name: '监管案例', count: 9, unit: '套', completeness: 100, tone: 'purple', icon: 'file' },
  { id: 'risks', name: '风险事项', count: 6, unit: '条', completeness: 85, tone: 'orange', icon: 'warning' }
];

const exportFiles = [
  { id: 'file-1', name: '差异清单', size: '24KB', type: 'xlsx' },
  { id: 'file-2', name: '费用异常汇总', size: '18KB', type: 'xlsx' },
  { id: 'file-3', name: '审计规范', size: '22KB', type: 'xlsx' },
  { id: 'file-4', name: '监管共享分析报告', size: '215KB', type: 'docx' },
  { id: 'file-5', name: '审计报告草稿', size: '1.2MB', type: 'docx' },
  { id: 'file-6', name: '审核问题清单', size: '16KB', type: 'xlsx' }
];

function buildItem(index) {
  const number = index + 1;
  const seed = visibleItemSeeds[index] || [
    itemTitlePool[(index - visibleItemSeeds.length) % itemTitlePool.length],
    index % 4 === 0 ? '控制测试' : '实质性',
    index % 5 === 0 ? 'high' : 'medium',
    index % 3 === 0 ? '内部制度+外部法规' : index % 3 === 1 ? '内部制度' : '监管案例'
  ];
  return {
    id: `CP-03-${String(number).padStart(3, '0')}`,
    title: seed[0],
    originalTitle: seed[0],
    category: seed[1],
    risk: seed[2],
    source: seed[3],
    status: index === 2 ? 'confirmed' : index === 5 ? 'excluded' : 'pending',
    exclusionReason: index === 5 ? '与本次审计范围不直接相关' : '',
    evidence: {
      policyName: '费用报销管理办法（2024版）',
      clause: '第三十五条',
      excerpt: '报销费用应真实、合法、合规，并按照授权权限履行审批程序。',
      page: '第 35 页',
      effectiveVersion: '2024-01-01 起生效',
      fileName: '费用报销管理办法（2024版）.pdf'
    }
  };
}

function createItems() {
  return Array.from({ length: 186 }, (_, index) => buildItem(index));
}

function nowLabel() {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

function appendTrail(state, entry) {
  return {
    ...state,
    operationTrail: [...state.operationTrail, { id: `OP-${state.operationTrail.length + 1}`, time: nowLabel(), operator: '审计A（李明）', ...entry }]
  };
}

function updateItem(state, itemId, updater) {
  const index = state.items.findIndex((item) => item.id === itemId);
  if (index < 0) return state;
  const item = updater(state.items[index]);
  if (item === state.items[index]) return state;
  const items = state.items.slice();
  items[index] = item;
  return { ...state, items, version: { ...state.version, saved: false } };
}

export function createAuditStandardResultState() {
  return {
    generation: { completed: 186, total: 320, percent: 58, status: 'generating' },
    selectedItemId: 'CP-03-001',
    items: createItems(),
    version: { number: 'V1.0', status: 'draft', saved: false },
    sourceCards: sourceCards.map((item) => ({ ...item })),
    suggestions: [
      '加强对高风险费用（高招待费、差旅费）的事前审批与预算控制。',
      '建议完善费用报销单据的完整性与合规性要求。',
      '对大额费用支出，应强化必要性、合理性和审批层级的完备。',
      '关注关联交易费用的定价公允性与披露完整性。',
      '建议定期开展费用报销流程的穿行测试与监督检查。'
    ],
    exportFiles: exportFiles.map((item) => ({ ...item })),
    exportRecords: [],
    operationTrail: [
      { id: 'OP-0', time: '2025-05-10 10:26:12', operator: '李娜（审计员A）', action: '生成草稿', itemId: '', detail: '已生成 186 条规范条目' }
    ]
  };
}

export function selectStandardItem(state, itemId) {
  if (state.selectedItemId === itemId || !state.items.some((item) => item.id === itemId)) return state;
  return { ...state, selectedItemId: itemId };
}

export function editStandardItem(state, itemId, title) {
  const normalized = String(title || '').trim().slice(0, 80);
  if (!normalized) throw new Error('条目内容不能为空');
  const updated = updateItem(state, itemId, (item) => item.title === normalized ? item : { ...item, title: normalized });
  return updated === state ? state : appendTrail(updated, { action: '编辑条目', itemId, detail: normalized });
}

export function confirmStandardItem(state, itemId) {
  const updated = updateItem(state, itemId, (item) => item.status === 'confirmed' ? item : { ...item, status: 'confirmed', exclusionReason: '' });
  return updated === state ? state : appendTrail(updated, { action: '确认条目', itemId, detail: '纳入正式规范' });
}

export function excludeStandardItem(state, itemId, reason) {
  const normalized = String(reason || '').trim().slice(0, 200);
  if (!normalized) throw new Error('排除原因不能为空');
  const updated = updateItem(state, itemId, (item) => item.status === 'excluded' && item.exclusionReason === normalized
    ? item
    : { ...item, status: 'excluded', exclusionReason: normalized });
  return updated === state ? state : appendTrail(updated, { action: '排除条目', itemId, detail: normalized });
}

export function saveAuditStandardDraft(state) {
  if (state.version.saved) return state;
  return appendTrail({ ...state, version: { number: 'V1.0', status: 'draft', saved: true } }, { action: '保存草稿', itemId: '', detail: 'V1.0' });
}

export function regenerateAuditStandard(state) {
  const items = state.items.map((item) => ({ ...item, title: item.originalTitle, status: 'pending', exclusionReason: '' }));
  return appendTrail({
    ...state,
    items,
    generation: { completed: 186, total: 320, percent: 58, status: 'generating' },
    version: { ...state.version, saved: false }
  }, { action: '重新生成', itemId: '', detail: '按当前条件重新生成规范' });
}

export function exportAuditStandardExcel(state) {
  const sequence = state.exportRecords.length + 1;
  const fileName = `上海分公司Q1审计规范_V1.0_${sequence}.xlsx`;
  const record = { id: `EXPORT-${sequence}`, type: 'xlsx', fileName, time: nowLabel() };
  return appendTrail({ ...state, exportRecords: [...state.exportRecords, record] }, { action: '导出 Excel', itemId: '', detail: fileName });
}

export function paginateStandardItems(items, page, pageSize) {
  const size = Math.max(1, Number(pageSize) || 10);
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(totalPages, Math.max(1, Number(page) || 1));
  return items.slice((current - 1) * size, current * size);
}
