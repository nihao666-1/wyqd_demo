<template>
  <template v-if="isEmptyMode">
  <div class="expense-empty-page route-fill-page" aria-label="费用审计分析">
    <div class="expense-empty-layout">
      <main class="expense-empty-main">
        <section class="expense-metrics-strip" aria-label="费用审计指标概览">
          <article v-for="item in metrics" :key="item.label" class="expense-metric">
            <span class="metric-icon" :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span>
            <div>
              <p>{{ item.label }}</p>
              <strong>0 <em>{{ item.unit }}</em></strong>
              <small>较昨日 0</small>
            </div>
          </article>
        </section>

        <section class="expense-empty-hero" aria-labelledby="expense-empty-hero-title">
          <svg class="hero-illustration" viewBox="0 0 260 150" role="img" aria-label="暂无费用审计数据">
            <rect x="88" y="18" width="86" height="118" rx="4" fill="#f4f7fb" stroke="#dfe6f0" />
            <line x1="105" y1="44" x2="154" y2="44" stroke="#d8e0eb" stroke-width="3" stroke-linecap="round" />
            <line x1="105" y1="64" x2="158" y2="64" stroke="#e1e7f0" stroke-width="3" stroke-linecap="round" />
            <line x1="105" y1="84" x2="148" y2="84" stroke="#e1e7f0" stroke-width="3" stroke-linecap="round" />
            <circle cx="110" cy="37" r="7" fill="#e1e8f2" />
            <rect x="28" y="62" width="82" height="86" rx="5" fill="#fbfcfe" stroke="#dfe6f0" />
            <rect x="48" y="110" width="8" height="20" fill="#d6dfe9" />
            <rect x="63" y="96" width="8" height="34" fill="#cbd6e4" />
            <rect x="78" y="82" width="8" height="48" fill="#d6dfe9" />
            <rect x="93" y="72" width="8" height="58" fill="#cbd6e4" />
            <circle cx="180" cy="104" r="30" fill="none" stroke="#d7dee9" stroke-width="9" />
            <line x1="203" y1="127" x2="232" y2="146" stroke="#cbd5e2" stroke-width="10" stroke-linecap="round" />
          </svg>
          <div>
            <h2 id="expense-empty-hero-title">暂无费用审计数据</h2>
            <p>上传费控、预算、财务和审批数据后，可进行费用综合分析、异常识别和趋势分析。</p>
          </div>
        </section>

        <section class="expense-entry-grid" aria-label="新建费用审计分析入口">
          <article v-for="entry in entries" :key="entry.title" class="expense-entry-card">
            <header>
              <span class="entry-icon" :class="entry.tone"><FontAwesomeIcon :icon="entry.icon" /></span>
              <div>
                <h2>{{ entry.title }}</h2>
                <p>{{ entry.description }}</p>
              </div>
            </header>
            <ol class="entry-flow">
              <li v-for="(step, index) in entry.steps" :key="step">
                <span>{{ index + 1 }}</span>
                <small>{{ step }}</small>
              </li>
            </ol>
            <RouterLink class="entry-action" :to="entry.to">{{ entry.action }}</RouterLink>
          </article>
        </section>

        <section class="expense-task-panel" aria-labelledby="expense-task-title">
          <h2 id="expense-task-title">费用分析任务</h2>
          <div class="expense-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">任务编号</th>
                  <th scope="col">分析类型</th>
                  <th scope="col">被审计单位</th>
                  <th scope="col">审计期间</th>
                  <th scope="col">数据来源</th>
                  <th scope="col">状态</th>
                  <th scope="col">输出结果</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="8">
                    <div class="expense-task-empty" role="status">
                      <svg viewBox="0 0 120 90" role="img" aria-label="暂无费用分析任务">
                        <path d="M34 39h52l12 18-10 24H32L22 57l12-18Z" fill="#f5f7fb" stroke="#dce4ee" />
                        <path d="M34 39 48 58h24l14-19M22 57h26l7 8h10l7-8h26" fill="none" stroke="#cfd9e6" />
                        <path d="M54 19 68 12l7 17-14 7-7-17ZM80 27l11-5 5 12-11 5-5-12Z" fill="#e8edf5" stroke="#d6dfeb" />
                        <circle cx="20" cy="30" r="2" fill="#d8e0eb" />
                        <circle cx="100" cy="24" r="2" fill="#d8e0eb" />
                      </svg>
                      <strong>暂无费用分析任务</strong>
                      <p>创建综合分析、异常监控或趋势分析任务后将在此显示。</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <aside class="expense-source-panel" aria-labelledby="expense-source-title">
        <h2 id="expense-source-title">所需数据源</h2>
        <article v-for="source in sources" :key="source.title" class="source-card">
          <span class="source-icon" :class="source.tone"><FontAwesomeIcon :icon="source.icon" /></span>
          <div>
            <h3>{{ source.title }}</h3>
            <p>{{ source.description }}</p>
            <span class="source-badge" :class="{ optional: source.optional }">{{ source.badge }}</span>
          </div>
        </article>
        <RouterLink class="source-guide" to="/demo-guide"><FontAwesomeIcon :icon="faBookOpen" />数据接入指引</RouterLink>
      </aside>
    </div>
  </div>
  </template>

  <template v-else>
    <div class="expense-data-entry-page route-fill-page" aria-labelledby="expense-data-title">
      <section class="expense-data-hero">
        <div>
          <h1 id="expense-data-title">费用审计分析</h1>
          <p>已载入模拟费用、预算、审批和凭证数据，可进入总览、异常监控和趋势分析继续演示。</p>
        </div>
        <div class="expense-data-actions">
          <RouterLink class="primary-link" to="/expense/audit/overview">查看费用总览</RouterLink>
          <RouterLink to="/expense/anomaly/dashboard">费用异常监控</RouterLink>
          <RouterLink to="/expense/usage/dashboard">费用趋势分析</RouterLink>
        </div>
      </section>

      <section class="expense-data-metrics" aria-label="费用审计关键指标">
        <article v-for="item in dataMetrics" :key="item.label" class="expense-data-metric">
          <span class="metric-icon" :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span>
          <div>
            <p>{{ item.label }}</p>
            <strong>{{ item.value }}</strong>
            <small>{{ item.hint }}</small>
          </div>
        </article>
      </section>

      <section class="expense-data-grid" aria-label="费用审计有数据页面入口">
        <RouterLink v-for="entry in dataEntries" :key="entry.title" class="expense-data-card" :to="entry.to">
          <span class="entry-icon" :class="entry.tone"><FontAwesomeIcon :icon="entry.icon" /></span>
          <div>
            <h2>{{ entry.title }}</h2>
            <p>{{ entry.description }}</p>
            <small>{{ entry.meta }}</small>
          </div>
        </RouterLink>
      </section>
    </div>
  </template>
