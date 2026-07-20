<template>
  <div class="business-analysis-page route-fill-page">
    <section class="analysis-toolbar panel" aria-label="被审计单位业务分析条件">
      <label><span>被审计单位</span><select><option>上海分公司</option></select></label>
      <label><span>分析期间</span><select><option>2025年第一季度</option></select></label>
      <label><span>机构类型</span><select><option>分支机构</option></select></label>
      <div class="toolbar-actions">
        <button type="button" @click="store.handleBusinessAnalysisAction('analyze')">重新生成</button>
        <button class="primary" type="button" @click="store.handleBusinessAnalysisAction('confirm')">确认分析结果</button>
      </div>
    </section>

    <section class="panel closure-status" aria-live="polite">
      <div><strong>经营分析状态</strong><span>{{ businessState.status }}</span></div>
      <p>确认后，经营结论作为报告生成的演示输入，不再重复维护。</p>
      <RouterLink to="/audit-report/workbench">进入报告生成</RouterLink>
    </section>

    <section class="metric-grid" aria-label="经营情况摘要">
      <article v-for="metric in metrics" :key="metric.label" class="panel metric-card">
        <p>{{ metric.label }}</p><strong>{{ metric.value }}</strong><small>{{ metric.hint }}</small>
      </article>
    </section>

    <section class="analysis-grid">
      <section class="panel data-panel">
        <header><div><h2>业务数据准备</h2><p>基础信息和经营数据形成报告生成时可引用的锁定快照。</p></div><RouterLink class="primary link-button" to="/materials/import?scene=audit-report">上传业务数据</RouterLink></header>
        <table>
          <thead><tr><th>数据类别</th><th>数据内容</th><th>数据期间</th><th>状态</th><th>最近更新</th><th>操作</th></tr></thead>
          <tbody><tr v-for="row in dataRows" :key="row.type"><td><strong>{{ row.type }}</strong></td><td>{{ row.content }}</td><td>{{ row.period }}</td><td><span class="status-tag" :class="row.tone">{{ row.status }}</span></td><td>{{ row.updatedAt }}</td><td><button type="button" @click="notify(`已打开${row.type}详情。`)">查看</button></td></tr></tbody>
        </table>
      </section>

      <aside class="panel readiness-panel">
        <h2>报告生成准备度</h2>
        <div class="readiness-ring"><strong>86%</strong><span>资料就绪</span></div>
        <ul><li v-for="item in readiness" :key="item.label"><span>{{ item.label }}</span><b :class="item.tone">{{ item.status }}</b></li></ul>
        <RouterLink to="/audit-report/workbench">进入报告生成</RouterLink>
      </aside>
    </section>

    <section class="panel insight-panel">
      <header><div><h2>经营情况分析</h2><p>结合市场和机构经营数据生成，结论需人工确认后才能进入报告。</p></div><span class="ai-mark">AI生成内容</span></header>
      <div class="insight-grid"><article v-for="item in insights" :key="item.title"><strong>{{ item.title }}</strong><p>{{ item.content }}</p><small>依据：{{ item.source }}</small></article></div>
      <footer><button type="button" @click="store.handleBusinessAnalysisAction('analyze')">重新生成</button><button class="primary" type="button" @click="store.handleBusinessAnalysisAction('confirm')">确认分析结果</button></footer>
    </section>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
const store = inject('store');
const businessState = computed(() => store.db.businessAnalysisState || { status: '待分析' });
const metrics = [
  { label: '营业收入', value: '3,856.4 万元', hint: '同比增长 8.6%' },
  { label: '客户资产', value: '126.8 亿元', hint: '较期初增长 5.2%' },
  { label: '有效客户', value: '28,642 户', hint: '本期新增 1,326 户' },
  { label: '员工人数', value: '86 人', hint: '人均收入 44.8 万元' }
];
const dataRows = [
  { type: '机构基础信息', content: '人员、地址、面积、组织架构', period: '截至2025-03-31', status: '已就绪', tone: 'success', updatedAt: '2025-05-10 09:20' },
  { type: '经营业务数据', content: '收入、客户、资产及业务结构', period: '2025Q1', status: '已就绪', tone: 'success', updatedAt: '2025-05-10 09:18' },
  { type: '市场对标数据', content: '区域市场及同类机构指标', period: '2025Q1', status: '待确认', tone: 'warning', updatedAt: '2025-05-09 16:42' }
];
const readiness = [
  { label: '基础信息', status: '完整', tone: 'success' },
  { label: '经营数据', status: '完整', tone: 'success' },
  { label: '市场数据', status: '待确认', tone: 'warning' },
  { label: '人工复核', status: '未完成', tone: 'muted' }
];
const insights = [
  { title: '经营规模稳步增长', content: '营业收入及客户资产保持增长，财富管理业务贡献度较上年同期提升。', source: '经营指标快照、市场对标数据' },
  { title: '客户结构仍需优化', content: '新增客户增长较快，但高净值客户占比低于区域同类机构平均水平。', source: '客户结构明细、区域市场数据' },
  { title: '人均效能有所改善', content: '员工规模总体稳定，人均营业收入同比提升，部分岗位产能差异较大。', source: '人员清单、收入明细' }
];
function notify(message) { store.setNotice(message); }
</script>

