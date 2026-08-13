<template>
  <template v-if="showDraftState">
    <TaskDetailDraft />
  </template>
  <template v-else>
  <TaskDetailArchived v-if="showArchivedState" />
  <template v-if="!showArchivedState">
  <TaskDetailGenerating v-if="showGeneratingState" />
  <ExpenseAnomalyTaskDetail
    v-else-if="isExpenseAnomalyDetail"
    :anomaly="selectedExpenseAnomaly"
    :evidence="selectedExpenseEvidence"
    :similar-rows="similarExpenseRows"
    @back="backToExpenseAnomalyList"
    @confirm="confirmExpenseAnomaly"
    @exclude="excludeExpenseAnomaly"
    @supplement="supplementExpenseAnomaly"
  />
  <div v-else class="pending-task-detail" :class="{ 'trace-closed': !traceOpen && !fileDrawer.open }">
    <main class="central-workspace">
      <TaskDetailHeader
        :task="taskDetailMeta"
        :tabs="taskDetailTabs"
        :active-tab="activeTab"
        :pending-count="pendingCount"
        :version="taskState.version"
        @save-version="handleSaveVersion"
        @submit-review="handleSubmitReview"
        @export-results="handleExportResults"
        @tab-change="handleTabChange"
      />

      <section v-if="activeTab === 'overview'" class="task-detail-tab-panel">
        <header><h2>任务概览</h2></header>
        <div class="overview-grid">
          <dl>
            <div><dt>任务名称</dt><dd>{{ taskDetailMeta.title }}</dd></div>
            <div><dt>负责人</dt><dd>{{ taskDetailMeta.owner }}</dd></div>
            <div><dt>任务类型</dt><dd>{{ taskDetailMeta.type }}</dd></div>
            <div><dt>创建时间</dt><dd>{{ taskDetailMeta.createdAt }}</dd></div>
            <div><dt>当前状态</dt><dd class="phase-text">{{ taskDetailMeta.phaseStatus }}</dd></div>
            <div><dt>被审计单位</dt><dd>{{ taskDetailMeta.organization }}</dd></div>
          </dl>
          <section>
            <h3>已选择业务能力</h3>
            <ul>
              <li v-for="ability in displayAbilities" :key="ability.id">{{ ability.name }}<span>{{ statusLabel(ability.status) }}</span></li>
            </ul>
          </section>
        </div>
      </section>

      <section v-else-if="activeTab === 'materials'" class="task-detail-tab-panel">
        <header><h2>输入资料</h2></header>
        <table class="detail-table">
          <thead><tr><th>文件名称</th><th>类型</th><th>解析状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="file in inputMaterials" :key="file.id">
              <td>{{ file.name }}</td><td>{{ file.type }}</td><td>{{ file.parseStatus }}</td>
              <td><button type="button" @click="openFileDrawer(file)">查看详情</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-else-if="activeTab === 'analysis'" class="task-detail-tab-panel">
        <header><h2>分析过程</h2></header>
        <ol class="phase-timeline">
          <li v-for="stage in analysisStages" :key="stage.key" :class="stage.state">
            <span></span>
            <div><strong>{{ stage.label }}</strong><time>{{ stage.time }}</time><p>{{ stage.detail }}</p></div>
          </li>
        </ol>
      </section>

      <template v-else-if="activeTab === 'results'">
        <CapabilityResultGrid
          :abilities="displayAbilities"
          :selected-ability-id="selectedItem?.abilityId"
          @view-result="handleViewResult"
          @view-evidence="handleViewEvidence"
          @confirm-ability="handleConfirmAbility"
          @exclude-ability="handleExcludeAbility"
          @upload-report="handleUploadReport"
          @run-check="handleRunCheck"
        />

        <PendingConfirmationTable
          ref="confirmationTable"
          :items="pagedItems"
          :ability-names="abilityNames"
          :total="taskState.items.length"
          :page="page"
          :page-size="pageSize"
          :selected-item-id="taskState.selectedItemId"
          @view-evidence="handleViewEvidence"
          @confirm="handleConfirmItem"
          @exclude="handleExcludeItem"
          @edit-note="handleEditNote"
          @decision-change="handleDecisionChange"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />

      </template>

      <section v-else-if="activeTab === 'outputs'" class="task-detail-tab-panel">
        <VersionExportPreview
          :versions="versions"
          :files="files"
          @select-version="handleVersionPreview"
          @preview-file="handleFilePreview"
          @more-files="handleMoreFiles"
        />
      </section>

      <section v-else-if="activeTab === 'timeline'" class="task-detail-tab-panel">
        <TaskArchiveRecords :archive="recordArchive" @archive-action="showToast" />
      </section>

      <section v-else-if="activeTab === 'export-records'" class="task-detail-tab-panel">
        <TaskArchiveRecords :archive="recordArchive" export-only @archive-action="showToast" />
      </section>
    </main>

    <aside v-if="fileDrawer.open" class="file-detail-drawer" aria-label="文件详情">
      <header><h2>文件详情</h2><button type="button" aria-label="关闭文件详情" @click="closeFileDrawer">×</button></header>
      <dl>
        <div><dt>文件名称</dt><dd>{{ fileDrawer.file.name }}</dd></div>
        <div><dt>文件类型</dt><dd>{{ fileDrawer.file.type }}</dd></div>
        <div><dt>解析状态</dt><dd>{{ fileDrawer.file.parseStatus }}</dd></div>
        <div><dt>文件来源</dt><dd>{{ fileDrawer.file.source }}</dd></div>
        <div><dt>版本</dt><dd>{{ fileDrawer.file.version }}</dd></div>
        <div><dt>关联关系</dt><dd>{{ fileDrawer.file.relation }}</dd></div>
        <div><dt>上传部门</dt><dd>{{ fileDrawer.file.owner }}</dd></div>
        <div><dt>解析时间</dt><dd>{{ fileDrawer.file.parsedAt }}</dd></div>
      </dl>
    </aside>

    <EvidenceTracePanel
      :open="traceOpen"
      :item="selectedItem"
      :evidence="selectedEvidence"
      :active-tab="traceTab"
      :decision="selectedItem?.decision || '确认该事项'"
      :note="selectedItem?.note || ''"
      :logs="logs"
      @close="traceOpen = false"
      @tab-change="traceTab = $event"
      @view-source="showToast('已定位到来源条款原文')"
      @view-related-file="handleRelatedFile"
      @decision-change="handleDrawerDecision"
      @note-change="handleNoteChange"
      @confirm-item="handleConfirmItem(selectedItem)"
      @exclude-item="handleExcludeItem(selectedItem)"
      @link-report="handleLinkReport"
    />

    <div v-if="toast" class="task-toast" role="status">{{ toast }}</div>
  </div>
  </template>
  </template>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  canSubmitReview,
  confirmAbility,
  confirmItem,
  createTaskResultState,
  excludeItem,
  getAbilityStatus,
  getPendingCount,
  markResultDirty,
  paginateItems,
  saveItemNote
} from '../../domain/taskDetail/taskResultState.js';
import { resolveTaskDetailMode } from '../../domain/taskDetail/draftTaskDetail.js';
import { resolveTaskDetailView } from '../../domain/taskDetail/taskDetailViewState.js';
import { taskRows } from './taskCenterData.js';
import {
  evidenceForItem,
  initialOperationLogs,
  inputMaterials,
  analysisStages,
  outputFiles,
  taskDetailMeta,
  taskDetailTabs,
  timelineEvents,
  timelineFilters,
  versionTimeline
} from './taskDetailPendingData.js';
import TaskDetailArchived from './TaskDetailArchived.vue';
import TaskDetailDraft from './TaskDetailDraft.vue';
import TaskDetailGenerating from './TaskDetailGenerating.vue';
import TaskDetailHeader from './task-detail/TaskDetailHeader.vue';
import CapabilityResultGrid from './task-detail/CapabilityResultGrid.vue';
import PendingConfirmationTable from './task-detail/PendingConfirmationTable.vue';
import VersionExportPreview from './task-detail/VersionExportPreview.vue';
import EvidenceTracePanel from './task-detail/EvidenceTracePanel.vue';
import ExpenseAnomalyTaskDetail from './task-detail/ExpenseAnomalyTaskDetail.vue';
import TaskArchiveRecords from './TaskArchiveRecords.vue';

