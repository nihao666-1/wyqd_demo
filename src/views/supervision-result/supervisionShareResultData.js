const FILTER_KEYS = new Set(['keyword', 'dataTag', 'department', 'fileType', 'startDate', 'endDate']);
const PAGE_SIZES = new Set([10, 20, 50]);
const INITIAL_RESULT_TOTAL = 158;

const LOG_DEFINITIONS = {
  confirmFiles: {
    id: 'log-confirm-files',
    time: '2025-04-28 10:24:00',
    action: '确认文件',
    detail: '已确认监督共享分析文件',
    operator: '审计管理员',
    status: 'success'
  },
  referenceRow: {
    id: 'log-reference-row',
    time: '2025-04-28 10:25:00',
    action: '引用报告',
    detail: '分析结果已引用至报告章节',
    operator: '审计管理员',
    status: 'success'
  },
  restartExtraction: {
    id: 'log-restart-extraction',
    time: '2025-04-28 10:26:00',
    action: '重新提取',
    detail: '智能提取已重新启动',
    operator: '审计管理员',
    status: 'success'
  },
  generateOutput: {
    id: 'log-generate-output',
    time: '2025-04-28 10:27:00',
    action: '生成输出',
    detail: '报告输出已生成',
    operator: '审计管理员',
    status: 'success'
  },
  saveVersion: {
    id: 'log-save-version',
    time: '2025-04-28 10:28:00',
    action: '保存版本',
    detail: 'V1.1',
    operator: '审计管理员',
    status: 'success'
  }
};

function createSelectedFiles() {
  const departments = [
    ['合规法务部', 8],
    ['风险管理部', 6],
    ['审计中心', 4]
  ];

  return departments.flatMap(([department, count]) => Array.from({ length: count }, (_, index) => ({
    id: `file-${department}-${String(index + 1).padStart(2, '0')}`,
    name: `${department}监督共享资料${String(index + 1).padStart(2, '0')}.xlsx`,
    department
  })));
}

function createResultRows() {
  return [
    {
      id: 'result-001',
      filename: '关联交易专项核查清单.xlsx',
      department: '合规法务部',
      fileType: 'Excel',
      date: '2025-03-18',
      keywords: ['关联交易', '利益冲突'],
      tags: ['关联交易', '重点关注'],
      summary: '识别关联交易审批与披露完整性风险。',
      uploadedAt: '2025-03-18 14:26:08',
      ownershipPeriod: '2025Q1',
      relatedTask: '上海分公司Q1常规审计任务',
      summaryPage: 3,
      referenceChapter: '合规分析',
      referencePage: 12,
      referenceStatus: '未引用',
      defaultSectionId: 'compliance',
      referenced: false,
      referencedSectionId: null
    },
    {
      id: 'result-002',
      filename: '一季度风险评估报告.docx',
      department: '风险管理部',
      fileType: 'Word',
      date: '2025-03-21',
      keywords: ['授信集中度', '风险预警'],
      tags: ['风险预警', '高风险'],
      summary: '重点客户授信集中度接近预警线。',
      uploadedAt: '2025-03-21 09:42:16',
      ownershipPeriod: '2025年第一季度',
      relatedTask: '重点业务风险评估任务',
      summaryPage: 5,
      referenceChapter: '风险分析',
      referencePage: 18,
      referenceStatus: '未引用',
      defaultSectionId: 'risk',
      referenced: false,
      referencedSectionId: null
    },
    {
      id: 'result-003',
      filename: '审计问题整改跟踪表.xlsx',
      department: '审计中心',
      fileType: 'Excel',
      date: '2025-02-28',
      keywords: ['问题整改', '闭环管理'],
      tags: ['整改跟踪'],
      summary: '部分历史问题整改证据仍待补充。',
      uploadedAt: '2025-02-28 16:18:35',
      ownershipPeriod: '2024Q4-2025Q1',
      relatedTask: '历史问题整改跟踪任务',
      summaryPage: 7,
      referenceChapter: '审计发现',
      referencePage: 24,
      referenceStatus: '未引用',
      defaultSectionId: 'findings',
      referenced: false,
      referencedSectionId: null
    },
    {
      id: 'result-004',
      filename: '监管规则更新提示.pdf',
      department: '合规法务部',
      fileType: 'PDF',
      date: '2025-01-15',
      keywords: ['监管规则', '适用性'],
      tags: ['监管新规'],
      summary: '梳理本季度新规及分公司适用要求。',
      uploadedAt: '2025-01-15 11:05:42',
      ownershipPeriod: '2025年1月',
      relatedTask: '监管规则适用性检查任务',
      summaryPage: 2,
      referenceChapter: '综合摘要',
      referencePage: 6,
      referenceStatus: '未引用',
      defaultSectionId: 'summary',
      referenced: false,
      referencedSectionId: null
    },
    {
      id: 'result-005',
      filename: '监督资料索引及附件.zip',
      department: '风险管理部',
      fileType: 'Archive',
      date: '2025-03-31',
      keywords: ['资料索引', '证据附件'],
      tags: ['资料索引'],
      summary: '汇总监督共享资料来源与证据附件。',
      uploadedAt: '2025-03-31 17:36:20',
      ownershipPeriod: '2025-01-01 ～ 2025-03-31',
      relatedTask: '监督共享资料归档任务',
      summaryPage: 9,
      referenceChapter: '报告附录',
      referencePage: 31,
      referenceStatus: '未引用',
      defaultSectionId: 'appendix',
      referenced: false,
      referencedSectionId: null
    }
  ];
}

