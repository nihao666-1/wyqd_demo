<template>
  <PageHeader eyebrow="回传比对" title="系统锁定版本与线下修改稿比对" description="差异确认后，可以形成新版本，也可以仅归档线下修改稿。">
    <RouterLink class="btn" to="/audit-report/offline-upload">返回回传</RouterLink>
    <button class="btn primary" @click="store.handleReportDiffAction('newVersion')">形成新版本</button>
    <button class="btn" @click="store.handleReportDiffAction('archive')">仅归档</button>
  </PageHeader>
  <MetricGrid :metrics="metrics" />
  <section class="panel">
    <div class="panel-title"><h3>差异明细</h3></div>
    <DataTable :columns="columns" :rows="store.db.reportDiffItems" row-key="diffId">
      <template #actions="{ row }">
        <button class="btn" @click="row.decision = '形成新版本'; store.addLog('确认回传差异', '报告差异', row.diffId)">采用</button>
        <button class="btn" @click="row.decision = '仅归档'; store.addLog('归档回传差异', '报告差异', row.diffId)">归档</button>
      </template>
    </DataTable>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const metrics = [
  { label: '差异总数', value: '3', hint: '内容 2，格式 1' },
  { label: '待确认', value: '1', hint: '需人工判断' },
  { label: '形成新版本', value: '1', hint: '整改建议章节' },
  { label: '仅归档', value: '1', hint: '格式调整' }
];
const columns = [
  { key: 'section', label: '位置' },
  { key: 'changeType', label: '差异类型' },
  { key: 'summary', label: '差异摘要' },
  { key: 'decision', label: '处理方式' }
];
</script>
