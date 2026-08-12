<template>
  <div class="expense-analysis-dashboard route-fill-page" aria-label="费用分析看板">
    <nav class="top-tabs" aria-label="费用分析类型">
      <button
        v-for="tab in pageTabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeTab === tab.id }"
        @click="setActiveTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section v-if="activeTab === 'summary'" class="summary-view" aria-label="费用审计综合分析">
      <section class="filter-panel" aria-label="费用审计筛选">
        <label v-for="filter in filters" :key="filter.label" :class="filter.className">
          <span>{{ filter.label }}</span>
          <select v-if="filter.type === 'select'" :aria-label="filter.label">
            <option>{{ filter.value }}</option>
          </select>
          <input v-else :aria-label="filter.label" :placeholder="filter.value" />
        </label>
        <div class="filter-actions">
          <button class="primary" type="button">查询</button>
          <button type="button">重置</button>
        </div>
      </section>

      <section class="metric-grid" aria-label="费用审计指标">
        <article v-for="metric in metrics" :key="metric.label" class="metric-card" :class="metric.tone">
          <span class="metric-icon"><FontAwesomeIcon :icon="metric.icon" /></span>
          <div>
            <p>{{ metric.label }}</p>
            <strong>{{ metric.value }}</strong>
          </div>
        </article>
      </section>

      <section class="chart-grid" aria-label="费用审计图表">
        <article class="chart-card trend-card">
          <div class="chart-title">
            <h2>预算执行趋势</h2>
            <span>单位：万元</span>
          </div>
          <div class="trend-legend">
            <span><i class="blue"></i>实际金额</span>
            <span><i class="orange"></i>预算金额</span>
            <span><i class="red"></i>预算使用率</span>
          </div>
          <div class="trend-plot">
            <div class="trend-scale"><span>700</span><span>600</span><span>500</span><span>400</span><span>300</span><span>200</span><span>100</span><span>0</span></div>
            <div class="trend-bars">
              <div v-for="item in budgetTrend" :key="item.month" class="trend-month">
                <div class="bar-pair">
                  <i class="bar actual" :style="{ height: `${item.actual}%` }"></i>
                  <i class="bar budget" :style="{ height: `${item.budget}%` }"></i>
                </div>
                <span>{{ item.month }}</span>
              </div>
              <svg class="trend-line" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="36,70 150,52 264,50" fill="none" stroke="#ff3b30" stroke-width="3" />
              </svg>
            </div>
          </div>
        </article>

        <article class="chart-card">
          <div class="chart-title"><h2>费用类别结构</h2></div>
          <div class="donut-layout">
            <div class="donut category-donut"><span><b>1,285.62万</b><br />费用总额</span></div>
            <ul class="chart-list">
              <li v-for="item in categoryStructure" :key="item.name"><i :style="{ background: item.color }"></i><span>{{ item.name }}</span></li>
            </ul>
          </div>
        </article>

        <article class="chart-card rank-card">
          <div class="chart-title"><h2>人均费用排行（TOP10）</h2><span>单位：元</span></div>
          <ul class="rank-list">
            <li v-for="item in employeeRank" :key="item.name">
              <span>{{ item.name }}</span>
              <i><b :style="{ width: `${item.percent}%` }"></b></i>
            </li>
          </ul>
        </article>

        <article class="chart-card">
          <div class="chart-title"><h2>异常类型分布</h2></div>
          <div class="donut-layout">
            <div class="donut anomaly-donut"><span><b>125.68万</b><br />异常总额</span></div>
            <ul class="chart-list">
              <li v-for="item in anomalyTypes" :key="item.name"><i :style="{ background: item.color }"></i><span>{{ item.name }}</span></li>
            </ul>
          </div>
        </article>

        <article class="chart-card wide-chart anomaly-trend-card">
          <div class="chart-title">
            <h2>异常监控趋势</h2>
            <div class="trend-legend">
              <span><i class="blue"></i>异常笔数</span>
              <span><i class="orange"></i>异常金额</span>
              <span><i class="red"></i>同比金额</span>
              <em>万元</em>
            </div>
          </div>
          <div class="anomaly-trend">
            <div class="trend-scale"><span>30</span><span>25</span><span>20</span><span>15</span><span>10</span><span>5</span><span>0</span></div>
            <div class="trend-bars">
              <div v-for="item in anomalyTrend" :key="item.month" class="trend-month">
                <div class="bar-pair">
                  <i class="bar actual" :style="{ height: `${item.count}%` }"></i>
                  <i class="bar budget" :style="{ height: `${item.amount}%` }"></i>
                </div>
                <span>{{ item.month }}</span>
              </div>
              <svg class="trend-line" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="36,114 150,114 264,10" fill="none" stroke="#ff3b30" stroke-width="3" />
              </svg>
            </div>
          </div>
        </article>

        <article class="chart-card compact-donut">
          <div class="chart-title"><h2>异常类型占比</h2></div>
          <div class="donut-layout">
            <div class="donut anomaly-share-donut"><span><b>27 笔</b><br />异常总笔数</span></div>
            <ul class="chart-list">
              <li v-for="item in anomalyShare" :key="item.name"><i :style="{ background: item.color }"></i><span>{{ item.name }}</span><b>{{ item.value }}</b></li>
            </ul>
          </div>
        </article>

        <article class="chart-card rule-rank-card">
          <div class="chart-title"><h2>规则命中排行（TOP10）</h2><span>单位：笔</span></div>
          <ul class="horizontal-rank">
            <li v-for="item in ruleRanking" :key="item.name">
              <span>{{ item.name }}</span>
              <i><b :style="{ width: `${item.percent}%` }"></b></i>
            </li>
          </ul>
        </article>
      </section>
    </section>

    <section v-else class="trend-compact-view" aria-label="费用趋势分析">
      <section class="trend-compact-filter" aria-label="费用趋势筛选">
        <label v-for="field in trendFilterFields" :key="field.key">
          <span>{{ field.label }}</span>
          <select>
            <option v-for="option in field.options" :key="option">{{ option }}</option>
          </select>
        </label>
        <div class="filter-actions">
          <button class="primary" type="button">查询</button>
          <button type="button">重置</button>
        </div>
      </section>

      <section class="trend-metrics" aria-label="费用趋势指标">
        <article v-for="metric in trendMetricCards" :key="metric.key" class="metric-card" :class="metric.tone">
          <span class="metric-icon">{{ metric.icon }}</span>
          <div>
            <p>{{ metric.label }}</p>
            <strong>{{ metric.value }} <small>{{ metric.unit }}</small></strong>
          </div>
        </article>
      </section>

      <section class="trend-compact-charts" aria-label="费用趋势核心图表">
        <article class="trend-panel">
          <h2>费用月度趋势与预算对比</h2>
          <div class="mini-bars">
            <span v-for="item in trend.monthlyTrend" :key="item.month">
              <i class="actual" :style="{ height: `${item.actual / monthlyMax * 100}%` }"></i>
              <i class="budget" :style="{ height: `${item.budget / monthlyMax * 100}%` }"></i>
              <b>{{ item.month.slice(5) }}</b>
            </span>
          </div>
        </article>
        <article class="trend-panel">
          <h2>费用类别趋势</h2>
          <div class="mini-stacks">
            <span v-for="item in trend.categoryTrend" :key="item.month">
              <i class="business" :style="{ height: `${item.business / categoryMax * 100}%` }"></i>
              <i class="marketing" :style="{ height: `${item.marketing / categoryMax * 100}%` }"></i>
              <i class="travel" :style="{ height: `${item.travel / categoryMax * 100}%` }"></i>
              <i class="meeting" :style="{ height: `${item.meeting / categoryMax * 100}%` }"></i>
              <b>{{ item.month.slice(5) }}</b>
            </span>
          </div>
        </article>
        <article class="trend-panel">
          <div class="chart-title"><h2>部门费用排行（TOP10）</h2><span>单位：元</span></div>
          <ul class="compact-rank">
            <li v-for="item in trend.departmentRanking.slice(0, 8)" :key="item.department">
              <span>{{ item.department }}</span>
              <i><b :style="{ width: `${item.amount / departmentMax * 100}%` }"></b></i>
            </li>
          </ul>
        </article>
        <article class="trend-panel">
          <h2>员工费用离群分析</h2>
          <div class="mini-scatter">
            <i v-for="item in trend.employeeOutliers" :key="item.employee" :class="item.level" :style="{ left: `clamp(8px, ${item.amount / 5 * 100}%, calc(100% - 8px))`, bottom: `clamp(8px, ${item.frequency / 30 * 100}%, calc(100% - 8px))` }"></i>
          </div>
        </article>
      </section>

      <section class="trend-compact-bottom" aria-label="费用趋势摘要和明细">
        <article class="trend-panel warning-table">
          <h2>趋势预警摘要</h2>
          <table>
            <thead><tr><th>预警类型</th><th>预警项数</th><th>本期金额（元）</th><th>环比</th><th>主要影响部门</th></tr></thead>
            <tbody><tr v-for="row in trend.warningSummary" :key="row.type"><td>{{ row.type }}</td><td>{{ row.count }}</td><td>{{ row.amount }}</td><td class="up">{{ row.mom }}</td><td>{{ row.owner }}</td></tr></tbody>
          </table>
        </article>
        <article class="trend-panel detail-table">
          <h2>费用趋势明细</h2>
          <table>
            <thead><tr><th>期间</th><th>费用类别</th><th>部门</th><th>金额（元）</th><th>预算偏差率</th><th>趋势判断</th></tr></thead>
            <tbody><tr v-for="row in trend.detailRows" :key="`${row.period}-${row.category}-${row.department}`"><td>{{ row.period }}</td><td>{{ row.category }}</td><td>{{ row.department }}</td><td>{{ row.amount }}</td><td class="up">{{ row.budgetRate }}</td><td>{{ row.judgement }}</td></tr></tbody>
          </table>
        </article>
      </section>
    </section>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChartLine, faExclamationCircle, faReceipt } from '@fortawesome/free-solid-svg-icons';

