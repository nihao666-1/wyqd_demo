<template>
  <div class="expense-anomaly-dashboard route-fill-page" aria-label="费用异常分析">
    <section class="anomaly-filter" aria-label="费用异常筛选">
      <form class="filter-row" @submit.prevent="applyFilters" @reset.prevent="resetFilters">
        <label class="field-task">
          <span>任务编号</span>
          <input v-model="queryFilters.taskNo" placeholder="请输入任务编号" />
        </label>
        <label>
          <span>被审计单位</span>
          <select v-model="queryFilters.organization">
            <option value="">上海分公司</option>
            <option v-for="option in filterOptions.organization" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
        <label class="field-period">
          <span>审计期间</span>
          <select v-model="queryFilters.period">
            <option value="">2025年Q1（2025-01 ~ 2025-03）</option>
            <option value="2025Q1">2025年Q1（2025-01 ~ 2025-03）</option>
          </select>
        </label>
        <label>
          <span>异常类型</span>
          <select v-model="queryFilters.type">
            <option value="">全部</option>
            <option v-for="option in filterOptions.type" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
        <label>
          <span>风险等级</span>
          <select v-model="queryFilters.riskLevel">
            <option value="">全部</option>
            <option v-for="option in filterOptions.riskLevel" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
        <label>
          <span>部门</span>
          <select v-model="queryFilters.department">
            <option value="">全部</option>
            <option v-for="option in filterOptions.department" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
        <label class="field-employee">
          <span>员工</span>
          <input v-model="queryFilters.employee" placeholder="请输入员工姓名 / 工号" />
        </label>
        <label>
          <span>处理状态</span>
          <select v-model="queryFilters.status">
            <option value="">全部</option>
            <option v-for="option in filterOptions.status" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
        <button class="create-button" type="button" @click="store.setNotice('创建异常分析任务入口已打开。')">创建异常分析任务</button>
        <div class="filter-actions">
          <button class="primary" type="submit">查询</button>
          <button type="reset">重置</button>
        </div>
      </form>
    </section>

    <section class="status-metrics" aria-label="费用异常状态统计">
      <article v-for="metric in statusMetrics" :key="metric.key" class="metric-card" :class="metric.tone">
        <span class="metric-icon"><FontAwesomeIcon :icon="metric.icon" /></span>
        <div>
          <p>{{ metric.label }}</p>
          <strong>{{ metric.value }} <small>笔</small></strong>
        </div>
      </article>
    </section>

    <ExpenseAnomalyTable
      :tabs="tabs"
      :active-tab="activeTab"
      :rows="pageRows.rows"
      :total="pageRows.total"
      :page="pageRows.page"
      :page-size="pageSize"
      @change-tab="changeTab"
      @change-page="changePage"
      @view="viewDetail"
      @confirm="confirmAnomaly"
      @exclude="excludeAnomaly"
      @supplement="supplementAnomaly"
      @export="exportExcel"
    />
  </div>
</template>

<script setup>
import { computed, inject, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCheckCircle, faFileLines, faTableCells, faTimes, faWarning } from '@fortawesome/free-solid-svg-icons';
import { exportExpenseWorkbook } from '../../domain/expense/expenseWorkbook.js';
import { EXPENSE_MONITOR_TABS, createExpenseFilters, deriveExpenseMetrics, deriveExpenseMonitorTabCounts, filterExpenseRows, paginateExpenseRows } from '../../domain/expense/expenseAnomalyState.js';
import ExpenseAnomalyTable from './components/ExpenseAnomalyTable.vue';

const store = inject('store');
const router = useRouter();
const queryFilters = reactive({
  ...createExpenseFilters(),
  taskNo: ''
});
const appliedFilters = ref(createExpenseFilters());
const activeTab = ref('all');
const page = ref(1);
const pageSize = 12;

