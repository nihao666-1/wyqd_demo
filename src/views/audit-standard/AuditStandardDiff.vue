<template>
  <PageHeader eyebrow="版本差异" title="标准规范版本差异分析" description="入库前必须展示新旧版本差异，并保存差异结果。">
    <RouterLink class="btn" to="/audit-standard/upload">返回上传</RouterLink>
    <RouterLink class="btn primary" to="/audit-standard/library">确认入审计规范库</RouterLink>
  </PageHeader>
  <MetricGrid :metrics="metrics" />
  <section class="panel">
    <div class="panel-title"><h3>差异明细</h3></div>
    <DataTable :columns="columns" :rows="store.db.standardDiffItems" row-key="diffId" />
  </section>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const metrics = [
  { label: '旧版本', value: 'V2.1', hint: '当前有效' },
  { label: '新版本', value: 'V2.2', hint: '待入库' },
  { label: '差异项', value: '3', hint: '新增 2，修改 1' },
  { label: '引用影响', value: '需确认', hint: '4 个引用对象' }
];
const columns = [
  { key: 'section', label: '章节' },
  { key: 'changeType', label: '差异类型' },
  { key: 'summary', label: '差异摘要' }
];
</script>
