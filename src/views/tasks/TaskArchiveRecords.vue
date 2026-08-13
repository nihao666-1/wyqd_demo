<template>
  <section class="timeline-record-panel" data-archive-region="records">
    <nav v-if="!exportOnly" class="record-type-tabs" aria-label="任务时间线记录类型">
      <button
        v-for="tab in archive.recordTabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeRecordTab === tab.id }"
        @click="activeRecordTab = tab.id"
      >
        {{ tab.label }} <span>({{ tab.count }})</span>
      </button>
    </nav>

    <div class="timeline-table-wrap">
      <table v-if="!exportOnly" class="timeline-table">
        <thead>
          <tr>
            <th>任务编号</th><th>任务名称</th><th>任务类型</th><th>被审计单位</th><th>审计期间</th>
            <th>当前阶段</th><th>状态</th><th>风险/问题数</th><th>下一步</th><th>创建人</th><th>更新时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in visibleRecords" :key="record.id">
            <td>{{ record.taskId }}</td>
            <td :title="record.taskName">{{ record.taskName }}</td>
            <td>{{ record.taskType }}</td>
            <td>{{ record.organization }}</td>
            <td>{{ record.period }}</td>
            <td>{{ record.stage }}</td>
            <td><span class="status-pill">{{ record.status }}</span></td>
            <td class="risk-count">{{ record.riskCount }}</td>
            <td :title="record.nextStep">{{ record.nextStep }}</td>
            <td>{{ record.creator }}</td>
            <td>{{ record.updatedAt }}</td>
            <td><button type="button" @click="$emit('archive-action', record.action + record.taskName)">{{ record.action }}</button></td>
          </tr>
        </tbody>
      </table>

      <table v-else class="timeline-table export-record-table">
        <thead>
          <tr><th>导出文件</th><th>导出类型</th><th>版本号</th><th>导出人</th><th>导出时间</th><th>AI标识</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="record in archive.exports" :key="record.file">
            <td :title="record.file">{{ record.file }}</td>
            <td>{{ record.type }}</td>
            <td>{{ record.version }}</td>
            <td>{{ record.exporter }}</td>
            <td>{{ record.exportedAt }}</td>
            <td><span class="status-pill">{{ record.aiLabel }}</span></td>
            <td><button type="button" @click="$emit('archive-action', `下载${record.file}`)">下载</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <ArchivePager :count="visibleCount" />
  </section>
</template>

<script setup>
import { computed, defineComponent, h, ref } from 'vue';

const props = defineProps({
  archive: { type: Object, required: true },
  exportOnly: { type: Boolean, default: false },
});
defineEmits(['archive-action']);

const activeRecordTab = ref('all');
const visibleRecords = computed(() => {
  if (activeRecordTab.value === 'all') return props.archive.operationRecords;
  return props.archive.operationRecords.filter((record) => record.category === activeRecordTab.value);
});
const visibleCount = computed(() => props.exportOnly ? props.archive.exports.length : visibleRecords.value.length);

const ArchivePager = defineComponent({
  props: { count: { type: Number, required: true } },
  setup(componentProps) {
    return () => h('footer', { class: 'archive-pager' }, [
      h('span', `共 ${componentProps.count} 条记录`),
      h('div', { class: 'pager-controls' }, [h('button', { type: 'button', disabled: true }, '‹'), h('button', { type: 'button', class: 'current' }, '1'), h('button', { type: 'button', disabled: true }, '›')]),
      h('span', '10 条/页'), h('span', '跳至'), h('span', { class: 'page-input' }, '1'), h('span', '页'),
    ]);
  },
});
</script>

<style scoped>
.timeline-record-panel { min-height: 468px; margin-top: 8px; border: 1px solid #e2e7ef; border-radius: 5px; background: #fff; display: flex; flex-direction: column; overflow: hidden; }
.record-type-tabs { height: 44px; padding: 0 14px; border-bottom: 1px solid #e2e7ef; display: flex; align-items: stretch; gap: 28px; overflow: auto; }
.record-type-tabs button { position: relative; min-width: 0; padding: 0; border: 0; border-bottom: 2px solid transparent; background: transparent; color: #59677c; font-size: 13px; font-weight: 500; white-space: nowrap; }
.record-type-tabs button.active { border-bottom-color: var(--color-primary); color: var(--color-primary); font-weight: 700; }
.record-type-tabs button:hover { color: var(--color-primary); }
.record-type-tabs button:focus-visible, .timeline-table button:focus-visible, :deep(.pager-controls button:focus-visible) { outline: 2px solid var(--color-info); outline-offset: 2px; }
.record-type-tabs span { color: inherit; font-size: 11px; font-weight: 500; }
.timeline-table-wrap { flex: 1; min-height: 0; overflow: auto; }
.timeline-table { width: 100%; min-width: 1180px; border-collapse: collapse; table-layout: fixed; color: #1f2937; font-size: 12px; }
.timeline-table th, .timeline-table td { height: 38px; padding: 0 10px; border-bottom: 1px solid #e2e7ef; overflow: hidden; text-align: left; text-overflow: ellipsis; white-space: nowrap; }
.timeline-table th { height: 36px; background: #f6f8fb; color: #536176; font-weight: 700; }
.timeline-table tbody tr:nth-child(odd) { background: #fbfcfe; }
.timeline-table tbody tr:nth-child(even) { background: #fff; }
.timeline-table th:nth-child(1) { width: 138px; }
.timeline-table th:nth-child(2) { width: 204px; }
.timeline-table th:nth-child(3) { width: 118px; }
.timeline-table th:nth-child(4) { width: 110px; }
.timeline-table th:nth-child(5) { width: 82px; }
.timeline-table th:nth-child(6) { width: 108px; }
.timeline-table th:nth-child(7) { width: 76px; }
.timeline-table th:nth-child(8) { width: 92px; }
.timeline-table th:nth-child(9) { width: 164px; }
.timeline-table th:nth-child(10) { width: 72px; }
.timeline-table th:nth-child(11) { width: 130px; }
.timeline-table th:nth-child(12) { width: 84px; }
.status-pill { display: inline-block; padding: 2px 5px; border-radius: 3px; background: #eef3f7; color: #536176; font-size: 11px; line-height: 16px; }
.risk-count { color: var(--color-primary); font-weight: 700; }
.timeline-table button { padding: 0; border: 0; background: transparent; color: var(--color-info); font-size: 12px; font-weight: 700; }
.export-record-table { min-width: 760px; }
.export-record-table th:nth-child(1) { width: 220px; }
.export-record-table th:nth-child(2) { width: 120px; }
.export-record-table th:nth-child(3) { width: 80px; }
.export-record-table th:nth-child(4) { width: 100px; }
.export-record-table th:nth-child(5) { width: 150px; }
.export-record-table th:nth-child(6) { width: 90px; }
:deep(.archive-pager) { height: 44px; padding: 0 14px; border-top: 1px solid #e2e7ef; display: flex; align-items: center; justify-content: flex-end; gap: 12px; color: #59677c; font-size: 12px; }
:deep(.archive-pager > span:first-child) { margin-right: auto; }
:deep(.pager-controls) { display: flex; gap: 4px; }
:deep(.pager-controls button) { width: 26px; height: 26px; padding: 0; border: 1px solid #e2e7ef; border-radius: 3px; background: #fff; color: #5c697d; }
:deep(.pager-controls .current) { border-color: var(--color-primary); background: var(--color-primary); color: #fff; }
:deep(.page-input) { width: 38px; height: 24px; border: 1px solid #e2e7ef; border-radius: 3px; display: inline-grid; place-items: center; }
</style>
