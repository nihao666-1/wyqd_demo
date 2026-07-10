<template>
  <PageHeader eyebrow="费用异常审计" title="费用异常审计看板" description="按规则类型、风险等级和处理状态查看异常候选。">
    <RouterLink class="btn primary" to="/expense/anomaly/candidates">查看候选异常</RouterLink>
  </PageHeader>
  <MetricGrid :metrics="metrics" />
  <section class="panel">
    <div class="panel-title"><h3>异常类型分布</h3></div>
    <DataTable :columns="columns" :rows="rows" row-key="type" />
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import DataTable from '../../components/common/DataTable.vue';

const metrics = [
  { label: '异常总数', value: '42', hint: '规则命中候选' },
  { label: '异常金额', value: '128.6万', hint: '含预算和合同异常' },
  { label: '高风险', value: '8', hint: '需优先确认' },
  { label: '待补充', value: '5', hint: '缺审批或附件' }
];
const columns = [
  { key: 'type', label: '异常类型' },
  { key: 'count', label: '数量' },
  { key: 'amount', label: '金额' },
  { key: 'risk', label: '风险等级' }
];
const rows = [
  { type: '业务招待/餐饮', count: 16, amount: '42.8万', risk: '高' },
  { type: '预算合规', count: 9, amount: '52.0万', risk: '高' },
  { type: '差旅住宿', count: 7, amount: '11.4万', risk: '中' },
  { type: '合同付款', count: 4, amount: '22.4万', risk: '中' }
];
</script>
