<template>
  <div class="expense-usage-report-page route-fill-page">
    <PageHeader eyebrow="综合分析报告" title="费用综合分析报告草稿" description="综合分析报告草稿确认后才能锁定和导出，来源快照必须保留。">
    <button class="btn" @click="store.handleExpenseUsageReportAction('confirm')">确认</button>
    <button class="btn primary" @click="store.handleExpenseUsageReportAction('lock')">锁定</button>
    <button class="btn" @click="store.handleExpenseUsageReportAction('export')">导出</button>
  </PageHeader>
  <section class="panel state-panel">
    <div>
      <span class="state-label">综合报告状态</span>
      <h3>{{ report.status }} / {{ report.versionNo }} / {{ report.exportStatus || '未导出' }}</h3>
      <p>确认、锁定、导出均会写入记录中心；未锁定前不能导出正式报告。</p>
    </div>
  </section>
  <section class="two-col">
    <div class="panel">
      <div class="panel-title"><h3>报告章节</h3></div>
      <DataTable :columns="columns" :rows="rows" row-key="id" />
    </div>
    <div class="panel">
      <div class="panel-title"><h3>来源完整性</h3></div>
      <p>费用总额、预算执行率、费用结构、人均费用、员工报销集中度、供应商集中度均已绑定来源快照。</p>
      <p>来源快照：SNAP-FEE-2026Q2-001。</p>
    </div>
    </section>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const report = computed(() => store.db.expenseUsageReport || { status: '草稿待确认', versionNo: '草稿版', exportStatus: '未导出' });
const rows = [
  { id: 'UR-1', chapter: '一、分析范围', source: '任务配置、权限范围', status: '来源完整' },
  { id: 'UR-2', chapter: '二、费用总体情况', source: '财务总账、费控', status: '来源完整' },
  { id: 'UR-3', chapter: '三、费用结构和趋势', source: '预算、费控、HR', status: '来源完整' },
  { id: 'UR-4', chapter: '四、重点异常提示', source: '费用异常候选清单', status: '待人工复核' }
];
const columns = [
  { key: 'chapter', label: '章节' },
  { key: 'source', label: '来源' },
  { key: 'status', label: '状态' }
];
</script>

<style scoped>
.expense-usage-report-page {
  display: flex;
  height: 0;
  min-height: 0;
  flex-direction: column;
  overflow: auto;
}

.expense-usage-report-page > .two-col {
  min-height: 0;
  flex: 1;
}

.expense-usage-report-page > .two-col > .panel:first-child {
  display: flex;
  min-height: 0;
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
