<template>
  <div class="audit-standard-library-page route-fill-page">
  <PageHeader eyebrow="规范库" title="审计规范库版本管理" description="查看当前有效版本、历史版本和引用锁定状态。">
    <RouterLink class="btn" to="/audit-standard/workbench">返回工作台</RouterLink>
  </PageHeader>
  <section v-if="route.query.action || route.query.panel" class="panel merge-hint">
    <strong>{{ route.query.action === 'upload' ? '规范上传已并入规范库' : '版本差异已并入规范库' }}</strong>
    <p>{{ route.query.action === 'upload' ? '可在规范库内上传制度或规范文件，并完成适用范围确认。' : '可在版本列表中打开差异抽屉，查看新旧版本变化和引用影响。' }}</p>
  </section>
  <FilterPanel :items="filters" @query="store.setNotice('已按规范名称、版本、部门和有效状态查询。')" />
  <section class="panel">
    <div class="panel-title"><h3>版本列表</h3></div>
    <DataTable :columns="columns" :rows="store.db.standardVersions" row-key="versionId">
      <template #actions="{ row }">
        <button class="btn" @click="store.validateStandardInvalidate(row)">设置失效校验</button>
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

<style scoped>
.audit-standard-library-page {
  height: 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.audit-standard-library-page > .panel {
  min-height: 0;
  flex: 1;
  overflow: auto;
}
</style>