const route = useRoute();
const router = useRouter();
const store = inject('store');
const allTaskRows = computed(() => [...(store?.db.createdTasks || []), ...taskRows]);
const selectedTask = computed(() => route.query.state === 'generating' ? undefined : allTaskRows.value.find((task) => task.id === route.query.taskId));
const detailMode = computed(() => resolveTaskDetailMode({
  explicitState: route.query.tab === 'expense-anomaly' && route.query.anomalyId ? 'pending' : String(route.query.state || ''),
  statusKey: selectedTask.value?.statusKey || '',
  tab: String(route.query.tab || '')
}));
const showDraftState = computed(() => detailMode.value === 'draft');
const detailView = computed(() => resolveTaskDetailView(route.query, selectedTask.value));
const showArchivedState = computed(() => detailView.value === 'archived');
const showGeneratingState = computed(() => detailView.value === 'generating');
const selectedExpenseAnomaly = computed(() => {
  const anomalyId = String(route.query.anomalyId || '');
  return store?.db.expenseAnomalies.find((row) => row.anomalyId === anomalyId) || null;
});
const selectedExpenseEvidence = computed(() => store?.db.expenseEvidenceChains.find((row) => row.anomalyId === selectedExpenseAnomaly.value?.anomalyId) || {});
const similarExpenseRows = computed(() => {
  if (!selectedExpenseAnomaly.value) return [];
  const evidenceRows = (selectedExpenseEvidence.value.similarRecords || []).map((row) => ({
    ...row,
    type: selectedExpenseAnomaly.value.type,
    status: row.status || row.riskLevel
  }));
  const sameTypeRows = store.db.expenseAnomalies
    .filter((row) => row.anomalyId !== selectedExpenseAnomaly.value.anomalyId && row.type === selectedExpenseAnomaly.value.type)
    .slice(0, Math.max(0, 3 - evidenceRows.length));
  return [...evidenceRows, ...sameTypeRows].slice(0, 3);
});
const isExpenseAnomalyDetail = computed(() => String(route.query.tab || '') === 'expense-anomaly' && Boolean(selectedExpenseAnomaly.value));

