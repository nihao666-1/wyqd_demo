<template>
  <section class="expense-analysis-panel" aria-label="费用异常监控分析">
    <form class="analysis-filters" aria-label="费用异常筛选" @submit.prevent="emit('query')" @reset.prevent="emit('reset')">
      <label v-for="field in filterFields" :key="field.key" :class="`field-${field.key}`">
        <span>{{ field.label }}</span>
        <input v-if="field.key === 'employee'" :value="filters.employee" placeholder="请输入员工姓名/工号" @input="emit('update-filter', field.key, $event.target.value)" />
        <select v-else :value="filters[field.key]" @change="emit('update-filter', field.key, $event.target.value)">
          <option value="">全部</option>
          <option v-for="option in context.filterOptions?.[field.key] || []" :key="optionValue(option)" :value="optionValue(option)">{{ optionLabel(option) }}</option>
        </select>
      </label>
      <div class="filter-actions"><button class="primary" type="submit">查询</button><button type="reset">重置</button></div>
    </form>

    <div class="analysis-metrics" aria-label="异常监控指标">
      <article v-for="metric in metricCards" :key="metric.key">
        <i :class="`tone-${metric.tone}`" aria-hidden="true">{{ metric.icon }}</i>
        <span>{{ metric.label }}</span>
        <strong>{{ metric.count }} <small>笔</small></strong>
        <em>涉及金额 {{ metric.amount }}</em>
      </article>
    </div>

    <div class="analysis-charts">
      <article class="trend-card"><header><h3>异常监控趋势</h3><ul class="legend"><li><i class="blue"></i>异常笔数（笔）</li><li><i class="red"></i>异常金额（元）</li><li><i class="green"></i>同比金额（元）</li></ul></header><svg viewBox="0 0 330 210" preserveAspectRatio="none" role="img" aria-label="异常监控趋势图"><g class="grid-lines"><line v-for="line in [34,70,106,142,178]" :key="line" x1="34" :y1="line" x2="304" :y2="line" /></g><g v-for="item in trendGeometry" :key="item.label"><rect class="trend-bar" :x="item.x - 9" :y="item.countY" width="18" :height="178 - item.countY" rx="2" /><text class="axis-label" :x="item.x" y="200" text-anchor="middle">{{ item.label }}</text></g><polyline class="amount-line" :points="amountPoints" /><polyline class="compare-line" :points="comparePoints" /></svg></article>
      <article class="heatmap-card"><header><h3>部门风险热力</h3></header><div class="heatmap-grid" role="table" aria-label="部门风险热力表"><strong>部门</strong><strong>低</strong><strong>中</strong><strong>高</strong><template v-for="row in heatmapRows" :key="row.department"><span>{{ row.department }}</span><b v-for="level in ['low','medium','high']" :key="`${row.department}-${level}`" :style="heatStyle(row[level])">{{ row[level] }}</b></template></div></article>
      <article class="donut-card"><header><h3>异常类型占比</h3></header><div class="donut-layout"><svg viewBox="0 0 180 180" role="img" aria-label="异常类型占比图"><circle class="donut-base" cx="90" cy="90" r="54" /><circle v-for="segment in anomalySegments" :key="segment.label" class="donut-segment" cx="90" cy="90" r="54" :stroke="segment.color" :stroke-dasharray="`${segment.length} ${donutCircumference - segment.length}`" :stroke-dashoffset="-segment.offset" /><text class="donut-label" x="90" y="84" text-anchor="middle">异常总笔数</text><text class="donut-total" x="90" y="106" text-anchor="middle">{{ metrics.anomalyCount || 306 }}</text><text class="donut-label" x="90" y="124" text-anchor="middle">笔</text></svg><ul class="donut-legend"><li v-for="segment in anomalySegments" :key="`type-${segment.label}`"><i :style="{ backgroundColor: segment.color }"></i><span>{{ segment.label }}</span><strong>{{ segment.percent }}%</strong></li></ul></div></article>
      <article class="ranking-card"><header><h3>规则命中排行（TOP10）</h3><span>单位：笔</span></header><div class="rank-list"><div v-for="item in ruleBars" :key="item.label" class="rank-row"><span>{{ item.label }}</span><b><i :style="{ width: `${item.width}%` }"></i></b><strong>{{ item.value }}</strong></div></div></article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ context:{type:Object,required:true}, filters:{type:Object,required:true}, metrics:{type:Object,required:true}, charts:{type:Object,required:true} });