const unique = (key) => [...new Set(store.db.expenseAnomalies.map((row) => row[key]).filter(Boolean))];
const filterOptions = computed(() => ({
  organization: unique('organization'),
  type: unique('type'),
  riskLevel: unique('riskLevel'),
  department: unique('department'),
  status: unique('status')
}));

const hasAppliedFilters = computed(() => Object.values(appliedFilters.value).some((value) => String(value || '').trim()));
const analysisRows = computed(() => filterExpenseRows(store.db.expenseAnomalies, appliedFilters.value, 'all'));
const metrics = computed(() => (hasAppliedFilters.value ? deriveExpenseMetrics(analysisRows.value) : store.db.expenseAuditContext.metrics));
const tabCounts = computed(() => (hasAppliedFilters.value ? deriveExpenseMonitorTabCounts(analysisRows.value) : store.db.expenseAuditContext.tabCounts));
const tabs = computed(() => EXPENSE_MONITOR_TABS.map((tab) => ({ ...tab, count: tabCounts.value[tab.id] || 0 })));
const filteredRows = computed(() => filterExpenseRows(analysisRows.value, createExpenseFilters(), activeTab.value));
const pageRows = computed(() => paginateExpenseRows(filteredRows.value, page.value, pageSize));

const statusMetrics = computed(() => [
  { key: 'pending', label: '待确认异常', value: metrics.value.pendingCount ?? 0, tone: 'orange', icon: faFileLines },
  { key: 'highRisk', label: '高风险异常', value: metrics.value.highRiskCount ?? 0, tone: 'red', icon: faWarning },
  { key: 'supplement', label: '待补充证据', value: metrics.value.supplementCount ?? 0, tone: 'blue', icon: faTableCells },
  { key: 'confirmed', label: '已确认异常', value: metrics.value.confirmedCount ?? 0, tone: 'green', icon: faCheckCircle },
  { key: 'excluded', label: '已排除异常', value: metrics.value.excludedCount ?? 0, tone: 'gray', icon: faTimes }
]);

function normalizedFilters() {
  const { taskNo, ...filters } = queryFilters;
  return filters;
}

function applyFilters() {
  appliedFilters.value = { ...normalizedFilters() };
  activeTab.value = 'all';
  page.value = 1;
  store.setNotice('费用异常筛选条件已应用。');
}

function resetFilters() {
  Object.assign(queryFilters, { ...createExpenseFilters(), taskNo: '' });
  appliedFilters.value = createExpenseFilters();
  activeTab.value = 'all';
  page.value = 1;
  store.setNotice('费用异常筛选条件已重置。');
}

function changeTab(tab) {
  activeTab.value = tab.id || tab;
  page.value = 1;
}

function changePage(nextPage) {
  page.value = nextPage;
}

function viewDetail(row) {
  store.selectedAnomalyId = row.anomalyId;
  router.push({
    path: '/tasks/detail',
    query: {
      taskId: row.taskId || 'TASK-20250428001',
      state: 'pending',
      tab: 'expense-anomaly',
      anomalyId: row.anomalyId
    }
  });
}

function confirmAnomaly(row) {
  store.decideExpenseAnomaly(row.anomalyId, 'confirm');
}

function excludeAnomaly(row) {
  store.decideExpenseAnomaly(row.anomalyId, 'exclude', { reason: '经人工复核排除' });
}

function supplementAnomaly(row) {
  store.saveExpenseSupplement(row.anomalyId, '已补充证据材料，待复核确认。');
}

