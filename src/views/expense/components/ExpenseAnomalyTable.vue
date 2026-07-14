<template>
  <section class="expense-anomaly-table" aria-label="费用异常结果">
    <header class="table-head">
      <div class="result-tabs" role="tablist" aria-label="异常结果分类">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :class="{ active: activeTab === tab.id }"
          @click="emit('change-tab', tab.id)"
        >
          {{ tab.label }}（{{ tab.count }}）
        </button>
      </div>
      <button class="export-button" type="button" @click="emit('export')"><span aria-hidden="true">⇩</span>导出 Excel</button>
    </header>

    <div class="table-scroll">
      <table>
        <colgroup>
          <col class="col-id" />
          <col class="col-type" />
          <col class="col-risk" />
          <col class="col-dept" />
          <col class="col-employee" />
          <col class="col-amount" />
          <col class="col-rule" />
          <col class="col-evidence" />
          <col class="col-status" />
          <col class="col-action" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">异常编号</th>
            <th scope="col">异常类型</th>
            <th scope="col">风险等级</th>
            <th scope="col">部门</th>
            <th scope="col">员工</th>
            <th scope="col">金额（元）</th>
            <th scope="col">命中规则</th>
            <th scope="col">证据状态</th>
            <th scope="col">处理状态</th>
            <th scope="col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.anomalyId"
            :aria-selected="selectedRowId === row.anomalyId"
            :class="{ selected: selectedRowId === row.anomalyId }"
            @click="selectRow(row)"
          >
            <td>{{ displayAnomalyId(row) }}</td>
            <td>{{ row.type }}</td>
            <td><span class="risk-tag" :class="riskClass(row.riskLevel)">{{ row.riskLevel }}风险</span></td>
            <td>{{ row.department }}</td>
            <td>{{ row.employee }}</td>
            <td class="amount">{{ formatAmount(row.amount) }}</td>
            <td>{{ row.ruleName || row.ruleId }}</td>
            <td>{{ row.evidenceStatus || '完整' }}</td>
            <td>{{ row.status }}</td>
            <td class="row-actions">
              <button type="button" @click.stop="selectRow(row)">查看详情</button>
              <button v-if="shouldShowConfirm(row)" type="button" @click.stop="emit('confirm', row)">确认异常</button>
              <button v-if="shouldShowSupplement(row)" type="button" @click.stop="emit('supplement', row)">补充证据</button>
              <button v-if="shouldShowExclude(row)" type="button" @click.stop="emit('exclude', row)">排除异常</button>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td class="empty-state" colspan="10">暂无异常数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination" aria-label="分页">
      <span class="total">共 {{ displayTotal }} 条</span>
      <div class="page-buttons">
        <button type="button" :disabled="page <= 1" aria-label="上一页" @click="emit('change-page', page - 1)">‹</button>
        <button
          v-for="item in pageItems"
          :key="item.key"
          type="button"
          :disabled="item.ellipsis"
          :class="{ active: item.page === page, ellipsis: item.ellipsis }"
          @click="!item.ellipsis && emit('change-page', item.page)"
        >{{ item.label }}</button>
        <button type="button" :disabled="page >= totalPages" aria-label="下一页" @click="emit('change-page', page + 1)">›</button>
      </div>
      <select :value="pageSize" aria-label="每页条数"><option :value="pageSize">{{ pageSize }} 条/页</option></select>
      <label class="jump">跳至 <input v-model.number="jumpPage" type="number" min="1" :max="totalPages" @keyup.enter="jump" /> 页</label>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  tabs: { type: Array, required: true },
  activeTab: { type: String, required: true },
  rows: { type: Array, required: true },
  total: { type: Number, required: true },
  page: { type: Number, required: true },
  pageSize: { type: Number, required: true }
});

const emit = defineEmits(['change-tab', 'change-page', 'view', 'confirm', 'exclude', 'supplement', 'export']);
const selectedRowId = ref(null);
const jumpPage = ref(props.page);
const activeTabCount = computed(() => props.tabs.find((tab) => tab.id === props.activeTab)?.count || props.total);
const displayTotal = computed(() => Math.max(props.total, activeTabCount.value));
const totalPages = computed(() => Math.max(1, Math.ceil(displayTotal.value / props.pageSize)));

const pageItems = computed(() => {
  const last = totalPages.value;
  const candidates = [1, 2, 3, 4, 5, last - 1, last].filter((item) => item >= 1 && item <= last);
  const unique = [...new Set(candidates)].sort((left, right) => left - right);
  const items = [];
  for (const pageNo of unique) {
    const previous = items.at(-1);
    if (previous && pageNo - previous.page > 1) items.push({ key: `ellipsis-${pageNo}`, label: '...', ellipsis: true });
    items.push({ key: `page-${pageNo}`, label: String(pageNo), page: pageNo });
  }
  return items;
});

