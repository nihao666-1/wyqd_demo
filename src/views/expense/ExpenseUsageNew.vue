<template>
  <PageHeader eyebrow="费用综合分析" title="新建费用综合分析任务" description="选择被审计单位、审计期和数据快照，完成完整性预检后进入综合分析看板。">
    <RouterLink class="btn" to="/expense/workbench">返回入口</RouterLink>
    <RouterLink class="btn primary" to="/expense/usage/dashboard">数据完整性预检并进入看板</RouterLink>
  </PageHeader>
  <section class="panel">
    <div class="panel-title"><h3>任务条件</h3></div>
    <div class="filter-grid">
      <label><span>被审计单位</span><input value="上海分公司" readonly /></label>
      <label><span>审计期</span><input value="2026Q2" readonly /></label>
      <label><span>数据快照</span><input value="SNAP-FEE-2026Q2-001" readonly /></label>
      <label><span>可选部门</span><input value="经纪业务部、计划财务部" readonly /></label>
      <label><span>来源系统</span><input value="OA、费控、预算、财务、发票、合同、HR" readonly /></label>
      <label><span>完整性状态</span><input value="待预检" readonly /></label>
    </div>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>数据源覆盖</h3></div>
    <DataTable :columns="columns" :rows="store.db.dataSources" row-key="sourceId" />
  </section>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const columns = [
  { key: 'sourceName', label: '系统' },
  { key: 'syncStatus', label: '同步状态' },
  { key: 'fieldCoverage', label: '字段覆盖率' },
  { key: 'recordCount', label: '数据量' },
  { key: 'lastSyncAt', label: '最近同步' }
];
</script>
