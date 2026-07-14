<template>
  <div class="special-audit-page route-fill-page">
    <section v-if="isEmptyMode" class="special-empty-page" aria-label="专项审计分析空白页">
      <div class="special-empty-grid">
        <main class="special-empty-main">
          <section class="empty-metric-grid" aria-label="专项审计分析空态指标">
            <article v-for="item in emptyMetrics" :key="item.label" class="empty-metric-card">
              <span class="empty-metric-icon" :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span>
              <div>
                <p>{{ item.label }}</p>
                <strong>0 <em>{{ item.unit }}</em></strong>
                <small>较昨日 <b>-</b></small>
              </div>
            </article>
          </section>

          <section class="empty-task-hero" aria-labelledby="special-empty-title">
            <svg class="empty-hero-art" viewBox="0 0 260 150" role="img" aria-label="暂无专项审计分析任务">
              <rect x="36" y="24" width="136" height="108" rx="8" fill="#f7f9fc" stroke="#dce3ed" />
              <line x1="58" y1="48" x2="122" y2="48" stroke="#d5dde9" stroke-width="7" stroke-linecap="round" />
              <line x1="58" y1="72" x2="132" y2="72" stroke="#e0e6ef" stroke-width="5" stroke-linecap="round" />
              <rect x="58" y="94" width="12" height="30" fill="#d9e2ec" />
              <rect x="80" y="83" width="12" height="41" fill="#cfd9e6" />
              <rect x="102" y="68" width="12" height="56" fill="#dde5ee" />
              <circle cx="146" cy="101" r="35" fill="none" stroke="#cfd9e6" stroke-width="10" />
              <line x1="171" y1="126" x2="208" y2="148" stroke="#c7d2df" stroke-width="12" stroke-linecap="round" />
              <rect x="180" y="84" width="52" height="48" rx="6" fill="#fbfcfe" stroke="#dce3ed" />
            </svg>
            <div>
              <h2 id="special-empty-title">暂无专项审计分析任务</h2>
              <p>可以监管案例舆情或监督共享信息发起分析，形成监管关注点、审计检查建议和汇总分析报告。</p>
              <div class="empty-ability-grid">
                <article v-for="item in emptyAbilities" :key="item.title">
                  <header>
                    <span :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span>
                    <h3>{{ item.title }}</h3>
                  </header>
                  <small>可执行操作</small>
                  <ol>
                    <li v-for="(step, index) in item.steps" :key="step.text">
                      <span><FontAwesomeIcon :icon="step.icon" /></span>
                      <em>{{ step.text }}</em>
                      <i v-if="index < item.steps.length - 1">→</i>
                    </li>
                  </ol>
                  <RouterLink :to="item.to">{{ item.action }}</RouterLink>
                </article>
              </div>
            </div>
          </section>

          <section class="empty-recent-panel" aria-labelledby="special-empty-recent-title">
            <header>
              <h2 id="special-empty-recent-title">最近分析任务</h2>
            </header>
            <div class="empty-table-wrap">
              <table>
                <thead>
                  <tr><th>任务编号</th><th>分析类型</th><th>被分析单位</th><th>分析期间</th><th>状态</th><th>输出结果</th><th>操作</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="7">
                      <div class="empty-table-state">
                        <svg viewBox="0 0 92 72" aria-hidden="true">
                          <path d="M24 30h44l10 14-8 20H22l-8-20 10-14Z" fill="#f6f8fb" stroke="#d8e1ec" />
                          <path d="M24 30l12 16h20l12-16M14 44h22l6 7h8l6-7h22" fill="none" stroke="#cbd6e4" />
                        </svg>
                        <strong>暂无数据</strong>
                        <p>当前暂无专项审计分析任务，快去创建吧！</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <RouterLink class="view-all-empty" to="/tasks">查看全部任务 <FontAwesomeIcon :icon="faChevronRight" /></RouterLink>
          </section>
        </main>

        <aside class="special-empty-aside" aria-label="所需资料说明">
          <section class="empty-info-panel">
            <h2>所需资料说明</h2>
            <article v-for="item in emptyMaterials" :key="item.title">
              <span class="material-icon" :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span>
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </article>
          </section>
        </aside>
      </div>
    </section>

    <div v-else class="page-grid">
      <main class="main-stack">
        <section class="metric-grid" aria-label="专项审计分析概览">
          <article v-for="item in metrics" :key="item.label" class="metric-card">
            <span class="icon-box" :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span>
            <div>
              <p>{{ item.label }}</p>
              <strong>{{ item.value }}<em>{{ item.unit }}</em></strong>
              <small>较昨日 <b>+{{ item.delta }}</b></small>
            </div>
          </article>
        </section>

        <section class="ability-grid" aria-label="专项分析能力">
          <article v-for="item in abilities" :key="item.title" class="ability-card">
            <header>
              <span class="ability-icon" :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span>
              <div>
                <h2>{{ item.title }}</h2>
                <p>{{ item.desc }}</p>
              </div>
            </header>
            <h3>可执行操作</h3>
            <ol class="flow">
              <li v-for="(step, index) in item.steps" :key="step.text">
                <span><FontAwesomeIcon :icon="step.icon" /></span>
                <small>{{ step.text }}</small>
                <i v-if="index < item.steps.length - 1">→</i>
              </li>
            </ol>
            <dl>
              <div v-for="stat in item.stats" :key="stat.label">
                <dt>{{ stat.label }}</dt>
                <dd>{{ stat.value }}<span v-if="stat.unit">{{ stat.unit }}</span></dd>
              </div>
            </dl>
            <RouterLink class="new-action" :to="item.to">{{ item.action }}</RouterLink>
          </article>
        </section>

        <section class="chart-grid" aria-label="专项分析结果图表">
          <article class="trend">
            <header><h2>监管关注点趋势<span>（近 6 个月）</span></h2></header>
            <div class="legend"><span><i class="red-dot"></i>新增关注点（条）</span><span><i class="blue-dot"></i>确认关注点（条）</span></div>
            <svg viewBox="0 0 330 128" role="img" aria-label="监管关注点趋势">
              <g class="grid-lines">
                <line v-for="y in [16, 40, 64, 88, 112]" :key="y" x1="30" :y1="y" x2="318" :y2="y" />
              </g>
              <g class="axis">
                <text x="6" y="114">0</text><text x="4" y="90">20</text><text x="4" y="66">40</text><text x="4" y="42">60</text><text x="4" y="18">80</text>
                <text v-for="p in trendPoints" :key="p.month" :x="p.x" y="124">{{ p.month }}</text>
              </g>
              <polyline :points="redPath" class="line-red" />
              <polyline :points="bluePath" class="line-blue" />
              <circle v-for="p in trendPoints" :key="`r-${p.month}`" :cx="p.x" :cy="p.red" r="3" class="point-red" />
              <circle v-for="p in trendPoints" :key="`b-${p.month}`" :cx="p.x" :cy="p.blue" r="3" class="point-blue" />
            </svg>
          </article>

          <article>
            <header><h2>风险主题分布<span>（近 6 个月）</span></h2></header>
            <div class="donut-layout">
              <div class="donut"><span>总计<br><b>42 条</b></span></div>
              <ul class="topic-list">
                <li v-for="topic in topics" :key="topic.label">
                  <i :style="{ background: topic.color }"></i><span>{{ topic.label }}</span><b>{{ topic.value }}</b><em>({{ topic.percent }})</em>
                </li>
              </ul>
            </div>
          </article>

          <article>
            <header><h2>来源部门贡献<span>（TOP5）</span></h2><small>单位：条</small></header>
            <div class="bar-list">
              <div v-for="dept in departments" :key="dept.name">
                <span>{{ dept.name }}</span>
                <p><i :style="{ width: `${dept.value * 5}%` }"></i></p>
                <b>{{ dept.value }}</b>
              </div>
              <footer><span>0</span><span>5</span><span>10</span><span>15</span><span>20</span></footer>
            </div>
          </article>
        </section>

        <section class="recent-panel" aria-labelledby="recent-title">
          <h2 id="recent-title">最近分析任务</h2>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>任务编号</th><th>分析类型</th><th>被分析单位</th><th>分析期间</th><th>状态</th><th>输出结果</th><th>更新时间</th><th>操作</th></tr>
              </thead>
              <tbody>
                <tr v-for="task in recentTasks" :key="task.id">
                  <td>{{ task.id }}</td><td>{{ task.type }}</td><td>{{ task.unit }}</td><td>{{ task.period }}</td>
                  <td><span class="status" :class="task.tone">{{ task.status }}</span></td>
                  <td>{{ task.output }}</td><td>{{ task.updated }}</td>
                  <td><span class="actions"><RouterLink v-for="action in task.actions" :key="action.text" :to="action.to">{{ action.text }}</RouterLink></span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <footer class="table-footer">
            <span>共 18 条</span>
            <div class="pager"><button>‹</button><button class="active">1</button><button>2</button><button>›</button><select><option>10 条/页</option></select><label>跳至 <input value="1"> 页</label></div>
          </footer>
        </section>
      </main>

      <aside class="side-stack" aria-label="所需资料与输出说明">
        <section class="info-panel">
          <h2>所需资料与输出说明</h2>
          <article v-for="item in materials" :key="item.title">
            <span class="material-icon" :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span>
            <div><h3>{{ item.title }}</h3><p>{{ item.desc }}</p><RouterLink :to="item.to">查看详情</RouterLink></div>
          </article>
        </section>
        <section class="pending-panel">
          <header><h2>待处理事项</h2><span>共 17 项</span></header>
          <ul>
            <li v-for="item in pendingItems" :key="item.label">
              <span class="pending-icon" :class="item.tone"><FontAwesomeIcon :icon="item.icon" /></span>
              <p>{{ item.label }}</p><strong :class="item.tone">{{ item.value }}</strong>
            </li>
          </ul>
          <RouterLink to="/tasks">查看全部待处理事项 <FontAwesomeIcon :icon="faChevronRight" /></RouterLink>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { RouterLink } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faBriefcase,
  faChartColumn,
  faChevronRight,
  faClipboardList,
  faComments,
  faDatabase,
  faFileLines,
  faFolder,
  faLightbulb,
  faMessage,
  faTag,
  faUser,
  faUserCheck,
  faWandMagicSparkles
} from '@fortawesome/free-solid-svg-icons';