const taskState = ref(createTaskResultState());
const activeTab = ref('overview');
const traceOpen = ref(false);
const traceTab = ref('source');
const timelineTypeFilter = ref('all');
const page = ref(1);
const pageSize = ref(10);
const confirmationTable = ref(null);
const toast = ref('');
const logs = ref(initialOperationLogs.map((log) => ({ ...log })));
const versions = ref(versionTimeline.map((version) => ({ ...version })));
const files = ref(outputFiles.map((file) => ({ ...file })));
const fileDrawer = ref({ open: false, file: {} });
let toastTimer;

const pendingCount = computed(() => getPendingCount(taskState.value));
const displayAbilities = computed(() => taskState.value.abilities.map((ability) => ({
  ...ability,
  status: getAbilityStatus(taskState.value, ability.id)
})));
const selectedItem = computed(() => taskState.value.items.find((item) => item.id === taskState.value.selectedItemId) || taskState.value.items[0]);
const selectedEvidence = computed(() => evidenceForItem(selectedItem.value));
const pagedItems = computed(() => paginateItems(taskState.value.items, page.value, pageSize.value));
const abilityNames = computed(() => Object.fromEntries(taskState.value.abilities.map((ability) => [ability.id, ability.name])));
const filteredTimelineEvents = computed(() => {
  const dynamicEvents = logs.value.map((log) => ({
    id: log.id,
    type: log.type || '操作记录',
    time: log.time,
    operator: log.operator,
    title: log.action,
    detail: log.result
  }));
  const events = [...dynamicEvents, ...timelineEvents];
  return timelineTypeFilter.value === 'all'
    ? events
    : events.filter((event) => event.type === timelineTypeFilter.value);
});
const recordArchive = computed(() => {
  const operationRecords = filteredTimelineEvents.value.map((event, index) => {
    const category = event.type.includes('导出') ? 'export' : event.type.includes('复核') ? 'review' : 'change';
    return {
      id: event.id,
      category,
      taskId: taskDetailMeta.id,
      taskName: event.title,
      taskType: taskDetailMeta.type,
      organization: taskDetailMeta.organization,
      period: taskDetailMeta.period,
      stage: event.type,
      status: event.result || taskDetailMeta.phaseStatus,
      riskCount: index % 2 === 0 ? '-' : String(index + 1),
      nextStep: event.detail,
      creator: event.operator,
      updatedAt: event.time,
      action: '查看'
    };
  });
  const exportRecords = files.value.map((file) => ({
    file: file.name,
    type: file.type,
    version: taskState.value.version?.id || 'V1.0',
    exporter: taskDetailMeta.owner,
    exportedAt: file.generatedAt,
    aiLabel: file.exported ? '已标识' : '待导出'
  }));
  return {
    recordTabs: [
      { id: 'all', label: '全部', count: operationRecords.length },
      { id: 'change', label: '修改', count: operationRecords.filter((record) => record.category === 'change').length },
      { id: 'review', label: '复核', count: operationRecords.filter((record) => record.category === 'review').length },
      { id: 'export', label: '导出', count: operationRecords.filter((record) => record.category === 'export').length }
    ],
    operationRecords,
    exports: exportRecords
  };
});

