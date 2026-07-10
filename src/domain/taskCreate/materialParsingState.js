const SUCCESS = '解析成功';
const PARSING = '解析中';
const FAILED = '解析失败';
const DUPLICATE = '重复文件';
const ABNORMAL = '格式异常';
const PENDING = '待解析';
const SKIPPED = '已跳过';

const batchBlueprint = [
  {
    id: 'financial-statement',
    name: '财务报表_2025Q1.xlsx',
    type: 'Excel',
    ability: '费用审计',
    pagesOrTables: '3 张表',
    folderPath: '/财务资料/财务报表',
    size: '2.4 MB',
    uploadedAt: '2026-07-10 09:12',
    parseStatus: SUCCESS,
    progress: 100,
    mappings: [
      { source: '科目编码', target: '会计科目编码', confidence: 98, status: '已匹配', required: true },
      { source: '期末余额', target: '期末余额', confidence: 100, status: '已匹配', required: true }
    ]
  },
  {
    id: 'expense-ledger-q1',
    name: '费用明细台账_2025Q1.xlsx',
    type: 'Excel',
    ability: '费用审计',
    pagesOrTables: '5 张表',
    folderPath: '/财务资料/费用明细',
    size: '4.8 MB',
    uploadedAt: '2026-07-10 09:13',
    parseStatus: SUCCESS,
    progress: 100,
    mappings: [
      { source: '报销单号', target: '费用单据编号', confidence: 96, status: '已匹配', required: true },
      { source: '报销金额', target: '费用金额', confidence: 99, status: '已匹配', required: true }
    ]
  },
  {
    id: 'budget-execution',
    name: '预算执行情况表.xlsx',
    type: 'Excel',
    ability: '费用审计',
    pagesOrTables: '2 张表',
    folderPath: '/财务资料/预算',
    size: '1.7 MB',
    uploadedAt: '2026-07-10 09:14',
    parseStatus: SUCCESS,
    progress: 100
  },
  {
    id: 'policy-current',
    name: '费用管理办法_最新版.pdf',
    type: 'PDF',
    ability: '制度查询',
    pagesOrTables: '42 页',
    folderPath: '/制度资料/现行制度',
    size: '3.1 MB',
    uploadedAt: '2026-07-10 09:16',
    parseStatus: SUCCESS,
    progress: 100
  },
  {
    id: 'policy-history',
    name: '费用管理办法_历史版.pdf',
    type: 'PDF',
    ability: '制度比对',
    pagesOrTables: '38 页',
    folderPath: '/制度资料/历史制度',
    size: '2.9 MB',
    uploadedAt: '2026-07-10 09:16',
    parseStatus: SUCCESS,
    progress: 100
  },
  {
    id: 'regulatory-cases',
    name: '监管案例汇编_2024.pdf',
    type: 'PDF',
    ability: '监管案例舆情分析',
    pagesOrTables: '126 页',
    folderPath: '/监管资料/案例库',
    size: '12.6 MB',
    uploadedAt: '2026-07-10 09:18',
    parseStatus: SUCCESS,
    progress: 100
  },
  {
    id: 'fixed-assets',
    name: '固定资产明细表.xlsx',
    type: 'Excel',
    ability: '费用审计',
    pagesOrTables: '2 张表',
    folderPath: '/财务资料/资产',
    size: '1.3 MB',
    uploadedAt: '2026-07-10 09:19',
    parseStatus: SUCCESS,
    progress: 100
  },
  {
    id: 'audit-notice',
    name: '审计通知书.pdf',
    type: 'PDF',
    ability: '报告生成',
    pagesOrTables: '6 页',
    folderPath: '/任务资料/通知书',
    size: '820 KB',
    uploadedAt: '2026-07-10 09:20',
    parseStatus: SUCCESS,
    progress: 100
  },
  {
    id: 'in-progress-workpapers',
    name: '审计工作底稿汇总.docx',
    type: 'Word',
    ability: '报告生成',
    pagesOrTables: '68 页',
    folderPath: '/底稿资料/工作底稿',
    size: '6.5 MB',
    uploadedAt: '2026-07-10 09:22',
    parseStatus: PARSING,
    progress: 60,
    metadataStatus: '提取中',
    referenceStatus: '待建立',
    suggestions: ['解析完成后自动建立引用关系']
  },
  {
    id: 'in-progress-vouchers',
    name: '记账凭证附件.zip',
    type: 'ZIP',
    ability: '费用审计',
    pagesOrTables: '216 个文件',
    folderPath: '/财务资料/凭证附件',
    size: '38.2 MB',
    uploadedAt: '2026-07-10 09:23',
    parseStatus: PARSING,
    progress: 50,
    metadataStatus: '提取中',
    referenceStatus: '待建立',
    suggestions: ['等待附件解压与版面识别完成']
  },
  {
    id: 'invoice-list',
    name: '发票清单_扫描件.pdf',
    type: 'PDF',
    ability: '费用审计',
    pagesOrTables: '54 页',
    folderPath: '/财务资料/发票',
    size: '18.4 MB',
    uploadedAt: '2026-07-10 09:24',
    parseStatus: FAILED,
    progress: 40,
    metadataStatus: '提取失败',
    referenceStatus: '未建立',
    failureReason: '部分页面损坏，OCR 无法识别',
    blocksSubmission: true,
    blockers: ['发票清单解析失败'],
    suggestions: ['重新解析或替换清晰版本'],
    impactAbilities: ['费用审计', '报告生成']
  },
  {
    id: 'duplicate-policy',
    name: '差旅费管理细则_副本.pdf',
    type: 'PDF',
    ability: '制度比对',
    pagesOrTables: '24 页',
    folderPath: '/制度资料/待核验',
    size: '1.8 MB',
    uploadedAt: '2026-07-10 09:25',
    parseStatus: DUPLICATE,
    progress: 50,
    metadataStatus: '完整',
    referenceStatus: '待确认',
    failureReason: '与现行制度目录中的文件内容重复',
    blocksSubmission: true,
    blockers: ['存在重复制度文件'],
    suggestions: ['确认保留版本或跳过此副本']
  },
  {
    id: 'legacy-contracts',
    name: '费用报销凭证明细_2025Q1.xlsx',
    type: 'Excel',
    ability: '费用审计',
    pagesOrTables: '18 张表',
    folderPath: '/财务资料/费用明细',
    size: '1.25 MB',
    uploadedAt: '2025-05-10 14:31',
    parseStatus: ABNORMAL,
    progress: 64,
    metadataStatus: '字段缺失',
    referenceStatus: '待确认',
    failureReason: '必填字段未完成映射',
    missingFields: ['金额(元)'],
    blocksSubmission: true,
    mappings: [
      { source: '部门名称', target: '费用所属部门', confidence: 100, status: '已匹配', required: true },
      { source: '发生日期', target: '费用发生日期', confidence: 100, status: '已匹配', required: true },
      { source: '金额(元)', target: '', confidence: 0, status: '未匹配', required: true },
      { source: '费用类别', target: '费用类别', confidence: 95, status: '已匹配', required: true },
      { source: '摘要', target: '费用摘要', confidence: 90, status: '已匹配', required: false },
      { source: '报销人', target: '报销人', confidence: 85, status: '已匹配', required: false }
    ],
    blockers: ['缺少必填字段：金额(元)'],
    suggestions: ['将“金额(元)”映射到标准目标字段']
  },
  {
    id: 'pending-supplement',
    name: '其他补充资料.docx',
    type: 'Word',
    ability: '通用',
    pagesOrTables: '12 页',
    folderPath: '/补充资料',
    size: '740 KB',
    uploadedAt: '2026-07-10 09:28',
    parseStatus: PENDING,
    progress: 0,
    metadataStatus: '待提取',
    referenceStatus: '待建立',
    suggestions: ['等待解析队列处理']
  }
];

