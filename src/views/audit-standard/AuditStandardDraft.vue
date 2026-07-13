<template>
  <div class="audit-standard-result-page" data-audit-region="result-page">
    <AuditStandardResultHeader
      :task-id="taskId"
      :generation="state.generation"
      :version="state.version"
      @back="handleBack"
      @regenerate="handleRegenerate"
      @save-draft="handleSaveDraft"
      @export-excel="handleExportExcel"
    />

    <div class="result-stage">
      <div class="result-primary">
        <div class="result-meta-spacer" aria-hidden="true"></div>
        <div class="result-workspace-row">
        <AuditGenerationConditions @start-generation="handleRegenerate" />
          <AuditGenerationWorkspace
            :source-cards="state.sourceCards"
            :generation="state.generation"
            :items="pagedItems"
            :suggestions="state.suggestions"
            :selected-item-id="state.selectedItemId"
            :page="page"
            :page-size="pageSize"
            @expand-log="showToast('已展开完整生成日志')"
            @view-evidence="handleViewEvidence"
            @edit-item="handleEditItem"
            @confirm-item="handleConfirmItem"
            @exclude-item="handleExcludeItem"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
            @more-suggestions="showToast('已加载全部审计重点建议')"
          />
        </div>
        <AuditResultFooter
          :export-files="state.exportFiles"
          :saved="state.version.saved"
          @view-task="handleBack"
          @view-version="showToast('已打开 V0.9 与 V1.0 版本对比')"
          @view-trail="handleViewTrail"
          @download-file="handlePreviewFile"
        />
      </div>

      <div class="result-side">
        <AuditEvidenceTrace v-if="traceVisible"
          :item="selectedItem"
          :operation-trail="state.operationTrail"
          @close="traceVisible = false"
          @confirm-reference="handleConfirmItem(selectedItem)"
          @replace-source="showToast('已进入来源替换选择')"
          @confirm-citation="showToast('已确认引庇关系')"
          @view-original="showToast('已定位制度原文第 35 页')"
        />
        <AuditResultFooter
          side-only
          :export-files="state.exportFiles"
          :saved="state.version.saved"
          @view-task="handleBack"
          @view-version="showToast('已打开 V0.9 与 V1.0 版本对比')"
          @view-trail="handleViewTrail"
        />
      </div>
    </div>

    <button v-if="!traceVisible" class="reopen-trace" type="button" @click="traceVisible = true">展开来源追溯</button>
    <AuditStandardActionDialogs
      :mode="dialogMode"
      :item="dialogItem"
      :error="dialogError"
      :operation-trail="state.operationTrail"
      @cancel="closeDialog"
      @confirm-edit="handleEditConfirm"
      @confirm-exclude="handleExcludeConfirm"
    />
    <div v-if="toast" class="result-toast" role="status">{{ toast }}</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  confirmStandardItem,
  createAuditStandardResultState,
  editStandardItem,
  excludeStandardItem,
  exportAuditStandardExcel,
  paginateStandardItems,
  regenerateAuditStandard,
  saveAuditStandardDraft,
  selectStandardItem
} from '../../domain/auditStandard/auditStandardResultState.js';
import { createAuditStandardWorkbook } from '../../domain/auditStandard/auditStandardExcel.js';
import AuditStandardResultHeader from './result/AuditStandardResultHeader.vue';
import AuditGenerationConditions from './result/AuditGenerationConditions.vue';
import AuditGenerationWorkspace from './result/AuditGenerationWorkspace.vue';
import AuditEvidenceTrace from './result/AuditEvidenceTrace.vue';
import AuditResultFooter from './result/AuditResultFooter.vue';
import AuditStandardActionDialogs from './result/AuditStandardActionDialogs.vue';

const DESIGN_WIDTH = 1586;
const DESIGN_HEIGHT = 995;
const route = useRoute();
const router = useRouter();
const taskId = computed(() => String(route.query.taskId || 'TASK-20250428001'));
const state = ref(createAuditStandardResultState());
const page = ref(1);
const pageSize = ref(10);
const traceVisible = ref(true);
const dialogMode = ref('');
const dialogItem = ref(null);
const dialogError = ref('');
const toast = ref('');
let toastTimer;
let shell;
let previousBodyOverflow = '';
let previousHtmlOverflow = '';
let dialogReturnFocus = null;

const pagedItems = computed(() => paginateStandardItems(state.value.items, page.value, pageSize.value));
const selectedItem = computed(() => state.value.items.find((item) => item.id === state.value.selectedItemId) || state.value.items[0]);

function showToast(message) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.value = ''; }, 2200);
}

function handleBack() {
  router.push({ path: '/tasks/detail', query: { taskId: taskId.value, tab: 'results' } });
}