</template>

<script setup>
import { computed, inject } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faBookOpen,
  faChartColumn,
  faChartLine,
  faClipboardCheck,
  faDatabase,
  faFileInvoice,
  faFileLines,
  faFolderOpen,
  faIdBadge,
  faShieldHalved,
  faWallet
} from '@fortawesome/free-solid-svg-icons';

const store = inject('store');
const isEmptyMode = computed(() => store.demoDataMode === 'empty');

const metrics = [
  { label: '费用数据快照', unit: '个', tone: 'red', icon: faDatabase },
  { label: '综合分析任务', unit: '个', tone: 'orange', icon: faClipboardCheck },
  { label: '异常监控任务', unit: '个', tone: 'green', icon: faShieldHalved },
  { label: '趋势预警', unit: '条', tone: 'blue', icon: faChartLine },
  { label: '导出报表', unit: '份', tone: 'purple', icon: faFileLines }
];

const entries = [
  {
    title: '费用综合分析',
    description: '对费用数据进行结构分析与统计汇总。',
    action: '新建综合分析',
    to: '/expense/usage/new',
    tone: 'red',
    icon: faChartColumn,
    steps: ['选择数据快照', '预算执行分析', '汇总统计']
  },
  {
    title: '费用异常监控',
    description: '识别异常交易与合规风险点。',
    action: '新建异常监控',
    to: '/expense/anomaly/dashboard',
    tone: 'orange',
    icon: faShieldHalved,
    steps: ['选择规则版本', '识别异常', '确认/排除']
  },
  {
    title: '费用趋势分析',
    description: '分析费用趋势与预测变化。',
    action: '新建趋势分析',
    to: '/expense/usage/dashboard',
    tone: 'blue',
    icon: faChartLine,
    steps: ['设置对比周期', '趋势预测', '加入报告']
  }
];

const sources = [
  { title: '费用审批流程', description: '费用申请、审批流、报销节点与影像。', badge: '必需', tone: 'red', icon: faIdBadge },
  { title: '费控数据', description: '消费明细、报销单据、凭证关联数据。', badge: '必需', tone: 'green', icon: faWallet },
  { title: '预算数据', description: '预算总额、预算分配、执行进度数据。', badge: '必需', tone: 'orange', icon: faClipboardCheck },
  { title: '财务凭证', description: '会计凭证、发票、记账数据与附件。', badge: '必需', tone: 'blue', icon: faFileInvoice },
  { title: '固定资产台账', description: '资产购置、折旧、处置及使用信息。', badge: '可选', optional: true, tone: 'purple', icon: faFolderOpen }
];