const store = inject('store');
const route = useRoute();
const router = useRouter();
const pageTabs = [
  { id: 'summary', label: '综合分析' },
  { id: 'trend', label: '趋势分析' }
];

const activeTab = ref(resolveTab(route));

watch(
  () => route.query.tab,
  () => {
    activeTab.value = resolveTab(route);
  }
);

function resolveTab(currentRoute) {
  return currentRoute.query.tab === 'trend' ? 'trend' : 'summary';
}

function setActiveTab(tab) {
  activeTab.value = tab;
  router.replace({ path: '/expense/audit/overview', query: tab === 'trend' ? { ...route.query, tab } : omitTab(route.query) });
}

function omitTab(query) {
  const nextQuery = { ...query };
  delete nextQuery.tab;
  delete nextQuery.panel;
  delete nextQuery.dimension;
  delete nextQuery.name;
  return nextQuery;
}

const filters = [
  { label: '被审计单位', value: '上海分公司', type: 'select' },
  { label: '审计期间', value: '2025年Q1（2025-01 ~ 2025-03）', type: 'select' },
  { label: '部门', value: '全部', type: 'select' },
  { label: '员工', value: '请输入员工姓名 / 工号', type: 'input' }
];

const metrics = [
  { label: '费用总额', value: '12,856,230.45 元', icon: faReceipt, tone: 'red' },
  { label: '预算使用率', value: '82.45%', icon: faChartLine, tone: 'blue' },
  { label: '异常金额', value: '1,256,780.32 元', icon: faChartLine, tone: 'orange' },
  { label: '异常笔数', value: '256 笔', icon: faReceipt, tone: 'green' },
  { label: '高风险异常数', value: '48 笔', icon: faExclamationCircle, tone: 'red' }
];