const store = inject('store');
const isEmptyMode = computed(() => store.demoDataMode === 'empty');

const emptyMetrics = [
  { label: '分析任务', unit: '个', tone: 'red', icon: faBriefcase },
  { label: '监管关注点', unit: '条', tone: 'orange', icon: faUserCheck },
  { label: '舆情风险', unit: '条', tone: 'purple', icon: faComments },
  { label: '共享文件', unit: '份', tone: 'green', icon: faFolder },
  { label: '汇总报告', unit: '份', tone: 'blue', icon: faChartColumn }
];

const emptyAbilities = [
  {
    title: '监管案例舆情分析',
    tone: 'purple',
    icon: faMessage,
    to: '/regulatory/result',
    action: '新建案例舆情分析',
    steps: [{ text: '输入单位/业务', icon: faFileLines }, { text: '获取案例舆情', icon: faDatabase }, { text: '加入审计重点', icon: faUser }]
  },
  {
    title: '监督共享信息分析',
    tone: 'green',
    icon: faFolder,
    to: '/tasks/detail/supervision-share',
    action: '新建共享信息分析',
    steps: [{ text: '选择共享文件', icon: faFileLines }, { text: '提取标签', icon: faTag }, { text: '生成汇总报告', icon: faClipboardList }]
  }
];

