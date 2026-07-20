<template>
  <div class="audit-report-template-page route-fill-page">
  <PageHeader eyebrow="模板管理" title="报告模板管理" description="查询模板版本、引用状态、样式规则和检查规则绑定情况。">
    <RouterLink class="btn" to="/audit-report/workbench">返回入口</RouterLink>
    <button class="btn primary" type="button" @click="store.setNotice('已打开模板上传弹窗。')">上传模板</button>
  </PageHeader>
  <section v-if="route.query.action || route.query.panel" class="panel merge-hint">
    <strong>{{ route.query.action === 'upload' ? '模板上传已并入当前页面' : '模板差异已并入当前页面' }}</strong>
    <p>{{ route.query.action === 'upload' ? '可在模板管理中直接上传新模板并完成版本确认。' : '可在模板版本列表中查看新旧版本差异、样式规则和引用影响。' }}</p>
  </section>
  <FilterPanel :items="filters" @query="store.setNotice('已按模板名称、版本、覆盖部门和有效状态查询。')" />
  <section class="panel report-table-panel">
    <div class="panel-title"><h3>模板版本</h3></div>
    <DataTable :columns="columns" :rows="store.db.reportTemplates" row-key="templateId">
      <template #actions="{ row }">
        <button class="btn" type="button" @click="store.setNotice(`${row.name} 的新版本差异抽屉已打开。`)">新版本差异</button>
        <button class="btn" @click="store.validateTemplateReference(row)">引用校验</button>
      </template>
    </DataTable>
  </section>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { useRoute } from 'vue-router';
import PageHeader from '../../components/common/PageHeader.vue';
import FilterPanel from '../../components/common/FilterPanel.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const route = useRoute();
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