function hasActiveFilters(filters) {
  return Object.values(filters).some((value) => String(value).trim() !== '');
}

function appendLog(logs, definition, overrides = {}) {
  return [...logs, { ...definition, ...overrides }];
}

export function createSupervisionShareResultState() {
  const selectedFiles = createSelectedFiles();

  return {
    task: {
      id: 'TASK-20250428001',
      organization: '上海分公司',
      period: '2025Q1（2025-01-01 ～ 2025-03-31）',
      status: '待确认',
      createdAt: '2025-04-28 09:15:32',
      creator: '审计管理员'
    },
    selectedFiles,
    selectedFileIds: selectedFiles.map((file) => file.id),
    filesConfirmed: false,
    filters: {
      keyword: '',
      dataTag: '',
      department: '',
      fileType: '',
      startDate: '',
      endDate: ''
    },
    resultRows: createResultRows(),
    resultTotal: INITIAL_RESULT_TOTAL,
    selectedRowId: 'result-001',
    sections: [
      { id: 'summary', name: '综合摘要', sourceCount: 18 },
      { id: 'findings', name: '审计发现', sourceCount: 16 },
      { id: 'compliance', name: '合规分析', sourceCount: 17 },
      { id: 'risk', name: '风险分析', sourceCount: 15 },
      { id: 'appendix', name: '报告附录', sourceCount: 18 }
    ],
    stages: [
      { id: 'stage1', name: '文件准备', status: 'completed', progress: 100 },
      { id: 'stage2', name: '内容解析', status: 'completed', progress: 100 },
      { id: 'stage3', name: '规则匹配', status: 'completed', progress: 100 },
      { id: 'stage4', name: '智能提取', status: 'active', progress: 78 },
      { id: 'stage5', name: '结果复核', status: 'pending', progress: 0 },
      { id: 'stage6', name: '报告输出', status: 'pending', progress: 0 }
    ],
    outputs: [
      { id: 'excel', name: '监督共享分析明细', type: 'Excel', status: 'generating', progress: 78 },
      { id: 'word', name: '监督共享分析报告', type: 'Word', status: 'pending', progress: 0 },
      { id: 'appendix', name: '监督共享报告附录', type: 'Appendix', status: 'pending', progress: 0 }
    ],
    versions: [
      { number: 'V0.1', status: 'saved', saved: true },
      { number: 'V0.5', status: 'saved', saved: true },
      { number: 'V0.8', status: 'saved', saved: true },
      { number: 'V0.9', status: 'saved', saved: true },
      { number: 'V1.0', status: 'saved', saved: true },
      { number: 'V1.1', status: 'draft', saved: false }
    ],
    versionDirty: false,
    pagination: { page: 1, pageSize: 10 },
    logs: [
      { id: 'log-001', time: '2025-04-28 09:15:32', action: '任务创建', detail: '监督共享信息分析任务已创建', operator: '审计管理员', status: 'success' },
      { id: 'log-002', time: '2025-04-28 09:18:10', action: '文件载入', detail: '已载入18个监督共享文件', operator: '系统', status: 'success' },
      { id: 'log-003', time: '2025-04-28 10:20:45', action: '智能提取', detail: '当前进度78%', operator: '智能分析引擎', status: 'processing' }
    ]
  };
}

export function filterResultRows(state) {
  const keyword = String(state.filters.keyword).trim().toLowerCase();

  return state.resultRows.filter((row) => {
    const searchable = [row.filename, ...row.keywords, row.summary].join(' ').toLowerCase();
    return (!keyword || searchable.includes(keyword))
      && (!state.filters.dataTag || row.tags.includes(state.filters.dataTag))
      && (!state.filters.department || row.department === state.filters.department)
      && (!state.filters.fileType || row.fileType === state.filters.fileType)
      && (!state.filters.startDate || row.date >= state.filters.startDate)
      && (!state.filters.endDate || row.date <= state.filters.endDate);
  });
}

export function updateResultFilter(state, key, value) {
  if (!FILTER_KEYS.has(key)) return state;

  const filterChanged = state.filters[key] !== value;
  const filters = filterChanged ? { ...state.filters, [key]: value } : state.filters;
  const resultTotal = filterChanged
    ? (hasActiveFilters(filters) ? filterResultRows({ ...state, filters }).length : INITIAL_RESULT_TOTAL)
    : state.resultTotal;
  const pagination = state.pagination.page === 1
    ? state.pagination
    : { ...state.pagination, page: 1 };

  if (!filterChanged && pagination === state.pagination && resultTotal === state.resultTotal) {
    return state;
  }

  return { ...state, filters, resultTotal, pagination };
}

