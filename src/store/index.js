import { reactive, watch } from 'vue';
import { mockDb } from '../mock/index.js';
import { guardAssetAction } from '../domain/lifecycle/assetReferenceGuard.js';
import { guardReportAction } from '../domain/lifecycle/reportActionGuard.js';
import { reportStates } from '../domain/stateMachines/reportState.js';
import { applyExpenseDecision } from '../domain/expense/expenseAnomalyState.js';

const storageKey = 'audit-lifecycle-demo-state-v10';
const canUseStorage = typeof window !== 'undefined' && !!window.localStorage;
const persisted = (() => {
  if (!canUseStorage) return null;
  try {
    return JSON.parse(window.localStorage.getItem(storageKey));
  } catch {
    return null;
  }
})();

const persistedDb = persisted?.db || {};
export function mergePersistedExpenseAnomalies(baseRows, persistedRows) {
  if (!Array.isArray(persistedRows)) return baseRows;
  const persistedById = new Map(persistedRows.map((row) => [row.anomalyId, row]));
  const normalized = baseRows.map((row) => ({ ...row, ...(persistedById.get(row.anomalyId) || {}) }));
  const knownIds = new Set(normalized.map((row) => row.anomalyId));
  return [...normalized, ...persistedRows.filter((row) => !knownIds.has(row.anomalyId))];
}

const mergedExpenseAnomalies = mergePersistedExpenseAnomalies(mockDb.expenseAnomalies, persistedDb.expenseAnomalies);