function exportExcel() {
  try {
    const download = exportExpenseWorkbook(filteredRows.value, store.db.expenseAuditContext.organization, queryFilters.period || '2025Q1');
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
.expense-anomaly-dashboard {
  display: grid;
  height: 0;
  min-height: 0;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 8px;
  overflow: hidden;
  padding: 8px 10px 10px;
  background: #f6f7fb;
  color: #111827;
}

.anomaly-filter,
.metric-card {
  box-sizing: border-box;
  border: 1px solid #cfd8e8;
  background: #fff;
}

.filter-row {
  display: grid;
  grid-template-columns:
    minmax(115px, .85fr)
    minmax(125px, .9fr)
    minmax(190px, 1.35fr)
    minmax(120px, .9fr)
    minmax(110px, .78fr)
    minmax(105px, .72fr)
    minmax(168px, 1.1fr)
    minmax(105px, .72fr)
    auto;
  gap: 7px 8px;
  align-items: end;
  padding: 8px 10px;
}

.filter-row label {
  display: grid;
  gap: 4px;
  min-width: 0;
  color: #1f2a44;
  font-size: 12px;
}

.filter-row input,
.filter-row select {
  box-sizing: border-box;
  width: 100%;
  height: 28px;
  border: 1px solid #bcc5d2;
  border-radius: 0;
  padding: 0 10px;
  background: #fff;
  color: #111827;
  font-size: 13px;
}

.create-button {
  height: 28px;
  min-width: 132px;
  border: 1px solid #cf2d2d;
  background: #cf2d2d;
  color: #fff;
  font-weight: 700;
}

.filter-actions {
  display: flex;
  grid-column: 8 / 10;
  justify-content: flex-end;
  gap: 8px;
}

button {
  height: 28px;
  border: 1px solid #b9c1cd;
  border-radius: 0;
  padding: 0 16px;
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  font-size: 13px;
}

button.primary {
  border-color: #cf2d2d;
  background: #cf2d2d;
  color: #fff;
  font-weight: 700;
}

.status-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.metric-card {
  display: grid;
  min-height: 58px;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 9px;
  align-items: center;
  padding: 8px 12px;
}

.metric-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 6px;
}

.metric-card.orange .metric-icon { border: 1px solid #e7a453; background: #fff7ed; color: #a95f10; }
.metric-card.red .metric-icon { border: 1px solid #d94c56; background: #fff5f5; color: #b22b38; }
.metric-card.blue .metric-icon { border: 1px solid #4b87d8; background: #eff6ff; color: #2368af; }
.metric-card.green .metric-icon { border: 1px solid #4aa386; background: #ecfdf5; color: #28775f; }
.metric-card.gray .metric-icon { border: 1px solid #91a0b6; background: #f8fafc; color: #64748b; }

.metric-card p {
  margin: 0 0 3px;
  color: #4b5563;
  font-size: 12px;
}

.metric-card strong {
  color: #111827;
  font-size: 19px;
  line-height: 1.25;
}

.metric-card small {
  font-size: 16px;
}

:deep(.expense-anomaly-table) {
  min-height: 0;
  border-color: #cfd8e8;
}

:deep(.table-head) {
  min-height: 38px;
  padding: 0 10px;
}

:deep(.result-tabs button) {
  height: 38px;
  font-size: 12px;
}

:deep(table) {
  min-width: 1120px;
  border-collapse: collapse;
}

:deep(th),
:deep(td) {
  height: 30px;
  border: 1px solid #ccd5e5;
  padding: 0 6px;
  text-align: center;
}

:deep(th) {
  background: #e9edf6;
  color: #111827;
}

:deep(tbody tr:nth-child(odd)) {
  background: #f0f0f0;
}

:deep(tbody tr:nth-child(even)) {
  background: #fff;
}

:deep(tbody tr:hover),
:deep(tbody tr.selected) {
  background: #fff7f7;
}

:deep(.amount) {
  text-align: center;
}

:deep(.row-actions) {
  justify-content: center;
}

:deep(.row-actions button) {
  color: #9a1f2d;
  font-weight: 700;
}

:deep(.pagination) {
  min-height: 38px;
}

@media (max-width: 1180px) {
  .filter-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .filter-actions {
    grid-column: auto;
    justify-content: flex-start;
  }

  .create-button {
    width: max-content;
  }
}

@media (max-width: 900px) {
  .expense-anomaly-dashboard {
    height: auto;
    min-height: calc(100dvh - 58px);
    overflow: auto;
  }

  .filter-row,
  .status-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
