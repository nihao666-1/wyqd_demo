import test from 'node:test';
import assert from 'node:assert/strict';
import {
  confirmSelectedFiles,
  createSupervisionShareResultState,
  filterResultRows,
  markOutputGenerated,
  referenceResultRow,
  restartExtraction,
  saveSupervisionVersion,
  selectResultRow,
  setResultPage,
  setResultPageSize,
  updateResultFilter
} from '../src/views/supervision-result/supervisionShareResultData.js';

function getRow(state, rowId) {
  return state.resultRows.find((row) => row.id === rowId);
}

test('初始状态提供任务、文件、结果、章节、阶段、输出和版本的确定性数据', () => {
  const state = createSupervisionShareResultState();

  assert.deepEqual(state.task, {
    id: 'TASK-20250428001',
    organization: '上海分公司',
    period: '2025Q1（2025-01-01 ～ 2025-03-31）',
    status: '待确认',
    createdAt: '2025-04-28 09:15:32',
    creator: '审计管理员'
  });
  assert.equal(state.selectedFiles.length, 18);
  assert.deepEqual(
    Object.fromEntries(['合规法务部', '风险管理部', '审计中心'].map((department) => [
      department,
      state.selectedFiles.filter((file) => file.department === department).length
    ])),
    { 合规法务部: 8, 风险管理部: 6, 审计中心: 4 }
  );
  assert.equal(state.resultRows.length, 5);
  assert.equal(state.resultTotal, 158);
  assert.ok(state.resultRows.every((row) => row.defaultSectionId));
  assert.deepEqual(state.sections.map(({ id, sourceCount }) => [id, sourceCount]), [
    ['summary', 18], ['findings', 16], ['compliance', 17], ['risk', 15], ['appendix', 18]
  ]);
  assert.equal(state.stages.length, 6);
  assert.deepEqual(state.stages[3], { id: 'stage4', name: '智能提取', status: 'active', progress: 78 });
  assert.deepEqual(state.outputs.map(({ id, status, progress }) => [id, status, progress]), [
    ['excel', 'generating', 78], ['word', 'pending', 0], ['appendix', 'pending', 0]
  ]);
  assert.deepEqual(state.versions.map((version) => version.number), ['V0.1', 'V0.5', 'V0.8', 'V0.9', 'V1.0', 'V1.1']);
  assert.deepEqual(state.versions.at(-1), { number: 'V1.1', status: 'draft', saved: false });
});

test('每条结果提供确定且彼此对应的详情字段', () => {
  const state = createSupervisionShareResultState();
  const first = getRow(state, 'result-001');
  const second = getRow(state, 'result-002');

  assert.deepEqual({
    uploadedAt: first.uploadedAt,
    ownershipPeriod: first.ownershipPeriod,
    relatedTask: first.relatedTask,
    summaryPage: first.summaryPage,
    referenceChapter: first.referenceChapter,
    referencePage: first.referencePage,
    referenceStatus: first.referenceStatus
  }, {
    uploadedAt: '2025-03-18 14:26:08',
    ownershipPeriod: '2025Q1',
    relatedTask: '上海分公司Q1常规审计任务',
    summaryPage: 3,
    referenceChapter: '合规分析',
    referencePage: 12,
    referenceStatus: '未引用'
  });
  assert.notEqual(second.uploadedAt, first.uploadedAt);
  assert.notEqual(second.relatedTask, first.relatedTask);
  assert.notEqual(second.summaryPage, first.summaryPage);
  assert.notEqual(second.referenceChapter, first.referenceChapter);
  assert.notEqual(second.referencePage, first.referencePage);
  assert.equal(second.referenceStatus, second.referenced ? '已引用' : '未引用');
  assert.ok(state.resultRows.every((row) => (
    row.filename
    && row.department
    && row.tags.length > 0
    && row.summary
    && row.defaultSectionId
    && row.referenceStatus === (row.referenced ? '已引用' : '未引用')
  )));
});

test('所有状态转换生成的日志保留确定性操作人和状态', () => {
  const state = createSupervisionShareResultState();
  const generatedLogs = [
    confirmSelectedFiles(state, state.selectedFileIds).logs.at(-1),
    referenceResultRow(state, 'result-001', 'compliance').logs.at(-1),
    restartExtraction(state).logs.at(-1),
    markOutputGenerated(state, 'word').logs.at(-1),
    saveSupervisionVersion(state).logs.at(-1)
  ];

  for (const log of generatedLogs) {
    assert.equal(log.operator, '审计管理员');
    assert.equal(log.status, 'success');
  }
});

test('初始三条日志均提供确定性操作人和状态', () => {
  const state = createSupervisionShareResultState();

  assert.deepEqual(state.logs.map(({ operator, status }) => [operator, status]), [
    ['审计管理员', 'success'],
    ['系统', 'success'],
    ['智能分析引擎', 'processing']
  ]);
});