<style scoped>
.closure-status{display:flex;align-items:center;gap:18px}.closure-status div{display:grid;gap:5px}.closure-status span{color:var(--color-primary);font-weight:800}.closure-status p{flex:1;margin:0;color:var(--color-muted)}.closure-status a{padding:8px 14px;border-radius:4px;background:var(--color-primary);color:#fff;text-decoration:none;font-weight:800}
.business-analysis-page{display:flex;height:0;min-height:0;flex-direction:column;gap:var(--ui-space-4);overflow:auto;color:var(--color-text)}.panel{padding:var(--ui-space-4);border:1px solid var(--color-line);border-radius:6px;background:#fff}.analysis-toolbar{display:grid;grid-template-columns:repeat(3,minmax(160px,1fr)) auto;gap:var(--ui-space-4);align-items:end}.analysis-toolbar label{display:grid;gap:var(--ui-space-2);font-size:var(--ui-font-xs)}select,button,.link-button{min-height:var(--ui-control-md);padding:0 var(--ui-space-3);border:1px solid var(--color-line);border-radius:4px;background:#fff;font:inherit}.toolbar-actions{display:flex;gap:var(--ui-space-2)}.primary{border-color:var(--color-primary);background:var(--color-primary);color:#fff;font-weight:700}.link-button{display:inline-flex;align-items:center;text-decoration:none}.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--ui-space-4)}.metric-card p,.metric-card small{margin:0;color:var(--color-muted);font-size:var(--ui-font-xs)}.metric-card strong{display:block;margin:var(--ui-space-2) 0;font-size:var(--ui-font-xl)}.analysis-grid{display:grid;grid-template-columns:minmax(0,1fr) var(--ui-panel-rail-lg);gap:var(--ui-space-4)}header{display:flex;align-items:center;justify-content:space-between;gap:var(--ui-space-4)}h2{margin:0;font-size:var(--ui-font-md)}header p{margin:var(--ui-space-1) 0 0;color:var(--color-muted);font-size:var(--ui-font-xs)}table{width:100%;margin-top:var(--ui-space-3);border-collapse:collapse}th,td{padding:var(--ui-space-3);border-bottom:1px solid var(--color-line);font-size:var(--ui-font-xs);text-align:left}td button{border:0;color:var(--color-primary);font-weight:700}.status-tag{padding:3px 7px;border-radius:999px}.success{background:#eaf8f0;color:var(--color-success)}.warning{background:#fff3e8;color:var(--color-warning)}.muted{color:var(--color-muted)}.readiness-panel{display:grid;align-content:start;gap:var(--ui-space-4)}.readiness-ring{display:grid;width:112px;height:112px;place-content:center;justify-self:center;border:10px solid #f1b8bd;border-top-color:var(--color-primary);border-radius:50%;text-align:center}.readiness-ring strong{font-size:var(--ui-font-xl)}.readiness-ring span{color:var(--color-muted);font-size:var(--ui-font-xs)}.readiness-panel ul{display:grid;gap:var(--ui-space-3);margin:0;padding:0;list-style:none}.readiness-panel li{display:flex;justify-content:space-between}.readiness-panel>a{min-height:var(--ui-control-md);padding:var(--ui-space-2);border:1px solid var(--color-primary);border-radius:4px;color:var(--color-primary);font-weight:700;text-align:center;text-decoration:none}.insight-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--ui-space-4);margin-top:var(--ui-space-4)}.insight-grid article{padding:var(--ui-space-4);border-left:3px solid var(--color-primary);background:#f8f9fb}.insight-grid p{color:var(--color-muted);font-size:var(--ui-font-sm);line-height:1.7}.insight-grid small{color:var(--color-muted)}.ai-mark{padding:4px 8px;border-radius:4px;background:#fff1f2;color:var(--color-primary);font-size:var(--ui-font-xs)}.insight-panel footer{display:flex;justify-content:flex-end;gap:var(--ui-space-2);margin-top:var(--ui-space-4)}@media(max-width:1100px){.analysis-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))}.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.analysis-grid{grid-template-columns:1fr}.insight-grid{grid-template-columns:1fr}}@media(max-width:680px){.analysis-toolbar,.metric-grid{grid-template-columns:1fr}}
</style>
