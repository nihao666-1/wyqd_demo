<template>
  <div class="special-audit-page" aria-labelledby="special-audit-title">
    <div class="title-row">
      <h1 id="special-audit-title">专项审计分析</h1>
    </div>

    <div class="page-grid">
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
import { computed } from 'vue';
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
    to: '/regulatory/new',
    action: '新建案例舆情分析',
    steps: [{ text: '输入单位/业务', icon: faUser }, { text: '获取案例舆情', icon: faFileLines }, { text: '加入审计重点', icon: faWandMagicSparkles }],
    stats: [{ label: '监管案例', value: '58', unit: '条' }, { label: '舆情风险', value: '24', unit: '条' }, { label: '审计建议', value: '12', unit: '条' }, { label: '最新分析', value: '2025-04-28 10:21' }]
  },
  {
    title: '监管共享信息分析',
    desc: '整合监督共享信息，提取标签并生成汇总分析报告。',
    tone: 'green',
    icon: faClipboardList,
    to: '/supervision/report/source-select',
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
.special-audit-page { --line:#dde3ec; --soft:#e9edf3; --red:#d60812; --blue:#1677ff; max-width:1362px; margin:0 auto; padding:14px 8px 12px; color:#111827; }
.title-row h1 { margin:0 0 12px; font-size:24px; line-height:32px; font-weight:700; }
.page-grid { display:grid; grid-template-columns:minmax(0,1fr) 282px; gap:12px; align-items:start; }
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
.red { background:linear-gradient(135deg,#d90a12,#ef2a35); }.orange { background:linear-gradient(135deg,#f08300,#ff9d19); }.purple { background:linear-gradient(135deg,#6a40e8,#8660ff); }.green { background:linear-gradient(135deg,#12a66c,#1db67b); }.blue { background:linear-gradient(135deg,#2f80ed,#5ca3ff); }
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
.bar-list p { height:7px; margin:0; border-radius:999px; background:#f0f3f8; overflow:hidden; }.bar-list i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#d60812,#df1b23); }
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
.status.success { border:1px solid #b6ead0; background:#eafaf2; color:#0b9b5b; }.status.processing { border:1px solid #b8d8ff; background:#eaf4ff; color:#2378e5; }.status.warning { border:1px solid #ffd8a8; background:#fff6e9; color:#d97800; }.status.danger { border:1px solid #ffc8c8; background:#fff1f1; color:#d71920; }
.actions { display:flex; justify-content:center; gap:8px; color:#126dff; font-size:12px; }
.table-footer { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:5px; font-size:12px; }
.pager { display:flex; align-items:center; gap:7px; }.pager button,.pager select,.pager input { height:25px; border:1px solid #d8dee8; border-radius:4px; background:#fff; font-size:12px; }.pager button { min-width:25px; }.pager button.active { border-color:var(--red); background:var(--red); color:#fff; }.pager select { width:86px; }.pager input { width:49px; text-align:center; }
.side-stack { min-width:0; display:grid; gap:11px; margin-top:-44px; }
.info-panel { display:grid; gap:8px; padding:15px 10px 12px; }.info-panel h2 { margin:0 4px 2px; }
.info-panel article { min-height:90px; display:grid; grid-template-columns:39px minmax(0,1fr); gap:12px; align-items:start; padding:11px 12px; border:1px solid #e5e9f0; border-radius:6px; background:#fff; }
.material-icon { width:34px; height:34px; border-radius:8px; font-size:16px; }
.info-panel h3 { margin:0 0 5px; font-size:15px; line-height:20px; }.info-panel p { margin:0; color:#4c5666; font-size:12px; line-height:18px; }.info-panel a { float:right; margin-top:6px; color:#126dff; font-size:12px; font-weight:600; }
.pending-panel { padding:12px 12px 15px; }.pending-panel header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }.pending-panel header span { color:#4b5563; font-size:12px; }
.pending-panel ul { display:grid; gap:11px; margin:0; padding:0; list-style:none; }.pending-panel li { min-height:30px; display:grid; grid-template-columns:28px minmax(0,1fr) auto; gap:9px; align-items:center; }
.pending-icon { width:26px; height:26px; border-radius:6px; font-size:13px; }.pending-panel p { margin:0; font-size:12px; }.pending-panel strong { font-size:13px; }.pending-panel strong.red { color:var(--red); background:none; }.pending-panel strong.orange { color:#f08300; background:none; }.pending-panel strong.blue { color:var(--blue); background:none; }.pending-panel > a { display:flex; justify-content:center; align-items:center; gap:6px; margin-top:22px; color:#126dff; font-size:12px; font-weight:600; }
@media (max-width:1390px){.special-audit-page{max-width:none;padding-left:6px;padding-right:6px}.page-grid{grid-template-columns:minmax(0,1fr) 270px;gap:10px}.metric-card{grid-template-columns:40px minmax(0,1fr);padding:12px 9px}.icon-box{width:36px;height:36px}.metric-card strong{font-size:23px}.ability-card{padding-left:11px;padding-right:11px}.ability-card h2{font-size:16px}.flow{gap:18px;margin-left:12px;margin-right:12px}.flow i{right:-16px}.ability-card dd{font-size:13px}.donut-layout{grid-template-columns:116px minmax(0,1fr)}.donut{width:106px;height:106px}.topic-list li{gap:4px;font-size:11px}}
@media (max-width:1180px){.page-grid{grid-template-columns:1fr}.side-stack{grid-template-columns:1fr;margin-top:0}.info-panel{grid-template-columns:repeat(2,minmax(0,1fr))}.info-panel h2{grid-column:1/-1}}
@media (max-width:1040px){.metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.chart-grid{grid-template-columns:1fr}.chart-grid article{border-right:0;border-bottom:1px solid var(--soft)}.chart-grid article:last-child{border-bottom:0}.trend svg{height:145px}.bar-list{max-width:560px}}
@media (max-width:760px){.special-audit-page{padding:12px 10px 20px}.metric-grid,.ability-grid,.info-panel{grid-template-columns:1fr}.metric-card{min-height:88px}.ability-card{min-height:auto}.ability-card dl{grid-template-columns:repeat(2,minmax(0,1fr))}.ability-card dl div:nth-child(2){border-right:0}.ability-card dl div:nth-child(-n+2){border-bottom:1px solid var(--soft)}.donut-layout{grid-template-columns:1fr;justify-items:center}.topic-list{width:100%}.table-footer,.pager{flex-wrap:wrap;justify-content:flex-start}}
@media (max-width:480px){.flow{gap:10px;margin-left:0;margin-right:0}.flow i{right:-11px}.flow small{white-space:normal;text-align:center}.actions{gap:5px}}
</style>
