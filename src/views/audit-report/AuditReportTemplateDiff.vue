<template>
  <PageHeader eyebrow="模板差异" title="模板新旧版本差异识别" description="展示结构、样式和检查规则差异，确认后发布新版本。">
    <RouterLink class="btn" to="/audit-report/template-upload">返回上传</RouterLink>
    <button class="btn primary" @click="store.publishTemplateVersion()">发布版本</button>
  </PageHeader>
  <MetricGrid :metrics="metrics" />
  <section class="panel state-panel">
    <div>
      <span class="state-label">模板发布状态</span>
      <h3>{{ templateStatus }}</h3>
      <p>发布后写入版本记录；旧版本保留引用关系，不覆盖历史报告。</p>
    </div>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>差异明细</h3></div>
    <DataTable :columns="columns" :rows="store.db.templateDiffItems" row-key="diffId" />
  </section>
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const templateStatus = computed(() => {
  const template = store.db.reportTemplates.find((item) => item.templateId === 'TPL-002');
  return template?.status || '待发布';
});
const metrics = computed(() => [
  { label: '旧版本', value: 'V2.1', hint: '已被 6 份报告引用' },
  { label: '新版本', value: 'V2.2', hint: templateStatus.value },
  { label: '结构差异', value: '1', hint: '新增章节' },
  { label: '规则差异', value: '2', hint: '样式和检查规则' }
]);
const columns = [
  { key: 'node', label: '节点' },
  { key: 'changeType', label: '差异类型' },
  { key: 'summary', label: '差异摘要' }
];
</script>