test('筛选使用 AND 语义、关键字覆盖三字段、日期边界包含且重置页码', () => {
  let state = createSupervisionShareResultState();
  state = setResultPage(state, 8);
  state = updateResultFilter(state, 'keyword', '关联交易');
  state = updateResultFilter(state, 'department', '合规法务部');
  state = updateResultFilter(state, 'startDate', '2025-03-18');
  state = updateResultFilter(state, 'endDate', '2025-03-18');

  assert.equal(state.pagination.page, 1);
  assert.deepEqual(filterResultRows(state).map((row) => row.id), ['result-001']);
  assert.equal(state.resultTotal, 1);

  const byFilename = updateResultFilter(createSupervisionShareResultState(), 'keyword', '风险评估');
  const byKeywords = updateResultFilter(createSupervisionShareResultState(), 'keyword', '授信集中度');
  const bySummary = updateResultFilter(createSupervisionShareResultState(), 'keyword', '集中度接近预警线');
  assert.deepEqual(filterResultRows(byFilename).map((row) => row.id), ['result-002']);
  assert.deepEqual(filterResultRows(byKeywords).map((row) => row.id), ['result-002']);
  assert.deepEqual(filterResultRows(bySummary).map((row) => row.id), ['result-002']);
});

test('数据标签是独立合法筛选并与关键词使用 AND 语义', () => {
  const initial = createSupervisionShareResultState();
  assert.equal(initial.filters.dataTag, '');
  assert.ok(initial.resultRows.every((row) => Array.isArray(row.tags)));

  const paged = setResultPage(initial, 8);
  const tagged = updateResultFilter(paged, 'dataTag', '高风险');
  assert.equal(tagged.pagination.page, 1);
  assert.deepEqual(filterResultRows(tagged).map((row) => row.id), ['result-002']);

  const matchingKeyword = updateResultFilter(tagged, 'keyword', '集中度');
  assert.deepEqual(filterResultRows(matchingKeyword).map((row) => row.id), ['result-002']);
  const conflictingKeyword = updateResultFilter(tagged, 'keyword', '关联交易');
  assert.deepEqual(filterResultRows(conflictingKeyword), []);

  const keywordOnly = updateResultFilter(initial, 'keyword', '高风险');
  assert.deepEqual(filterResultRows(keywordOnly), []);
});

test('无效筛选键返回原对象，清空全部筛选恢复展示总数 158', () => {
  const initial = createSupervisionShareResultState();
  assert.equal(updateResultFilter(initial, 'not-a-filter', 'x'), initial);

  const filtered = updateResultFilter(initial, 'department', '风险管理部');
  const reset = updateResultFilter(filtered, 'department', '');
  assert.equal(reset.resultTotal, 158);
});

test('同值筛选仅重置页码时保留 filters 引用', () => {
  const paged = setResultPage(createSupervisionShareResultState(), 8);
  const resetPage = updateResultFilter(paged, 'keyword', '');

  assert.equal(resetPage.pagination.page, 1);
  assert.equal(resetPage.filters, paged.filters);
});

test('确认文件不可变且相同文件集合重复确认不追加日志', () => {
  const state = createSupervisionShareResultState();
  const snapshot = structuredClone(state);
  const ids = state.selectedFiles.map((file) => file.id).reverse();
  const confirmed = confirmSelectedFiles(state, ids);

  assert.deepEqual(state, snapshot);
  assert.notEqual(confirmed, state);
  assert.equal(confirmed.filesConfirmed, true);
  assert.deepEqual(confirmed.selectedFileIds, state.selectedFiles.map((file) => file.id));
  assert.equal(confirmed.logs.length, state.logs.length + 1);
  assert.equal(confirmSelectedFiles(confirmed, [...ids]), confirmed);
  assert.equal(confirmSelectedFiles(state, ['missing-file']), state);
  assert.equal(confirmed.selectedFiles, state.selectedFiles);
  assert.equal(confirmed.resultRows, state.resultRows);
});

test('选择有效结果行只复制顶层，无效或重复选择保持原对象', () => {
  const state = createSupervisionShareResultState();
  const selected = selectResultRow(state, 'result-003');

  assert.notEqual(selected, state);
  assert.equal(selected.selectedRowId, 'result-003');
  assert.equal(selected.resultRows, state.resultRows);
  assert.equal(selected.sections, state.sections);
  assert.equal(selectResultRow(selected, 'result-003'), selected);
  assert.equal(selectResultRow(state, 'missing-row'), state);
});