const dataMetrics = [
  { label: '费用总额', value: '12,856,230.45', hint: '同比 +8.62%', tone: 'red', icon: faWallet },
  { label: '预算使用率', value: '82.45%', hint: '较上期 +5.21%', tone: 'blue', icon: faChartColumn },
  { label: '异常金额', value: '1,256,780.32', hint: '高风险 48 笔', tone: 'orange', icon: faShieldHalved },
  { label: '异常监控任务', value: '3', hint: '待确认 36 条', tone: 'green', icon: faClipboardCheck },
  { label: '趋势预警', value: '12', hint: '已加入审计重点 5 条', tone: 'purple', icon: faChartLine }
];

const dataEntries = [
  {
    title: '费用审计总览',
    description: '查看费用总额、预算使用率、异常金额、异常分类和明细清单。',
    meta: '进入总览看板',
    to: '/expense/audit/overview',
    tone: 'red',
    icon: faChartColumn
  },
  {
    title: '费用异常监控',
    description: '处理规则命中、凭证依据、审批链路和人工确认/排除。',
    meta: '进入异常监控',
    to: '/expense/anomaly/dashboard',
    tone: 'orange',
    icon: faShieldHalved
  },
  {
    title: '费用趋势分析',
    description: '分析月度趋势、预算偏差、员工离群和未来预测建议。',
    meta: '进入趋势分析',
    to: '/expense/usage/dashboard',
    tone: 'blue',
    icon: faChartLine
  }
];
</script>

