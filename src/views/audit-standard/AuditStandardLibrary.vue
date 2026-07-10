<template>
  <PageHeader eyebrow="规范库" title="审计规范库版本管理" description="查看当前有效版本、历史版本和引用锁定状态。">
    <RouterLink class="btn" to="/audit-standard/workbench">返回工作台</RouterLink>
  </PageHeader>
  <FilterPanel :items="filters" @query="store.setNotice('已按规范名称、版本、部门和有效状态查询。')" />
  <section class="panel">
    <div class="panel-title"><h3>版本列表</h3></div>
    <DataTable :columns="columns" :rows="store.db.standardVersions" row-key="versionId">
      <template #actions="{ row }">
        <button class="btn" @click="store.validateStandardInvalidate(row)">设置失效校验</button>
      </template>
    </DataTable>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import FilterPanel from '../../components/common/FilterPanel.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const filters = [
  { label: '规范名称', value: '费用报销审计规范' },
  { label: '覆盖部门', value: '上海分公司' },
  { label: '创建人', value: '配置管理员' },
  { label: '确认人', value: '李复核' },
  { label: '创建时间', value: '2026-06-01 至 2026-07-08' },
  { label: '是否有效', value: '有效' }
];
const columns = [
  { key: 'standardName', label: '规范名称' },
  { key: 'versionNo', label: '版本' },
  { key: 'status', label: '状态' },
  { key: 'referenceCount', label: '引用次数' },
  { key: 'createdAt', label: '创建时间' }
];
</script>
