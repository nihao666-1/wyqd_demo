<template>
  <main class="archive-main-frame">
    <section v-if="activeTab === 'overview'" class="archive-overview-panel">
      <h2>任务概览</h2>
      <dl class="archive-overview-grid">
        <div v-for="item in archive.metadata" :key="item.label">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
      </dl>
    </section>

    <section v-else-if="activeTab === 'materials'" class="archive-simple-panel">
      <h2>输入资料</h2>
      <table class="archive-simple-table">
        <thead><tr><th>文件名称</th><th>类型</th><th>状态</th><th>负责人</th><th>更新时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="item in archive.materials" :key="item.name">
            <td>{{ item.name }}</td><td>{{ item.type }}</td><td>{{ item.status }}</td><td>{{ item.owner }}</td><td>{{ item.time }}</td>
            <td><button type="button" @click="$emit('archive-action', `查看${item.name}`)">查看</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else-if="activeTab === 'analysis'" class="archive-simple-panel">
      <h2>分析过程</h2>
      <table class="archive-simple-table">
        <thead><tr><th>阶段</th><th>状态</th><th>处理人</th><th>时间</th><th>说明</th></tr></thead>
        <tbody>
          <tr v-for="item in archive.analysis" :key="item.phase">
            <td>{{ item.phase }}</td><td>{{ item.status }}</td><td>{{ item.owner }}</td><td>{{ item.time }}</td><td>{{ item.note }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <template v-else-if="activeTab === 'results' || activeTab === 'outputs'">
      <section class="outcome-grid" data-archive-region="outcomes" aria-label="最终归档成果">
        <article v-for="outcome in archive.outcomes" :key="outcome.title" class="outcome-card">
          <span class="outcome-icon" :class="`tone-${outcome.tone}`">
            <FontAwesomeIcon :icon="outcomeIcons[outcome.icon]" />
          </span>
          <div>
            <h2>{{ outcome.title }}</h2>
            <p><strong>{{ outcome.count }}</strong><span>{{ outcome.unit }}</span></p>
            <small>{{ outcome.format }}</small>
          </div>
        </article>
      </section>
      <TaskArchiveRecords v-if="activeTab === 'outputs'" :archive="archive" export-only @archive-action="$emit('archive-action', $event)" />
    </template>

    <TaskArchiveRecords v-else-if="activeTab === 'timeline'" :archive="archive" @archive-action="$emit('archive-action', $event)" />
    <TaskArchiveRecords v-else-if="activeTab === 'export-records'" :archive="archive" export-only @archive-action="$emit('archive-action', $event)" />
    <TaskArchiveReviewTrail v-if="activeTab === 'timeline'" :archive="archive" />

    <section v-if="activeTab === 'overview'" class="relation-section" data-archive-region="relations">
      <h2>关联任务与引用</h2>
      <div class="relation-grid">
        <article v-for="relation in archive.relations" :key="relation.title" class="relation-card">
          <div>
            <h3>{{ relation.title }}</h3>
            <p>{{ relation.text }}</p>
          </div>
          <span v-if="relation.status" class="relation-status">{{ relation.status }}</span>
          <FontAwesomeIcon v-else-if="relation.link" :icon="faChevronRight" />
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faFileLines, faFileExcel, faListCheck, faYenSign, faFolderOpen, faRectangleList, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import TaskArchiveRecords from './TaskArchiveRecords.vue';
import TaskArchiveReviewTrail from './TaskArchiveReviewTrail.vue';

defineProps({
  archive: { type: Object, required: true },
  activeTab: { type: String, default: 'timeline' },
});
defineEmits(['archive-action']);

const outcomeIcons = {
  document: faFileLines,
  sheet: faFileExcel,
  list: faListCheck,
  currency: faYenSign,
  folder: faFolderOpen,
  review: faRectangleList,
};
</script>

<style scoped>
.archive-main-frame { height: 690px; margin: 8px 4px 0 2px; padding: 6px 10px 8px 7px; border: 1px solid #e5e8ec; border-radius: 4px; background: #fff; overflow: hidden; }
.archive-overview-panel,.archive-simple-panel { min-height: 460px; padding: 12px; border: 1px solid #e5e8ec; background: #fff; }
.archive-overview-panel h2,.archive-simple-panel h2 { margin: 0 0 12px; font-size: 15px; }
.archive-overview-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); margin: 0; border: 1px solid #e5e8ec; }
.archive-overview-grid div { min-width: 0; padding: 12px; border-right: 1px solid #e5e8ec; border-bottom: 1px solid #e5e8ec; }
.archive-overview-grid dt { color: #667085; font-size: 11px; }
.archive-overview-grid dd { margin: 6px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 600; }
.archive-simple-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12px; }
.archive-simple-table th,.archive-simple-table td { height: 38px; padding: 0 10px; border: 1px solid #d8dee8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
.archive-simple-table th { background: #f6f8fb; }
.archive-simple-table button { border: 0; background: transparent; color: #b4000a; font-weight: 700; }
.outcome-grid { height: 84px; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); border: 1px solid #e5e8ec; border-radius: 4px; overflow: hidden; }
.outcome-card { min-width: 0; padding: 8px 10px; border-right: 1px solid #e5e8ec; display: flex; align-items: flex-start; gap: 10px; }
.outcome-card:last-child { border-right: 0; }
.outcome-icon { width: 40px; height: 40px; border-radius: 9px; display: inline-grid; place-items: center; flex: 0 0 40px; font-size: 23px; }
.tone-blue { color: var(--color-info); background: #eef5ff; }.tone-green { color: #079447; background: #edf9f2; }.tone-orange { color: #f26b1d; background: #fff3e9; }.tone-purple { color: #7447e8; background: #f3efff; }
.outcome-card h2 { margin: 0 0 2px; font-size: 12px; line-height: 16px; white-space: nowrap; }
.outcome-card p { display: flex; align-items: baseline; gap: 5px; margin: 0; line-height: 21px; }.outcome-card strong { font-size: 19px; }.outcome-card p span { font-size: 10px; }.outcome-card small { color: #747c88; font-size: 10px; }
.relation-section { height: 94px; margin-top: 37px; padding: 0 2px; border-top: 1px solid #e5e8ec; }
.relation-section > h2 { height: 32px; margin: 0; display: flex; align-items: center; font-size: 14px; }
.relation-grid { display: grid; grid-template-columns: 261px 373px 1fr; gap: 10px; }
.relation-card { height: 48px; padding: 7px 10px; border: 1px solid #e5e8ec; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; min-width: 0; }
.relation-card h3 { margin: 0 0 3px; font-size: 10px; }.relation-card p { margin: 0; overflow: hidden; font-size: 10px; line-height: 14px; text-overflow: ellipsis; white-space: nowrap; }
.relation-status { padding: 1px 5px; border: 1px solid #a9dfbd; border-radius: 3px; color: #079447; background: #f3fbf6; font-size: 9px; }
</style>