const budgetTrend = [
  { month: '2025-01', actual: 55, budget: 70 },
  { month: '2025-02', actual: 63, budget: 78 },
  { month: '2025-03', actual: 68, budget: 88 }
];

const anomalyTrend = [
  { month: '2025-01', count: 0, amount: 0 },
  { month: '2025-02', count: 0, amount: 0 },
  { month: '2025-03', count: 74, amount: 70 }
];

const categoryStructure = [
  { name: '差旅费', color: '#ff3b30' },
  { name: '业务招待费', color: '#ff9b50' },
  { name: '办公费', color: '#ffc263' },
  { name: '会议费', color: '#ffdf9b' },
  { name: '培训费', color: '#9cc9ff' },
  { name: '其他', color: '#6b95f6' }
];

const employeeRank = [
  { name: '张伟', percent: 100 },
  { name: '李娜', percent: 86 },
  { name: '王磊', percent: 74 },
  { name: '刘洋', percent: 67 },
  { name: '陈晨', percent: 63 },
  { name: '赵敏', percent: 58 },
  { name: '周强', percent: 54 },
  { name: '吴迪', percent: 50 },
  { name: '孙悦', percent: 47 },
  { name: '黄凯', percent: 43 }
];

const anomalyTypes = [
  { name: '超预算未审批', color: '#ff3b30' },
  { name: '费用违规报销', color: '#ff9b50' },
  { name: '疑似不合规报销', color: '#ffc263' },
  { name: '重复报销', color: '#ffdf9b' },
  { name: '其他', color: '#9cc9ff' }
];

