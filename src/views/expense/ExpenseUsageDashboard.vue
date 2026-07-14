<template>
  <div class="expense-trend-page route-fill-page">
    <main class="trend-main">
      <section class="trend-filter" aria-label="费用趋势分析筛选">
        <form class="trend-filter-row" @submit.prevent="queryTrend" @reset.prevent="resetFilters">
          <label v-for="field in filterFields" :key="field.key">
            <span>{{ field.label }}</span>
            <select v-model="filters[field.key]">
              <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>
          <div class="filter-actions">
            <button class="primary" type="submit">查询</button>
            <button type="reset">重置</button>
            <button class="text-btn" type="button" @click="store.setNotice('筛选区已收起到当前查询条件。')">收起 ^</button>
          </div>
        </form>
      </section>

      <section class="metric-row" aria-label="本期费用总额、环比增长、同比增长、预算使用率、趋势预警">
        <article v-for="metric in trend.metrics" :key="metric.key" :class="`metric-card ${metric.tone}`">
          <i aria-hidden="true">{{ metric.icon }}</i>
          <div><p>{{ metric.label }}</p><strong>{{ metric.value }} <small>{{ metric.unit }}</small></strong><em>{{ metric.hint }} <span v-if="metric.trend">{{ metric.trend }}</span></em></div>
        </article>
      </section>

      <section class="chart-row" aria-label="费用趋势图表区">
        <article class="chart-panel monthly-chart">
          <h2>费用月度趋势与预算对比</h2>
          <div class="bar-line-chart">
            <div v-for="item in trend.monthlyTrend" :key="item.month" class="month-group">
              <span class="bar actual" :style="{ height: `${item.actual / monthlyMax * 116}px` }"></span>
              <span class="bar budget" :style="{ height: `${item.budget / monthlyMax * 116}px` }"></span>
              <b :style="{ bottom: `${item.growth / 30 * 116 + 22}px` }"></b>
              <small>{{ item.month }}</small>
            </div>
          </div>
        </article>
        <article class="chart-panel category-chart">
          <h2>费用类别趋势</h2>
          <div class="stacked-chart">
            <div v-for="item in trend.categoryTrend" :key="item.month" class="stack">
              <span class="business" :style="{ height: `${item.business / categoryMax * 126}px` }"></span>
              <span class="marketing" :style="{ height: `${item.marketing / categoryMax * 126}px` }"></span>
              <span class="travel" :style="{ height: `${item.travel / categoryMax * 126}px` }"></span>
              <span class="meeting" :style="{ height: `${item.meeting / categoryMax * 126}px` }"></span>
              <small>{{ item.month }}</small>
            </div>
          </div>
        </article>
        <article class="chart-panel rank-chart">
          <header><h2>部门费用排行（TOP10）</h2><span>单位：元</span></header>
          <div class="rank-list">
            <div v-for="item in trend.departmentRanking" :key="item.department">
              <span>{{ item.department }}</span><b><i :style="{ width: `${item.amount / departmentMax * 100}%` }"></i></b><em>{{ item.amount.toLocaleString('zh-CN') }}</em>
            </div>
          </div>
        </article>
        <article class="chart-panel scatter-chart">
          <h2>员工费用离群分析</h2>
          <div class="scatter-box">
            <i v-for="item in trend.employeeOutliers" :key="item.employee" :class="item.level" :style="{ left: `${item.amount / 5 * 100}%`, bottom: `${item.frequency / 30 * 100}%` }" :title="`${item.employee} ${item.level}`"></i>
          </div>
        </article>
      </section>

      <section class="summary-row" aria-label="趋势摘要">
        <article class="summary-panel warning-summary">
          <h2>趋势预警摘要</h2>
          <div class="table-scroll"><table><thead><tr><th scope="col">预警类型</th><th scope="col">预警项数</th><th scope="col">本期金额（元）</th><th scope="col">环比变化</th><th scope="col">同比变化</th><th scope="col">主要影响部门</th><th scope="col">预警说明</th></tr></thead><tbody><tr v-for="row in trend.warningSummary" :key="row.type"><td>{{ row.type }}</td><td>{{ row.count }}</td><td>{{ row.amount }}</td><td class="up">{{ row.mom }}</td><td class="up">{{ row.yoy }}</td><td>{{ row.owner }}</td><td>{{ row.note }}</td></tr></tbody></table></div>
        </article>
        <article class="summary-panel structure-summary">
          <h2>费用结构变化（占比%）</h2>
          <div class="table-scroll"><table><thead><tr><th scope="col">类别</th><th scope="col">上期占比</th><th scope="col">本期占比</th><th scope="col">变化（pp）</th></tr></thead><tbody><tr v-for="row in trend.structureChange" :key="row.category"><td>{{ row.category }}</td><td>{{ row.last }}</td><td>{{ row.current }}</td><td :class="signedClass(row.change)">{{ row.change }}</td></tr></tbody></table></div>
        </article>
      </section>

      <section class="trend-detail" aria-label="费用趋势明细">
        <nav class="tabs" aria-label="费用趋势明细分类"><button v-for="tab in tabs" :key="tab" :class="{ active: activeTab === tab }" type="button" @click="activeTab = tab">{{ tab }}</button></nav>
        <div class="detail-scroll"><table><thead><tr><th scope="col">期间</th><th scope="col">费用类别</th><th scope="col">部门</th><th scope="col">金额（元）</th><th scope="col">环比</th><th scope="col">同比</th><th scope="col">预算偏差（元）</th><th scope="col">预算偏差率</th><th scope="col">趋势判断</th><th scope="col">操作</th></tr></thead><tbody>
          <tr v-for="row in trend.detailRows" :key="`${row.period}-${row.category}-${row.department}`">
            <td>{{ row.period }}</td><td>{{ row.category }}</td><td>{{ row.department }}</td><td>{{ row.amount }}</td><td :class="signedClass(row.mom)">{{ row.mom }}</td><td :class="signedClass(row.yoy)">{{ row.yoy }}</td><td :class="signedClass(row.budgetDiff)">{{ row.budgetDiff }}</td><td :class="signedClass(row.budgetRate)">{{ row.budgetRate }}</td><td :class="judgementClass(row.judgement)">{{ row.judgement }}</td>
            <td class="row-actions"><button type="button" @click="store.setNotice(`${row.department} ${row.category} 明细已定位。`)">查看明细</button><button type="button" @click="drilldown(row)">下钻分析</button><button type="button" @click="store.setNotice(`${row.department} ${row.category} 趋势结论已加入报告草稿。`)">加入报告</button></td>
          </tr>
        </tbody></table></div>
        <footer class="pager"><span>共 45 条</span><div><button disabled type="button">&lt;</button><button v-for="page in [1,2,3,4,5]" :key="page" :class="{ active: page === 5 }" type="button">{{ page }}</button><button type="button">&gt;</button></div><label>10 条/页</label><label>跳至 <input value="5" aria-label="跳至页码" /> 页</label></footer>
      </section>
    </main>

    <aside class="insight-rail" aria-labelledby="trend-insight-title">
      <header><h2 id="trend-insight-title">趋势分析洞察</h2><button aria-label="关闭洞察栏" type="button">×</button></header>
      <section><h3>关键结论</h3><ul><li v-for="item in trend.insights.conclusions" :key="item">{{ item }}</li></ul></section>
      <section><h3>异常波动原因</h3><ul><li v-for="item in trend.insights.causes" :key="item">{{ item }}</li></ul></section>
      <section><h3>预算偏差说明</h3><ul><li v-for="item in trend.insights.budgetNotes" :key="item">{{ item }}</li></ul></section>
      <section><h3>预测结果（未来 3 个月）</h3><table><thead><tr><th scope="col">期间</th><th scope="col">预测金额（元）</th><th scope="col">环比趋势</th><th scope="col">预算使用率预测</th></tr></thead><tbody><tr v-for="row in trend.forecast" :key="row.period"><td>{{ row.period }}</td><td>{{ row.expected }}</td><td class="up">↑</td><td>{{ row.usage }}</td></tr></tbody></table></section>
      <section><h3>建议关注点</h3><ul><li v-for="item in trend.insights.recommendations" :key="item">{{ item }}</li></ul></section>
      <footer class="insight-actions">
        <button class="primary action-half" type="button" @click="router.push('/expense/usage/report')">生成趋势报告</button>
        <button class="outline action-half" type="button" @click="store.setNotice('趋势分析结论已加入本次审计重点清单。')">加入审计重点</button>
        <button class="export action-full" type="button" @click="exportExcel"><span aria-hidden="true">↓</span> 导出 Excel</button>
      </footer>
    </aside>
  </div>
