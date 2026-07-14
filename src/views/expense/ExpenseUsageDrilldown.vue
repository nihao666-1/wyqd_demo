<template>
  <div class="expense-usage-drilldown-page route-fill-page">
    <PageHeader eyebrow="费用下钻" :title="`${name || '费用对象'} 明细来源`" description="从类别、部门、员工、供应商维度下钻到费用明细和来源快照。">
    <RouterLink class="btn" to="/expense/usage/dashboard">返回看板</RouterLink>
    <RouterLink class="btn primary" to="/expense/anomaly/candidates">查看相关异常</RouterLink>
  </PageHeader>
  <section class="panel source-detail-panel">
    <div class="panel-title"><h3>来源明细</h3></div>
    <DataTable :columns="columns" :rows="rows" row-key="id" />
  </section>
  <section class="panel">
    <div class="panel-title"><h3>来源快照</h3></div>
    <p>数据来自费控/报销、预算系统、财务总账、发票平台/OCR、OA 审批和合同系统，快照编号 SNAP-FEE-2026Q2-001。</p>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const route = useRoute();
const name = computed(() => route.query.name || '业务招待费');
const rows = [
  { id: 'D-001', billNo: 'BX-2026-1881', department: '经纪业务部', employee: '张某', vendor: '上海某会务服务有限公司', amount: '12800', source: '费控/发票/OA' },
  { id: 'D-002', billNo: 'BX-2026-1910', department: '经纪业务部', employee: '李某', vendor: '上海某餐饮有限公司', amount: '8600', source: '费控/发票' },
  { id: 'D-003', billNo: 'BX-2026-2012', department: '计划财务部', employee: '周某', vendor: '上海某办公用品有限公司', amount: '5600', source: '采购/财务' }
];
const columns = [
  { key: 'billNo', label: '单据号' },
  { key: 'department', label: '部门' },
  { key: 'employee', label: '员工' },
  { key: 'vendor', label: '供应商' },
  { key: 'amount', label: '金额' },
  { key: 'source', label: '证据来源' }
];
</script>

<style scoped>
.expense-usage-drilldown-page {
  display: flex;
  height: 0;
  min-height: 0;
  flex-direction: column;
  overflow: auto;
}

.source-detail-panel {
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
