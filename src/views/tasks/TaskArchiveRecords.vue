<template>
  <section class="record-grid" data-archive-region="records">
    <article class="record-panel">
      <h2>版本记录</h2>
      <div class="record-table-wrap">
        <table class="archive-table version-table">
          <thead><tr><th>版本号</th><th>对象类型</th><th>对象名称</th><th>创建人</th><th>创建时间</th><th>变更说明</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="version in archive.versions" :key="version.version" :class="{ final: version.final }">
              <td>{{ version.version }}</td><td>{{ version.objectType }}</td><td>{{ version.objectName }}</td><td>{{ version.creator }}</td><td>{{ version.createdAt }}</td><td>{{ version.change }}</td>
              <td><span class="record-status" :class="{ archived: version.final }">{{ version.status }}</span></td>
              <td class="record-actions"><button type="button" @click="$emit('archive-action', `查看${version.version}`)">查看</button><button type="button" @click="$emit('archive-action', `对比${version.version}`)">对比</button><button type="button" @click="$emit('archive-action', `下载${version.version}`)">下载</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <ArchivePager :count="archive.versions.length" />
    </article>

    <article class="record-panel">
      <h2>导出记录</h2>
      <div class="record-table-wrap">
        <table class="archive-table export-table">
          <thead><tr><th>导出文件</th><th>导出类型</th><th>版本号</th><th>导出人</th><th>导出时间</th><th>AI标识</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="record in archive.exports" :key="record.file">
              <td :title="record.file">{{ record.file }}</td><td>{{ record.type }}</td><td>{{ record.version }}</td><td>{{ record.exporter }}</td><td>{{ record.exportedAt }}</td><td><span class="record-status">{{ record.aiLabel }}</span></td>
              <td class="record-actions"><button type="button" @click="$emit('archive-action', `下载${record.file}`)">下载</button><span>已归档</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <ArchivePager :count="archive.exports.length" />
    </article>
  </section>
</template>

<script setup>
import { defineComponent, h } from 'vue';
defineProps({ archive: { type: Object, required: true } });
defineEmits(['archive-action']);

const ArchivePager = defineComponent({
  props: { count: { type: Number, required: true } },
  setup(props) {
    return () => h('footer', { class: 'archive-pager' }, [
      h('span', `共 ${props.count} 条记录`),
      h('div', { class: 'pager-controls' }, [h('button', { type: 'button', disabled: true }, '‹'), h('button', { type: 'button', class: 'current' }, '1'), h('button', { type: 'button', disabled: true }, '›')]),
      h('span', '10 条/页'), h('span', '跳至'), h('span', { class: 'page-input' }, '1'), h('span', '页'),
    ]);
  },
});
</script>

<style scoped>
.record-grid { height: 291px; margin-top: 8px; display: grid; grid-template-columns: 526px 1fr; gap: 9px; }
.record-panel { min-width: 0; border: 1px solid #e5e8ec; border-radius: 4px; overflow: hidden; }
.record-panel > h2 { height: 36px; margin: 0; padding: 0 4px; border-bottom: 1px solid #e5e8ec; display: flex; align-items: center; font-size: 14px; }
.record-table-wrap { height: 217px; overflow: hidden; }
.archive-table { width: 100%; min-width: 0; border-collapse: collapse; table-layout: fixed; color: #30343b; font-size: 9px; }
.archive-table th { height: 29px; padding: 0 4px; background: #f7f8f9; color: #505762; font-weight: 600; text-align: left; white-space: nowrap; }
.archive-table td { height: 32px; padding: 0 4px; border-top: 1px solid #edf0f3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.export-table td { height: 31px; }
.archive-table tr.final td { background: #f1fbf5; color: #087d40; }
.version-table th:nth-child(1){width:46px}.version-table th:nth-child(2){width:52px}.version-table th:nth-child(3){width:61px}.version-table th:nth-child(4){width:64px}.version-table th:nth-child(5){width:86px}.version-table th:nth-child(6){width:88px}.version-table th:nth-child(7){width:48px}.version-table th:nth-child(8){width:81px}
.export-table th:nth-child(1){width:125px}.export-table th:nth-child(2){width:62px}.export-table th:nth-child(3){width:46px}.export-table th:nth-child(4){width:60px}.export-table th:nth-child(5){width:94px}.export-table th:nth-child(6){width:50px}.export-table th:nth-child(7){width:75px}
.record-status { display: inline-block; padding: 1px 3px; border: 1px solid #a9dfbd; border-radius: 3px; color: #079447; background: #f3fbf6; font-size: 8px; }.record-status.archived { color: #078247; }
.record-actions { display: flex; align-items: center; gap: 4px; }.record-actions button { padding: 0; border: 0; background: transparent; color: #1677ff; font-size: 8px; }.record-actions span { color: #a8adb5; font-size: 8px; }
:deep(.archive-pager) { height: 37px; padding: 0 5px; border-top: 1px solid #e5e8ec; display: flex; align-items: center; justify-content: flex-end; gap: 8px; color: #505762; font-size: 9px; }
:deep(.archive-pager > span:first-child) { margin-right: auto; }
:deep(.pager-controls) { display: flex; gap: 3px; }:deep(.pager-controls button) { width: 22px; height: 22px; padding: 0; border: 1px solid #e0e4e9; border-radius: 3px; background: #fff; font-size: 10px; }:deep(.pager-controls .current) { border-color: #c7000b; background: #c7000b; color: #fff; }
:deep(.page-input) { width: 32px; height: 22px; border: 1px solid #e0e4e9; border-radius: 3px; display: inline-grid; place-items: center; }
</style>