function showToast(message) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = '';
  }, 2400);
}

function pushLog(action, result, type = '操作记录') {
  logs.value = [
    {
      id: `LOG-${Date.now()}`,
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      operator: '审计管理员',
      type,
      action,
      result
    },
    ...logs.value
  ];
}

function selectItem(item) {
  if (!item) return;
  taskState.value = { ...taskState.value, selectedItemId: item.id };
  traceOpen.value = true;
  traceTab.value = 'source';
}

function handleTabChange(tabId) {
  activeTab.value = tabId;
  traceOpen.value = false;
  closeFileDrawer();
}

function backToExpenseAnomalyList() {
  router.push({ path: '/expense/anomaly/dashboard' });
}

function confirmExpenseAnomaly(row) {
  const result = store.decideExpenseAnomaly(row.anomalyId, 'confirm');
  if (result.ok) showToast('费用异常已确认');
}

function excludeExpenseAnomaly(row, reason) {
  const result = store.decideExpenseAnomaly(row.anomalyId, 'exclude', { reason });
  if (result.ok) showToast('费用异常已排除');
}

function supplementExpenseAnomaly(row, note) {
  const result = store.saveExpenseSupplement(row.anomalyId, note);
  if (result.ok) showToast('补充说明已保存');
}

function handleViewResult(ability) {
  if (ability.name === '费用审计') {
    router.push({ path: '/expense/audit/overview', query: { taskId: route.query.taskId } });
    return;
  }
  if (ability.id === 5) {
    router.push({ path: '/audit-standard/draft', query: { taskId: route.query.taskId } });
    return;
  }
  showToast(`正在预览：${ability.fileName || ability.name}`);
  pushLog('查看能力结果', ability.name);
}

function handleViewEvidence(target) {
  const item = target.itemType
    ? target
    : taskState.value.items.find((candidate) => candidate.abilityId === target.id && candidate.disposition === 'pending')
      || taskState.value.items.find((candidate) => candidate.abilityId === target.id)
      || selectedItem.value;
  selectItem(item);
  fileDrawer.value = { open: false, file: {} };
  pushLog('查看结果依据', item?.itemType || target.name, '操作记录');
}

function handleConfirmItem(item) {
  if (!item) return;
  const updated = confirmItem(taskState.value, item.id);
  if (updated === taskState.value) {
    showToast('该事项已经处理');
    return;
  }
  taskState.value = updated;
  pushLog('确认待办事项', item.itemType, '确认结果');
  showToast('已确认该事项');
}

function handleExcludeItem(item) {
  if (!item) return;
  const updated = excludeItem(taskState.value, item.id, item.note);
  if (updated === taskState.value) {
    showToast('该事项已经处理');
    return;
  }
  taskState.value = updated;
  pushLog('排除待办事项', item.itemType, '排除结果');
  showToast('已排除该事项');
}

function handleEditNote(item) {
  selectItem(item);
  showToast('可在右侧填写处理说明');
}

function handleDecisionChange(itemId, decision) {
  taskState.value = markResultDirty({
    ...taskState.value,
    selectedItemId: itemId,
    items: taskState.value.items.map((item) => item.id === itemId ? { ...item, decision } : item)
  });
  traceOpen.value = true;
}

function handleDrawerDecision(decision) {
  if (!selectedItem.value) return;
  handleDecisionChange(selectedItem.value.id, decision);
}

function handleNoteChange(note) {
  if (!selectedItem.value) return;
  taskState.value = saveItemNote(taskState.value, selectedItem.value.id, note);
}

function handleConfirmAbility(ability) {
  const before = pendingCount.value;
  taskState.value = confirmAbility(taskState.value, ability.id);
  const resolved = before - pendingCount.value;
  showToast(resolved ? `已确认“${ability.name}”下 ${resolved} 项` : '该能力已全部处理');
  if (resolved) pushLog('批量确认能力结果', ability.name, '确认结果');
}

