<template>
  <div class="archive-page" data-archived-task-detail>
    <header class="archive-titlebar" data-archive-region="header">
      <div class="archive-title-group">
        <RouterLink class="archive-back" to="/tasks" aria-label="返回任务中心">
          <FontAwesomeIcon :icon="faArrowLeft" />
        </RouterLink>
        <h1>{{ archive.title }}</h1>
        <span class="archive-status"><FontAwesomeIcon :icon="faBoxArchive" />已归档</span>
      </div>
      <div class="archive-actions" aria-label="归档任务操作">
        <button class="archive-button primary" type="button" @click="performAction('查看报告')">查看报告</button>
        <button class="archive-button danger-outline" type="button" @click="performAction('下载归档包')">
          <FontAwesomeIcon :icon="faDownload" />下载归档包
        </button>
        <button class="archive-button" type="button" @click="performAction('复制任务')">复制任务</button>
        <button class="archive-button" type="button" disabled>解锁申请</button>
      </div>
    </header>

    <div class="archive-lower" :class="{ 'sidebar-closed': !sidebarOpen }">
      <div class="archive-primary-column">
        <dl class="archive-metadata" data-archive-region="metadata">
          <div v-for="item in archive.metadata" :key="item.label" :class="item.className">
            <dt>{{ item.label }}</dt>
            <dd :class="item.tone ? `tone-${item.tone}` : ''">{{ item.value }}</dd>
          </div>
        </dl>

        <nav class="archive-tabs" data-archive-region="tabs" aria-label="任务详情页签">
          <button
            v-for="tab in archive.tabs"
            :key="tab.label"
            class="archive-tab"
            :class="{ active: tab.active }"
            type="button"
            :aria-current="tab.active ? 'page' : undefined"
            @click="performAction(`查看${tab.label}`)"
          >
            {{ tab.label }}
          </button>
        </nav>

        <div class="archive-notice" data-archive-region="notice" role="status">
          <FontAwesomeIcon :icon="faCircleCheck" />
          <span>该任务已归档，所有结果不可修改，可查看、下载和复制任务。</span>
        </div>

        <TaskArchiveMain :archive="archive" @archive-action="performAction" />
      </div>

      <TaskArchiveSidebar
        v-if="sidebarOpen"
        :archive="archive"
        @archive-action="performAction"
        @close="sidebarOpen = false"
      />
    </div>

    <p class="archive-feedback" aria-live="polite">{{ feedback }}</p>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowLeft, faBoxArchive, faCircleCheck, faDownload } from '@fortawesome/free-solid-svg-icons';
import { archivedTaskDetail as archive, isArchivedReadAction } from '../../domain/taskDetail/archivedTaskDetail.js';
import TaskArchiveMain from './TaskArchiveMain.vue';
import TaskArchiveSidebar from './TaskArchiveSidebar.vue';

const feedback = ref('');
const sidebarOpen = ref(true);
let archiveShell;

function updateArchiveScale() {
  if (!archiveShell) return;
  const scale = window.innerWidth < 1600 ? Math.max(0.85, window.innerWidth / 1600) : 1;
  archiveShell.style.setProperty('--task-archived-scale', String(scale));
}

onMounted(() => {
  archiveShell = document.querySelector('.task-archived-shell');
  updateArchiveScale();
  window.addEventListener('resize', updateArchiveScale);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateArchiveScale);
  archiveShell?.style.removeProperty('--task-archived-scale');
});

function performAction(label) {
  if (!isArchivedReadAction(label)) return;
  feedback.value = `${label}：归档任务保持只读，演示操作已记录。`;
}
</script>

<style scoped>
.archive-page {
  width: 1372px;
  min-height: 933px;
  padding-top: 7px;
  color: #20242c;
  font-size: 12px;
}

.archive-titlebar {
  width: 1222px;
  height: 53px;
  margin-left: 8px;
  padding: 0 10px 0 12px;
  border: 1px solid #e5e8ec;
  border-radius: 4px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.archive-title-group,
.archive-actions {
  display: flex;
  align-items: center;
}

.archive-title-group { gap: 10px; min-width: 0; }
.archive-title-group h1 { font-size: 21px; line-height: 1; font-weight: 700; white-space: nowrap; }
.archive-actions { gap: 9px; }

.archive-back {
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  color: #1f2329;
  font-size: 19px;
}

.archive-status {
  min-height: 22px;
  padding: 2px 7px;
  border: 1px solid #9ad9b5;
  border-radius: 4px;
  background: #f2fbf6;
  color: #079447;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.archive-button {
  height: 33px;
  padding: 0 15px;
  border: 1px solid #d7dce3;
  border-radius: 4px;
  background: #fff;
  color: #24282f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.archive-button.primary { border-color: #b4000a; background: #b4000a; color: #fff; }
.archive-button.danger-outline { border-color: #e34850; color: #c7000b; }
.archive-button:disabled { border-color: #e5e8ec; background: #f5f6f8; color: #b8bdc6; cursor: not-allowed; }
.archive-button:focus-visible, .archive-tab:focus-visible, .archive-back:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }

.archive-lower {
  width: 1356px;
  margin: 4px 0 0 15px;
  display: grid;
  grid-template-columns: 1100px 249px;
  gap: 7px;
  align-items: start;
}

.archive-lower.sidebar-closed { grid-template-columns: 1100px; }
.archive-primary-column { min-width: 0; }

.archive-metadata {
  height: 60px;
  margin: 0;
  border: 1px solid #e5e8ec;
  border-radius: 4px;
  background: #fff;
  display: grid;
  grid-template-columns: 136px 82px 100px 230px 108px 130px 120px 60px 66px 68px;
  overflow: hidden;
}

.archive-metadata > div { min-width: 0; padding: 8px 10px 6px; border-right: 1px solid #edf0f3; }
.archive-metadata > div:last-child { border-right: 0; }
.archive-metadata dt { color: #697180; font-size: 10px; line-height: 15px; white-space: nowrap; }
.archive-metadata dd { margin: 4px 0 0; color: #22262d; font-size: 11px; font-weight: 600; line-height: 17px; white-space: nowrap; }
.archive-metadata .period dd { font-size: 10px; }
.archive-metadata .tone-success { display: inline-block; padding: 0 4px; border: 1px solid #a8e0bd; border-radius: 3px; color: #079447; background: #f3fbf6; }

.archive-tabs {
  height: 44px;
  margin-top: 9px;
  padding: 0 13px;
  border: 1px solid #e5e8ec;
  border-radius: 4px;
  background: #fff;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
}

.archive-tab { position: relative; padding: 0 1px; border: 0; background: transparent; color: #30343b; font-size: 12px; white-space: nowrap; }
.archive-tab.active { color: #c7000b; font-weight: 700; }
.archive-tab.active::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: #c7000b; }

.archive-notice {
  height: 40px;
  margin: 10px 5px 0 1px;
  padding: 0 12px;
  border: 1px solid #ccebd9;
  border-radius: 4px;
  background: #f6fbf9;
  color: #079447;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 11px;
}

.archive-notice svg { font-size: 15px; }
.archive-feedback { position: fixed; left: 50%; bottom: 18px; z-index: 20; margin: 0; padding: 8px 14px; border-radius: 4px; background: rgba(31,35,41,.9); color: #fff; font-size: 12px; transform: translateX(-50%); opacity: 0; pointer-events: none; }
.archive-feedback:not(:empty) { animation: archive-feedback 2.2s ease both; }
@keyframes archive-feedback { 0%,100%{opacity:0;transform:translate(-50%,6px)} 12%,82%{opacity:1;transform:translate(-50%,0)} }
</style>