export function confirmSelectedFiles(state, fileIds) {
  if (!Array.isArray(fileIds)) return state;

  const requestedIds = new Set(fileIds);
  if (requestedIds.size !== fileIds.length) return state;
  if ([...requestedIds].some((id) => !state.selectedFiles.some((file) => file.id === id))) return state;

  const selectedFileIds = state.selectedFiles
    .map((file) => file.id)
    .filter((id) => requestedIds.has(id));
  const unchanged = state.filesConfirmed
    && selectedFileIds.length === state.selectedFileIds.length
    && selectedFileIds.every((id, index) => id === state.selectedFileIds[index]);
  if (unchanged) return state;

  return {
    ...state,
    selectedFileIds,
    filesConfirmed: true,
    logs: appendLog(state.logs, LOG_DEFINITIONS.confirmFiles)
  };
}

export function selectResultRow(state, rowId) {
  if (state.selectedRowId === rowId) return state;
  if (!state.resultRows.some((row) => row.id === rowId)) return state;
  return { ...state, selectedRowId: rowId };
}

export function referenceResultRow(state, rowId, sectionId) {
  const rowIndex = state.resultRows.findIndex((row) => row.id === rowId);
  const sectionIndex = state.sections.findIndex((section) => section.id === sectionId);
  if (rowIndex < 0 || sectionIndex < 0 || state.resultRows[rowIndex].referenced) return state;

  const resultRows = [...state.resultRows];
  resultRows[rowIndex] = {
    ...resultRows[rowIndex],
    referenced: true,
    referenceStatus: '已引用',
    referencedSectionId: sectionId
  };
  const sections = [...state.sections];
  sections[sectionIndex] = {
    ...sections[sectionIndex],
    sourceCount: sections[sectionIndex].sourceCount + 1
  };

  return {
    ...state,
    resultRows,
    sections,
    versionDirty: true,
    logs: appendLog(state.logs, LOG_DEFINITIONS.referenceRow, {
      id: `log-reference-row-${rowId}`,
      rowId,
      sectionId
    })
  };
}

export function restartExtraction(state) {
  const stageIndex = state.stages.findIndex((stage) => stage.id === 'stage4');
  const stage = state.stages[stageIndex];
  let stages = state.stages;
  if (stage && (stage.status !== 'active' || stage.progress !== 78)) {
    stages = [...state.stages];
    stages[stageIndex] = { ...stage, status: 'active', progress: 78 };
  }

  return {
    ...state,
    stages,
    logs: appendLog(state.logs, LOG_DEFINITIONS.restartExtraction)
  };
}

export function markOutputGenerated(state, outputId) {
  const outputIndex = state.outputs.findIndex((output) => output.id === outputId);
  if (outputIndex < 0 || state.outputs[outputIndex].status === 'generated') return state;

  const outputs = [...state.outputs];
  outputs[outputIndex] = { ...outputs[outputIndex], status: 'generated', progress: 100 };
  return {
    ...state,
    outputs,
    logs: appendLog(state.logs, LOG_DEFINITIONS.generateOutput, {
      id: `log-generate-output-${outputId}`,
      outputId
    })
  };
}

export function saveSupervisionVersion(state) {
  const versionIndex = state.versions.findIndex((version) => version.number === 'V1.1');
  const version = state.versions[versionIndex];
  if (!version || (version.saved && !state.versionDirty)) return state;

  let versions = state.versions;
  if (!version.saved || version.status !== 'saved') {
    versions = [...state.versions];
    versions[versionIndex] = { ...version, status: 'saved', saved: true };
  }
  return {
    ...state,
    versions,
    versionDirty: false,
    logs: appendLog(state.logs, LOG_DEFINITIONS.saveVersion)
  };
}

export function setResultPage(state, page) {
  const requestedPage = Number.isFinite(Number(page)) ? Math.trunc(Number(page)) : 1;
  const maxPage = Math.max(1, Math.ceil(state.resultTotal / state.pagination.pageSize));
  const nextPage = Math.min(Math.max(requestedPage, 1), maxPage);
  if (nextPage === state.pagination.page) return state;
  return { ...state, pagination: { ...state.pagination, page: nextPage } };
}

export function setResultPageSize(state, pageSize) {
  const nextPageSize = PAGE_SIZES.has(Number(pageSize)) ? Number(pageSize) : 10;
  const maxPage = Math.max(1, Math.ceil(state.resultTotal / nextPageSize));
  const page = Math.min(state.pagination.page, maxPage);
  if (nextPageSize === state.pagination.pageSize && page === state.pagination.page) return state;
  return { ...state, pagination: { page, pageSize: nextPageSize } };
}