export const store = reactive({
  db: { ...mockDb, ...persistedDb, expenseAnomalies: mergedExpenseAnomalies },
  notice: persisted?.notice || '',
  demoDataMode: persisted?.demoDataMode || 'empty',
  selectedAssetId: persisted?.selectedAssetId || 'FA-001',
  selectedAnomalyId: persisted?.selectedAnomalyId || 'FY-202504280002',
  activeTaskTab: persisted?.activeTaskTab || 'overview',
  activeRecordTab: persisted?.activeRecordTab || 'operation',
  activeDrawer: persisted?.activeDrawer || '',
  drawerPayload: persisted?.drawerPayload || null,
  setNotice(message) {
    this.notice = message;
  },
  setDemoDataMode(mode) {
    this.demoDataMode = mode;
    this.setNotice(mode === 'empty' ? '已切换为空状态，可演示新系统首次使用。' : '已切换为有数据状态，可演示任务办理和资产查询。');
  },
  resetDemoState() {
    this.demoDataMode = 'empty';
    this.activeTaskTab = 'overview';
    this.activeRecordTab = 'operation';
    this.activeDrawer = '';
    this.drawerPayload = null;
    this.setNotice('已重置为空状态，可从工作台重新开始演示。');
  },
  setTaskTab(tab) {
    this.activeTaskTab = tab;
  },
  setRecordTab(tab) {
    this.activeRecordTab = tab;
  },
  now() {
    return new Date().toLocaleString('zh-CN', { hour12: false });
  },
  openDrawer(type, payload = {}) {
    this.activeDrawer = type;
    this.drawerPayload = payload;
  },
  closeDrawer() {
    this.activeDrawer = '';
    this.drawerPayload = null;
  },
  addLog(action, targetType, targetId, result = '成功', reason = '') {
    this.db.operationLogs.unshift({
      logId: `LOG-${Date.now()}`,
      operator: this.db.currentUser.name,
      action,
      targetType,
      targetId,
      result,
      reason,
      createdAt: this.now()
    });
  },
  ensureCollection(name, fallback = []) {
    if (!Array.isArray(this.db[name])) this.db[name] = fallback;
    return this.db[name];
  },
  handleUploadException(type) {
    const rows = this.ensureCollection('uploadExceptionRows', [
      { issueId: 'UE-FAIL', fileName: '客户投诉说明缺失.docx', issueType: '上传失败', processStatus: '待处理', result: '等待重新上传', operator: '-' },
      { issueId: 'UE-DUP', fileName: '整改跟踪表.xlsx', issueType: '重复文件', processStatus: '待处理', result: '等待版本确认', operator: '-' },
      { issueId: 'UE-FMT', fileName: '临时说明.tmp', issueType: '格式异常', processStatus: '待处理', result: '等待排除入库', operator: '-' }
    ]);
    const config = {
      failed: { issueType: '上传失败', status: '已标记重新上传', result: '重新上传入口已开放', action: '处理上传失败文件' },
      duplicate: { issueType: '重复文件', status: '已确认保留新版本', result: '进入版本确认记录', action: '处理重复文件' },
      format: { issueType: '格式异常', status: '已排除入库预检', result: '不进入后续入库', action: '处理格式异常文件' }
    }[type];
    const row = rows.find((item) => item.issueType === config.issueType);
    if (row) {
      row.processStatus = config.status;
      row.result = config.result;
      row.operator = this.db.currentUser.name;
    }
    this.addLog(config.action, '上传批次', 'UP-SUP-001');
    this.setNotice(`${config.issueType}已形成行级处理结果，并写入操作记录。`);
  },
  saveMetadataMapping(assetId) {
    const rows = this.ensureCollection('metadataMappingRows', []);
    let row = rows.find((item) => item.assetId === assetId);
    if (!row) {
      row = { assetId, metadataStatus: '待映射', savedAt: '', savedBy: '' };
      rows.push(row);
    }
    row.metadataStatus = '已映射';
    row.referenceStatus = '待入库前预检';
    row.savedBy = this.db.currentUser.name;
    row.savedAt = this.now();
    this.addLog('保存元数据映射', '文件资产', assetId);
    this.setNotice(`${assetId} 元数据映射已保存，文件级状态已更新。`);
  },
  openTagDrawer() {
    this.openDrawer('tag-definition', {
      title: '标签定义管理',
      rows: [
        { tag: '风险事项', scope: '经纪业务部', usage: '报告来源筛选、监督共享汇总' },
        { tag: '整改跟踪', scope: '审计部', usage: '整改建议、复查记录' },
        { tag: '报告资料', scope: '上海分公司', usage: '审计报告资料引用' }
      ]
    });
    this.addLog('打开标签定义管理', '配置', 'TAG-SUP');
  },
  saveTaskDraft(payload = {}) {
    this.db.taskDraft = {
      ...payload,
      savedBy: this.db.currentUser.name,
      savedAt: this.now()
    };
    this.ensureCollection('capabilityRuns', []);
    this.db.capabilityRuns.unshift({
      runId: `CAP-${Date.now()}`,
      taskId: 'TASK-2026-NEW',
      capabilityName: '任务创建暂存',
      status: '已暂存',
      output: '等待提交并准备资料',
      createdAt: this.now()
    });
    this.addLog('暂存任务配置', '任务', 'TASK-2026-NEW');
    this.setNotice('任务配置已暂存，已写入任务办理记录。');
  },
  openCapabilityGate(row) {
    this.openDrawer('capability-gate', row);
    this.addLog(`查看${row.capabilityName}前置条件`, '能力目录', row.capabilityId);
  },
  handleStandardDraftAction(action) {
    const draft = this.db.standardDraft;
    if (action === 'confirm') {
      draft.status = '已确认';
      this.addLog('确认审计规范草稿', '审计规范草稿', draft.draftId);
      this.setNotice('审计规范草稿已确认，下一步可锁定并形成版本记录。');
      return;
    }
    if (action === 'lock') {
      if (draft.status !== '已确认') {
        this.addLog('锁定审计规范草稿', '审计规范草稿', draft.draftId, '被阻断', '草稿未确认');
        this.setNotice('请先确认审计规范草稿，再执行锁定。');
        return;
      }
      draft.status = '已锁定';
      this.db.versionRecords.unshift({
        versionId: `V-STD-${Date.now()}`,
        objectType: '审计规范',
        objectName: draft.title,
        versionNo: 'V2.2',
        status: '已锁定',
        createdBy: this.db.currentUser.name,
        createdAt: this.now()
      });
      this.addLog('锁定审计规范草稿', '审计规范草稿', draft.draftId);
      this.setNotice('审计规范草稿已锁定，版本记录已生成。');
    }
  },
  handlePolicyCapability(type) {
    const map = {
      query: { name: '制度查询', target: 'POL-QUERY', message: '制度查询已生成结构化结果，并沉淀到任务详情 / 分析过程。' },
      change: { name: '制度变更', target: 'POL-CHANGE', message: '制度变更影响已生成，等待人工确认后进入规范生成。' },
      compare: { name: '制度比对', target: 'POL-COMPARE', message: '制度比对差异已生成，并进入任务生成结果。' }
    };
    const item = map[type];
    this.db.policyExecutionState = {
      ...(this.db.policyExecutionState || {}),
      [type]: { status: '已执行', executor: this.db.currentUser.name, executedAt: this.now() }
    };
    this.ensureCollection('capabilityRuns').unshift({
      runId: `CAP-${Date.now()}`,
      taskId: 'TASK-2026-001',
      capabilityName: item.name,
      status: '已执行',
      output: item.message,
      createdAt: this.now()
    });
    this.addLog(item.name, '制度能力', item.target);
    this.setNotice(item.message);
  },
  handleSupervisionReportAction(action, payload = {}) {
    if (!this.db.supervisionReport) {
      this.db.supervisionReport = { reportId: 'SUP-REP-001', title: '监督共享汇总分析报告', status: '草稿待确认', exportStatus: '未导出' };
    }
    const report = this.db.supervisionReport;
    if (action === 'source') {
      this.openDrawer('supervision-source', {
        title: '监督共享报告引用来源',
        rows: this.db.supervisionReportSources || []
      });
      this.addLog('打开引用来源抽屉', '监督共享报告', report.reportId);
      return;
    }
    if (action === 'cite') {
      payload.row.referenceStatus = '已引用';
      this.addLog('引用来源到监督共享报告', '来源资料', payload.row.sourceId || payload.row.title);
      this.setNotice(`${payload.row.title} 已引用到监督共享报告，来源状态已更新。`);
      return;
    }
    if (action === 'confirm') {
      report.status = '已确认';
      this.addLog('确认监督共享报告', '监督共享报告', report.reportId);
      this.setNotice('监督共享报告草稿已确认，下一步可导出 Word / Excel。');
      return;
    }
    if (action === 'export') {
      if (report.status !== '已确认') {
        this.addLog('导出监督共享报告', '监督共享报告', report.reportId, '被阻断', '报告未确认');
        this.setNotice('请先确认监督共享报告草稿，再导出 Word / Excel。');
        return;
      }
      report.exportStatus = '已导出';
      this.db.exportRecords.unshift({
        exportId: `EXP-SUP-${Date.now()}`,
        objectType: '监督共享报告',
        objectName: report.title,
        format: 'Word / Excel',
        exportedBy: this.db.currentUser.name,
        exportedAt: this.now()
      });
      this.addLog('导出监督共享报告', '监督共享报告', report.reportId);
      this.setNotice('监督共享报告已导出 Word / Excel，导出记录已生成。');
    }
  },
  handleExpenseUsageReportAction(action) {
    if (!this.db.expenseUsageReport) {
      this.db.expenseUsageReport = { reportId: 'EXP-USE-REP-001', title: '费用综合分析报告', status: '草稿待确认', versionNo: '草稿版', exportStatus: '未导出' };
    }
    const report = this.db.expenseUsageReport;
    if (action === 'confirm') {
      report.status = '已确认';
      this.addLog('确认费用综合分析报告', '费用综合报告', report.reportId);
      this.setNotice('费用综合分析报告草稿已确认，下一步可锁定。');
      return;
    }
    if (action === 'lock') {
      if (report.status !== '已确认') {
        this.addLog('锁定费用综合分析报告', '费用综合报告', report.reportId, '被阻断', '报告未确认');
        this.setNotice('请先确认费用综合分析报告草稿，再锁定。');
        return;
      }
      report.status = '已锁定';
      report.versionNo = 'V1.0';
      this.db.versionRecords.unshift({
        versionId: `V-USE-${Date.now()}`,
        objectType: '费用综合报告',
        objectName: report.title,
        versionNo: report.versionNo,
        status: '已锁定',
        createdBy: this.db.currentUser.name,
        createdAt: this.now()
      });
      this.addLog('锁定费用综合分析报告', '费用综合报告', report.reportId);
      this.setNotice('费用综合分析报告已锁定，版本记录已生成。');
      return;
    }
    if (action === 'export') {
      if (report.status !== '已锁定') {
        this.addLog('导出费用综合分析报告', '费用综合报告', report.reportId, '被阻断', '报告未锁定');
        this.setNotice('请先锁定费用综合分析报告，再导出。');
        return;
      }
      this.db.exportRecords.unshift({
        exportId: `EXP-USE-${Date.now()}`,
        objectType: '费用综合报告',
        objectName: report.title,
        format: 'Word',
        exportedBy: this.db.currentUser.name,
        exportedAt: this.now()
      });
      report.exportStatus = '已导出';
      this.addLog('导出费用综合分析报告', '费用综合报告', report.reportId);
      this.setNotice('费用综合分析报告导出记录已生成。');
    }
  },
  publishTemplateVersion() {
    const template = this.db.reportTemplates.find((item) => item.templateId === 'TPL-002') || this.db.reportTemplates[0];
    template.status = '已发布';
    template.version = template.version === 'V2.2' ? 'V2.2' : 'V2.2';
    this.db.versionRecords.unshift({
      versionId: `V-TPL-${Date.now()}`,
      objectType: '报告模板',
      objectName: template.name,
      versionNo: template.version,
      status: '已发布',
      createdBy: this.db.currentUser.name,
      createdAt: this.now()
    });
    this.addLog('发布报告模板版本', '报告模板', template.templateId);
    this.setNotice(`${template.name} ${template.version} 已发布，旧版本继续保留引用关系。`);
  },
  downloadCheckResult() {
    this.db.checkResultExportStatus = '已生成下载记录';
    this.db.exportRecords.unshift({
      exportId: `EXP-CHK-${Date.now()}`,
      objectType: '报告检查结果',
      objectName: '营业部常规审计报告文档规范检查结果',
      format: 'Excel',
      exportedBy: this.db.currentUser.name,
      exportedAt: this.now()
    });
    this.addLog('下载报告检查结果', '报告检查', 'CHK-RPT-001');
    this.setNotice('报告检查结果已生成下载记录，并写入记录中心。');
  },
  requestAssetUnlock(assetId) {
    const requests = this.ensureCollection('assetChangeRequests');
    const request = {
      requestId: `UNLOCK-${Date.now()}`,
      assetId,
      action: '解锁申请',
      status: '待复核',
      nextStep: '复核通过后回退相关草稿',
      createdBy: this.db.currentUser.name,
      createdAt: this.now()
    };
    requests.unshift(request);
    this.db.assetWorkflowState = { status: '待复核', nextStep: '复核通过后回退相关草稿' };
    this.addLog('提交文件资产解锁申请', '文件资产', assetId);
    this.setNotice('解锁申请已提交，状态为待复核；通过后必须回退相关草稿。');
  },
  rollbackDraftForAsset(assetId) {
    const requests = this.ensureCollection('assetChangeRequests');
    requests.unshift({
      requestId: `ROLLBACK-${Date.now()}`,
      assetId,
      action: '回退重生成草稿',
      status: '已回退待重生成',
      nextStep: '重新选择来源并生成未确认草稿',
      createdBy: this.db.currentUser.name,
      createdAt: this.now()
    });
    if (this.db.reportDraft) this.db.reportDraft.status = reportStates.DRAFT_PENDING;
    this.db.assetWorkflowState = { status: '已回退待重生成', nextStep: '重新选择来源并生成未确认草稿' };
    this.addLog('回退关联草稿重新生成', '文件资产', assetId);
    this.setNotice('关联报告草稿已回退为未确认状态，需重新预检并生成。');
  },
  submitReportSupplement() {
    this.db.reportSupplementUpload = {
      batchId: 'RUP-001',
      status: '已补充并重新预检',
      fieldStatus: '三字段已补全',
      metadataStatus: '元数据已映射',
      updatedAt: this.now()
    };
    this.db.gapItems.forEach((item) => {
      if (item.gapId === 'GAP-001') {
        item.status = '已补充';
        item.resolution = '已上传整改责任部门说明并重新预检';
      }
    });
    this.addLog('报告生成中补充上传并重新预检', '报告资料', 'RUP-001');
    this.setNotice('补充资料已完成预览、三字段补全和重新预检，已回流资料缺口清单。');
  },
  openConfigDetail(row) {
    this.openDrawer('config-detail', row);
    this.addLog('查看配置参数详情', '配置', row.id);
  },
  validateConfigEdit(row) {
    const blocked = row.reference === '已引用';
    this.addLog('配置编辑校验', '配置', row.id, blocked ? '被阻断' : '成功', blocked ? '配置已被引用' : '');
    this.setNotice(blocked ? '该配置已被引用，不能覆盖，只能新增版本。' : '该配置可编辑，保存后会形成发布记录。');
  },
  addReviewSupplement(reviewId) {
    const item = this.db.reportReviewItems.find((review) => review.reviewId === reviewId);
    if (item) {
      item.decision = '补充说明';
      item.status = '已补充说明';
      this.db.reviewRecords.unshift({
        reviewLogId: `REV-${Date.now()}`,
        objectName: `${item.chapter} / ${item.suggestion}`,
        reviewer: this.db.currentUser.name,
        action: '报告审核建议补充说明',
        result: '成功',
        createdAt: this.now()
      });
      this.addLog('报告审核建议补充说明', '报告草稿', reviewId);
      this.setNotice(`${reviewId} 已补充说明，并写入复核记录。`);
    }
  },
  handleRegulatoryAction(action) {
    if (!this.db.regulatoryResultState) {
      this.db.regulatoryResultState = { resultId: 'REG-RES-001', status: '待确认', versionNo: '草稿版', exportStatus: '未导出' };
    }
    const state = this.db.regulatoryResultState;
    if (action === 'confirm') {
      state.status = '已确认';
      this.addLog('确认监管分析结果', '监管分析结果', state.resultId);
      this.setNotice('监管分析结果已确认，下一步可锁定。');
      return;
    }
    if (action === 'lock') {
      if (state.status !== '已确认') {
        this.addLog('锁定监管分析结果', '监管分析结果', state.resultId, '被阻断', '结果未确认');
        this.setNotice('请先确认监管分析结果，再锁定。');
        return;
      }
      state.status = '已锁定';
      state.versionNo = 'REG-V1.0';
      this.db.versionRecords.unshift({
        versionId: `V-REG-${Date.now()}`,
        objectType: '监管分析结果',
        objectName: '监管分析结果_2026Q2',
        versionNo: state.versionNo,
        status: '已锁定',
        createdBy: this.db.currentUser.name,
        createdAt: this.now()
      });
      this.addLog('锁定监管分析结果', '监管分析结果', state.resultId);
      this.setNotice('监管分析结果已锁定，版本记录已生成。');
      return;
    }
    if (action === 'export') {
      if (state.status !== '已锁定') {
        this.addLog('导出监管分析结果', '监管分析结果', state.resultId, '被阻断', '结果未锁定');
        this.setNotice('请先锁定监管分析结果，再导出。');
        return;
      }
      this.db.exportRecords.unshift({
        exportId: `EXP-REG-${Date.now()}`,
        objectType: '监管分析结果',
        objectName: '监管分析结果_2026Q2',
        format: 'Word',
        exportedBy: this.db.currentUser.name,
        exportedAt: this.now()
      });
      state.exportStatus = '已导出';
      this.addLog('导出监管分析结果', '监管分析结果', state.resultId);
      this.setNotice('监管分析结果导出记录已生成。');
    }
  },
  handleReportDiffAction(action) {
    if (action === 'newVersion') {
      this.db.versionRecords.unshift({
        versionId: `V-REP-${Date.now()}`,
        objectType: '报告',
        objectName: '营业部常规审计报告',
        versionNo: 'V1.2',
        status: '回传差异确认形成新版本',
        createdBy: this.db.currentUser.name,
        createdAt: this.now()
      });
      this.addLog('回传比对形成新版本', '报告差异', 'RDIFF');
      this.setNotice('已根据差异确认形成报告新版本 V1.2，版本记录已生成。');
      return;
    }
    this.db.callbackRecords.unshift({
      callbackId: `CB-${Date.now()}`,
      reportName: '营业部常规审计报告',
      lockedVersion: 'V1.1',
      offlineFile: '线下修改稿_仅归档.docx',
      status: '仅归档'
    });
    this.addLog('回传比对仅归档', '报告差异', 'RDIFF');
    this.setNotice('线下修改稿已仅归档，不影响系统锁定版本，回传记录已生成。');
  },
  validateStandardInvalidate(row) {
    const blocked = row.referenceCount > 0;
    this.addLog('审计规范版本失效校验', '审计规范版本', row.versionId, blocked ? '被阻断' : '成功', blocked ? '规范版本已被引用' : '');
    this.setNotice(blocked ? '该规范版本已被引用，不能直接设置失效。' : '该版本可设置失效，并会写入版本记录。');
  },
  validateTemplateReference(row) {
    const blocked = row.referenceCount > 0;
    this.addLog('报告模板引用校验', '报告模板', row.templateId, blocked ? '被阻断' : '成功', blocked ? '模板版本已被引用' : '');
    this.setNotice(blocked ? '该模板版本已被报告引用，不能覆盖，只能上传新版本。' : '该模板版本可编辑，保存后形成版本记录。');
  },
  openSupervisionSourceDetail(row) {
    this.openDrawer('supervision-source-detail', row);
    this.addLog('查看监督共享来源详情', '来源资料', row.sourceId);
  },
  selectSupervisionReportSource(row) {
    if (row.permissionScope !== '权限内' || row.referenceStatus === '不可引用') {
      this.addLog('加入监督共享报告来源', '来源资料', row.sourceId, '被阻断', '无权限或不可引用');
      this.setNotice('该文件无权限或不可引用，不能加入来源。');
      return;
    }
    row.referenceStatus = '已加入报告来源';
    this.addLog('加入监督共享报告来源', '来源资料', row.sourceId);
    this.setNotice(`${row.fileName} 已加入报告来源，来源状态已更新。`);
  },
  handleAssetAction(assetId, action) {
    const asset = this.db.fileAssets.find((item) => item.assetId === assetId) || this.db.fileAssetsExtended.find((item) => item.assetId === assetId);
    const guard = guardAssetAction(asset, action);
    this.addLog(action === 'delete' ? '逻辑删除校验' : '设置失效校验', '文件资产', assetId, guard.allowed ? '成功' : '被阻断', guard.reason);
    this.setNotice(guard.allowed ? '操作已记录。' : guard.message);
    return guard;
  },
  updateAnomaly(anomalyId, status) {
    const anomaly = this.db.expenseAnomalies.find((item) => item.anomalyId === anomalyId);
    if (anomaly) {
      anomaly.status = status;
      this.addLog(`异常状态调整为${status}`, '费用异常', anomalyId);
      this.setNotice(`异常 ${anomalyId} 已更新为${status}。`);
    }
  },
  decideExpenseAnomaly(anomalyId, action, payload = {}) {
    const index = this.db.expenseAnomalies.findIndex((item) => item.anomalyId === anomalyId);
    if (index < 0) return { ok: false, error: '未找到费用异常记录', row: null };
    const result = applyExpenseDecision(this.db.expenseAnomalies[index], action, payload);
    if (!result.ok) {
      this.setNotice(result.error);
      return result;
    }
    this.db.expenseAnomalies[index] = result.row;
    const actionLabel = { confirm: '确认异常', exclude: '排除异常', supplement: '补充说明' }[action];
    this.addLog(actionLabel, '费用异常', anomalyId);
    this.setNotice(`异常 ${anomalyId} 已${actionLabel}。`);
    return result;
  },
  saveExpenseSupplement(anomalyId, note) {
    return this.decideExpenseAnomaly(anomalyId, 'supplement', { note });
  },
  saveExpenseRemediation(anomalyId, remediation) {
    const row = this.db.expenseAnomalies.find((item) => item.anomalyId === anomalyId);
    const value = typeof remediation === 'string' ? remediation.trim() : '';
    if (!row) return { ok: false, error: '未找到费用异常记录', row: null };
    if (!value) return { ok: false, error: '整改建议不能为空', row };
    row.remediation = value;
    this.addLog('保存整改建议', '费用异常', anomalyId);
    this.setNotice(`异常 ${anomalyId} 的整改建议已保存。`);
    return { ok: true, row };
  },
  recordExpenseExport(objectName, rowCount) {
    if (!objectName || !Number.isInteger(rowCount) || rowCount <= 0) {
      return { ok: false, error: '导出范围为空或文件名无效' };
    }
    const record = {
      exportId: `EXP-${Date.now()}`,
      objectType: '费用异常汇总',
      objectName,
      format: 'Excel',
      exportedBy: this.db.currentUser.name,
      exportedAt: this.now(),
      rowCount
    };
    this.db.exportRecords.unshift(record);
    this.addLog('导出费用异常汇总', '费用异常', record.exportId);
    this.setNotice(`${objectName} 已生成，共导出 ${rowCount} 条记录。`);
    return { ok: true, record };
  },
  updateReportReview(reviewId, decision) {
    const item = this.db.reportReviewItems.find((review) => review.reviewId === reviewId);
    if (item) {
      item.decision = decision;
      item.status = decision === '忽略' ? '已忽略' : '已采纳';
      this.db.reviewRecords.unshift({
        reviewLogId: `REV-${Date.now()}`,
        objectName: `${item.chapter} / ${item.suggestion}`,
        reviewer: this.db.currentUser.name,
        action: `报告审核建议${decision}`,
        result: '成功',
        createdAt: this.now()
      });
      this.addLog(`报告审核建议${decision}`, '报告草稿', reviewId);
      this.setNotice(`审核建议 ${reviewId} 已${decision}，并写入复核记录。`);
    }
  },
  handleReportAction(action) {
    const report = this.db.reportDraft;
    const guard = guardReportAction(report, action);
    if (!guard.allowed) {
      this.addLog(action, '报告草稿', report.draftId, '被阻断', guard.reason);
      this.setNotice(guard.message);
      return guard;
    }
    if (action === 'generate') report.status = reportStates.DRAFT_PENDING;
    if (action === 'confirm') report.status = reportStates.CONFIRMED;
    if (action === 'lock') {
      report.status = reportStates.LOCKED;
      this.db.versionRecords.unshift({
        versionId: `V-${Date.now()}`,
        objectType: '报告',
        objectName: report.reportType,
        versionNo: 'V1.1',
        status: '已锁定',
        createdBy: this.db.currentUser.name,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
      });
    }
    if (action === 'export') {
      this.db.exportRecords.unshift({
        exportId: `EXP-${Date.now()}`,
        objectType: '报告',
        objectName: report.reportType,
        format: 'Word',
        exportedBy: this.db.currentUser.name,
        exportedAt: this.now()
      });
    }
    if (action === 'callback') {
      this.db.callbackRecords.unshift({
        callbackId: `CB-${Date.now()}`,
        reportName: report.reportType,
        lockedVersion: 'V1.1',
        offlineFile: '营业部常规审计报告_线下修改稿.docx',
        status: '待比对'
      });
    }
    this.addLog(action, '报告草稿', report.draftId);
    this.setNotice(`报告动作已执行：${action}`);
    return guard;
  }
});

if (canUseStorage) {
  watch(
    () => ({
      db: store.db,
      notice: store.notice,
      selectedAssetId: store.selectedAssetId,
      selectedAnomalyId: store.selectedAnomalyId,
      activeTaskTab: store.activeTaskTab,
      activeRecordTab: store.activeRecordTab,
      activeDrawer: store.activeDrawer,
      drawerPayload: store.drawerPayload,
      demoDataMode: store.demoDataMode
    }),
    (value) => {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    },
    { deep: true }
  );
}