const emptyMaterials = [
  { title: '监管案例库', desc: '收集最新监管处罚、现场检查、通报等案例信息。', tone: 'red', icon: faDatabase },
  { title: '舆情动态', desc: '监测媒体报道、网络舆情、公告信息等动态内容。', tone: 'orange', icon: faComments },
  { title: '合规/风险/审计共享文件', desc: '来自合规、风险、审计条线的共享文档与数据。', tone: 'green', icon: faFolder },
  { title: '数据标签', desc: '基于业务、风险、监管主题的标准标签体系。', tone: 'blue', icon: faTag },
  { title: '使用提示', desc: '可按照组合两类分析能力使用；分析结果可引用到审计报告；所有过程留痕，支持追溯与复核。', tone: 'orange', icon: faLightbulb }
];

const metrics = [
  { label: '分析任务', value: '18', unit: '个', delta: '3', tone: 'red', icon: faBriefcase },
  { label: '监管关注点', value: '126', unit: '条', delta: '8', tone: 'orange', icon: faUserCheck },
  { label: '舆情风险', value: '42', unit: '条', delta: '5', tone: 'purple', icon: faComments },
  { label: '共享文件', value: '384', unit: '份', delta: '27', tone: 'green', icon: faFolder },
  { label: '汇总报告', value: '16', unit: '份', delta: '2', tone: 'blue', icon: faChartColumn }
];

const abilities = [
  {
    title: '监管案例舆情分析',
    desc: '分析监管案例与舆情信息，识别监管关注点与舆情风险。',
    tone: 'purple',
    icon: faMessage,
    to: '/regulatory/result',
    action: '新建案例舆情分析',
    steps: [{ text: '输入单位/业务', icon: faUser }, { text: '获取案例舆情', icon: faFileLines }, { text: '加入审计重点', icon: faWandMagicSparkles }],
    stats: [{ label: '监管案例', value: '58', unit: '条' }, { label: '舆情风险', value: '24', unit: '条' }, { label: '审计建议', value: '12', unit: '条' }, { label: '最新分析', value: '2025-04-28 10:21' }]
  },
  {
    title: '监管共享信息分析',
    desc: '整合监督共享信息，提取标签并生成汇总分析报告。',
    tone: 'green',
    icon: faClipboardList,
    to: '/tasks/detail/supervision-share',
    action: '新建共享信息分析',
    steps: [{ text: '选择共享文件', icon: faFileLines }, { text: '提取标签', icon: faTag }, { text: '生成汇总报告', icon: faClipboardList }],
    stats: [{ label: '共享文件', value: '384', unit: '份' }, { label: '标签命中', value: '1,268', unit: '条' }, { label: '汇总报告', value: '16', unit: '份' }, { label: '最新生成', value: '2025-04-28 09:52' }]
  }
];