const emit = defineEmits(['update-filter', 'query', 'reset']);
const filterFields = [
  { key: 'organization', label: '被审计单位' },
  { key: 'period', label: '审计期间' },
  { key: 'type', label: '异常类型' },
  { key: 'riskLevel', label: '风险等级' },
  { key: 'department', label: '部门' },
  { key: 'employee', label: '员工' },
  { key: 'status', label: '处理状态' }
];
const palette = ['var(--color-info)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-primary)', 'var(--color-warning)', 'var(--color-success)'];
const donutCircumference = 2 * Math.PI * 54;
const numeric = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const optionValue = (option) => (typeof option === 'object' ? option.value : option);
const optionLabel = (option) => (typeof option === 'object' ? option.label : option);
const metricCards = computed(() => [
  { key: 'pending', label: '待确认异常', count: props.metrics.pendingCount ?? 86, amount: formatMoney(props.metrics.pendingAmount ?? 1025430), tone: 'blue', icon: '▣' },
  { key: 'highRisk', label: '高风险异常', count: props.metrics.highRiskCount ?? 48, amount: formatMoney(props.metrics.highRiskAmount ?? 658240), tone: 'red', icon: '◆' },
  { key: 'supplement', label: '待补充证据', count: props.metrics.supplementCount ?? 23, amount: formatMoney(props.metrics.supplementAmount ?? 232560), tone: 'orange', icon: '▤' },
  { key: 'confirmed', label: '已确认异常', count: props.metrics.confirmedCount ?? 112, amount: formatMoney(props.metrics.confirmedAmount ?? 2356780), tone: 'green', icon: '✓' },
  { key: 'excluded', label: '已排除异常', count: props.metrics.excludedCount ?? 37, amount: formatMoney(props.metrics.excludedAmount ?? 186420), tone: 'gray', icon: '×' }
]);
const monitorTrend = computed(() => props.charts.monitorTrend || []);
const trendGeometry = computed(() => {
  const rows = monitorTrend.value.length ? monitorTrend.value : [{ label:'2025-01', count:58, amount:1200000, compareAmount:1580000 }, { label:'2025-02', count:72, amount:1700000, compareAmount:1400000 }, { label:'2025-03', count:86, amount:2050000, compareAmount:1220000 }];
  const maxCount = Math.max(1, ...rows.map((item) => numeric(item.count)));
  const maxAmount = Math.max(1, ...rows.flatMap((item) => [numeric(item.amount), numeric(item.compareAmount)]));
  return rows.map((item, index) => ({ label:item.label, x:74 + index * (180 / Math.max(rows.length - 1, 1)), countY:178 - (numeric(item.count) / maxCount) * 132, amountY:178 - (numeric(item.amount) / maxAmount) * 132, compareY:178 - (numeric(item.compareAmount) / maxAmount) * 132 }));
});
const amountPoints = computed(() => trendGeometry.value.map((item) => `${item.x},${item.amountY}`).join(' '));
const comparePoints = computed(() => trendGeometry.value.map((item) => `${item.x},${item.compareY}`).join(' '));
const heatmapRows = computed(() => props.charts.departmentHeatmap || []);
const anomalySegments = computed(() => {
  const rows = props.charts.anomalyDistribution || [];
  return buildSegments(rows);
});
const ruleBars = computed(() => {
  const rows = props.charts.ruleRanking || [];
  const max = Math.max(1, ...rows.map((item) => numeric(item.value)));
  return rows.map((item) => ({ ...item, width:(numeric(item.value) / max) * 100 }));
});
function buildSegments(rows) {
  const total = rows.reduce((sum, item) => sum + numeric(item.value), 0) || 1;
  let offset = 0;
  return rows.map((item, index) => {
    const length = (numeric(item.value) / total) * donutCircumference;
    const segment = { label:item.label, color:palette[index % palette.length], percent:numeric(item.percent || (numeric(item.value) / total) * 100).toFixed(2), length, offset };
    offset += length;
    return segment;
  });
}
function formatMoney(value){ return `￥${numeric(value).toLocaleString('zh-CN', { minimumFractionDigits:2, maximumFractionDigits:2 })}`; }
function formatCompact(value){ return numeric(value).toLocaleString('zh-CN', { maximumFractionDigits:2 }); }
function heatStyle(value){ return { backgroundColor: `rgba(248, 129, 51, ${Math.min(0.9, 0.12 + numeric(value) / 26)})` }; }
</script>

