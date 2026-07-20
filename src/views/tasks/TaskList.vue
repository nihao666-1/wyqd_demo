<template>
  <div class="task-list-route route-fill-page">
  <TaskCenterEmptyState v-if="!isDataMode" />
  <section v-else class="task-center-page">
    <div class="task-center-layout">
    <div class="task-main-column">
    <div class="metric-strip" aria-label="任务状态统计">
      <button v-for="metric in metricDefinitions" :key="metric.label" class="task-metric" :class="{ active: filters.status === metric.filter }" type="button" @click="selectMetric(metric.filter)">
        <span class="metric-icon" :class="metric.tone"><TaskIcon :name="metric.icon" :size="22" /></span>
        <span class="metric-copy"><b>{{ metric.label }}</b><strong>{{ isDataMode ? metric.count : 0 }}</strong><small>较昨日 <em :class="{ down: metric.label === '失败/异常' }">{{ isDataMode ? metricTrend(metric.label) : '--' }}</em></small></span>
      </button>
    </div>

    <section class="filter-panel" aria-label="任务筛选">
      <label><span>审计单位</span><select v-model="filters.organization"><option v-for="item in organizations" :key="item">{{ item }}</option></select></label>
      <label><span>任务类型</span><select v-model="filters.type"><option v-for="item in taskTypes" :key="item">{{ item }}</option></select></label>
      <label><span>审计期间</span><select v-model="filters.period"><option v-for="item in periods" :key="item">{{ item }}</option></select></label>
      <label><span>状态</span><select v-model="filters.status" @change="syncTabFromStatus"><option v-for="item in taskStatuses" :key="item">{{ item }}</option></select></label>
      <label class="keyword-field"><span>关键词</span><input v-model.trim="filters.keyword" placeholder="请输入任务名称/编号" /></label>
      <div class="filter-actions">
        <RouterLink class="create-task-inline" to="/tasks/create" aria-label="创建审计任务">
          <TaskIcon name="create" :size="16" />
          <span>创建审计任务</span>
        </RouterLink>
        <div class="query-actions"><button class="task-button primary" type="button" @click="applyQuery">查询</button><button class="task-button" type="button" @click="resetFilters">重置</button></div>
      </div>
    </section>

      <main id="task-table" class="task-list-panel">
        <nav class="status-tabs" aria-label="任务状态筛选"><button v-for="tab in tabs" :key="tab.key" :class="{ active: activeTab === tab.key }" type="button" @click="selectTab(tab.key)">{{ tab.label }}<span v-if="isDataMode">（{{ tabCount(tab.key) }}）</span></button></nav>
        <div class="task-table-wrap">
          <table>
            <thead><tr><th>任务编号</th><th>任务名称</th><th>任务类型</th><th>被审计单位</th><th>审计期间</th><th>当前阶段</th><th>进度</th><th>风险项</th><th>创建人</th><th>更新时间</th><th>状态</th><th>操作</th></tr></thead>
            <tbody v-if="isDataMode && paged.rows.length"><tr v-for="task in paged.rows" :key="task.id"><td :title="task.id">{{ task.id }}</td><td :title="task.name"><b>{{ task.name }}</b></td><td :title="task.type">{{ task.type }}</td><td :title="task.organization">{{ task.organization }}</td><td>{{ task.period }}</td><td :title="task.phase"><span class="phase-tag">{{ task.phase }}</span></td><td><div class="progress-cell"><span>{{ task.progress }}%</span><i><em :style="{ width: `${task.progress}%` }"></em></i></div></td><td :class="{ risky: task.riskCount }">{{ task.riskCount }}</td><td :title="task.creator">{{ task.creator }}</td><td :title="task.updatedAt">{{ task.updatedAt }}</td><td><span class="status-badge" :class="task.statusKey">{{ task.status }}</span></td><td class="operation-cell"><span class="operation-actions"><RouterLink :to="detailRoute(task)">查看详情</RouterLink><RouterLink :to="actionRoute(task)">{{ task.action }}</RouterLink></span></td></tr></tbody>
            <tbody v-else><tr><td colspan="12"><div class="task-empty-state"><span class="empty-icon">▱</span><h3>{{ isDataMode ? '未找到匹配任务' : '暂无审计任务' }}</h3><p>{{ isDataMode ? '请调整筛选条件后重试。' : '创建首个任务后，可在此集中跟踪执行进度、风险项和归档状态。' }}</p><div v-if="!isDataMode"><RouterLink class="task-button primary" to="/tasks/create">创建审计任务</RouterLink><button class="task-button" type="button" @click="store.setDemoDataMode('data')">导入模拟任务</button></div></div></td></tr></tbody>
          </table>
        </div>
        <footer class="pagination"><span>共 {{ isDataMode ? filteredRows.length : 0 }} 条</span><div class="pagination-controls"><label class="page-size"><select v-model.number="pageSize"><option :value="10">10条/页</option><option :value="20">20条/页</option></select></label><button :disabled="page === 1" aria-label="上一页" @click="goToPage(page - 1)">‹</button><button v-for="item in pageNumbers" :key="item" :class="{ current: page === item }" type="button" @click="goToPage(item)">{{ item }}</button><button :disabled="page === paged.totalPages" aria-label="下一页" @click="goToPage(page + 1)">›</button><label class="jump-page">前往 <input :value="page" type="number" min="1" :max="paged.totalPages" @change="goToPage($event.target.value)" /> 页</label></div></footer>
      </main>
    </div>
    </div>
  </section>
  </div>