const anomalyShare = [
  { name: '超预算未审批', value: '22.2%', color: '#ff3b30' },
  { name: '费用违规报销', value: '18.5%', color: '#ff9b50' },
  { name: '疑似不合规报销', value: '22.2%', color: '#ffc263' },
  { name: '重复报销', value: '22.2%', color: '#ffdf9b' },
  { name: '其他', value: '14.8%', color: '#9cc9ff' }
];

const ruleRanking = [
  { name: '超预算未审批', percent: 100 },
  { name: '疑似不合规报销', percent: 100 },
  { name: '重复报销识别', percent: 100 },
  { name: '费用违规报销', percent: 82 },
  { name: '其他费用异常', percent: 67 }
];

const trend = computed(() => store.db.expenseTrendAnalysis);
const trendFilterFields = computed(() => [
  { key: 'organization', label: '被审计单位', options: trend.value.filters.organizations },
  { key: 'period', label: '对比周期', options: trend.value.filters.periods },
  { key: 'category', label: '费用类别', options: trend.value.filters.categories },
  { key: 'department', label: '部门', options: trend.value.filters.departments },
  { key: 'budgetScope', label: '预算口径', options: trend.value.filters.budgetScopes },
  { key: 'source', label: '数据来源', options: trend.value.filters.sources }
]);
const trendMetricCards = computed(() => trend.value.metrics.map((metric, index) => ({
  ...metric,
  icon: ['¥', '%', '↑', '率', '!'][index] || '•'
})));
const monthlyMax = computed(() => Math.max(...trend.value.monthlyTrend.flatMap((item) => [item.actual, item.budget])));
const categoryMax = computed(() => Math.max(...trend.value.categoryTrend.map((item) => item.business + item.marketing + item.travel + item.meeting)));
const departmentMax = computed(() => Math.max(...trend.value.departmentRanking.map((item) => item.amount)));
</script>

<style scoped>
.expense-analysis-dashboard {
  display: grid;
  height: 0;
  min-height: 0;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 8px;
  overflow: hidden;
  padding: 8px 10px 10px;
  background: #f6f7fb;
  color: #0f172a;
}

.top-tabs,
.filter-panel,
.metric-card,
.chart-card {
  box-sizing: border-box;
  border: 1px solid #cfd8e8;
  background: #fff;
}

.top-tabs {
  display: flex;
  height: 38px;
  align-items: stretch;
  gap: 22px;
  padding: 0 28px;
}

.top-tabs button {
  position: relative;
  border: 0;
  background: transparent;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
}

.top-tabs button.active {
  color: var(--color-primary);
}

.top-tabs button.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: var(--color-primary);
  content: "";
}

.summary-view {
  display: grid;
  min-height: 0;
  grid-template-rows: auto auto minmax(0, 1fr);
  overflow: hidden;
}

:deep(.expense-trend-page) {
  height: 100%;
}

.trend-compact-view {
  display: grid;
  min-height: 0;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: 8px;
  overflow: hidden;
}

.trend-compact-filter {
  display: grid;
  grid-template-columns: minmax(130px, .92fr) minmax(220px, 1.45fr) repeat(4, minmax(112px, .85fr)) auto;
  gap: 8px;
  align-items: end;
  padding: 8px 10px;
  border: 1px solid #cfd8e8;
  background: #fff;
}

.trend-compact-filter label {
  display: grid;
  gap: 4px;
  min-width: 0;
  color: #1f2a44;
  font-size: 12px;
}

.trend-compact-filter select {
  width: 100%;
  height: 28px;
  border: 1px solid #bcc5d2;
  border-radius: 0;
  padding: 0 8px;
  background: #fff;
  color: #111827;
  font-size: 12px;
}

.trend-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.trend-compact-charts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.trend-panel {
  min-width: 0;
  height: clamp(150px, calc((100vh - 442px) / 2), 226px);
  overflow: hidden;
  border: 1px solid #cfd8e8;
  padding: 8px 10px;
  background: #fff;
}

.trend-panel h2 {
  margin: 0 0 6px;
  font-size: 13px;
}

