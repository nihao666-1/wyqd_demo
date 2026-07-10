<template>
  <PageHeader eyebrow="费用综合分析" title="费用综合分析看板" description="展示费用总额、预算执行、费用结构、人均费用、增长趋势和来源完整性。">
    <RouterLink class="btn" to="/expense/usage/new">返回任务</RouterLink>
    <RouterLink class="btn primary" to="/expense/usage/report">生成综合分析报告草稿</RouterLink>
  </PageHeader>
  <MetricGrid :metrics="store.db.expenseUsageMetrics" />
  <section class="panel">
    <div class="panel-title"><h3>下钻入口</h3></div>
    <DataTable :columns="columns" :rows="store.db.expenseUsageBreakdown" row-key="itemId">
      <template #actions="{ row }">
        <RouterLink class="btn" :to="`/expense/usage/drilldown?dimension=${encodeURIComponent(row.dimension)}&name=${encodeURIComponent(row.name)}`">下钻明细</RouterLink>
      </template>
    </DataTable>
  </section>
  <section class="two-col">
    <div class="panel">
      <div class="panel-title"><h3>费用类别结构</h3></div>
      <div class="bars">
        <div v-for="item in store.db.expenseUsageBreakdown" :key="item.itemId" class="bar-row">
          <span>{{ item.name }}</span>
          <div class="bar-track"><div class="bar-fill" :style="{ width: item.ratio }"></div></div>
          <strong>{{ item.ratio }}</strong>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title"><h3>重点异常提示</h3></div>
      <p>业务招待费增长较快，经纪业务部费用集中度偏高；建议结合费用异常审计候选清单核验审批、发票和预算依据。</p>
    </div>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const columns = [
  { key: 'dimension', label: '下钻维度' },
  { key: 'name', label: '对象' },
  { key: 'amount', label: '金额' },
  { key: 'ratio', label: '占比' },
  { key: 'trend', label: '趋势' },
  { key: 'source', label: '来源' }
];
</script>
