<template>
  <PageHeader eyebrow="费用智能化审计" title="费用审计入口" description="综合分析和异常审计分线办理，并展示数据快照和规则状态。">
    <RouterLink class="btn" to="/expense/usage/new">新建综合分析</RouterLink>
    <RouterLink class="btn primary" to="/expense/anomaly/dashboard">新建异常审计</RouterLink>
  </PageHeader>
  <MetricGrid :metrics="metrics" />
  <section class="panel">
    <div class="panel-title"><h3>数据源状态</h3></div>
    <DataTable :columns="sourceColumns" :rows="store.db.dataSources" row-key="sourceId" />
  </section>
  <section class="panel">
    <div class="panel-title"><h3>规则版本</h3></div>
    <p>费用异常规则台账 V2026.07，共 27 条启用规则，覆盖 OA、费控、预算、财务、发票/OCR、合同、采购、HR 和基础配置库。</p>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const metrics = [
  { label: '费用总额', value: '865.4万', hint: '上海分公司 2026Q2' },
  { label: '异常候选', value: '42', hint: '高风险 8 条' },
  { label: '规则版本', value: 'V2026.07', hint: '27 条规则启用' },
  { label: '待补充资料', value: '5', hint: '小票、审批、合同附件' }
];
const sourceColumns = [
  { key: 'sourceName', label: '数据源' },
  { key: 'syncStatus', label: '同步状态' },
  { key: 'fieldCoverage', label: '字段覆盖率' },
  { key: 'recordCount', label: '数据量' },
  { key: 'lastSyncAt', label: '最近同步' }
];
</script>