.mini-bars,
.mini-stacks,
.mini-scatter {
  height: calc(100% - 24px);
  border-bottom: 1px solid #dce3eb;
  background: repeating-linear-gradient(to top, #fff 0, #fff 25px, #edf1f5 26px);
}

.mini-bars,
.mini-stacks {
  display: flex;
  align-items: end;
  justify-content: space-around;
  padding: 8px 10px 20px;
}

.mini-bars span,
.mini-stacks span {
  position: relative;
  display: flex;
  height: 100%;
  align-items: end;
  gap: 4px;
}

.mini-bars i {
  width: 10px;
  border-radius: 2px 2px 0 0;
}

.mini-bars .actual { background: #5a82f0; }
.mini-bars .budget { background: #ff9b50; }

.mini-bars b,
.mini-stacks b {
  position: absolute;
  bottom: -18px;
  left: 50%;
  color: #667085;
  font-size: 10px;
  font-weight: 500;
  transform: translateX(-50%);
}

.mini-stacks span {
  width: 24px;
  flex-direction: column-reverse;
  gap: 0;
}

.mini-stacks i {
  width: 100%;
}

.business { background: #5a82f0; }
.marketing { background: #2f7b5f; }
.travel { background: #ffc263; }
.meeting { background: #9cc9ff; }

.compact-rank {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 2px 0 0;
  list-style: none;
}

.compact-rank li {
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr);
  gap: 6px;
  align-items: center;
  color: #344054;
  font-size: 11px;
}

.compact-rank span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-rank i {
  height: 8px;
  overflow: hidden;
  border-radius: 2px;
  background: #edf1f5;
}

.compact-rank b {
  display: block;
  height: 100%;
  background: #5067f2;
}

.mini-scatter {
  position: relative;
  overflow: hidden;
}

.mini-scatter i {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translate(-50%, 50%);
}

.mini-scatter .正常 { background: #2f7b5f; }
.mini-scatter .关注 { width: 10px; height: 10px; background: #ffc263; }
.mini-scatter .异常 { width: 13px; height: 13px; background: #cf2d2d; }

.trend-compact-bottom {
  display: grid;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 8px;
  overflow: hidden;
}

.trend-compact-bottom .trend-panel {
  height: auto;
  min-height: 0;
}

.trend-compact-bottom table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.trend-compact-bottom th,
.trend-compact-bottom td {
  height: 25px;
  overflow: hidden;
  border: 1px solid #edf0f4;
  padding: 0 6px;
  color: #344054;
  font-size: 11px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trend-compact-bottom th {
  background: #f7f8fa;
  font-weight: 700;
}

.up {
  color: #cf2d2d;
}

.filter-panel {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) minmax(240px, 1.6fr) minmax(130px, .8fr) minmax(220px, 1.25fr) auto;
  gap: 8px;
  align-items: end;
  padding: 8px 10px;
}

.filter-panel label {
  display: grid;
  gap: 5px;
  min-width: 0;
  color: #1f2a44;
  font-size: 12px;
}

.filter-panel select,
.filter-panel input {
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

.filter-actions {
  display: flex;
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

.metric-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
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

.metric-card.red .metric-icon { border: 1px solid #d94c56; background: #fff5f5; color: #b22b38; }
.metric-card.blue .metric-icon { border: 1px solid #4b87d8; background: #eff6ff; color: #2368af; }
.metric-card.orange .metric-icon { border: 1px solid #e7a453; background: #fff7ed; color: #b36a16; }
.metric-card.green .metric-icon { border: 1px solid #4aa386; background: #ecfdf5; color: #28775f; }

.metric-card p {
  margin: 0 0 3px;
  color: #4b5563;
  font-size: 12px;
}

.metric-card strong {
  display: block;
  overflow: hidden;
  font-size: 17px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(0, .95fr) minmax(0, 1.02fr) minmax(0, .95fr);
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 8px;
  min-height: 0;
  margin-top: 8px;
  overflow: hidden;
}

.chart-card {
  min-width: 0;
  height: auto;
  min-height: 0;
  padding: 9px 10px 8px;
  overflow: hidden;
}

.wide-chart {
  grid-column: span 2;
}

.chart-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 5px;
}

.chart-title h2 {
  margin: 0;
  font-size: 13px;
}

.chart-title span,
.trend-legend,
.chart-title em {
  color: #40506a;
  font-size: 12px;
  font-style: normal;
}

.trend-legend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-legend i,
.chart-list i {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  vertical-align: -1px;
}

.trend-legend .blue { background: #5a82f0; }
.trend-legend .orange { background: #ff9b50; }
.trend-legend .red { background: #ff3b30; }

.trend-plot,
.anomaly-trend {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  height: calc(100% - 38px);
}

.trend-scale {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #8a93a3;
  font-size: 11px;
  text-align: right;
}

.trend-bars {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: end;
  padding: 10px 14px 18px;
  border-bottom: 1px solid #dce3eb;
  background: repeating-linear-gradient(to bottom, #fff 0, #fff 36px, #edf1f5 37px);
}

.trend-month {
  display: grid;
  justify-items: center;
  gap: 5px;
  color: #7a8290;
}

.bar-pair {
  display: flex;
  height: 100%;
  align-items: end;
  gap: 8px;
}

.bar {
  width: 16px;
  border-radius: 1px 1px 0 0;
}

.bar.actual { background: #5a82f0; }
.bar.budget { background: #ff9b50; }

.trend-line {
  position: absolute;
  right: 12px;
  bottom: 42px;
  left: 12px;
  width: calc(100% - 24px);
  height: 96px;
  pointer-events: none;
}

.donut-layout {
  display: grid;
  grid-template-columns: minmax(116px, 1fr) minmax(96px, .75fr);
  gap: 8px;
  align-items: center;
  height: calc(100% - 28px);
}

.donut {
  position: relative;
  display: grid;
  width: min(142px, 100%);
  aspect-ratio: 1;
  margin: auto;
  place-items: center;
  border-radius: 50%;
}

.category-donut {
  background: conic-gradient(#ff3b30 0 30%, #ff9b50 30% 48%, #ffc263 48% 68%, #ffdf9b 68% 78%, #9cc9ff 78% 88%, #6b95f6 88% 100%);
}

.anomaly-donut {
  background: conic-gradient(#ff3b30 0 35%, #ff9b50 35% 60%, #ffc263 60% 78%, #ffdf9b 78% 90%, #9cc9ff 90% 100%);
}

.anomaly-share-donut {
  background: conic-gradient(#ff3b30 0 22%, #ff9b50 22% 41%, #ffc263 41% 63%, #ffdf9b 63% 85%, #9cc9ff 85% 100%);
}

.donut::after {
  position: absolute;
  inset: 30%;
  border-radius: 50%;
  background: #fff;
  content: "";
}

.donut span {
  position: relative;
  z-index: 1;
  color: #1f2937;
  font-size: 11px;
  line-height: 1.5;
  text-align: center;
}

.donut b {
  font-size: 20px;
}

.chart-list {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.chart-list li {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) auto;
  align-items: center;
  color: #344054;
  font-size: 11px;
}

.chart-list span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-list,
.horizontal-rank {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 10px 12px 0 18px;
  list-style: none;
}

.rank-list li,
.horizontal-rank li {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  color: #6b7280;
  font-size: 11px;
}

.rank-list i,
.horizontal-rank i {
  height: 15px;
  overflow: hidden;
  background: linear-gradient(to right, transparent 0, transparent calc(100% - 1px), #edf1f5 calc(100% - 1px));
}

.rank-list b,
.horizontal-rank b {
  display: block;
  height: 100%;
  background: #5067f2;
}

.anomaly-trend-card .bar-pair {
  height: 100%;
}

.compact-donut .donut-layout {
  grid-template-columns: minmax(120px, 1fr) minmax(124px, 1fr);
}

.compact-donut .donut {
  width: min(144px, 100%);
}

.rule-rank-card .horizontal-rank {
  gap: 12px;
  padding-top: 14px;
}

.rule-rank-card .horizontal-rank li {
  grid-template-columns: 110px minmax(0, 1fr);
}

@media (max-width: 1180px) {
  .filter-panel,
  .trend-compact-filter {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-actions {
    justify-content: flex-end;
  }

  .metric-grid,
  .chart-grid,
  .trend-metrics,
  .trend-compact-charts,
  .trend-compact-bottom {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-grid {
    grid-template-rows: auto;
    overflow: auto;
  }

  .wide-chart {
    grid-column: span 1;
  }
}

@media (max-width: 900px) {
  .expense-analysis-dashboard {
    height: auto;
    min-height: calc(100dvh - 58px);
    overflow: auto;
  }

  .metric-grid,
  .chart-grid,
  .filter-panel,
  .trend-compact-filter,
  .trend-metrics,
  .trend-compact-charts,
  .trend-compact-bottom {
    grid-template-columns: 1fr;
  }

  .metric-card strong {
    white-space: normal;
  }
}
</style>