watch(() => props.rows, (rows) => {
  if (!rows.some((row) => row.anomalyId === selectedRowId.value)) selectedRowId.value = null;
});

watch(() => props.page, (value) => {
  jumpPage.value = value;
});

function selectRow(row) {
  selectedRowId.value = row.anomalyId;
  emit('view', row);
}

function jump() {
  const nextPage = Math.min(Math.max(Number(jumpPage.value) || 1, 1), totalPages.value);
  emit('change-page', nextPage);
}

function isTerminal(status) {
  return status === '已确认' || status === '已排除';
}

function shouldShowSupplement(row) {
  return row.status === '待补充' || row.evidenceStatus === '不完整';
}

function shouldShowConfirm(row) {
  return !isTerminal(row.status) && !shouldShowSupplement(row);
}

function shouldShowExclude(row) {
  return !isTerminal(row.status);
}

function riskClass(riskLevel) {
  return { 高: 'high', 中: 'medium', 低: 'low' }[riskLevel] || 'medium';
}

function displayAnomalyId(row) {
  return row.displayId || row.auditNo || row.anomalyCode || row.anomalyId;
}

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<style scoped>
.expense-anomaly-table { display:grid; grid-template-rows:auto minmax(0,1fr) auto; min-width:0; height:100%; min-height:336px; border:1px solid #dfe5ec; background:#fff; }
.table-head { display:flex; min-height:48px; align-items:center; justify-content:space-between; gap:12px; padding:0 12px; border-bottom:1px solid #e5e9ef; }
.result-tabs { display:flex; min-width:0; gap:22px; overflow-x:auto; scrollbar-width:none; }
.result-tabs button { position:relative; height:48px; flex:0 0 auto; border:0; background:transparent; color:#303846; font-size:13px; font-weight:600; }
.result-tabs button.active { color:var(--color-primary); }
.result-tabs button.active::after { position:absolute; right:0; bottom:0; left:0; height:2px; background:var(--color-primary); content:""; }
.export-button { display:inline-flex; height:30px; flex:0 0 auto; align-items:center; gap:6px; border:1px solid #cfd8e3; border-radius:4px; padding:0 12px; background:#fff; color:#303846; font-size:12px; }
.table-scroll { min-height:0; overflow:auto; }
table { width:100%; min-width:990px; table-layout:fixed; border-collapse:collapse; font-size:12px; }
th, td { height:38px; overflow:hidden; border-bottom:1px solid #edf0f4; padding:0 8px; text-align:left; text-overflow:ellipsis; white-space:nowrap; }
.col-id { width:120px; }
.col-type { width:100px; }
.col-risk { width:74px; }
.col-dept { width:78px; }
.col-employee { width:60px; }
.col-amount { width:82px; }
.col-rule { width:160px; }
.col-evidence { width:72px; }
.col-status { width:70px; }
.col-action { width:174px; }
th { background:#f7f8fa; color:#344054; font-weight:700; }
tbody tr { cursor:pointer; }
tbody tr:hover, tbody tr.selected { background:#fff8f8; }
.amount { text-align:right; font-variant-numeric:tabular-nums; }
.risk-tag { display:inline-flex; min-width:44px; justify-content:center; border-radius:4px; padding:2px 6px; font-size:12px; }
.risk-tag.high { border:1px solid #ffd7d7; color:var(--color-primary); background:#fff0f0; }
.risk-tag.medium { border:1px solid #ffd9b7; color:var(--color-warning); background:#fff7e8; }
.risk-tag.low { border:1px solid #bfe8d4; color:#0f8f55; background:#ebf8f1; }
.row-actions { display:flex; gap:6px; }
.row-actions button { border:0; padding:0; background:transparent; color:var(--color-info); font-size:12px; }
.row-actions button:disabled { cursor:not-allowed; color:#a9b4c2; }
.empty-state { height:120px; text-align:center; color:#7a8491; }
.pagination { display:flex; min-height:48px; align-items:center; justify-content:flex-end; gap:10px; padding:0 12px; color:#4b5563; font-size:12px; }
.pagination .total { margin-right:auto; }
.page-buttons { display:inline-flex; align-items:center; gap:6px; }
.page-buttons button { min-width:24px; height:24px; border:1px solid #d6dde8; border-radius:4px; background:#fff; color:#465366; }
.page-buttons button.active { border-color:var(--color-primary); background:var(--color-primary); color:#fff; }
.page-buttons button.ellipsis { border-color:transparent; }
.pagination select, .jump input { height:26px; border:1px solid #d6dde8; border-radius:4px; background:#fff; color:#475467; font-size:12px; }
.pagination select { padding:0 8px; }
.jump { display:inline-flex; align-items:center; gap:6px; }
.jump input { width:44px; padding:0 6px; }
@media (max-width:760px) {
  .expense-anomaly-table { height:auto; min-height:336px; }
  .pagination { flex-wrap:wrap; justify-content:flex-start; padding:8px 12px; }
}
</style>