test('首次引用只更新目标行和章节、追加一次日志并标记版本脏，重复引用幂等', () => {
  const state = createSupervisionShareResultState();
  const originalSection = state.sections.find((section) => section.id === 'compliance');
  const referenced = referenceResultRow(state, 'result-001', 'compliance');

  assert.equal(getRow(referenced, 'result-001').referenced, true);
  assert.equal(getRow(referenced, 'result-001').referenceStatus, '已引用');
  assert.equal(getRow(referenced, 'result-001').referencedSectionId, 'compliance');
  assert.equal(referenced.sections.find((section) => section.id === 'compliance').sourceCount, originalSection.sourceCount + 1);
  assert.equal(referenced.sections.find((section) => section.id === 'summary'), state.sections.find((section) => section.id === 'summary'));
  assert.equal(referenced.logs.length, state.logs.length + 1);
  assert.equal(referenced.logs.at(-1).id, 'log-reference-row-result-001');
  assert.equal(referenced.versionDirty, true);
  assert.equal(referenceResultRow(referenced, 'result-001', 'compliance'), referenced);
  assert.equal(referenceResultRow(state, 'missing-row', 'compliance'), state);
  assert.equal(referenceResultRow(state, 'result-001', 'missing-section'), state);

  const secondReference = referenceResultRow(referenced, 'result-002', 'risk');
  assert.equal(secondReference.logs.at(-1).id, 'log-reference-row-result-002');
  assert.equal(new Set(secondReference.logs.map((log) => log.id)).size, secondReference.logs.length);
});

test('重新提取按 stage id 恢复第四阶段且不复制未变化 stages', () => {
  const state = createSupervisionShareResultState();
  const restarted = restartExtraction(state);

  assert.deepEqual(restarted.stages[3], { id: 'stage4', name: '智能提取', status: 'active', progress: 78 });
  assert.equal(restarted.stages, state.stages);
  assert.equal(restarted.resultTotal, state.resultTotal);
  assert.equal(restarted.resultRows, state.resultRows);
  assert.equal(restarted.logs.at(-1).id, 'log-restart-extraction');
  assert.equal(restarted.logs.at(-1).time, '2025-04-28 10:26:00');

  const stage4 = { ...state.stages[3], status: 'completed', progress: 100 };
  const reordered = { ...state, stages: [stage4, ...state.stages.slice(0, 3), ...state.stages.slice(4)] };
  const restartedReordered = restartExtraction(reordered);
  assert.deepEqual(restartedReordered.stages[0], { id: 'stage4', name: '智能提取', status: 'active', progress: 78 });
  assert.equal(restartedReordered.stages[1], reordered.stages[1]);
});

test('生成输出只更新有效目标且重复生成幂等', () => {
  const state = createSupervisionShareResultState();
  const generated = markOutputGenerated(state, 'word');

  assert.deepEqual(generated.outputs.find((output) => output.id === 'word'), {
    id: 'word', name: '监督共享分析报告', type: 'Word', status: 'generated', progress: 100
  });
  assert.equal(generated.logs.length, state.logs.length + 1);
  assert.equal(generated.logs.at(-1).id, 'log-generate-output-word');
  assert.equal(markOutputGenerated(generated, 'word'), generated);
  assert.equal(markOutputGenerated(state, 'missing-output'), state);

  const generatedAppendix = markOutputGenerated(generated, 'appendix');
  assert.equal(generatedAppendix.logs.at(-1).id, 'log-generate-output-appendix');
  assert.equal(new Set(generatedAppendix.logs.map((log) => log.id)).size, generatedAppendix.logs.length);
});

test('保存只原位更新 V1.1 并清除脏标记，重复保存幂等', () => {
  const dirty = referenceResultRow(createSupervisionShareResultState(), 'result-001', 'summary');
  const saved = saveSupervisionVersion(dirty);

  assert.equal(saved.versions.length, 6);
  assert.deepEqual(saved.versions.at(-1), { number: 'V1.1', status: 'saved', saved: true });
  assert.equal(saved.versionDirty, false);
  assert.equal(saved.logs.length, dirty.logs.length + 1);
  assert.equal(saveSupervisionVersion(saved), saved);

  const dirtyAgain = referenceResultRow(saved, 'result-002', 'risk');
  const resaved = saveSupervisionVersion(dirtyAgain);
  assert.equal(resaved.versionDirty, false);
  assert.equal(resaved.versions, dirtyAgain.versions);
});

test('页码按总页数夹紧，页容量仅支持 10、20、50 且非法值回退 10', () => {
  const state = createSupervisionShareResultState();
  const lastPage = setResultPage(state, 99);
  assert.equal(lastPage.pagination.page, 16);
  assert.equal(lastPage.resultRows, state.resultRows);

  const size20 = setResultPageSize(lastPage, 20);
  assert.deepEqual(size20.pagination, { page: 8, pageSize: 20 });
  const size50 = setResultPageSize(size20, 50);
  assert.deepEqual(size50.pagination, { page: 4, pageSize: 50 });
  const fallback = setResultPageSize(size50, 13);
  assert.deepEqual(fallback.pagination, { page: 4, pageSize: 10 });
  assert.equal(setResultPageSize(fallback, 13), fallback);
  assert.equal(setResultPage(fallback, 4), fallback);
});