function handleExcludeAbility(ability) {
  const targets = taskState.value.items.filter((item) => item.abilityId === ability.id && item.disposition === 'pending');
  targets.forEach((item) => {
    taskState.value = excludeItem(taskState.value, item.id);
  });
  showToast(targets.length ? `已排除“${ability.name}”下 ${targets.length} 项` : '该能力已全部处理');
  if (targets.length) pushLog('批量排除能力结果', ability.name, '排除结果');
}

function handleSaveVersion() {
  taskState.value = {
    ...taskState.value,
    draftState: 'saved',
    version: { ...taskState.value.version, saved: true }
  };
  versions.value = versions.value.map((version) => version.id === 'V1.0' ? { ...version, note: '已保存' } : version);
  pushLog('保存当前版本', 'V1.0 草稿', '操作记录');
  showToast('V1.0 草稿已保存');
}

function handleSubmitReview() {
  if (!canSubmitReview(taskState.value)) {
    const message = pendingCount.value
      ? `尚有 ${pendingCount.value} 项待确认，暂不能提交复核`
      : '请先保存当前版本';
    showToast(message);
    confirmationTable.value?.focusSection();
    return;
  }
  taskState.value = { ...taskState.value, phase: 'under_review' };
  pushLog('提交复核', '任务已进入复核中', '提交复核');
  showToast('任务已提交复核');
}

function handleExportResults() {
  files.value = files.value.map((file) => ({ ...file, exported: true }));
  pushLog('导出生成结果', `${files.value.length} 个文件`, '导出文件');
  showToast('已生成 4 个导出记录');
}

function handleUploadReport() {
  taskState.value = markResultDirty({
    ...taskState.value,
    abilities: taskState.value.abilities.map((ability) => ability.id === 9
      ? { ...ability, fileName: '审计报告终稿.docx', fileType: 'docx', baseStatus: 'checking' }
      : ability)
  });
  pushLog('上传审核报告', '审计报告终稿.docx', '上传文件');
  showToast('报告已上传，可以执行检查');
}

function handleRunCheck() {
  const reportAbility = taskState.value.abilities.find((ability) => ability.id === 9);
  if (!reportAbility?.fileName) {
    showToast('请先上传报告');
    return;
  }
  taskState.value = markResultDirty({
    ...taskState.value,
    abilities: taskState.value.abilities.map((ability) => ability.id === 9 ? { ...ability, baseStatus: 'check_passed' } : ability)
  });
  pushLog('执行报告审核', '检查通过', '生成报告');
  showToast('报告审核已完成');
}

function handlePageChange(nextPage) {
  const totalPages = Math.max(1, Math.ceil(taskState.value.items.length / pageSize.value));
  page.value = Math.min(totalPages, Math.max(1, Number(nextPage) || 1));
}

function handlePageSizeChange(nextSize) {
  pageSize.value = Number(nextSize) || 10;
  page.value = 1;
}

function handleVersionPreview(version) {
  showToast(`正在查看 ${version.id} 版本快照`);
}

function handleFilePreview(file) {
  showToast(`正在预览：${file.name}`);
}

function handleMoreFiles() {
  showToast('其余文件已在输出文件页签中展示');
}

function handleRelatedFile(file) {
  showToast(`正在查看关联文件：${file.name}`);
}

function handleLinkReport() {
  if (!selectedItem.value) return;
  taskState.value = markResultDirty({
    ...taskState.value,
    items: taskState.value.items.map((item) => item.id === selectedItem.value.id ? { ...item, linkedToReport: true } : item)
  });
  pushLog('引用到报告', selectedItem.value.itemType, '生成报告');
  showToast('该事项已引用到报告');
}

function openFileDrawer(file) {
  traceOpen.value = false;
  fileDrawer.value = { open: true, file };
}

function closeFileDrawer() {
  fileDrawer.value = { open: false, file: {} };
}

function statusLabel(status) {
  return {
    confirmed: '已确认',
    pending: '待确认',
    awaiting_upload: '待上传',
    checking: '检查中',
    check_passed: '已通过',
    excluded: '已排除'
  }[status] || status;
}

function handleKeydown(event) {
  if (event.key === 'Escape' && traceOpen.value) traceOpen.value = false;
}

onMounted(() => window.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  clearTimeout(toastTimer);
});
</script>

