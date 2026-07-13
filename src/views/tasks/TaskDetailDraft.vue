<template>
  <main class="task-detail-draft-page">
    <header class="task-detail-draft-header">
      <div class="task-detail-draft-title-row">
        <RouterLink class="task-detail-draft-back" to="/tasks" aria-label="返回任务中心"><FontAwesomeIcon :icon="faArrowLeft" /></RouterLink>
        <h1>{{ task.title }}</h1>
        <span class="task-detail-draft-status">草稿</span>
      </div>

      <section class="task-detail-draft-summary" aria-label="草稿任务信息">
        <div class="task-detail-draft-metadata">
          <div class="task-detail-draft-meta" data-task-meta><span>任务编号</span><strong>{{ task.id }}</strong></div>
          <div class="task-detail-draft-meta" data-task-meta><span>被审计单位</span><strong>{{ task.organization }}</strong></div>
          <div class="task-detail-draft-meta" data-task-meta><span>审计期间</span><strong>{{ task.period }}</strong></div>
          <div class="task-detail-draft-meta" data-task-meta><span>任务类型</span><strong>{{ task.type }}</strong></div>
          <div class="task-detail-draft-meta" data-task-meta><span>负责人</span><strong>{{ task.owner }}</strong></div>
          <div class="task-detail-draft-meta" data-task-meta><span>状态</span><strong class="task-detail-draft-meta-status">{{ task.status }}</strong></div>
          <div class="task-detail-draft-meta" data-task-meta><span>当前版本</span><strong>{{ task.version }}</strong></div>
        </div>

        <div class="task-detail-draft-top-actions" aria-label="草稿任务操作">
          <RouterLink data-top-action class="task-detail-draft-top-action task-detail-draft-top-action--primary" :to="{ path: '/tasks/create', query: { phase: 'confirm' } }">继续编辑</RouterLink>
          <RouterLink data-top-action class="task-detail-draft-top-action" :to="materialRoute('local')">上传资料</RouterLink>
          <button ref="deleteTrigger" data-top-action type="button" class="task-detail-draft-top-action" @click="openDelete">删除草稿</button>
        </div>
      </section>
    </header>

    <nav class="task-detail-draft-tabs" role="tablist" aria-label="任务详情标签">
      <button
        v-for="tab in task.tabs"
        :id="`draft-tab-${tab.id}`"
        :key="tab.id"
        type="button"
        role="tab"
        :class="{ 'is-active': activeTab === tab.id }"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`draft-panel-${tab.id}`"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section
      v-if="activeTab === 'overview'"
      id="draft-panel-overview"
      class="task-detail-draft-grid"
      role="tabpanel"
      aria-labelledby="draft-tab-overview"
    >
      <TaskDetailDraftOverview :task="task" @open-material-source="openMaterialSource" />
      <TaskDetailDraftRail :task="task" @edit-materials="openMaterialSource('local')" />
    </section>

    <section
      v-else
      :id="`draft-panel-${activeTab}`"
      class="task-detail-draft-placeholder"
      role="tabpanel"
      :aria-labelledby="`draft-tab-${activeTab}`"
    >
      <h2>{{ currentTab.label }}</h2>
      <p>当前任务仍处于草稿阶段，请先补充资料并继续编辑任务。</p>
      <RouterLink :to="materialRoute('local')">前往上传资料</RouterLink>
    </section>

    <div v-if="deleteOpen" class="task-detail-draft-dialog-mask" @click.self="closeDelete">
      <section
        ref="deleteDialog"
        class="task-detail-draft-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-draft-delete-title"
        aria-describedby="task-detail-draft-delete-description"
        tabindex="-1"
        @keydown.esc.stop.prevent="closeDelete"
        @keydown.tab="trapDeleteFocus"
      >
        <h2 id="task-detail-draft-delete-title">确认删除草稿？</h2>
        <p id="task-detail-draft-delete-description">删除后将返回任务中心，此操作不可撤销。</p>
        <div class="task-detail-draft-dialog-actions">
          <button ref="cancelDeleteButton" type="button" @click="closeDelete">取消</button>
          <button ref="confirmDeleteButton" type="button" class="task-detail-draft-dialog-confirm" @click="confirmDelete">确认删除</button>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { draftTaskDetail } from '../../domain/taskDetail/draftTaskDetail';
import TaskDetailDraftOverview from './task-detail-draft/TaskDetailDraftOverview.vue';
import TaskDetailDraftRail from './task-detail-draft/TaskDetailDraftRail.vue';