function createFile(source) {
  const missingFields = [...(source.missingFields || [])];
  const impactAbilities = [...(source.impactAbilities || [source.ability])];
  const blockers = [...(source.blockers || [])];
  const suggestions = [...(source.suggestions || [])];
  const mappings = (source.mappings || []).map((mapping) => ({ ...mapping }));
  const sourceRequirements = (source.sourceRequirements || []).map((item) => ({ ...item }));
  const sourceRoot = String(source.folderPath || '').replaceAll('\\', '/').split('/').filter(Boolean)[0];
  const treeFolder = ['fixed-assets', 'invoice-list'].includes(source.id)
    ? '附件影像'
    : ({ 财务资料: '财务数据', 制度资料: '制度文件', 监管资料: '报告资料', 任务资料: '报告资料', 底稿资料: '附件影像', 业务资料: '附件影像', 补充资料: '附件影像' })[sourceRoot] || '其他文件';
  const folderPath = `/上海分公司 Q1 审计资料/${treeFolder}`;
  const selectedDetail = {
    name: source.name,
    type: source.type,
    size: source.size,
    uploadedAt: source.uploadedAt,
    folderPath: source.folderPath
  };

  return {
    id: source.id,
    name: source.name,
    type: source.type,
    ability: source.ability,
    uploadStatus: source.uploadStatus || '已上传',
    parseStatus: source.parseStatus,
    progress: source.progress,
    pagesOrTables: source.pagesOrTables,
    metadataStatus: source.metadataStatus || '完整',
    referenceStatus: source.referenceStatus || '已建立',
    folderPath,
    selectedDetail,
    size: source.size,
    uploadedAt: source.uploadedAt,
    failureReason: source.failureReason || '',
    missingFields,
    impactAbilities,
    blocksSubmission: Boolean(source.blocksSubmission),
    mappings,
    blockers,
    suggestions,
    sourceRequirements,
    visibleInTable: source.visibleInTable !== false
  };
}

