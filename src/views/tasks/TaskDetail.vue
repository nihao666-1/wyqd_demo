<template>
  <template v-if="showDraftState">
    <TaskDetailDraft />
  </template>
  <template v-else>
  <TaskDetailArchived v-if="showArchivedState" />
  <template v-if="!showArchivedState">
  <TaskDetailGenerating v-if="showGeneratingState" />
  <div v-else class="pending-task-detail" :class="{ 'trace-closed': !traceOpen }">
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

      <template v-if="activeTab === 'results'">
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

        <VersionExportPreview
          :versions="versions"
          :files="files"
          @select-version="handleVersionPreview"
          @preview-file="handleFilePreview"
          @more-files="handleMoreFiles"
        />
      </template>

      <section v-else class="tab-placeholder">
        <h2>{{ taskDetailTabs.find((tab) => tab.id === activeTab)?.label }}</h2>
        <p>当前演示聚焦“生成结果”待确认工作台，该栏目入口已保留。</p>
        <button type="button" @click="activeTab = 'results'">返回生成结果</button>
      </section>
    </main>

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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
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
  outputFiles,
  taskDetailMeta,
  taskDetailTabs,
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

const route = useRoute();
const router = useRouter();
const selectedTask = computed(() => route.query.state === 'generating' ? undefined : taskRows.find((task) => task.id === route.query.taskId));
const detailMode = computed(() => resolveTaskDetailMode({
  explicitState: String(route.query.state || ''),
  statusKey: selectedTask.value?.statusKey || '',
  tab: String(route.query.tab || '')
}));
const showDraftState = computed(() => detailMode.value === 'draft');
const detailView = computed(() => resolveTaskDetailView(route.query, selectedTask.value));
const showArchivedState = computed(() => detailView.value === 'archived');
const showGeneratingState = computed(() => detailView.value === 'generating');

const taskState = ref(createTaskResultState());
const activeTab = ref('results');
const traceOpen = ref(true);
const traceTab = ref('source');
const page = ref(1);
const pageSize = ref(10);
const confirmationTable = ref(null);
const toast = ref('');
const logs = ref(initialOperationLogs.map((log) => ({ ...log })));
const versions = ref(versionTimeline.map((version) => ({ ...version })));
const files = ref(outputFiles.map((file) => ({ ...file })));
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

function showToast(message) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = '';
  }, 2400);
}

function pushLog(action, result) {
  logs.value = [
    {
      id: `LOG-${Date.now()}`,
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      operator: '审计管理员',
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
  if (tabId !== 'results') showToast('已切换栏目，可随时返回生成结果');
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
  pushLog('查看结果依据', item?.itemType || target.name);
}

function handleConfirmItem(item) {
  if (!item) return;
  const updated = confirmItem(taskState.value, item.id);
  if (updated === taskState.value) {
    showToast('该事项已经处理');
    return;
  }
  taskState.value = updated;
  pushLog('确认待办事项', item.itemType);
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
  pushLog('排除待办事项', item.itemType);
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
  if (resolved) pushLog('批量确认能力结果', ability.name);
}

function handleExcludeAbility(ability) {
  const targets = taskState.value.items.filter((item) => item.abilityId === ability.id && item.disposition === 'pending');
  targets.forEach((item) => {
    taskState.value = excludeItem(taskState.value, item.id);
  });
  showToast(targets.length ? `已排除“${ability.name}”下 ${targets.length} 项` : '该能力已全部处理');
  if (targets.length) pushLog('批量排除能力结果', ability.name);
}

function handleSaveVersion() {
  taskState.value = {
    ...taskState.value,
    draftState: 'saved',
    version: { ...taskState.value.version, saved: true }
  };
  versions.value = versions.value.map((version) => version.id === 'V1.0' ? { ...version, note: '已保存' } : version);
  pushLog('保存当前版本', 'V1.0 草稿');
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
  pushLog('提交复核', '任务已进入复核中');
  showToast('任务已提交复核');
}

function handleExportResults() {
  files.value = files.value.map((file) => ({ ...file, exported: true }));
  pushLog('导出生成结果', `${files.value.length} 个文件`);
  showToast('已生成 4 个演示导出记录');
}

function handleUploadReport() {
  taskState.value = markResultDirty({
    ...taskState.value,
    abilities: taskState.value.abilities.map((ability) => ability.id === 9
      ? { ...ability, fileName: '审计报告终稿.docx', fileType: 'docx', baseStatus: 'checking' }
      : ability)
  });
  pushLog('上传审核报告', '审计报告终稿.docx');
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
  pushLog('执行报告审核', '检查通过');
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
  showToast('其余 2 个文件已在导出记录中展示');
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
  pushLog('引用到报告', selectedItem.value.itemType);
  showToast('该事项已引用到报告');
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
.pending-task-detail{height:calc(100dvh - 56px);display:grid;grid-template-columns:minmax(0,1fr) clamp(276px,20.7vw,328px);gap:8px;overflow:hidden;background:#f5f7fa}.pending-task-detail.trace-closed{grid-template-columns:minmax(0,1fr)}.central-workspace{min-width:0;overflow-y:auto;padding:0 8px 10px 12px;display:flex;flex-direction:column;gap:0}.central-workspace>:deep(.results-section){margin-right:5px;margin-left:5px}.central-workspace>:deep(.confirmation-section){margin:2px 0 0 11px}.central-workspace>:deep(.preview-row){margin:10px 20px 0 1px}.central-workspace::-webkit-scrollbar{width:5px}.central-workspace::-webkit-scrollbar-thumb{background:#d8dee8;border-radius:4px}.tab-placeholder{min-height:360px;padding:40px;border:1px solid #e5eaf0;background:#fff;text-align:center}.tab-placeholder h2{margin:0 0 12px;font-size:18px}.tab-placeholder p{color:#667085;font-size:12px}.tab-placeholder button{height:34px;padding:0 16px;border:1px solid var(--color-primary-dark);border-radius:4px;background:var(--color-primary-dark);color:#fff}.task-toast{position:fixed;z-index:50;top:68px;right:344px;max-width:320px;padding:9px 14px;border-radius:4px;background:rgba(32,38,49,.92);color:#fff;font-size:11px;box-shadow:0 6px 18px rgba(16,24,40,.16)}
@media(max-height:850px){.central-workspace{padding-bottom:6px}.central-workspace>:deep(.confirmation-section){margin-top:2px}.central-workspace>:deep(.preview-row){margin-top:6px}}
@media(max-width:1279px){.pending-task-detail{grid-template-columns:minmax(0,1fr)}.pending-task-detail :deep(.trace-panel){position:fixed;z-index:40;top:56px;right:0;width:min(328px,92vw)}.task-toast{right:16px}}
</style>