const props = defineProps({
  task: { type: Object, default: () => draftTaskDetail }
});
const emit = defineEmits(['delete-draft']);
const router = useRouter();
const task = computed(() => props.task);
const activeTab = ref('overview');
const deleteOpen = ref(false);
const deleteDialog = ref(null);
const deleteTrigger = ref(null);
const cancelDeleteButton = ref(null);
const confirmDeleteButton = ref(null);
const currentTab = computed(() => task.value.tabs.find((tab) => tab.id === activeTab.value) || task.value.tabs[0]);

function materialRoute(source) {
  return { path: '/tasks/create', query: { phase: 'materials', source } };
}

function openMaterialSource(source) {
  router.push(materialRoute(source));
}

async function openDelete() {
  deleteOpen.value = true;
  await nextTick();
  cancelDeleteButton.value?.focus();
}

async function closeDelete() {
  deleteOpen.value = false;
  await nextTick();
  deleteTrigger.value?.focus();
}

function trapDeleteFocus(event) {
  const dialog = deleteDialog.value;
  const first = cancelDeleteButton.value;
  const last = confirmDeleteButton.value;
  if (!dialog || !first || !last) return;

  const focused = document.activeElement;
  if (!dialog.contains(focused)) {
    event.preventDefault();
    first.focus();
  } else if (event.shiftKey && focused === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && focused === last) {
    event.preventDefault();
    first.focus();
  }
}

function confirmDelete() {
  emit('delete-draft', task.value.id);
  deleteOpen.value = false;
  router.push('/tasks');
}
</script>

<style scoped>
.task-detail-draft-page{--draft-red:#c50000;--draft-line:#dfe5ec;padding:0 2px 18px;color:#252c37}

:global(.task-detail-shell:has(.task-detail-draft-page) .sidebar) {
  width: clamp(182px, 13.25vw, 212px);
  height: 100dvh;
  flex-basis: clamp(182px, 13.25vw, 212px);
}

:global(.task-detail-shell:has(.task-detail-draft-page) .main) {
  height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
}

:global(.task-detail-shell:has(.task-detail-draft-page) .topbar),
:global(.task-detail-shell:has(.task-detail-draft-page) .brand) {
  min-height: 68px;
  height: 68px;
}

:global(.task-detail-shell:has(.task-detail-draft-page) .brand) {
  margin-bottom: 23px;
  background: #c50000;
}

:global(.task-detail-shell:has(.task-detail-draft-page) .brand strong) { font-size: 21px; }
:global(.task-detail-shell:has(.task-detail-draft-page) .sidebar a) { min-height: 46px; font-size: 14px; }
:global(.task-detail-shell:has(.task-detail-draft-page) .bottom-nav) {
  min-height: 118px;
  flex: 0 0 118px;
  align-content: start;
  padding-top: 18px;
}

.task-detail-draft-header {
  margin-bottom: 5px;
  padding: 19px 24px 14px 14px;
  border-bottom: 1px solid var(--draft-line);
  background: #fff;
}

.task-detail-draft-title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-left: 10px;
}

.task-detail-draft-title-row h1 {
  overflow: hidden;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-detail-draft-back {
  display: grid;
  width: 28px;
  height: 32px;
  place-items: center;
  color: #2f3743;
  font-size: 23px;
  line-height: 1;
  text-decoration: none;
}

.task-detail-draft-status,
.task-detail-draft-meta-status {
  border: 1px solid #d6e6fb;
  border-radius: 4px;
  background: #edf5ff;
  color: #306cae;
}

.task-detail-draft-status {
  padding: 3px 8px;
  font-size: 12px;
  white-space: nowrap;
}

.task-detail-draft-summary {
  display: flex;
  min-height: 92px;
  box-sizing: border-box;
  align-items: center;
  gap: 20px;
  padding: 12px 18px;
  border: 1px solid var(--draft-line);
  border-radius: 5px;
  background: #fff;
}

.task-detail-draft-metadata {
  display: grid;
  min-width: 0;
  flex: 1 1 auto;
  grid-template-columns: 1.35fr 1.15fr .85fr .9fr .75fr .75fr .8fr;
}

.task-detail-draft-meta {
  min-width: 0;
  padding: 0 16px;
  border-right: 1px solid #e6eaf0;
}

.task-detail-draft-meta:first-child { padding-left: 0; }
.task-detail-draft-meta:last-child { border-right: 0; }

.task-detail-draft-meta span,
.task-detail-draft-meta strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-detail-draft-meta span {
  margin-bottom: 10px;
  color: #687386;
  font-size: 13px;
}

.task-detail-draft-meta strong {
  color: #202732;
  font-size: 15px;
  font-weight: 500;
}

.task-detail-draft-meta .task-detail-draft-meta-status {
  display: inline-block;
  padding: 3px 9px;
  border-color: #ffe2b2;
  background: #fff6e7;
  color: #ad6800;
  font-size: 12px;
}

.task-detail-draft-top-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 12px;
}

