<template>
  <div class="expense-monitor-page">
    <div class="expense-monitor-body" :class="{ 'drawer-closed': !drawerOpen || !selectedRow }">
      <main class="expense-main-column">
        <ExpenseAuditAnalysis :context="analysisContext" :filters="queryFilters" :metrics="metrics" :charts="charts" @update-filter="updateFilter" @query="applyFilters" @reset="resetFilters" />
        <ExpenseAnomalyTable :tabs="tabs" :active-tab="activeTab" :rows="pageRows.rows" :total="pageRows.total" :page="pageRows.page" :page-size="pageSize" @change-tab="changeTab" @change-page="changePage" @view="openDetail" @confirm="confirmAnomaly" @exclude="openDetail" @supplement="openDetail" @export="exportExcel" />
      </main>
      <ExpenseAnomalyDetailDrawer v-if="drawerOpen && selectedRow" :open="drawerOpen" :row="selectedRow" :evidence="selectedEvidence" @close="drawerOpen = false" @confirm="confirmAnomaly" @exclude="excludeAnomaly" @save-supplement="saveSupplement" />
    </div>
  </div>
</template>

<script setup>
import { computed, inject, reactive, ref, watch } from 'vue';
import { exportExpenseWorkbook } from '../../../domain/expense/expenseWorkbook.js';
import { EXPENSE_MONITOR_TABS, createExpenseFilters, deriveExpenseCharts, deriveExpenseMetrics, deriveExpenseMonitorTabCounts, filterExpenseRows, paginateExpenseRows } from '../../../domain/expense/expenseAnomalyState.js';
import ExpenseAuditAnalysis from './ExpenseAuditAnalysis.vue';
import ExpenseAnomalyDetailDrawer from './ExpenseAnomalyDetailDrawer.vue';
import ExpenseAnomalyTable from './ExpenseAnomalyTable.vue';

const store = inject('store');
const queryFilters = reactive(createExpenseFilters());
const appliedFilters = ref(createExpenseFilters());
const activeTab = ref('all');
const page = ref(1);
const pageSize = 10;
const drawerOpen = ref(true);

const unique = (key) => [...new Set(store.db.expenseAnomalies.map((row) => row[key]).filter(Boolean))];
const hasAppliedFilters = computed(() => Object.values(appliedFilters.value).some((value) => String(value || '').trim()));
const analysisContext = computed(() => ({
  ...store.db.expenseAuditContext,
  periodValue: '2025Q1',
  filterOptions: {
    organization: unique('organization'),
    period: [{ value: '2025Q1', label: store.db.expenseAuditContext.periodLabel || '2025年Q1（2025-01 ~ 2025-03）' }],
    type: unique('type'),
    riskLevel: unique('riskLevel'),
    department: unique('department'),
    employee: unique('employee'),
    status: unique('status')
  }
}));
const analysisRows = computed(() => filterExpenseRows(store.db.expenseAnomalies, appliedFilters.value, 'all'));
const metrics = computed(() => (hasAppliedFilters.value ? deriveExpenseMetrics(analysisRows.value) : store.db.expenseAuditContext.metrics));
const charts = computed(() => (hasAppliedFilters.value ? deriveExpenseCharts(analysisRows.value) : store.db.expenseAuditContext.charts));
const tabCounts = computed(() => (hasAppliedFilters.value ? deriveExpenseMonitorTabCounts(analysisRows.value) : store.db.expenseAuditContext.tabCounts));
const tabs = computed(() => EXPENSE_MONITOR_TABS.map((tab) => ({ ...tab, count: tabCounts.value[tab.id] || 0 })));
const filteredRows = computed(() => filterExpenseRows(analysisRows.value, createExpenseFilters(), activeTab.value));
const pageRows = computed(() => paginateExpenseRows(filteredRows.value, page.value, pageSize));
const selectedRow = computed(() => store.db.expenseAnomalies.find((row) => row.anomalyId === store.selectedAnomalyId) || null);
const selectedEvidence = computed(() => (selectedRow.value ? store.db.expenseEvidenceChains.find((item) => item.anomalyId === selectedRow.value.anomalyId) || null : null));

watch(() => [pageRows.value.rows.map((row) => row.anomalyId).join('|'), store.selectedAnomalyId], () => {
  const rows = pageRows.value.rows;
  if (!rows.length) {
    store.selectedAnomalyId = null;
    drawerOpen.value = false;
    return;
  }
  if (!rows.some((row) => row.anomalyId === store.selectedAnomalyId)) {
    store.selectedAnomalyId = rows.find((row) => row.anomalyId === 'FY-202504280007')?.anomalyId || rows[0].anomalyId;
  }
}, { immediate: true });

function updateFilter(key, value) { queryFilters[key] = value; }
function applyFilters() { appliedFilters.value = { ...queryFilters }; page.value = 1; drawerOpen.value = true; store.setNotice('筛选条件已应用，异常监控视图已同步刷新。'); }
function resetFilters() { Object.assign(queryFilters, createExpenseFilters()); appliedFilters.value = createExpenseFilters(); activeTab.value = 'all'; page.value = 1; drawerOpen.value = true; store.setNotice('筛选条件已重置。'); }
function changeTab(tab) { activeTab.value = tab.id || tab; page.value = 1; drawerOpen.value = true; }
function changePage(nextPage) { page.value = nextPage; drawerOpen.value = true; }
function openDetail(row) { store.selectedAnomalyId = row.anomalyId; drawerOpen.value = true; }
function confirmAnomaly(row) { store.decideExpenseAnomaly(row.anomalyId, 'confirm'); }
function excludeAnomaly(row, reason) { store.decideExpenseAnomaly(row.anomalyId, 'exclude', { reason }); }
function saveSupplement(row, note) { store.saveExpenseSupplement(row.anomalyId, note); }
function exportExcel() {
  try {
    const download = exportExpenseWorkbook(filteredRows.value, store.db.expenseAuditContext.organization, queryFilters.period || analysisContext.value.periodValue || '2025Q1');
    const blob = new Blob([download.content], { type: download.mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = download.fileName;
    anchor.click();
    store.recordExpenseExport(download.fileName, download.rowCount);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  } catch (error) {
    store.setNotice(error.message);
  }
}
</script>

<style scoped>
.expense-monitor-page{min-height:calc(100vh - 58px);margin:0;padding:8px 16px 10px 12px;background:#f7f8fa;color:#1f2937}.expense-monitor-body{display:grid;grid-template-columns:minmax(0,1fr) 320px;align-items:stretch;gap:16px}.expense-monitor-body.drawer-closed{grid-template-columns:minmax(0,1fr)}.expense-main-column{display:grid;min-width:0;gap:8px;align-content:start}@media(max-width:1479px){.expense-monitor-page{padding:8px 16px 10px 10px}.expense-monitor-body{grid-template-columns:minmax(0,1fr) 320px;gap:16px}}@media(max-width:900px){.expense-monitor-body{grid-template-columns:1fr}}@media(max-width:760px){.expense-monitor-page{padding:8px}}
</style>