<style scoped>
.pending-task-detail{height:calc(100dvh - 56px);display:grid;grid-template-columns:minmax(0,1fr) clamp(276px,20.7vw,328px);gap:8px;overflow:hidden;background:#f5f7fa}.pending-task-detail.trace-closed{grid-template-columns:minmax(0,1fr)}.central-workspace{min-width:0;overflow-y:auto;padding:0 8px 10px 12px;display:flex;flex-direction:column;gap:0}.central-workspace>:deep(.results-section){margin-right:5px;margin-left:5px}.central-workspace>:deep(.confirmation-section){margin:2px 0 0 11px}.central-workspace>:deep(.preview-row){margin:0}.central-workspace::-webkit-scrollbar{width:5px}.central-workspace::-webkit-scrollbar-thumb{background:#d8dee8;border-radius:4px}.task-detail-tab-panel{margin:8px 5px 0;padding:14px;border:1px solid #e5eaf0;background:#fff}.task-detail-tab-panel>header,.timeline-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.task-detail-tab-panel h2{margin:0;color:#202631;font-size:15px}.overview-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(280px,.75fr);gap:12px}.overview-grid dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;border:1px solid #e8ecf2}.overview-grid dl>div{padding:12px;border-right:1px solid #e8ecf2;border-bottom:1px solid #e8ecf2}.overview-grid dt{color:#667085;font-size:11px}.overview-grid dd{margin:6px 0 0;color:#202631;font-size:12px}.phase-text{color:var(--color-warning)!important}.overview-grid section{padding:12px;border:1px solid #e8ecf2}.overview-grid h3{margin:0 0 10px;font-size:13px}.overview-grid ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:0;padding:0;list-style:none}.overview-grid li{display:flex;justify-content:space-between;gap:8px;padding:7px 8px;background:#f7f9fb;color:#303642;font-size:11px}.overview-grid li span{color:#667085}.detail-table{width:100%;border-collapse:collapse;table-layout:fixed}.detail-table th,.detail-table td{height:38px;padding:0 10px;border:1px solid #e5eaf0;overflow:hidden;text-align:left;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.detail-table th{background:#f6f8fb;color:#4b5566}.detail-table button{padding:0;border:0;background:transparent;color:var(--color-info);font-size:12px}.phase-timeline,.operation-timeline{display:grid;gap:9px;margin:0;padding:0;list-style:none}.phase-timeline li{display:grid;grid-template-columns:26px minmax(0,1fr);align-items:start}.phase-timeline li>span{width:13px;height:13px;margin-top:3px;border:2px solid #c8d0dc;border-radius:50%;background:#fff}.phase-timeline li.completed>span{border-color:#0b9848;background:#0b9848}.phase-timeline li.active>span{border-color:var(--color-primary);box-shadow:0 0 0 4px #ffe8e8}.phase-timeline strong,.operation-timeline strong{display:block;color:#202631;font-size:13px}.phase-timeline time,.operation-timeline time,.operation-timeline span{color:#667085;font-size:11px}.phase-timeline p,.operation-timeline p{margin:4px 0 0;color:#4b5566;font-size:12px}.timeline-header select{height:30px;border:1px solid #d8dee8;border-radius:4px;background:#fff;color:#303642}.operation-timeline li{padding:11px;border:1px solid #e8ecf2;background:#fff}.file-detail-drawer{height:calc(100dvh - 56px);min-width:0;background:#fff;border-left:1px solid #e5eaf0;box-shadow:-4px 0 12px rgba(16,24,40,.06);color:#303642}.file-detail-drawer header{display:flex;height:54px;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid #e8ebf0}.file-detail-drawer h2{margin:0;font-size:16px}.file-detail-drawer button{width:28px;height:28px;border:0;background:transparent;font-size:21px}.file-detail-drawer dl{margin:0;padding:10px 14px}.file-detail-drawer dl>div{padding:10px 0;border-bottom:1px solid #eef1f4}.file-detail-drawer dt{color:#667085;font-size:11px}.file-detail-drawer dd{margin:5px 0 0;font-size:12px;line-height:1.6}.task-toast{position:fixed;z-index:50;top:68px;right:344px;max-width:320px;padding:9px 14px;border-radius:4px;background:rgba(32,38,49,.92);color:#fff;font-size:11px;box-shadow:0 6px 18px rgba(16,24,40,.16)}
@media(max-height:850px){.central-workspace{padding-bottom:6px}.central-workspace>:deep(.confirmation-section){margin-top:2px}.central-workspace>:deep(.preview-row){margin-top:6px}}
@media(max-width:1279px){.pending-task-detail{grid-template-columns:minmax(0,1fr)}.pending-task-detail :deep(.trace-panel){position:fixed;z-index:40;top:56px;right:0;width:min(328px,92vw)}.task-toast{right:16px}}
</style>