const trendPoints = [
  { month: '2024-11', x: 58, red: 66, blue: 89 },
  { month: '2024-12', x: 108, red: 56, blue: 78 },
  { month: '2025-01', x: 158, red: 68, blue: 89 },
  { month: '2025-02', x: 208, red: 49, blue: 78 },
  { month: '2025-03', x: 258, red: 45, blue: 71 },
  { month: '2025-04', x: 308, red: 34, blue: 60 }
];
const redPath = computed(() => trendPoints.map((p) => `${p.x},${p.red}`).join(' '));
const bluePath = computed(() => trendPoints.map((p) => `${p.x},${p.blue}`).join(' '));

const topics = [
  { label: '客户适当性管理', value: 25, percent: '59.52%', color: '#d80f17' },
  { label: '反洗钱管理', value: 8, percent: '19.05%', color: '#ff8a1d' },
  { label: '费用报销管理', value: 5, percent: '11.90%', color: '#3f8cff' },
  { label: '人员执业管理', value: 3, percent: '7.14%', color: '#18b574' },
  { label: '其他', value: 1, percent: '2.38%', color: '#6d48e8' }
];
const departments = [{ name: '合规法务部', value: 18 }, { name: '风险管理部', value: 12 }, { name: '审计部', value: 8 }, { name: '运营管理部', value: 6 }, { name: '财务部', value: 4 }];
const recentTasks = [
  { id: 'TASK-20250428001', type: '监管案例舆情分析', unit: '上海分公司', period: '2025Q1', status: '已完成', tone: 'success', output: '案例 18 条 / 舆情 9 条 / 建议 6 条', updated: '2025-04-28 10:21', actions: [{ text: '查看结果', to: '/regulatory/result' }, { text: '查看依据', to: '/regulatory/history' }, { text: '生成报告', to: '/audit-report/draft' }, { text: '导出', to: '/files' }] },
  { id: 'TASK-20250427002', type: '监管共享信息分析', unit: '上海分公司', period: '2025Q1', status: '已完成', tone: 'success', output: '共享文件 86 份 / 标签 312 条 / 报告 2 份', updated: '2025-04-27 16:48', actions: [{ text: '查看结果', to: '/tasks/detail/supervision-share' }, { text: '查看依据', to: '/supervision/workbench' }, { text: '生成报告', to: '/audit-report/draft' }, { text: '导出', to: '/files' }] },
  { id: 'TASK-20250426003', type: '监管案例舆情分析', unit: '上海分公司', period: '2024Q4', status: '已完成', tone: 'success', output: '案例 15 条 / 舆情 6 条 / 建议 4 条', updated: '2025-04-26 14:32', actions: [{ text: '查看结果', to: '/regulatory/result' }, { text: '查看依据', to: '/regulatory/history' }, { text: '生成报告', to: '/audit-report/draft' }, { text: '导出', to: '/files' }] },
  { id: 'TASK-20250425004', type: '监管共享信息分析', unit: '上海分公司', period: '2025Q1', status: '处理中', tone: 'processing', output: '共享文件 128 份 / 标签提取中', updated: '2025-04-28 11:05', actions: [{ text: '查看进度', to: '/tasks/detail' }, { text: '查看依据', to: '/supervision/workbench' }, { text: '取消任务', to: '/tasks' }] },
  { id: 'TASK-20250424005', type: '监管案例舆情分析', unit: '上海分公司', period: '2025Q1', status: '待确认', tone: 'warning', output: '关注点 12 条 / 风险 7 条', updated: '2025-04-25 09:41', actions: [{ text: '查看结果', to: '/regulatory/result' }, { text: '查看依据', to: '/regulatory/history' }, { text: '确认关注点', to: '/regulatory/result' }] },
  { id: 'TASK-20250423006', type: '监管共享信息分析', unit: '上海分公司', period: '2024Q4', status: '失败', tone: 'danger', output: '解析失败：文件格式不支持', updated: '2025-04-23 15:12', actions: [{ text: '查看日志', to: '/records' }, { text: '重新分析', to: '/supervision/report/source-select' }, { text: '删除', to: '/tasks' }] }
];
const materials = [
  { title: '监管案例库', desc: '收集最新监管处罚、现场检查、通报等案例信息。', tone: 'red', icon: faDatabase, to: '/regulatory/history' },
  { title: '舆情动态', desc: '监测媒体报道、网络舆情、公告信息等动态内容。', tone: 'orange', icon: faComments, to: '/regulatory/history' },
  { title: '合规/风险/审计共享文件', desc: '来自合规、风险、审计条线的共享文档与数据。', tone: 'green', icon: faFolder, to: '/supervision/workbench' },
  { title: '数据标签', desc: '基于业务、风险、监管主题的标准标签体系。', tone: 'blue', icon: faTag, to: '/audit-standard/policy' },
  { title: '使用提示', desc: '分析结果可引用到审计报告，所有过程留痕，支持追溯。', tone: 'orange', icon: faLightbulb, to: '/demo-guide' }
];
const pendingItems = [
  { label: '待确认关注点', value: '8 条', tone: 'red', icon: faComments },
  { label: '待补充标签', value: '5 条', tone: 'orange', icon: faBriefcase },
  { label: '待导出报告', value: '4 份', tone: 'blue', icon: faFileLines }
];
</script>

