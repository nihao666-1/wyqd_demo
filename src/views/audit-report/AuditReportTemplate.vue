<template>
  <div class="audit-report-template-page route-fill-page">
  <PageHeader eyebrow="模板管理" title="报告模板管理" description="查询模板版本、引用状态、样式规则和检查规则绑定情况。">
    <RouterLink class="btn" to="/audit-report/workbench">返回入口</RouterLink>
    <RouterLink class="btn primary" to="/audit-report/template-upload">上传模板</RouterLink>
  </PageHeader>
  <FilterPanel :items="filters" @query="store.setNotice('已按模板名称、版本、覆盖部门和有效状态查询。')" />
  <section class="panel report-table-panel">
    <div class="panel-title"><h3>模板版本</h3></div>
    <DataTable :columns="columns" :rows="store.db.reportTemplates" row-key="templateId">
      <template #actions="{ row }">
        <RouterLink class="btn" to="/audit-report/template-diff">新版本差异</RouterLink>
        <button class="btn" @click="store.validateTemplateReference(row)">引用校验</button>
      </template>
    </DataTable>
  </section>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import FilterPanel from '../../components/common/FilterPanel.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const filters = [
  { label: '模板名称', value: '营业部常规审计报告模板' },
  { label: '模板版本', value: 'V2.1' },
  { label: '覆盖部门', value: '审计部' },
  { label: '创建人', value: '配置管理员' },
  { label: '确认人', value: '李复核' },
  { label: '是否有效', value: '有效' }
];
const columns = [
  { key: 'name', label: '模板名称' },
  { key: 'version', label: '版本' },
  { key: 'status', label: '状态' },
  { key: 'referenceCount', label: '引用次数' },
  { key: 'styleStatus', label: '样式/规则状态' }
];
</script>

<style scoped>
.audit-report-template-page {
  display: flex;
  height: 0;
  min-height: 0;
  flex-direction: column;
  overflow: auto;
}

.report-table-panel {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

:deep(.table-wrap) {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  margin-bottom: 0;
}

:deep(.table-wrap > table) {
  height: 100%;
}
</style>