</template>

<script setup>
import { computed, inject, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = inject('store');
const router = useRouter();
const trend = computed(() => store.db.expenseTrendAnalysis);
const filters = reactive({ organization: '上海分公司', period: '本年累计（2025-01 ~ 2025-04）', category: '全部', department: '全部', budgetScope: '年度预算', source: '全部' });
const activeTab = ref('费用趋势明细');
const tabs = ['费用趋势明细', '类别对比', '部门对比', '员工排行', '预算偏差', '预测建议'];
const filterFields = computed(() => [
  { key: 'organization', label: '被审计单位', options: trend.value.filters.organizations },
  { key: 'period', label: '对比周期', options: trend.value.filters.periods },
  { key: 'category', label: '费用类别', options: trend.value.filters.categories },
  { key: 'department', label: '部门', options: trend.value.filters.departments },
  { key: 'budgetScope', label: '预算口径', options: trend.value.filters.budgetScopes },
  { key: 'source', label: '数据来源', options: trend.value.filters.sources }
]);
const monthlyMax = computed(() => Math.max(...trend.value.monthlyTrend.flatMap((item) => [item.actual, item.budget])));
const categoryMax = computed(() => Math.max(...trend.value.categoryTrend.map((item) => item.business + item.marketing + item.travel + item.meeting)));
const departmentMax = computed(() => Math.max(...trend.value.departmentRanking.map((item) => item.amount)));

function signedClass(value) { return String(value).trim().startsWith('-') ? 'down' : 'up'; }
function judgementClass(value) { return value === '下降' ? 'down' : value === '平稳' ? 'stable' : 'up'; }
function queryTrend() { store.setNotice(`已按 ${filters.organization} / ${filters.period} 刷新趋势分析。`); }
function resetFilters() { Object.assign(filters, { organization: '上海分公司', period: '本年累计（2025-01 ~ 2025-04）', category: '全部', department: '全部', budgetScope: '年度预算', source: '全部' }); store.setNotice('费用趋势筛选条件已重置。'); }
function drilldown(row) { router.push(`/expense/usage/drilldown?dimension=${encodeURIComponent(row.category)}&name=${encodeURIComponent(row.department)}`); }
function exportExcel() {
  const lines = [['期间', '费用类别', '部门', '金额', '环比', '同比', '预算偏差', '预算偏差率', '趋势判断'].join(','), ...trend.value.detailRows.map((row) => [row.period, row.category, row.department, row.amount, row.mom, row.yoy, row.budgetDiff, row.budgetRate, row.judgement].join(','))];
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = '费用趋势分析明细.csv';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  store.setNotice('费用趋势分析明细已导出。');
}
</script>

<style scoped>
.expense-trend-page{display:grid;grid-template-columns:minmax(0,1fr) 345px;gap:8px;align-items:start;min-height:calc(100vh - 58px);padding-top:4px;color:#222831}
.trend-main{display:grid;grid-template-columns:minmax(0,1fr);min-width:0;gap:8px}.trend-filter,.metric-card,.chart-row,.summary-panel,.trend-detail,.insight-rail{border:1px solid #e2e6ec;background:#fff}
.trend-filter{min-height:54px;padding:8px 10px 7px}
.trend-filter-row{display:grid;grid-template-columns:132px minmax(174px,1.35fr) repeat(4,minmax(110px,1fr)) auto;gap:12px 16px;align-items:end}
.trend-filter-row label{display:grid;gap:4px;min-width:0;color:#333c4d;font-size:12px;font-weight:700}.trend-filter-row select{width:100%;height:29px;border:1px solid #cfd6df;border-radius:4px;padding:0 26px 0 9px;background:#fff;color:#202936;font-size:12px}.filter-actions{display:flex;gap:9px;white-space:nowrap}
button{height:29px;border:1px solid #cfd6df;border-radius:4px;padding:0 12px;background:#fff;color:#303846;font-size:12px}.primary{border-color:var(--color-primary);background:var(--color-primary);color:#fff;font-weight:700}.outline{border-color:#d60000;color:var(--color-primary);background:#fff}.text-btn{border:0;padding:0 4px;color:#5c6675}
.metric-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.metric-card{display:grid;grid-template-columns:34px minmax(0,1fr);gap:11px;height:88px;overflow:hidden;padding:15px 12px 8px}.metric-card i{display:grid;width:30px;height:30px;place-items:center;border-radius:5px;color:#fff;font-style:normal;font-weight:800}.metric-card.blue i{background:var(--color-info)}.metric-card.green i{background:#48b98f}.metric-card.orange i{background:#ff7a1a}.metric-card.red i{background:#e00000}.metric-card p{color:#4d5666;font-size:12px;font-weight:700}.metric-card strong{display:block;margin-top:5px;color:#20242c;font-size:19px;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap}.metric-card small{font-size:12px}.metric-card em{display:block;margin-top:7px;color:#4d5666;font-size:10.5px;font-style:normal;line-height:1.35}
.up,.metric-card em span{color:#e00000}.down{color:#18a064}.stable{color:#333c4d}
.chart-row{display:grid;grid-template-columns:1.25fr 1fr .92fr .95fr;gap:0}.chart-panel{height:246px;padding:12px 12px 8px;border-right:1px solid #edf0f4}.chart-panel:last-child{border-right:0}.chart-panel header{display:flex;justify-content:space-between;gap:8px}.chart-panel h2{margin:0 0 8px;font-size:13px}.chart-panel header span{color:#6c7582;font-size:10px}
.bar-line-chart,.stacked-chart,.scatter-box{position:relative;height:190px;border-bottom:1px solid #edf0f4;background:repeating-linear-gradient(to top,#fff 0,#fff 29px,#edf1f5 30px)}.bar-line-chart{display:flex;align-items:end;justify-content:space-around;padding:0 16px 24px}.month-group{position:relative;display:flex;align-items:end;gap:4px;height:136px}.month-group .bar{width:12px;border-radius:2px 2px 0 0}.actual{background:var(--color-info)}.budget{background:var(--color-success)}.month-group b{position:absolute;left:31px;width:8px;height:8px;border:2px solid var(--color-warning);border-radius:50%;background:#fff}.month-group small,.stack small{position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);color:#566173;font-size:10px}.stacked-chart{display:flex;align-items:end;justify-content:space-around;padding:0 22px 24px}.stack{position:relative;display:flex;flex-direction:column-reverse;width:34px}.stack span{width:100%;opacity:.76}.business{background:var(--color-info)}.marketing{background:var(--color-success)}.travel{background:#b8944f}.meeting{background:#6f8dbd}.rank-list{display:grid;gap:5px}.rank-list div{display:grid;grid-template-columns:64px minmax(0,1fr) 76px;gap:6px;align-items:center;font-size:10px}.rank-list b{height:7px;border-radius:2px;background:#edf1f5}.rank-list i{display:block;height:100%;border-radius:2px;background:var(--color-info)}.rank-list em{font-style:normal;text-align:right}.scatter-box{height:190px;margin-top:6px}.scatter-box i{position:absolute;width:8px;height:8px;border-radius:50%;transform:translate(-50%,50%)}.scatter-box .正常{background:var(--color-success)}.scatter-box .关注{width:10px;height:10px;background:var(--color-warning)}.scatter-box .异常{width:14px;height:14px;background:var(--color-primary)}
.summary-row{display:grid;grid-template-columns:minmax(0,2fr) minmax(270px,.9fr);gap:10px;min-height:171px}.summary-panel{min-width:0;padding:10px 12px 8px}.summary-panel h2{margin:0 0 8px;font-size:13px}.table-scroll,.detail-scroll{overflow:auto}.table-scroll table,.detail-scroll table,.insight-rail table{width:100%;border-collapse:collapse}.table-scroll th,.table-scroll td{height:26px;border:1px solid #edf0f4;padding:4px 7px;font-size:11px;text-align:center;white-space:nowrap}.table-scroll th{background:#f7f8fa;color:#485364}.warning-summary table{min-width:660px}.structure-summary table{min-width:300px}
.trend-detail{min-height:254px;padding:0 12px 8px}.tabs{display:flex;align-items:center;height:39px;gap:23px;border-bottom:1px solid #edf0f4}.tabs button{position:relative;height:38px;border:0;border-radius:0;padding:0 4px;background:transparent;font-size:12px;font-weight:700}.tabs button.active{color:var(--color-primary)}.tabs button.active::after{position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--color-primary);content:""}.detail-scroll table{min-width:960px}.detail-scroll th,.detail-scroll td{height:27px;border:1px solid #edf0f4;padding:3px 8px;font-size:11px;text-align:center;white-space:nowrap}.detail-scroll th{background:#f7f8fa;color:#485364}.row-actions{display:flex;justify-content:center;gap:8px}.row-actions button{height:22px;border:0;padding:0;background:transparent;color:var(--color-info)}.pager{display:flex;align-items:center;gap:24px;min-height:45px;color:#4f5968;font-size:12px}.pager>div{display:flex;gap:12px;margin-left:auto}.pager button{min-width:28px;height:28px;padding:0 7px}.pager button.active{border-color:var(--color-primary);background:var(--color-primary);color:#fff}.pager input{width:48px;height:28px;border:1px solid #d7dde6;border-radius:4px;text-align:center}
.insight-rail{position:relative;top:auto;display:grid;grid-template-rows:auto repeat(5,auto) auto;min-width:0;max-width:345px;min-height:calc(100vh - 66px);overflow:hidden;padding-bottom:8px}.insight-rail header{display:flex;align-items:center;justify-content:space-between;min-height:50px;padding:0 12px;border-bottom:1px solid #edf0f4}.insight-rail header h2{font-size:14px}.insight-rail header button{border:0;padding:0;font-size:22px}.insight-rail section{min-width:0;padding:10px 12px 9px;border-bottom:1px solid #edf0f4}.insight-rail h3{margin:0 0 7px;font-size:13px}.insight-rail ul{display:grid;gap:5px;margin:0;padding-left:17px}.insight-rail li{font-size:11.5px;line-height:1.42}.insight-rail table{min-width:0;table-layout:fixed}.insight-rail th,.insight-rail td{height:24px;border:1px solid #edf0f4;padding:3px 4px;overflow:hidden;font-size:10px;text-align:center;text-overflow:ellipsis;white-space:nowrap}.insight-rail th{background:#f7f8fa}.insight-actions{align-self:end;display:flex;flex-wrap:wrap;gap:9px 10px;padding:10px 12px}.insight-actions button{box-sizing:border-box;height:34px;min-width:0;font-weight:700}.insight-actions .action-half{flex:0 0 calc((100% - 10px)/2);padding:0 6px;white-space:nowrap}.insight-actions .action-full{flex:0 0 100%;width:100%;background:#fff;color:#303846}.insight-actions .action-full span{font-size:15px;line-height:1}
@media(max-width:1280px){.trend-filter-row{grid-template-columns:repeat(3,minmax(0,1fr))}.filter-actions{grid-column:1/-1;justify-content:flex-end}}
@media(max-width:1500px){.expense-trend-page{grid-template-columns:minmax(0,1fr)}.insight-rail{position:relative;top:auto;max-width:none;min-height:auto}}
@media(max-width:1199px){.expense-trend-page{grid-template-columns:1fr}.insight-rail{position:relative;top:auto;min-height:auto}.chart-row{grid-template-columns:repeat(2,minmax(0,1fr))}.chart-panel:nth-child(2){border-right:0}.chart-panel:nth-child(-n+2){border-bottom:1px solid #edf0f4}}
@media(max-width:900px){.metric-row{grid-template-columns:repeat(2,minmax(0,1fr))}.summary-row{grid-template-columns:1fr}.tabs{overflow-x:auto}}
@media(max-width:760px){.trend-filter-row,.chart-row,.metric-row{grid-template-columns:1fr}.chart-panel{border-right:0;border-bottom:1px solid #edf0f4}.pager{flex-wrap:wrap;gap:10px}.pager>div{margin-left:0}}
.expense-trend-page {
  height: 0;
  min-height: 0;
  overflow: auto;
}

@media (min-width: 1501px) {
  .expense-trend-page {
    align-items: stretch;
    overflow: hidden;
  }

  .trend-main {
    height: 100%;
    min-height: 0;
    grid-template-rows: auto auto auto auto minmax(0, 1fr);
  }

  .trend-detail {
    display: flex;
    min-height: 0;
    flex-direction: column;
  }

  .detail-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .insight-rail {
    height: 100%;
    min-height: 0;
    overflow: auto;
  }
}
</style>