<style scoped>
.special-audit-page { --line:#dde3ec; --soft:#e9edf3; --red:var(--color-primary); --blue:var(--color-info); box-sizing:border-box; width:100%; max-width:none; height:0; min-height:0; margin:0; padding:var(--ui-space-3); color:#111827; overflow:auto; }
.special-empty-page { display:grid; gap:8px; min-height:calc(100vh - 74px); color:#111827; }
.special-empty-grid { display:grid; grid-template-columns:minmax(0,1fr) var(--ui-panel-rail-lg); gap:var(--ui-space-4); align-items:start; min-width:0; }
.special-empty-main { min-width:0; display:grid; grid-template-columns:minmax(0,1fr); gap:8px; }
.empty-metric-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:8px; }
.empty-metric-card { min-height:84px; display:grid; grid-template-columns:40px minmax(0,1fr); align-items:center; gap:10px; padding:10px 14px; border:1px solid var(--line); border-radius:5px; background:#fff; }
.empty-metric-icon { width:40px; height:40px; display:grid; place-items:center; border-radius:8px; color:#fff; font-size:18px; }
.empty-metric-card p { margin:0 0 6px; color:#2d3542; font-size:13px; font-weight:700; }
.empty-metric-card strong { display:block; color:#030712; font-size:26px; line-height:30px; font-weight:700; }
.empty-metric-card em { font-size:13px; font-style:normal; font-weight:600; }
.empty-metric-card small { display:block; margin-top:6px; color:#4b5563; font-size:12px; }
.empty-task-hero { min-height:300px; display:grid; grid-template-columns:260px minmax(0,1fr); align-items:center; gap:22px; padding:20px 24px; border:1px solid var(--line); border-radius:6px; background:#fff; }
.empty-hero-art { width:238px; max-width:100%; opacity:.95; }
.empty-task-hero h2 { margin:0 0 10px; font-size:24px; line-height:32px; text-align:center; }
.empty-task-hero p { max-width:620px; margin:0 auto 18px; color:#364253; font-size:13px; line-height:22px; text-align:center; }
.empty-ability-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
.empty-ability-grid article { min-height:166px; padding:16px; border:1px solid var(--line); border-radius:5px; background:#fff; }
.empty-ability-grid header { display:flex; align-items:center; gap:10px; }
.empty-ability-grid header span { width:34px; height:34px; display:grid; place-items:center; border-radius:7px; color:#fff; }
.empty-ability-grid h3 { margin:0; font-size:17px; line-height:24px; }
.empty-ability-grid small { display:block; margin:14px 0 10px; color:#3a4554; font-size:12px; font-weight:700; }
.empty-ability-grid ol { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin:0 0 14px; padding:0; list-style:none; }
.empty-ability-grid li { position:relative; display:grid; justify-items:center; gap:6px; min-width:0; color:#263241; font-size:11px; text-align:center; }
.empty-ability-grid li > span { width:30px; height:30px; display:grid; place-items:center; border:1px solid #d7dee8; border-radius:50%; color:#4b5565; }
.empty-ability-grid li i { position:absolute; top:6px; right:-10px; color:#7d8795; font-style:normal; }
.empty-ability-grid li em { font-style:normal; line-height:16px; }
.empty-ability-grid a { width:188px; height:34px; display:flex; align-items:center; justify-content:center; margin:0 auto; border:1px solid var(--red); border-radius:4px; color:var(--red); font-size:13px; font-weight:700; }
.empty-recent-panel { min-height:204px; padding:12px 14px 10px; border:1px solid var(--line); border-radius:6px; background:#fff; }
.empty-recent-panel header { display:flex; align-items:center; justify-content:space-between; min-height:28px; }
.empty-recent-panel h2 { margin:0; font-size:18px; line-height:24px; }
.empty-table-wrap { margin-top:10px; border:1px solid var(--line); border-radius:3px; overflow-x:auto; }
.empty-table-wrap table { width:100%; border-collapse:collapse; table-layout:fixed; }
.empty-table-wrap th { height:32px; border-right:1px solid var(--line); border-bottom:1px solid var(--line); background:#f8fafc; font-size:12px; text-align:center; }
.empty-table-wrap th:last-child { border-right:0; }
.empty-table-wrap td { height:96px; padding:0; text-align:center; }
.empty-table-state { display:grid; justify-items:center; align-content:center; min-height:96px; color:#667385; }
.empty-table-state svg { width:72px; height:56px; }
.empty-table-state strong { margin-top:3px; color:#667385; font-size:13px; }
.empty-table-state p { margin:6px 0 0; font-size:12px; }
.view-all-empty { display:flex; align-items:center; justify-content:flex-end; gap:6px; margin-top:14px; color:var(--color-info); font-size:13px; font-weight:700; }
.special-empty-aside { min-width:0; position:relative; z-index:0; }
.empty-info-panel { display:grid; gap:10px; padding:12px 10px 14px; border:1px solid var(--line); border-radius:5px; background:#fff; }
.empty-info-panel h2 { margin:0 0 2px; font-size:18px; line-height:24px; }
.empty-info-panel article { min-height:88px; display:grid; grid-template-columns:38px minmax(0,1fr); gap:10px; align-items:start; padding:12px 10px; border:1px solid #e4e9f1; border-radius:6px; background:#fff; }
.empty-info-panel h3 { margin:0 0 6px; font-size:15px; line-height:20px; }
.empty-info-panel p { margin:0; color:#526071; font-size:12px; line-height:20px; }
.special-empty-page { height:100%; min-height:0; }
.special-empty-grid { height:100%; align-items:stretch; }
.special-empty-main { min-height:0; grid-template-rows:auto auto minmax(0,1fr); }
.empty-recent-panel { display:flex; min-height:0; flex-direction:column; }
.empty-table-wrap { display:flex; min-height:0; flex:1; flex-direction:column; }
.empty-table-wrap table { height:100%; }
.empty-table-wrap tbody,.empty-table-wrap tr,.empty-table-wrap td,.empty-table-state { height:100%; }
.empty-info-panel { height:100%; align-content:start; }
.page-grid { display:grid; min-height:100%; grid-template-columns:minmax(0,1fr) var(--ui-panel-rail-lg); gap:var(--ui-space-4); align-items:start; }
.main-stack { min-width:0; display:grid; gap:9px; }
.metric-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:9px; margin-bottom:0; }
.metric-card,.ability-card,.chart-grid,.recent-panel,.info-panel,.pending-panel { min-width:0; border:1px solid var(--line); border-radius:4px; background:#fff; box-shadow:0 8px 18px rgba(35,45,66,.025); }
.metric-card { min-height:100px; display:grid; grid-template-columns:42px minmax(0,1fr); align-items:center; gap:9px; padding:12px 12px; }
.metric-card::before { display:none; }
.icon-box,.ability-icon,.material-icon,.pending-icon { display:grid; place-items:center; color:#fff; flex:0 0 auto; }
.icon-box { width:40px; height:40px; border-radius:8px; font-size:18px; }
.metric-card p { margin:0 0 4px; color:#2b3341; font-size:13px; font-weight:600; }
.metric-card strong { display:block; color:#090d14; font-size:24px; line-height:28px; font-weight:500; }
.metric-card em { margin-left:5px; font-size:13px; font-style:normal; font-weight:600; }
.metric-card small { display:block; margin-top:4px; color:#313947; font-size:12px; }
.metric-card b { margin-left:5px; color:var(--red); }
.red { background:var(--color-primary); }.orange { background:var(--color-warning); }.purple { background:#6f668f; }.green { background:var(--color-success); }.blue { background:var(--color-info); }
.ability-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
.ability-card { min-height:289px; padding:13px 13px 12px; display:grid; align-content:start; }
.ability-card header { display:grid; grid-template-columns:34px minmax(0,1fr); gap:10px; align-items:start; }
.ability-icon { width:31px; height:31px; border-radius:6px; font-size:16px; }
.ability-card h2 { margin:0 0 4px; font-size:18px; line-height:24px; }
.ability-card header p { margin:0; color:#526071; font-size:12px; line-height:20px; }
.ability-card h3 { margin:15px 0 10px; font-size:12px; line-height:18px; }
.flow { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:22px; margin:0 16px 12px; padding:0; list-style:none; }
.flow li { position:relative; display:grid; justify-items:center; gap:7px; min-width:0; }
.flow li > span { width:42px; height:42px; display:grid; place-items:center; border:1px solid #dce2ea; border-radius:50%; color:#4e5969; font-size:16px; }
.flow small { color:#1f2732; font-size:12px; line-height:17px; white-space:nowrap; }
.flow i { position:absolute; top:12px; right:-18px; color:#7c8797; font-style:normal; font-size:18px; }
.ability-card dl { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); margin:0 0 11px; border:1px solid var(--soft); border-radius:3px; background:#fbfcfe; }
.ability-card dl div { min-height:50px; display:grid; align-content:center; justify-items:center; border-right:1px solid var(--soft); }
.ability-card dl div:last-child { border-right:0; }
.ability-card dt { color:#505a69; font-size:12px; line-height:17px; }
.ability-card dd { margin:2px 0 0; color:#0e1420; font-size:14px; line-height:20px; font-weight:600; white-space:nowrap; }
.ability-card dd span { margin-left:3px; font-size:12px; font-weight:500; }
.new-action { width:min(194px,72%); height:32px; display:flex; justify-self:center; align-items:center; justify-content:center; border:1px solid var(--red); border-radius:4px; color:var(--red); font-size:13px; font-weight:700; }
.chart-grid { min-height:176px; display:grid; grid-template-columns:1.08fr 1.05fr 1fr; overflow:hidden; }
.chart-grid article { min-width:0; padding:7px 12px 6px; border-right:1px solid var(--soft); }
.chart-grid article:last-child { border-right:0; }
.chart-grid header { min-height:24px; display:flex; justify-content:space-between; align-items:center; gap:8px; }
.chart-grid h2,.recent-panel h2,.info-panel h2,.pending-panel h2 { margin:0; font-size:15px; line-height:22px; font-weight:700; }
.chart-grid h2 span { color:#374151; font-size:12px; font-weight:500; }
.chart-grid header small { color:#4b5563; font-size:11px; }
.legend { display:flex; gap:18px; margin-top:1px; color:#4b5563; font-size:11px; }
.legend i,.topic-list i { display:inline-block; width:8px; height:8px; margin-right:6px; border-radius:50%; }
.red-dot { background:var(--red); }.blue-dot { background:var(--blue); }
.trend svg { width:100%; height:126px; overflow:visible; }
.grid-lines line { stroke:#edf1f6; }.axis text { fill:#616b7a; font-size:10px; text-anchor:middle; }
.axis text:nth-child(-n+5) { text-anchor:start; }
.line-red,.line-blue { fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
.line-red { stroke:var(--red); }.line-blue { stroke:var(--blue); }
.point-red,.point-blue { stroke:#fff; stroke-width:1.5; }.point-red { fill:var(--red); }.point-blue { fill:var(--blue); }
.donut-layout { min-height:130px; display:grid; grid-template-columns:126px minmax(0,1fr); gap:6px; align-items:center; }
.donut { width:112px; height:112px; border-radius:50%; display:grid; place-items:center; background:conic-gradient(#d80f17 0 59.52%,#ff8a1d 59.52% 78.57%,#3f8cff 78.57% 90.47%,#18b574 90.47% 97.61%,#6d48e8 97.61% 100%); }
.donut span { width:62px; height:62px; display:grid; place-items:center; border-radius:50%; background:#fff; text-align:center; font-size:12px; line-height:18px; }
.donut b { font-size:15px; }
.topic-list { display:grid; gap:7px; margin:0; padding:0; list-style:none; }
.topic-list li { display:grid; grid-template-columns:12px minmax(0,1fr) auto auto; gap:5px; align-items:center; font-size:12px; line-height:16px; }
.topic-list span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.topic-list em { color:#4b5563; font-style:normal; }
.bar-list { display:grid; gap:9px; padding:7px 4px 0; }
.bar-list div { display:grid; grid-template-columns:66px minmax(0,1fr) 20px; gap:8px; align-items:center; color:#384151; font-size:12px; }
.bar-list p { height:7px; margin:0; border-radius:999px; background:#f0f3f8; overflow:hidden; }.bar-list i { display:block; height:100%; border-radius:inherit; background:var(--color-primary); }
.bar-list b { font-size:12px; font-weight:500; }.bar-list footer { display:grid; grid-template-columns:repeat(5,1fr); margin-left:74px; color:#505b6a; font-size:11px; }
.recent-panel { min-height:240px; padding:8px 9px 7px; }
.recent-panel h2 { margin-bottom:6px; }
.table-wrap { overflow-x:auto; border:1px solid var(--line); border-radius:2px; }
table { width:100%; min-width:950px; border-collapse:collapse; table-layout:fixed; }
th { height:26px; padding:0 7px; border-right:1px solid var(--line); border-bottom:1px solid var(--line); background:#f8fafc; text-align:center; font-size:12px; white-space:nowrap; }
td { height:23px; padding:2px 7px; border-right:1px solid var(--line); border-bottom:1px solid var(--line); text-align:center; font-size:12px; line-height:17px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
th:last-child,td:last-child { border-right:0; } tr:last-child td { border-bottom:0; }
th:nth-child(1){width:128px} th:nth-child(2){width:116px} th:nth-child(3){width:90px} th:nth-child(4){width:80px} th:nth-child(5){width:74px} th:nth-child(6){width:230px} th:nth-child(7){width:116px} th:nth-child(8){width:210px}
.status { display:inline-flex; align-items:center; justify-content:center; min-width:43px; height:18px; padding:0 7px; border-radius:4px; font-size:11px; font-weight:600; }
.status.success { border:1px solid #b6ead0; background:#eafaf2; color:#0b9b5b; }.status.processing { border:1px solid #b8d8ff; background:#eaf4ff; color:var(--color-info); }.status.warning { border:1px solid #ffd8a8; background:#fff6e9; color:var(--color-warning); }.status.danger { border:1px solid #ffc8c8; background:#fff1f1; color:var(--color-primary); }
.actions { display:flex; justify-content:center; gap:8px; color:#126dff; font-size:12px; }
.table-footer { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:5px; font-size:12px; }
.pager { display:flex; align-items:center; gap:7px; }.pager button,.pager select,.pager input { height:25px; border:1px solid #d8dee8; border-radius:4px; background:#fff; font-size:12px; }.pager button { min-width:25px; }.pager button.active { border-color:var(--red); background:var(--red); color:#fff; }.pager select { width:86px; }.pager input { width:49px; text-align:center; }
.side-stack { min-width:0; display:grid; gap:11px; margin-top:0; }
.info-panel { display:grid; gap:8px; padding:15px 10px 12px; }.info-panel h2 { margin:0 4px 2px; }
.info-panel article { min-height:90px; display:grid; grid-template-columns:39px minmax(0,1fr); gap:12px; align-items:start; padding:11px 12px; border:1px solid #e5e9f0; border-radius:6px; background:#fff; }
.material-icon { width:34px; height:34px; border-radius:8px; font-size:16px; }
.info-panel h3 { margin:0 0 5px; font-size:15px; line-height:20px; }.info-panel p { margin:0; color:#4c5666; font-size:12px; line-height:18px; }.info-panel a { float:right; margin-top:6px; color:#126dff; font-size:12px; font-weight:600; }
.pending-panel { padding:12px 12px 15px; }.pending-panel header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }.pending-panel header span { color:#4b5563; font-size:12px; }
.pending-panel ul { display:grid; gap:11px; margin:0; padding:0; list-style:none; }.pending-panel li { min-height:30px; display:grid; grid-template-columns:28px minmax(0,1fr) auto; gap:9px; align-items:center; }
.pending-icon { width:26px; height:26px; border-radius:6px; font-size:13px; }.pending-panel p { margin:0; font-size:12px; }.pending-panel strong { font-size:13px; }.pending-panel strong.red { color:var(--red); background:none; }.pending-panel strong.orange { color:var(--color-warning); background:none; }.pending-panel strong.blue { color:var(--blue); background:none; }.pending-panel > a { display:flex; justify-content:center; align-items:center; gap:6px; margin-top:22px; color:#126dff; font-size:12px; font-weight:600; }
@media (max-width:1390px){.special-audit-page{max-width:none;padding-left:6px;padding-right:6px}.page-grid{grid-template-columns:minmax(0,1fr) 270px;gap:10px}.metric-card{grid-template-columns:40px minmax(0,1fr);padding:12px 9px}.icon-box{width:36px;height:36px}.metric-card strong{font-size:23px}.ability-card{padding-left:11px;padding-right:11px}.ability-card h2{font-size:16px}.flow{gap:18px;margin-left:12px;margin-right:12px}.flow i{right:-16px}.ability-card dd{font-size:13px}.donut-layout{grid-template-columns:116px minmax(0,1fr)}.donut{width:106px;height:106px}.topic-list li{gap:4px;font-size:11px}}
@media (max-width:1280px){.special-empty-grid{grid-template-columns:1fr}.empty-metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.empty-info-panel{grid-template-columns:repeat(2,minmax(0,1fr))}.empty-info-panel h2{grid-column:1/-1}.empty-task-hero{grid-template-columns:220px minmax(0,1fr);gap:20px;padding-left:22px;padding-right:22px}.empty-hero-art{width:220px}.empty-info-panel article{grid-template-columns:36px minmax(0,1fr);padding-left:10px;padding-right:10px}}
@media (max-width:1180px){.page-grid{grid-template-columns:1fr}.side-stack{grid-template-columns:1fr;margin-top:0}.info-panel{grid-template-columns:repeat(2,minmax(0,1fr))}.info-panel h2{grid-column:1/-1}}
@media (max-width:1040px){.metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.chart-grid{grid-template-columns:1fr}.chart-grid article{border-right:0;border-bottom:1px solid var(--soft)}.chart-grid article:last-child{border-bottom:0}.trend svg{height:145px}.bar-list{max-width:560px}}
@media (max-width:760px){.special-audit-page{padding:12px 10px 20px}.empty-metric-grid,.empty-info-panel,.metric-grid,.ability-grid,.info-panel{grid-template-columns:1fr}.metric-card{min-height:88px}.ability-card{min-height:auto}.ability-card dl{grid-template-columns:repeat(2,minmax(0,1fr))}.ability-card dl div:nth-child(2){border-right:0}.ability-card dl div:nth-child(-n+2){border-bottom:1px solid var(--soft)}.donut-layout{grid-template-columns:1fr;justify-items:center}.topic-list{width:100%}.table-footer,.pager{flex-wrap:wrap;justify-content:flex-start}}
@media (max-width:480px){.flow{gap:10px;margin-left:0;margin-right:0}.flow i{right:-11px}.flow small{white-space:normal;text-align:center}.actions{gap:5px}}
</style>