</template>

<script setup>
import { computed, inject, reactive, ref, watch } from 'vue';
import TaskIcon from './TaskIcon.vue';
import TaskCenterEmptyState from './TaskCenterEmptyState.vue';
import { getTaskCenterRows, paginateTaskRows } from '../../domain/taskCenter/taskListState.js';
import { metricDefinitions, organizations, taskRows, taskTypes } from './taskCenterData.js';

const store = inject('store');
const activeTab = ref('all');
const page = ref(1);
const pageSize = ref(10);
const filters = reactive({ keyword: '', organization: '上海分公司', type: '全部', period: '2025Q1', status: '全部' });
const tabs = [{ key: 'all', label: '全部任务' }, { key: 'running', label: '执行中' }, { key: 'confirming', label: '待确认' }, { key: 'archived', label: '已归档' }, { key: 'abnormal', label: '异常任务' }];
const periods = ['2025Q1', '2024Q4'];
const taskStatuses = ['全部', '执行中', '待确认', '已归档', '失败/异常'];
const isDataMode = computed(() => store.demoDataMode === 'data');
const normalizedStatus = computed(() => filters.status === '执行中' ? '生成中' : filters.status === '失败/异常' ? '失败' : filters.status);
const filteredRows = computed(() => getTaskCenterRows(taskRows, { ...filters, status: normalizedStatus.value }, activeTab.value).filter((row) => row.period === filters.period));
const paged = computed(() => paginateTaskRows(filteredRows.value, page.value, pageSize.value));
const pageNumbers = computed(() => Array.from({ length: paged.value.totalPages }, (_, index) => index + 1));

watch([() => store.demoDataMode, () => activeTab.value, () => filters.keyword, () => filters.organization, () => filters.type, () => filters.period, () => filters.status, pageSize], () => { page.value = 1; });

function statusToTab(status) { return status === '失败/异常' ? 'abnormal' : status === '已归档' ? 'archived' : status === '待确认' ? 'confirming' : status === '执行中' ? 'running' : 'all'; }
function selectMetric(status) { filters.status = status; activeTab.value = statusToTab(status); }
function selectTab(tab) { activeTab.value = tab; filters.status = '全部'; }
function syncTabFromStatus() { activeTab.value = statusToTab(filters.status); }
function applyQuery() { page.value = 1; }
function resetFilters() { Object.assign(filters, { keyword: '', organization: '上海分公司', type: '全部', period: '2025Q1', status: '全部' }); activeTab.value = 'all'; }
function tabCount(tab) { return getTaskCenterRows(taskRows, { ...filters, status: '全部' }, tab).filter((row) => row.period === filters.period).length; }
function goToPage(value) { const next = Number(value); page.value = Number.isFinite(next) ? Math.min(Math.max(next, 1), paged.value.totalPages) : 1; }
function metricTrend(label) { return label === '全部任务' ? '+4' : label === '待确认' ? '+2' : label === '失败/异常' ? '-1' : '+1'; }
function detailRoute(task) { return { path: '/tasks/detail', query: { taskId: task.id } }; }
function actionRoute(task) { return task.action === '查看日志' ? { path: '/records', query: { taskId: task.id } } : { path: '/tasks/detail', query: { taskId: task.id, tab: task.statusKey === 'confirming' ? 'reviews' : task.statusKey === 'failed' ? 'results' : 'analysis', action: task.action } }; }
</script>