function cloneFile(file) {
  return {
    ...file,
    selectedDetail: { ...file.selectedDetail },
    missingFields: [...file.missingFields],
    impactAbilities: [...file.impactAbilities],
    mappings: file.mappings.map((mapping) => ({ ...mapping })),
    blockers: [...file.blockers],
    suggestions: [...file.suggestions],
    sourceRequirements: file.sourceRequirements.map((item) => ({ ...item }))
  };
}

function updateFiles(files, shouldUpdate, update) {
  return files.map((source) => {
    const file = cloneFile(source);
    return shouldUpdate(source) ? update(file) : file;
  });
}

function markParsing(file) {
  return {
    ...file,
    parseStatus: PARSING,
    progress: 0,
    metadataStatus: '提取中',
    referenceStatus: '待建立',
    failureReason: '',
    blocksSubmission: true,
    blockers: ['文件正在重新解析'],
    suggestions: ['等待解析完成']
  };
}

function markSkipped(file) {
  return {
    ...file,
    parseStatus: SKIPPED,
    progress: 100,
    failureReason: '',
    blocksSubmission: false,
    blockers: [],
    suggestions: []
  };
}

export function createMaterialParsingBatch(sourceMaterials = []) {
  const uploadedRequirements = Array.isArray(sourceMaterials)
    ? sourceMaterials.filter((item) => item?.uploadStatus === '已上传').map((item) => ({
        id: item.id,
        name: item.name,
        ability: item.ability,
        uploadStatus: item.uploadStatus
      }))
    : [];

  return batchBlueprint.map((source) => createFile({
    ...source,
    sourceRequirements: uploadedRequirements.filter((item) => item.ability === source.ability)
  }));
}

export function getParsingSummary(files) {
  const count = (status) => files.filter((file) => file.parseStatus === status).length;
  const processedStatuses = new Set([SUCCESS, FAILED, DUPLICATE, ABNORMAL, SKIPPED]);
  const totalProgress = files.reduce((sum, file) => sum + (Number(file.progress) || 0), 0);

  return {
    percentage: files.length ? Math.round(totalProgress / files.length) : 0,
    processed: files.filter((file) => processedStatuses.has(file.parseStatus)).length,
    total: files.length,
    success: count(SUCCESS),
    parsing: count(PARSING),
    failed: count(FAILED),
    duplicate: count(DUPLICATE),
    abnormal: count(ABNORMAL)
  };
}

export function getSelectedFile(files, id) {
  return files.find((file) => file.id === id) || null;
}

export function retryParsingFile(files, id) {
  return updateFiles(
    files,
    (file) => file.id === id && [FAILED, ABNORMAL].includes(file.parseStatus),
    markParsing
  );
}

export function replaceParsingFile(files, id, name) {
  return updateFiles(files, (file) => file.id === id, (file) => {
    const replacement = markParsing(file);
    return {
      ...replacement,
      name,
      selectedDetail: { ...replacement.selectedDetail, name }
    };
  });
}

export function skipParsingFile(files, id) {
  return updateFiles(files, (file) => file.id === id, markSkipped);
}

export function mapParsingField(files, id, source, target) {
  return updateFiles(files, (file) => file.id === id, (file) => {
    const normalizedTarget = target.trim();
    const mappings = file.mappings.map((mapping) => mapping.source === source
      ? {
          ...mapping,
          target: normalizedTarget,
          confidence: normalizedTarget ? 100 : 0,
          status: normalizedTarget ? '已匹配' : '未匹配'
        }
      : mapping
    );
    const missingFields = mappings
      .filter((mapping) => mapping.required && !mapping.target)
      .map((mapping) => mapping.source);
    const nonFieldBlockers = file.blockers.filter((blocker) => !blocker.startsWith('缺少必填字段：'));
    const blockers = [
      ...nonFieldBlockers,
      ...missingFields.map((field) => '缺少必填字段：' + field)
    ];
    const mappingResolved = blockers.length === 0;

    return {
      ...file,
      mappings,
      missingFields,
      parseStatus: mappingResolved && file.parseStatus === ABNORMAL ? SUCCESS : file.parseStatus,
      metadataStatus: missingFields.length ? '字段缺失' : '完整',
      failureReason: missingFields.length ? file.failureReason : '',
      blockers,
      blocksSubmission: blockers.length > 0,
      suggestions: missingFields.length ? file.suggestions : []
    };
  });
}

export function batchRetryParsing(files) {
  return updateFiles(
    files,
    (file) => [FAILED, ABNORMAL].includes(file.parseStatus),
    markParsing
  );
}

export function batchSkipParsing(files) {
  return updateFiles(
    files,
    (file) => [FAILED, DUPLICATE, ABNORMAL].includes(file.parseStatus),
    markSkipped
  );
}

export function canContinueParsing(files) {
  return files.every((file) => !file.blocksSubmission);
}