function handleViewEvidence(item) {
  state.value = selectStandardItem(state.value, item.id);
  traceVisible.value = true;
}

function handleEditItem(item) {
  handleViewEvidence(item);
  dialogReturnFocus = document.activeElement;
  dialogItem.value = item;
  dialogMode.value = 'edit';
  dialogError.value = '';
}

function handleExcludeItem(item) {
  handleViewEvidence(item);
  dialogReturnFocus = document.activeElement;
  dialogItem.value = item;
  dialogMode.value = 'exclude';
  dialogError.value = '';
}

function handleViewTrail() {
  dialogReturnFocus = document.activeElement;
  dialogMode.value = 'trail';
  dialogError.value = '';
}

function handleConfirmItem(item) {
  if (!item) return;
  state.value = confirmStandardItem(state.value, item.id);
  showToast(`已确认条目 ${item.id}`);
}

function handleEditConfirm(title) {
  try {
    state.value = editStandardItem(state.value, dialogItem.value.id, title);
    closeDialog();
    showToast('条目已更新并写入操作留痕');
  } catch (error) {
    dialogError.value = error.message;
  }
}

function handleExcludeConfirm(reason) {
  try {
    state.value = excludeStandardItem(state.value, dialogItem.value.id, reason);
    closeDialog();
    showToast('条目已排除，原因已写入操作留痕');
  } catch (error) {
    dialogError.value = error.message;
  }
}

async function closeDialog() {
  dialogMode.value = '';
  dialogItem.value = null;
  dialogError.value = '';
  await nextTick();
  dialogReturnFocus?.focus?.();
  dialogReturnFocus = null;
}

function handleSaveDraft() {
  state.value = saveAuditStandardDraft(state.value);
  showToast('草稿 V1.0 已保存');
}

function handleRegenerate() {
  state.value = regenerateAuditStandard(state.value);
  page.value = 1;
  showToast('已按当前生成条件重新开始生成');
}

function handleExportExcel() {
  state.value = exportAuditStandardExcel(state.value);
  const record = state.value.exportRecords.at(-1);
  const workbook = createAuditStandardWorkbook(state.value.items);
  const url = URL.createObjectURL(new Blob([workbook], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = record.fileName;
  link.click();
  URL.revokeObjectURL(url);
  showToast(`已导出 ${record.fileName}`);
}

function handlePreviewFile(file) { showToast(`正在预览：${file.name}`); }
function handlePageChange(nextPage) { page.value = Math.min(19, Math.max(1, Number(nextPage) || 1)); }
function handlePageSizeChange(nextSize) { pageSize.value = nextSize; page.value = 1; }

function applyScale() {
  if (!shell) return;
  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  const physicalWidth = DESIGN_WIDTH * scale;
  shell.style.setProperty('--audit-result-scale', String(scale));
  shell.style.zoom = String(scale);
  shell.style.marginLeft = `${Math.max(0, (window.innerWidth - physicalWidth) / 2) / scale}px`;
}

onMounted(() => {
  shell = document.querySelector('.audit-standard-result-shell');
  previousBodyOverflow = document.body.style.overflow;
  previousHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  applyScale();
  window.addEventListener('resize', applyScale);
  window.addEventListener('keydown', handleKeydown);
});

function handleKeydown(event) {
  if (event.key === 'Escape') closeDialog();
}

onBeforeUnmount(() => {
  clearTimeout(toastTimer);
  window.removeEventListener('resize', applyScale);
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = previousBodyOverflow;
  document.documentElement.style.overflow = previousHtmlOverflow;
  if (shell) { shell.style.zoom = ''; shell.style.marginLeft = ''; shell.style.removeProperty('--audit-result-scale'); }
});
</script>

<style scoped>
.audit-standard-result-page{position:relative;width:1384px;height:933px;padding:5px 1px 5px 15px;background:#f7f8fa;color:#252d38;font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif;overflow:hidden}.result-stage{display:grid;grid-template-columns:1006px 348px;gap:10px;margin-top:-69px}.result-primary{display:grid;grid-template-rows:70px 628px 149px;gap:10px}.result-meta-spacer{pointer-events:none}.result-workspace-row{display:grid;grid-template-columns:209px 788px;gap:9px}.result-side{display:grid;grid-template-rows:731px 115px;gap:10px}.reopen-trace{position:absolute;z-index:12;top:76px;right:8px;height:30px;border:1px solid #c80000;border-radius:4px;background:#fff;color:#c80000;font-size:11px}.result-toast{position:fixed;z-index:120;top:74px;left:50%;min-width:260px;padding:10px 18px;border-radius:4px;background:rgb(30 41 59 / 92%);color:#fff;font-size:12px;text-align:center;transform:translateX(-50%);box-shadow:0 8px 24px rgb(15 23 42 / 20%)}
</style>
