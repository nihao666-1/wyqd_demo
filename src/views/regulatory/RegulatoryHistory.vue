<template>
  <div class="regulatory-history-page route-fill-page">
  <PageHeader eyebrow="历史查询" title="监管分析历史查询" description="按覆盖部门、生效部门、创建人、确认人、时间和有效状态查询历史分析。">
    <RouterLink class="btn" to="/regulatory/workbench">返回工作台</RouterLink>
  </PageHeader>
  <FilterPanel :items="filters" @query="store.setNotice('已按历史分析过滤条件刷新。')" />
  <section class="panel">
    <div class="panel-title"><h3>历史分析记录</h3></div>
    <DataTable :columns="columns" :rows="store.db.regulatoryHistory" row-key="historyId">
      <template #actions="{ row }">
        <button class="btn" @click="store.handleRegulatoryHistoryAction(row, 'view')">查看</button>
        <button class="btn" @click="store.handleRegulatoryHistoryAction(row, 'delete')">逻辑删除校验</button>
      </template>
    </DataTable>
  </section>
  <aside v-if="store.activeDrawer === 'regulatory-history-detail'" class="drawer">
    <div class="panel-title">
      <h3>{{ store.drawerPayload.taskName }}</h3>
      <button class="btn" @click="store.closeDrawer()">关闭</button>
    </div>
    <div class="summary-item"><strong>审计期间</strong><p>{{ store.drawerPayload.period }}</p></div>
    <div class="summary-item"><strong>状态</strong><p>{{ store.drawerPayload.status }}</p></div>
    <div class="summary-item"><strong>引用次数</strong><p>{{ store.drawerPayload.referenceCount }}</p></div>
  </aside>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import FilterPanel from '../../components/common/FilterPanel.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const filters = [
  { label: '覆盖部门', value: '经纪业务部' },
  { label: '生效部门', value: '审计部' },
  { label: '创建人', value: '王审计' },
  { label: '确认人', value: '李复核' },
  { label: '创建时间', value: '2026-07-01 至 2026-07-08' },
  { label: '是否有效', value: '有效' }
];
const columns = [
  { key: 'taskName', label: '分析任务' },
  { key: 'period', label: '期间' },
  { key: 'status', label: '状态' },
  { key: 'exportedAt', label: '导出时间' },
  { key: 'referenceCount', label: '引用次数' }
];
</script>

<style scoped>
.regulatory-history-page {
  height: 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.regulatory-history-page > .panel {
  min-height: 0;
  flex: 1;
  overflow: auto;
}
</style>