.task-detail-draft-top-action {
  display: inline-flex;
  min-width: 112px;
  min-height: 38px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border: 1px solid #dc4f55;
  border-radius: 5px;
  background: #fff;
  color: var(--draft-red);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.task-detail-draft-top-action--primary {
  border-color: var(--draft-red);
  background: var(--draft-red);
  color: #fff;
}

.task-detail-draft-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 12px;
  border-bottom: 1px solid var(--draft-line);
  background: #fff;
  scrollbar-width: thin;
}

.task-detail-draft-tabs button {
  position: relative;
  min-height: 40px;
  flex: 0 0 auto;
  padding: 0 18px;
  border: 0;
  background: transparent;
  color: #343c48;
  font: inherit;
  font-size: 15px;
  white-space: nowrap;
  cursor: pointer;
}

.task-detail-draft-tabs button.is-active {
  color: var(--draft-red);
  font-weight: 600;
}

.task-detail-draft-tabs button.is-active::after {
  position: absolute;
  right: 14px;
  bottom: 0;
  left: 14px;
  height: 3px;
  background: var(--draft-red);
  content: "";
}

.task-detail-draft-grid{display:grid;grid-template-columns:minmax(0,1fr) clamp(286px,25%,405px);gap:10px;align-items:start}
.task-detail-draft-grid { padding: 8px 24px 0 12px; }

.task-detail-draft-placeholder {
  min-height: 180px;
  margin: 10px 12px 0;
  padding: 24px;
  border: 1px solid var(--draft-line);
  background: #fff;
}

.task-detail-draft-placeholder h2 { margin: 0 0 10px; font-size: 17px; }
.task-detail-draft-placeholder p { margin: 0 0 14px; color: #687386; font-size: 14px; }
.task-detail-draft-placeholder a { color: #1677ff; font-size: 14px; text-decoration: none; }

.task-detail-draft-dialog-mask {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(15 23 42 / 42%);
}

.task-detail-draft-dialog {
  width: min(420px, 100%);
  box-sizing: border-box;
  padding: 24px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 14px 36px rgb(15 23 42 / 18%);
  outline: none;
}

.task-detail-draft-dialog h2 { margin: 0 0 12px; font-size: 19px; }
.task-detail-draft-dialog p { margin: 0; color: #687386; font-size: 14px; line-height: 1.7; }

.task-detail-draft-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.task-detail-draft-dialog-actions button {
  min-width: 86px;
  min-height: 36px;
  border: 1px solid #ccd4df;
  border-radius: 4px;
  background: #fff;
  color: #343c48;
  font: inherit;
  cursor: pointer;
}

.task-detail-draft-dialog-actions .task-detail-draft-dialog-confirm {
  border-color: var(--draft-red);
  background: var(--draft-red);
  color: #fff;
}

.task-detail-draft-back:focus-visible,
.task-detail-draft-top-action:focus-visible,
.task-detail-draft-tabs button:focus-visible,
.task-detail-draft-placeholder a:focus-visible,
.task-detail-draft-dialog-actions button:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}

@media (max-width: 1280px) {
  .task-detail-draft-summary { align-items: stretch; flex-direction: column; }
  .task-detail-draft-top-actions { justify-content: flex-end; }
}

@media (max-width: 1450px) {
  .task-detail-draft-top-actions { gap: 8px; }
  .task-detail-draft-top-action { min-width: 98px; padding: 0 12px; }
}

@media (max-width: 900px) {
  .task-detail-draft-grid { grid-template-columns: 1fr; }
  .task-detail-draft-metadata { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 0; }
  .task-detail-draft-meta:nth-child(2n) { border-right: 0; }
  .task-detail-draft-top-actions { flex-wrap: wrap; justify-content: flex-start; }
}

@media (max-width: 520px) {
  .task-detail-draft-title-row h1 { font-size: 20px; }
  .task-detail-draft-metadata { grid-template-columns: 1fr; }
  .task-detail-draft-meta { padding: 0; border-right: 0; }
  .task-detail-draft-top-action { width: 100%; }
}
</style>