<style scoped>
.expense-empty-page{--red:var(--color-primary);--line:#e3e8ef;--muted:#606b7b;--soft:#f7f8fa;box-sizing:border-box;width:100%;max-width:none;margin:0;padding:16px 56px 12px 8px;color:#111827}
.expense-empty-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:32px;align-items:start;min-width:0}
.expense-empty-main{display:grid;min-width:0;gap:12px}
.expense-metrics-strip{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));height:116px;border:1px solid var(--line);border-radius:4px;background:#fff;overflow:hidden}
.expense-metric{display:grid;grid-template-columns:52px minmax(0,1fr);align-items:center;gap:18px;min-width:0;padding:18px;border-right:1px solid #eef1f5}
.expense-metric:last-child{border-right:0}
.metric-icon,.entry-icon,.source-icon{display:grid;place-items:center;flex:0 0 auto}
.metric-icon{width:52px;height:52px;border:1px solid currentColor;border-radius:8px;font-size:24px}
.expense-metric p{margin:0 0 8px;color:#2d3542;font-size:14px;font-weight:700;white-space:nowrap}
.expense-metric strong{display:block;color:#06080d;font-size:30px;line-height:32px;font-weight:700}
.expense-metric em{font-size:15px;font-style:normal;font-weight:500}
.expense-metric small{display:block;margin-top:10px;color:#596677;font-size:12px}
.red{color:#d60b0b;background:#fff1f1}.orange{color:var(--color-warning);background:#fff4e8}.green{color:var(--color-success);background:#eaf8f0}.blue{color:var(--color-info);background:#edf5ff}.purple{color:#6f668f;background:#f3edff}
.expense-empty-hero{display:grid;grid-template-columns:320px minmax(0,1fr);align-items:center;height:176px;padding:18px 42px;border:1px solid var(--line);border-radius:6px;background:#fff}
.hero-illustration{width:260px;max-width:100%;height:auto;opacity:.92}
.expense-empty-hero h2{margin:0 0 16px;font-size:28px;line-height:36px;font-weight:700}
.expense-empty-hero p{max-width:620px;margin:0;color:#2f3744;font-size:14px;line-height:22px}
.expense-entry-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;height:255px;padding:12px 16px 18px;border:1px solid var(--line);border-top:0;border-radius:0 0 6px 6px;background:#fff}
.expense-entry-card{display:grid;align-content:start;min-height:222px;padding:20px 26px 18px;border:1px solid var(--line);border-radius:4px;background:#fff}
.expense-entry-card header{display:grid;grid-template-columns:52px minmax(0,1fr);gap:16px;align-items:start}
.entry-icon{width:52px;height:52px;border:1px solid currentColor;border-radius:8px;font-size:24px}
.expense-entry-card h2{margin:0 0 6px;font-size:16px;line-height:22px}
.expense-entry-card p{margin:0;color:#596577;font-size:12px;line-height:18px}
.entry-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:22px 0 18px;padding:0;list-style:none}
.entry-flow li{position:relative;display:grid;justify-items:center;gap:8px;min-width:0;color:#1f2937;font-size:12px;text-align:center}
.entry-flow li:not(:first-child)::before{content:"";position:absolute;top:12px;right:50%;left:-50%;height:2px;background:#d9dee7}
.entry-flow span{position:relative;z-index:1;display:grid;width:26px;height:26px;place-items:center;border:1px solid #cfd7e3;border-radius:50%;background:#fff;color:#384252;font-weight:700}
.entry-flow small{font-size:12px;line-height:17px;white-space:nowrap}
.entry-action{display:flex;width:176px;height:38px;align-items:center;justify-content:center;justify-self:center;border:1px solid var(--red);border-radius:4px;color:var(--red);background:#fff;font-size:14px;font-weight:700}
.expense-task-panel{height:264px;padding:14px 16px 10px;border:1px solid var(--line);border-radius:6px;background:#fff}
.expense-task-panel h2{margin:0 0 12px;font-size:18px;line-height:24px}
.expense-table-wrap{overflow-x:auto;border:1px solid var(--line)}
.expense-table-wrap table{width:100%;min-width:880px;border-collapse:collapse;table-layout:fixed}
.expense-table-wrap th{height:34px;padding:0 8px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:#f7f8fa;color:#111827;text-align:center;font-size:13px;font-weight:700;white-space:nowrap}
.expense-table-wrap th:last-child{border-right:0}
.expense-table-wrap td{height:165px;padding:0;text-align:center}
.expense-task-empty{display:grid;justify-items:center;align-content:center;min-height:162px;color:#768294}
.expense-task-empty svg{width:118px;height:88px;margin-bottom:4px}
.expense-task-empty strong{color:#66717f;font-size:16px;line-height:24px}
.expense-task-empty p{margin:4px 0 0;color:#697586;font-size:13px;line-height:20px}
.expense-source-panel{display:grid;gap:14px;min-width:0;position:relative;z-index:0;padding:16px 10px 12px;border:1px solid var(--line);background:#fff}
.expense-source-panel h2{margin:0 8px 4px;font-size:18px;line-height:24px}
.source-card{display:grid;grid-template-columns:44px minmax(0,1fr);gap:14px;align-items:start;height:104px;padding:16px 12px 10px;border:1px solid var(--line);border-radius:7px;background:#fff}
.source-icon{width:44px;height:44px;border:1px solid currentColor;border-radius:8px;font-size:23px}
.source-card h3{margin:0 0 6px;font-size:14px;line-height:20px}
.source-card p{max-height:36px;margin:0 0 6px;overflow:hidden;color:#566171;font-size:12px;line-height:18px}
.source-badge{display:inline-flex;align-items:center;min-height:22px;padding:1px 7px;border:1px solid #ffb5b5;border-radius:4px;background:#fff2f2;color:#e00000;font-size:12px;font-weight:700}
.source-badge.optional{border-color:#bcd8ff;background:#edf5ff;color:var(--color-info)}
.source-guide{display:flex;height:40px;align-items:center;justify-content:center;gap:9px;border:1px solid #d5dbe4;border-radius:4px;background:#fff;color:#394453;font-size:14px}
.expense-data-entry-page{--red:var(--color-primary);--line:#e3e8ef;--muted:#606b7b;box-sizing:border-box;width:100%;max-width:none;margin:0;padding:16px 8px 20px;color:#111827}
.expense-data-hero{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:132px;padding:22px 28px;border:1px solid var(--line);border-radius:6px;background:#fff}
.expense-data-hero h1{margin:0 0 10px;font-size:26px;line-height:34px}
.expense-data-hero p{max-width:660px;margin:0;color:#384252;font-size:14px;line-height:22px}
.expense-data-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}
.expense-data-actions a{display:inline-flex;height:38px;align-items:center;justify-content:center;padding:0 14px;border:1px solid #d5dbe4;border-radius:4px;background:#fff;color:#394453;font-size:14px;font-weight:700;text-decoration:none}
.expense-data-actions .primary-link{border-color:var(--red);background:var(--red);color:#fff}
.expense-data-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));margin-top:12px;border:1px solid var(--line);border-radius:4px;background:#fff;overflow:hidden}
.expense-data-metric{display:grid;grid-template-columns:52px minmax(0,1fr);align-items:center;gap:14px;min-height:108px;padding:16px;border-right:1px solid #eef1f5}
.expense-data-metric:last-child{border-right:0}
.expense-data-metric p{margin:0 0 8px;color:#2d3542;font-size:14px;font-weight:700}
.expense-data-metric strong{display:block;color:#06080d;font-size:24px;line-height:30px}
.expense-data-metric small{display:block;margin-top:7px;color:#596677;font-size:12px}
.expense-data-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:12px}
.expense-data-card{display:grid;grid-template-columns:52px minmax(0,1fr);gap:16px;min-height:148px;padding:20px;border:1px solid var(--line);border-radius:6px;background:#fff;color:inherit;text-decoration:none}
.expense-data-card h2{margin:0 0 8px;font-size:17px;line-height:24px}
.expense-data-card p{margin:0;color:#4b5565;font-size:13px;line-height:20px}
.expense-data-card small{display:block;margin-top:14px;color:var(--red);font-size:13px;font-weight:700}
@media (max-width: 1300px){.expense-empty-page{padding-left:10px;padding-right:56px}.expense-empty-layout{gap:16px}.expense-metric{gap:12px;padding:14px}.expense-entry-grid{gap:16px;padding-left:14px;padding-right:14px}.expense-entry-card{padding-left:18px;padding-right:18px}.entry-flow small{white-space:normal}}
@media (max-width: 1700px){.expense-empty-layout{grid-template-columns:1fr}.expense-source-panel{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.expense-source-panel h2,.source-guide{grid-column:1/-1}.source-card{min-height:104px;height:auto}}
@media (max-width: 1199px){.expense-empty-layout{grid-template-columns:1fr}.expense-source-panel{grid-template-columns:repeat(2,minmax(0,1fr))}.expense-source-panel h2,.source-guide{grid-column:1/-1}.expense-source-panel{gap:12px}.source-card{min-height:96px}.expense-empty-hero{grid-template-columns:260px minmax(0,1fr)}.expense-data-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.expense-data-metric:nth-child(2n){border-right:0}.expense-data-grid{grid-template-columns:1fr}}
@media (max-width: 900px){.expense-metrics-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.expense-metric:nth-child(2n){border-right:0}.expense-metric:last-child{grid-column:1/-1;border-top:1px solid #eef1f5}.expense-empty-hero{grid-template-columns:1fr;padding:22px;text-align:center}.hero-illustration{justify-self:center}.expense-entry-grid{grid-template-columns:1fr}.expense-source-panel{grid-template-columns:1fr}.source-guide{grid-column:auto}.expense-data-hero{align-items:flex-start;flex-direction:column}.expense-data-actions{justify-content:flex-start}}
@media (max-width: 760px){.expense-empty-page{padding:12px 10px 18px}.expense-metrics-strip{grid-template-columns:1fr}.expense-metric,.expense-metric:nth-child(2n){border-right:0;border-bottom:1px solid #eef1f5}.expense-metric:last-child{grid-column:auto;border-top:0;border-bottom:0}.expense-entry-card{min-height:auto}.entry-flow{gap:4px}.entry-flow small{font-size:11px}.entry-action{width:min(176px,100%)}.expense-task-panel{padding-left:10px;padding-right:10px}.expense-table-wrap td{height:170px}}
@media (max-width: 480px){.expense-empty-hero h2{font-size:24px}.expense-metric{grid-template-columns:46px minmax(0,1fr)}.metric-icon,.entry-icon{width:46px;height:46px}.expense-entry-card header{grid-template-columns:46px minmax(0,1fr);gap:12px}.source-card{grid-template-columns:40px minmax(0,1fr);padding:16px 10px}.source-icon{width:40px;height:40px}}
.expense-empty-page,
.expense-data-entry-page {
  height: 0;
  min-height: 0;
  overflow: auto;
}

.expense-data-entry-page {
  display: flex;
  flex-direction: column;
}

.expense-data-grid {
  min-height: 0;
  flex: 1;
}

@media (min-width: 1701px) {
  .expense-empty-layout {
    height: 100%;
    align-items: stretch;
  }

  .expense-empty-main {
    min-height: 0;
    grid-template-rows: auto auto auto minmax(0, 1fr);
  }

  .expense-task-panel {
    display: flex;
    height: auto;
    min-height: 0;
    flex-direction: column;
  }

  .expense-table-wrap {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
  }

  .expense-table-wrap table,
  .expense-table-wrap tbody,
  .expense-table-wrap tr,
  .expense-table-wrap td,
  .expense-task-empty {
    height: 100%;
  }

  .expense-source-panel {
    height: 100%;
    align-content: start;
  }
}
</style>