<style scoped>
.expense-analysis-panel{display:grid;gap:10px;min-width:0}.analysis-filters{display:grid;grid-template-columns:minmax(112px,.88fr) minmax(190px,1.45fr) repeat(3,minmax(92px,.74fr)) minmax(156px,1.18fr) minmax(94px,.74fr) auto;gap:8px;align-items:end;padding:12px 14px;border:1px solid #dfe5ec;background:#fff}.analysis-filters label{display:grid;gap:5px;min-width:0;color:#4b5563;font-size:12px;font-weight:600}.analysis-filters select,.analysis-filters input{width:100%;height:32px;min-width:0;border:1px solid #d3dbe7;border-radius:4px;padding:0 9px;background:#fff;color:#1f2937;font-size:12px}.filter-actions{display:flex;gap:8px}.filter-actions button{height:32px;min-width:52px;border:1px solid #d3dbe7;border-radius:4px;background:#fff;color:#303846;font-size:12px}.filter-actions .primary{border-color:var(--color-primary);background:var(--color-primary);color:#fff;font-weight:700}.analysis-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border:1px solid #dfe5ec;background:#fff}.analysis-metrics article{display:grid;grid-template-columns:38px minmax(0,1fr);column-gap:12px;align-items:center;min-height:82px;padding:12px 16px;border-right:1px solid #edf0f4}.analysis-metrics i{grid-row:1/4;display:grid;width:36px;height:36px;place-items:center;border-radius:5px;color:#fff;font-style:normal;font-weight:800}.tone-blue{background:var(--color-info)}.tone-red{background:var(--color-primary)}.tone-orange{background:var(--color-warning)}.tone-green{background:var(--color-success)}.tone-gray{background:#5f6b7a}.analysis-metrics span{font-size:12px}.analysis-metrics strong{font-size:24px;line-height:27px}.analysis-metrics em{font-size:12px;font-style:normal}.analysis-charts{display:grid;grid-template-columns:minmax(250px,1.08fr) minmax(190px,.75fr) minmax(220px,.85fr) minmax(230px,.9fr);height:278px;border:1px solid #dfe5ec;background:#fff;overflow:hidden}.analysis-charts article{min-width:0;overflow:hidden;padding:10px 12px;border-right:1px solid #edf0f4}.analysis-charts h3{margin:0;color:#1f2937;font-size:13px;font-weight:800}.legend{display:flex;flex-wrap:wrap;gap:7px;margin:0;padding:0;list-style:none;color:#5f6b7a;font-size:11px}.legend i{display:inline-block;width:9px;height:5px;border-radius:2px}.legend .blue{background:var(--color-info)}.legend .red{background:var(--color-primary)}.legend .green{background:var(--color-success)}.trend-card svg{width:100%;height:224px}.grid-lines line{stroke:#edf1f5}.axis-label{fill:#667085;font-size:10px}.trend-bar{fill:var(--color-info)}.amount-line,.compare-line{fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.amount-line{stroke:var(--color-primary)}.compare-line{stroke:var(--color-success);stroke-dasharray:6 5}.heatmap-grid{display:grid;grid-template-columns:minmax(58px,1.35fr) repeat(3,minmax(28px,.7fr));margin-top:9px;border-top:1px solid #edf0f4;border-left:1px solid #edf0f4;font-size:11px}.heatmap-grid>*{display:grid;height:32px;min-width:0;place-items:center;border-right:1px solid #edf0f4;border-bottom:1px solid #edf0f4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.heatmap-grid strong{background:#f7f8fa;color:#475467}.heatmap-grid span{background:#fbfcfd;color:#344054;font-weight:700}.heatmap-grid b{font-weight:500}.donut-layout{display:grid;grid-template-columns:92px minmax(0,1fr);align-items:center;gap:6px}.donut-layout svg{width:118px;height:174px;transform:translateX(-13px)}.donut-base,.donut-segment{fill:none;stroke-width:26}.donut-base{stroke:#eef2f6}.donut-segment{transform:rotate(-90deg);transform-origin:90px 90px}.donut-label{fill:#4b5563;font-size:11px}.donut-total{fill:#111827;font-size:19px;font-weight:800}.donut-legend{display:grid;gap:7px;min-width:0;margin:0;padding:0;list-style:none;font-size:11px}.donut-legend li{display:grid;grid-template-columns:8px minmax(0,1fr) auto;align-items:center;gap:5px;min-width:0}.donut-legend span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.donut-legend i{width:8px;height:8px;border-radius:2px}.rank-list{display:grid;gap:7px;margin-top:6px}.rank-row{display:grid;grid-template-columns:82px minmax(54px,1fr) 24px;align-items:center;gap:6px;font-size:11px}.rank-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rank-row b{height:7px;border-radius:2px;background:#edf2f7}.rank-row i{display:block;height:7px;border-radius:2px;background:var(--color-info)}@media(max-width:1479px){.analysis-filters{grid-template-columns:repeat(4,minmax(0,1fr))}.analysis-charts{grid-template-columns:repeat(2,minmax(0,1fr));height:548px}}@media(max-width:900px){.analysis-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.analysis-charts{grid-template-columns:1fr;height:auto}.analysis-charts article{min-height:260px}}@media(max-width:760px){.analysis-filters,.analysis-metrics{grid-template-columns:1fr}}
.analysis-filters{min-height:0;align-self:start;align-content:start;grid-auto-rows:max-content;padding:6px 14px 8px}
.analysis-filters label{gap:4px}
.expense-analysis-panel{gap:8px;align-self:start;align-content:start}
</style>
