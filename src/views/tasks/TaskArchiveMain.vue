<template>
  <main class="archive-main-frame">
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

    <TaskArchiveRecords :archive="archive" @archive-action="$emit('archive-action', $event)" />
    <TaskArchiveReviewTrail :archive="archive" />

    <section class="relation-section" data-archive-region="relations">
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

defineProps({ archive: { type: Object, required: true } });
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