<style scoped>
.task-center-page{--red:var(--color-primary);--line:#e2e7ef;--muted:#738097;box-sizing:border-box;width:100%;max-width:none;margin:0;padding:12px;color:#202938}.task-center-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start}.task-main-column{min-width:0}.create-task-tile,.task-button{min-height:34px;padding:7px 12px;border:1px solid #ccd5e2;border-radius:4px;background:#fff;color:#344054;font-size:13px;white-space:nowrap}.create-task-tile{display:flex;min-height:104px;align-items:center;justify-content:center;gap:8px;border:1px solid var(--red);border-radius:5px;background:#fff;color:var(--red);font-size:14px;font-weight:700;text-decoration:none}.create-task-tile:hover{background:#fff6f6}.task-button.primary{border-color:var(--red);background:var(--red);color:#fff}.metric-strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin-bottom:12px}.task-metric{display:flex;min-height:104px;align-items:center;gap:12px;padding:14px;border:1px solid var(--line);border-radius:5px;background:#fff;text-align:left}.task-metric.active{background:#fff}.metric-icon{display:grid;flex:0 0 42px;height:42px;place-items:center;border-radius:5px}.metric-icon.red{background:#fff0f1;color:var(--color-primary)}.metric-icon.blue{background:#edf4ff;color:var(--color-info)}.metric-icon.orange{background:#fff3e8;color:var(--color-warning)}.metric-icon.green{background:#eaf8f0;color:var(--color-success)}.metric-copy b,.metric-copy small{display:block}.metric-copy b{font-size:13px}.metric-copy strong{display:block;margin-top:4px;font-size:28px;line-height:1}.metric-copy small{margin-top:7px;color:var(--muted);font-size:11px}.metric-copy em{color:var(--color-primary);font-style:normal;font-weight:700}.metric-copy em.down{color:var(--color-success)}.filter-panel{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr)) minmax(180px,1.45fr) auto;gap:10px;margin-bottom:12px;padding:11px 12px;border:1px solid var(--line);border-radius:5px;background:#fff}.filter-panel label{display:grid;gap:5px;font-size:12px}.filter-panel input,.filter-panel select{min-width:0;height:36px;padding:0 9px;border:1px solid #d4dce8;border-radius:4px;background:#fff;color:#344054}.filter-actions{display:flex;align-items:end;gap:7px}.task-list-panel{min-width:0;border:1px solid var(--line);border-radius:5px;background:#fff}.status-tabs{display:flex;gap:28px;overflow:auto;padding:0 14px;border-bottom:1px solid var(--line)}.status-tabs button{min-height:42px;border:0;border-bottom:2px solid transparent;background:transparent;color:#59677c;font-size:13px;white-space:nowrap}.status-tabs button.active{border-bottom-color:var(--red);color:var(--red);font-weight:700}.task-table-wrap{overflow:auto}table{width:100%;min-width:1180px;border-collapse:collapse;table-layout:fixed}th,td{padding:12px 6px;border-bottom:1px solid var(--line);overflow:hidden;text-align:left;text-overflow:ellipsis;font-size:11px;white-space:nowrap}th{background:#f6f8fb;color:#536176;font-weight:700;font-size:11px}th:nth-child(1){width:10%}th:nth-child(2){width:14%}th:nth-child(3){width:7.5%}th:nth-child(4){width:8%}th:nth-child(5){width:6%}th:nth-child(6){width:9.5%}th:nth-child(7){width:7%}th:nth-child(8){width:5%}th:nth-child(9){width:6.5%}th:nth-child(10){width:10.5%}th:nth-child(11){width:6%}th:nth-child(12){width:10%}td:last-child{padding-right:2px;padding-left:2px}td b{font-weight:700}td a{color:var(--color-info);font-weight:700}.operation-cell{min-width:120px;font-size:11px;white-space:nowrap;overflow:visible}.operation-actions{display:flex;align-items:center;gap:8px}.operation-actions a{display:inline-flex;flex:0 0 auto;line-height:1.2}.phase-tag{padding:3px 5px;border-radius:3px;background:#edf4ff;color:var(--color-info)}.progress-cell{display:grid;gap:4px}.progress-cell i{display:block;width:48px;height:4px;border-radius:4px;background:#e5eaf2}.progress-cell em{display:block;height:100%;border-radius:inherit;background:var(--color-info)}.risky{color:var(--color-primary);font-weight:700}.status-badge{padding:3px 5px;border-radius:3px;background:#eef3f7}.status-badge.confirming{color:var(--color-warning);background:#fff2dd}.status-badge.generating{color:var(--color-info);background:#edf4ff}.status-badge.archived{color:var(--color-success);background:#eaf8f0}.status-badge.failed{color:var(--color-primary);background:#fff0f1}.task-empty-state{display:grid;min-height:260px;place-items:center;padding:24px;text-align:center}.empty-icon{font-size:52px;color:#c8d2e0}.task-empty-state h3{margin:5px 0;font-size:19px}.task-empty-state p{max-width:460px;margin:0 0 14px;color:var(--muted);font-size:13px}.task-empty-state .task-button{margin:0 4px}.pagination{display:flex;justify-content:space-between;align-items:center;min-height:52px;padding:0 14px;color:#59677c;font-size:12px}.pagination-controls{display:flex;align-items:center;gap:7px}.pagination button{display:grid;width:29px;height:29px;place-items:center;border:1px solid var(--line);border-radius:3px;background:#fff;color:#5c697d}.pagination button.current{border-color:var(--red);background:var(--red);color:#fff}.pagination button:disabled{opacity:.45}.page-size select,.jump-page input{height:30px;border:1px solid var(--line);border-radius:3px;background:#fff;color:#536176}.page-size select{padding:0 7px}.jump-page{display:flex;align-items:center;gap:5px;white-space:nowrap}.jump-page input{width:38px;padding:0 5px;text-align:center}@media(max-width:1200px){.filter-panel{grid-template-columns:repeat(3,minmax(0,1fr))}.metric-strip{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:1024px){.task-center-layout{grid-template-columns:minmax(0,1fr)}}@media(max-width:760px){.task-center-page{padding:10px}.create-task-tile{min-height:82px}.metric-strip{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.task-metric{min-height:82px;padding:10px}.filter-panel{grid-template-columns:1fr}.filter-actions{align-items:center}.filter-actions .task-button{flex:1}.status-tabs{gap:17px}.task-table-wrap table{min-width:860px}.pagination{align-items:flex-start;flex-direction:column;gap:8px;padding:10px 12px}.pagination-controls{flex-wrap:wrap}.jump-page{margin-left:auto}}@media(max-width:420px){.metric-icon{flex-basis:34px;height:34px}.metric-copy strong{font-size:22px}.task-metric{gap:8px}}
</style>

<style scoped>
.task-list-route {
  width: 100%;
  height: 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.task-list-route :deep(.empty-task-center) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.task-center-page {
  flex: 1;
  min-height: 0;
  padding: var(--ui-space-4);
  overflow: hidden;
}

.task-center-layout {
  height: 100%;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--ui-space-5);
  align-items: stretch;
}

.task-main-column {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.task-list-panel {
  min-height: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.task-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.metric-strip,
.filter-panel {
  gap: var(--ui-space-4);
  margin-bottom: var(--ui-space-4);
}

.task-metric,
.filter-panel {
  padding: var(--ui-space-4);
}

.create-task-tile,
.task-button,
.filter-panel input,
.filter-panel select {
  min-height: var(--ui-control-md);
  font-size: var(--ui-font-xs);
}

.metric-icon {
  flex-basis: var(--ui-icon-lg);
  height: var(--ui-icon-lg);
}

.metric-copy b,
.status-tabs button {
  font-size: var(--ui-font-sm);
}

.metric-copy strong {
  font-size: var(--ui-font-xl);
}

.metric-copy small,
.filter-panel label,
th,
td,
.operation-cell,
.pagination {
  font-size: var(--ui-font-xs);
}

th,
td {
  padding: var(--ui-space-4) var(--ui-space-2);
}

.pagination {
  min-height: calc(var(--ui-control-md) + var(--ui-space-5));
  padding: 0 var(--ui-space-4);
}

.metric-strip {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.filter-panel {
  grid-template-columns:
    minmax(120px, 1fr)
    minmax(120px, 1fr)
    minmax(120px, 1fr)
    minmax(120px, 1fr)
    minmax(190px, 1.35fr)
    156px;
  align-items: stretch;
}

.filter-actions {
  display: grid;
  grid-template-rows: var(--ui-control-md) var(--ui-control-md);
  gap: 8px;
  align-items: stretch;
  align-self: stretch;
}

.create-task-inline {
  display: inline-flex;
  min-width: 0;
  min-height: var(--ui-control-md);
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid var(--red);
  border-radius: 4px;
  background: #fff;
  color: var(--red);
  font-size: var(--ui-font-xs);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.create-task-inline:hover {
  background: #fff6f6;
}

.query-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.query-actions .task-button {
  width: 100%;
  justify-content: center;
}

@media (max-width: 1439px) {
  .metric-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filter-panel {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filter-actions {
    grid-column: span 3;
    grid-template-columns: minmax(160px, 1fr) auto;
    grid-template-rows: var(--ui-control-md);
  }

  .query-actions {
    min-width: 156px;
  }
}

@media (max-width: 1024px) {
  .task-center-page {
    overflow: auto;
  }

  .task-center-layout {
    height: auto;
    grid-template-columns: minmax(0, 1fr);
  }

}

@media (max-width: 760px) {
  .metric-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-panel {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    grid-column: auto;
    grid-template-columns: 1fr;
    grid-template-rows: var(--ui-control-md) var(--ui-control-md);
  }

  .query-actions {
    min-width: 0;
  }
}
</style>
