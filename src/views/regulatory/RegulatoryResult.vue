<template>
  <section class="reg-result-page" data-regulatory-result-page aria-labelledby="regulatory-result-title">
    <div class="reg-result-main">
      <header class="reg-page-title">
        <h2 id="regulatory-result-title">监管案例舆情分析</h2>
        <span aria-label="页面说明">i</span>
      </header>

      <section class="filter-strip" data-result-region="filters" aria-label="分析筛选条件">
        <label v-for="filter in filters" :key="filter.label">
          <span>{{ filter.label }}</span>
          <select v-if="filter.type === 'select'" :aria-label="filter.label">
            <option>{{ filter.value }}</option>
          </select>
          <input v-else :value="filter.value" :aria-label="filter.label" readonly />
        </label>
        <div class="filter-actions">
          <button type="button" class="primary" @click="notify('已按当前条件刷新监管案例舆情分析。')">查询</button>
          <button type="button" @click="notify('筛选条件已重置为默认范围。')">重置</button>
          <button type="button" class="primary wide" @click="notify('已进入新建案例舆情分析流程。')">新建案例舆情分析</button>
        </div>
      </section>

      <section class="metric-strip" data-result-region="metrics" aria-label="监管分析汇总指标">
        <article v-for="metric in metrics" :key="metric.label">
          <span class="metric-icon" :class="metric.tone"><FontAwesomeIcon :icon="metric.icon" /></span>
          <div>
            <p>{{ metric.label }}</p>
            <strong>{{ metric.value }}<small>{{ metric.unit }}</small></strong>
            <em>较昨日 <b>{{ metric.delta }}</b></em>
          </div>
        </article>
      </section>

      <section class="chart-grid" data-result-region="charts" aria-label="监管案例舆情分析图表">
        <article class="chart-card trend-card">
          <h3>监管关注点趋势 <small>（近 6 个月）</small></h3>
          <svg viewBox="0 0 276 152" role="img" aria-label="监管关注点趋势折线图">
            <g class="grid-lines">
              <path v-for="y in [22, 50, 78, 106, 134]" :key="y" :d="`M28 ${y} H258`" />
            </g>
            <text x="8" y="22">（条）</text>
            <text x="246" y="22">（%）</text>
            <polyline class="line-red" points="34,112 78,96 122,78 166,64 210,50 248,44" />
            <polyline class="line-blue" points="34,126 78,74 122,102 166,92 210,99 248,70" />
            <g class="dots-red">
              <circle v-for="point in trendPoints" :key="point" :cx="point[0]" :cy="point[1]" r="3" />
            </g>
            <g class="axis-labels">
              <text v-for="month in trendMonths" :key="month.label" :x="month.x" y="148">{{ month.label }}</text>
            </g>
            <g class="legend">
              <circle cx="74" cy="12" r="3" />
              <text x="82" y="15">关注点数量（条）</text>
              <path d="M160 12 H178" />
              <text x="183" y="15">同比（%）</text>
            </g>
          </svg>
        </article>

        <article class="chart-card donut-card">
          <h3>风险主题分布</h3>
          <div class="donut-layout">
            <div class="donut-wrap">
              <svg viewBox="0 0 160 160" role="img" aria-label="风险主题分布环形图">
                <circle class="donut-bg" cx="80" cy="80" r="52" />
                <circle v-for="segment in donutSegments" :key="segment.className" :class="segment.className" cx="80" cy="80" r="52" :stroke-dasharray="segment.dash" :stroke-dashoffset="segment.offset" />
              </svg>
              <span>合计<br /><b>126 条</b></span>
            </div>
            <ul>
              <li v-for="item in riskThemes" :key="item.name"><i :class="item.tone"></i>{{ item.name }}<b>{{ item.percent }}</b></li>
            </ul>
          </div>
        </article>

        <article class="chart-card source-card">
          <h3>案例来源分布 <small>（条）</small></h3>
          <svg viewBox="0 0 240 152" role="img" aria-label="案例来源分布柱状图">
            <g class="grid-lines">
              <path v-for="y in [26, 54, 82, 110, 138]" :key="y" :d="`M24 ${y} H226`" />
            </g>
            <g v-for="bar in sourceBars" :key="bar.name">
              <rect :x="bar.x" :y="bar.y" width="20" :height="138 - bar.y" rx="2" />
              <text :x="bar.x + 10" :y="bar.y - 6" text-anchor="middle">{{ bar.value }}</text>
              <text :x="bar.x + 10" y="150" text-anchor="middle">{{ bar.name }}</text>
            </g>
          </svg>
        </article>

        <article class="chart-card reason-card">
          <h3>高频处罚原因TOP5 <small>（条）</small></h3>
          <div v-for="reason in reasonBars" :key="reason.name" class="reason-row">
            <span>{{ reason.name }}</span>
            <i><b :style="{ width: reason.width }"></b></i>
            <em>{{ reason.value }}</em>
          </div>
          <div class="reason-axis"><span>0</span><span>5</span><span>10</span><span>15</span><span>20</span></div>
        </article>
      </section>

      <section class="focus-table-card" data-result-region="focus-table" aria-label="监管关注点结果表">
        <nav class="result-tabs" aria-label="结果类型">
          <button v-for="tab in tabs" :key="tab" type="button" :class="{ active: tab === '监管关注点' }">{{ tab }}</button>
        </nav>
        <p class="table-count">共 126 条关注点</p>
        <div class="focus-table-wrap">
          <table>
            <thead>
              <tr>
                <th>关注点编号</th>
                <th>风险主题</th>
                <th>关联案例/舆情</th>
                <th>业务线</th>
                <th>风险等级</th>
                <th>相似度</th>
                <th>建议检查内容</th>
                <th>引用状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in focusRows" :key="row.id" :class="{ selected: row.id === selectedFocus.id }" @click="selectedId = row.id">
                <td>{{ row.id }}</td>
                <td>{{ row.theme }}</td>
                <td>{{ row.refs }}</td>
                <td>{{ row.line }}</td>
                <td><span class="risk-tag" :class="row.riskTone">{{ row.risk }}</span></td>
                <td>{{ row.similarity }}</td>
                <td>{{ row.suggestion }}</td>
                <td>{{ row.status }}</td>
                <td class="row-actions">
                  <button type="button" @click.stop="selectedId = row.id">查看详情</button>
                  <button type="button" @click.stop="notify(`${row.id} 已加入审计重点。`)">加入审计重点</button>
                  <button type="button" @click.stop="notify(`${row.id} 已引用到报告。`)">引用到报告</button>
                  <button type="button" @click.stop="notify(`${row.id} 已从当前列表移除。`)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer class="pagination">
          <span>共 126 条</span>
          <div>
            <button type="button">‹</button>
            <button type="button" class="active">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">4</button>
            <button type="button">5</button>
            <span>...</span>
            <button type="button">13</button>
            <button type="button">›</button>
            <select aria-label="每页条数"><option>10 条/页</option></select>
          </div>
          <label>跳至 <input value="1" aria-label="跳转页码" readonly /> 页</label>
        </footer>
      </section>

      <section class="process-flow-card" data-result-region="process-flow" aria-label="本次分析处理流程">
        <h3>处理流程 <small>（本次分析）</small></h3>
        <ol>
          <li v-for="(step, index) in processSteps" :key="step.title" :class="{ linked: step.linked }">
            <span><FontAwesomeIcon :icon="step.icon" /></span>
            <div><strong>{{ step.title }}</strong><p>{{ step.desc }}</p><em>{{ step.time }}</em></div>
            <i v-if="index < processSteps.length - 1"></i>
          </li>
        </ol>
      </section>

      <section class="history-card" data-result-region="history" aria-label="历史分析任务">
        <h3>历史分析任务</h3>
        <table>
          <thead>
            <tr><th>任务编号</th><th>任务名称</th><th>业务范围</th><th>分析期间</th><th>状态</th><th>关注点数</th><th>创建时间</th><th>输出结果</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="task in historyTasks" :key="task.id">
              <td>{{ task.id }}</td><td>{{ task.name }}</td><td>{{ task.scope }}</td><td>{{ task.period }}</td>
              <td><span class="status-done">分析完成</span></td><td>{{ task.count }}</td><td>{{ task.createdAt }}</td>
              <td>{{ task.outputs }}</td>
              <td class="history-actions"><button type="button">查看</button><button type="button">复制</button><button type="button">删除</button></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <aside class="focus-detail" data-result-region="focus-detail" aria-labelledby="focus-detail-title">
      <header>
        <h3 id="focus-detail-title">关注点详情</h3>
        <button type="button" aria-label="关闭关注点详情" @click="notify('关注点详情已收起。')"><FontAwesomeIcon :icon="faXmark" /></button>
      </header>
      <div class="detail-body">
        <section>
          <h4>综合结论</h4>
          <p>该关注点在 18 个监管案例和 6 条舆情中高频出现，存在客户适当性管理制度执行不到位、评估记录不完整、产品匹配性不足等风险，监管处罚金额合计 1,265.80 万元。</p>
        </section>
        <section>
          <h4>相关监管案例（3）</h4>
          <ul class="case-list">
            <li v-for="item in detailCases" :key="item.title">
              <b>{{ item.title }}</b><small>{{ item.source }}　{{ item.date }}</small><button type="button">查看原文</button>
            </li>
          </ul>
          <button class="expand" type="button">展开全部（18 条）⌄</button>
        </section>
        <section>
          <h4>舆情来源（2）</h4>
          <ul class="case-list">
            <li v-for="item in detailNews" :key="item.title">
              <b>{{ item.title }}</b><small>{{ item.date }}</small><button type="button">查看原文</button>
            </li>
          </ul>
          <button class="expand" type="button">展开全部（6 条）⌄</button>
        </section>
        <section>
          <h4>处罚依据</h4>
          <ul class="basis-list">
            <li>《证券公司客户适当性管理办法》第十六条、第二十条</li>
            <li>《证券法》第一百九十六条</li>
          </ul>
        </section>
        <section>
          <h4>相似点分析</h4>
          <div class="similar-tags">
            <span>评估结果不完整</span><span>记录留存不规范</span><span>产品匹配不足</span><span>风险提示不到位</span>
          </div>
        </section>
        <section>
          <h4>人工处理</h4>
          <div class="decision-row">
            <label><input v-model="decision" type="radio" value="采纳建议" />采纳建议</label>
            <label><input v-model="decision" type="radio" value="无需处置" />无需处置</label>
            <label><input v-model="decision" type="radio" value="已优化控制" />已优化控制</label>
          </div>
          <label class="comment-box">
            <textarea v-model="comment" maxlength="200" placeholder="请输入处理说明（选填）"></textarea>
            <span>{{ comment.length }}/200</span>
          </label>
        </section>
      </div>
      <footer>
        <button type="button" class="primary" @click="notify(`${selectedFocus.id} 已加入审计重点。`)">加入审计重点</button>
        <button type="button" class="outline" @click="notify(`${selectedFocus.id} 已引用到当前任务。`)">引用到当前任务</button>
        <button type="button" @click="notify('监管案例舆情分析结果已导出。')">导出结果</button>
      </footer>
    </aside>
  </section>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faChartSimple,
  faCheck,
  faDatabase,
  faFileLines,
  faLink,
  faMessage,
  faRotate,
  faShieldHalved,
  faStar,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

const store = inject('store');
const DESIGN_WIDTH = 1586;
let resizeFrame = 0;
let shell = null;

const filters = [
  { label: '被分析单位', value: '上海分公司', type: 'select' },
  { label: '指定业务', value: '适当性管理 / 反洗钱 / 费用...', type: 'select' },
  { label: '审计期间', value: '2025Q1（2025-01-01 ~ 2025-03-31）', type: 'select' },
  { label: '监管机构', value: '全部', type: 'select' },
  { label: '风险主题', value: '全部', type: 'select' },
  { label: '舆情来源', value: '全部', type: 'select' }
];

const metrics = [
  { label: '监管案例', value: 58, unit: '条', delta: '+8', tone: 'red', icon: faDatabase },
  { label: '舆情风险', value: 24, unit: '条', delta: '+3', tone: 'orange', icon: faMessage },
  { label: '监管关注点', value: 126, unit: '条', delta: '+12', tone: 'green', icon: faStar },
  { label: '审计建议', value: 32, unit: '条', delta: '+5', tone: 'blue', icon: faFileLines },
  { label: '已引用到任务', value: 18, unit: '条', delta: '+4', tone: 'purple', icon: faLink }
];

const trendPoints = [[34, 112], [78, 96], [122, 78], [166, 64], [210, 50], [248, 44]];
const trendMonths = [
  { label: '2024-10', x: 20 },
  { label: '2024-11', x: 62 },
  { label: '2024-12', x: 105 },
  { label: '2025-01', x: 148 },
  { label: '2025-02', x: 191 },
  { label: '2025-03', x: 234 }
];
const donutSegments = [
  { className: 'donut-blue', dash: '98 328', offset: '0' },
  { className: 'donut-green', dash: '72 328', offset: '-98' },
  { className: 'donut-orange', dash: '57 328', offset: '-170' },
  { className: 'donut-red', dash: '36 328', offset: '-227' },
  { className: 'donut-cyan', dash: '31 328', offset: '-263' },
  { className: 'donut-yellow', dash: '31 328', offset: '-294' }
];
const riskThemes = [
  { name: '客户适当性', percent: '30.16%', tone: 'blue' },
  { name: '反洗钱管理', percent: '22.22%', tone: 'green' },
  { name: '费用报销', percent: '17.46%', tone: 'orange' },
  { name: '信息披露', percent: '11.11%', tone: 'red' },
  { name: '投诉处理', percent: '9.52%', tone: 'cyan' },
  { name: '其他', percent: '9.52%', tone: 'yellow' }
];
const sourceBars = [
  { name: '证监会', value: 21, x: 36, y: 48 },
  { name: '交易所', value: 15, x: 78, y: 72 },
  { name: '银保监会', value: 10, x: 120, y: 94 },
  { name: '地方监管局', value: 8, x: 162, y: 104 },
  { name: '其他', value: 4, x: 204, y: 120 }
];
const reasonBars = [
  { name: '客户适当性不足', value: 18, width: '90%' },
  { name: '未履行反洗钱义务', value: 16, width: '80%' },
  { name: '内部控制不完善', value: 12, width: '60%' },
  { name: '虚假或不真实披露', value: 10, width: '50%' },
  { name: '信息披露不及时', value: 8, width: '40%' }
];

const tabs = ['监管案例', '舆情风险', '监管关注点', '审计检查建议', '已引用'];
const focusRows = [
  { id: 'FG-2025-0001', theme: '客户适当性管理', refs: '案例 18 条　舆情 6 条', line: '经纪业务', risk: '高风险', riskTone: 'high', similarity: '92%', suggestion: '核查客户适当性制度执行情况，评估记录完整性', status: '已引用 2 次' },
  { id: 'FG-2025-0002', theme: '反洗钱管理', refs: '案例 16 条　舆情 5 条', line: '经纪业务', risk: '高风险', riskTone: 'high', similarity: '88%', suggestion: '核查客户身份识别、异常交易监测及报告情况', status: '已引用 1 次' },
  { id: 'FG-2025-0003', theme: '费用报销真实性', refs: '案例 12 条　舆情 4 条', line: '管理支持', risk: '中风险', riskTone: 'medium', similarity: '83%', suggestion: '核查报销凭证真实性、合规性及审批完整性', status: '待引用' },
  { id: 'FG-2025-0004', theme: '投诉处理', refs: '案例 10 条　舆情 3 条', line: '经纪业务', risk: '中风险', riskTone: 'medium', similarity: '78%', suggestion: '核查投诉受理、处理、反馈及纾困台账完整性', status: '待引用' },
  { id: 'FG-2025-0005', theme: '信息披露', refs: '案例 8 条　舆情 3 条', line: '经纪业务', risk: '低风险', riskTone: 'low', similarity: '72%', suggestion: '核查信息披露期限执行及报告内容准确性', status: '已引用 1 次' }
];
const selectedId = ref('FG-2025-0001');
const selectedFocus = computed(() => focusRows.find((row) => row.id === selectedId.value) || focusRows[0]);
const processSteps = [
  { title: '获取案例', desc: '58 条案例', time: '完成时间 09:12', icon: faCheck },
  { title: '提取风险', desc: '24 条舆情风险', time: '完成时间 09:18', icon: faCheck },
  { title: '生成人工建议', desc: '32 条审计建议', time: '完成时间 09:25', icon: faCheck },
  { title: '已引用', desc: '18 条已引用', time: '完成时间 09:40', icon: faLink, linked: true }
];
const historyTasks = [
  { id: 'AN-20250428-001', name: '上海分公司Q1适当性管理舆情分析', scope: '适当性管理', period: '2025Q1', count: 126, createdAt: '2025-04-28 09:00', outputs: '监管关注点清单.xlsx　审计建议清单.xlsx' },
  { id: 'AN-20250415-002', name: '上海分公司Q1反洗钱案例分析', scope: '反洗钱管理', period: '2025Q1', count: 98, createdAt: '2025-04-15 10:23', outputs: '监管关注点清单.xlsx　舆情风险清单.xlsx' },
  { id: 'AN-20250330-001', name: '证券行业舆情月度监测（3月）', scope: '全行业', period: '2025-03', count: 156, createdAt: '2025-03-30 08:40', outputs: '舆情监测报告.pdf' }
];
const detailCases = [
  { title: '《证券公司客户适当性管理办法（2023年修订）》', source: '证监会', date: '2023-08-18' },
  { title: '上海证监局行政处罚决定书〔2024〕36号', source: '上海证监局', date: '2024-06-21' },
  { title: '深圳证监局行政监管措施决定书〔2024〕15号', source: '深圳证监局', date: '2024-03-12' }
];
const detailNews = [
  { title: '证券时报网：《客户适当性管理乱象频发，监管持续加码》', date: '2025-04-22' },
  { title: '新浪财经：《券商产品与客户不匹配问题引关注》', date: '2025-04-18' }
];
const decision = ref('采纳建议');
const comment = ref('');

function notify(message) {
  store?.setNotice?.(message);
}

function applyViewportScale() {
  if (!shell) shell = document.querySelector('.regulatory-result-shell');
  if (!shell) return;
  const scale = window.innerWidth < 1200 ? 1 : Math.min(1.22, window.innerWidth / DESIGN_WIDTH);
  shell.style.setProperty('--regulatory-result-scale', String(scale));
}

function scheduleScale() {
  if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(applyViewportScale);
}

onMounted(() => {
  applyViewportScale();
  window.addEventListener('resize', scheduleScale);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', scheduleScale);
  if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
  if (shell) shell.style.removeProperty('--regulatory-result-scale');
});
</script>

<style scoped>
.reg-result-page {
  --reg-red: #c9000b;
  --reg-line: #dde4ef;
  --reg-soft: #f7f9fc;
  --reg-muted: #687386;
  width: 1360px;
  height: 927px;
  display: grid;
  grid-template-columns: 1055px 305px;
  gap: 10px;
  color: #101828;
  font-size: 12px;
}

.reg-result-main {
  display: grid;
  grid-template-rows: 29px 74px 88px 218px 244px 78px 145px;
  gap: 8px;
  min-width: 0;
}

.reg-page-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reg-page-title h2 {
  font-size: 20px;
  line-height: 1;
}

.reg-page-title span {
  width: 15px;
  height: 15px;
  border: 1px solid #9aa4b2;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.filter-strip,
.metric-strip,
.chart-card,
.focus-table-card,
.process-flow-card,
.history-card,
.focus-detail {
  border: 1px solid var(--reg-line);
  border-radius: 3px;
  background: #fff;
}

.filter-strip {
  display: grid;
  grid-template-columns: 112px 176px 196px 78px 82px 82px 1fr;
  gap: 10px;
  align-items: end;
  padding: 10px 10px 12px;
}

.filter-strip label {
  display: grid;
  gap: 5px;
  min-width: 0;
  color: #394456;
  font-size: 11px;
  font-weight: 700;
}

.filter-strip select,
.filter-strip input {
  width: 100%;
  height: 30px;
  padding: 0 9px;
  border: 1px solid #d4dce8;
  border-radius: 3px;
  background: #f9fbfe;
  color: #111827;
  font-size: 11px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
}

.filter-actions button {
  height: 31px;
  min-width: 50px;
  padding: 0 12px;
  border: 1px solid #d2d9e5;
  border-radius: 3px;
  background: #fff;
  color: #374151;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.filter-actions .primary {
  border-color: var(--reg-red);
  background: linear-gradient(180deg, #d6000b, #b70000);
  color: #fff;
}

.filter-actions .wide {
  min-width: 124px;
}

.metric-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}

.metric-strip article {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-right: 1px solid #edf1f6;
}

.metric-strip article:last-child {
  border-right: 0;
}

.metric-icon {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.metric-icon.red { background: #ffe8e8; color: #d00000; }
.metric-icon.orange { background: #fff0dc; color: #f07a00; }
.metric-icon.green { background: #e5f7ed; color: #0b9b50; }
.metric-icon.blue { background: #e8f1ff; color: #2f76e6; }
.metric-icon.purple { background: #f1e8ff; color: #7c3aed; }

.metric-strip p {
  color: #263244;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
}

.metric-strip strong {
  display: block;
  margin: 4px 0;
  font-size: 29px;
  line-height: 1;
}

.metric-strip small {
  margin-left: 5px;
  font-size: 12px;
}

.metric-strip em {
  color: #64748b;
  font-style: normal;
  font-size: 11px;
}

.metric-strip b {
  color: #e00000;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.96fr 0.88fr 1fr;
  gap: 10px;
}

.chart-card {
  min-width: 0;
  padding: 10px 10px 6px;
}

.chart-card h3 {
  height: 22px;
  font-size: 13px;
}

.chart-card small {
  color: #64748b;
  font-weight: 400;
}

.chart-card svg {
  width: 100%;
  height: 176px;
}

.grid-lines path {
  stroke: #e9edf3;
  stroke-width: 1;
}

svg text {
  fill: #344054;
  font-size: 9px;
}

.line-red,
.line-blue {
  fill: none;
  stroke-width: 2;
}

.line-red { stroke: #e00000; }
.line-blue { stroke: #2f76e6; stroke-dasharray: 5 4; }
.dots-red circle,
.legend circle { fill: #e00000; }
.legend path { stroke: #2f76e6; stroke-dasharray: 5 4; }

.donut-layout {
  display: grid;
  grid-template-columns: 145px 1fr;
  align-items: center;
  height: 176px;
}

.donut-wrap {
  position: relative;
  display: grid;
  place-items: center;
}

.donut-wrap svg {
  width: 142px;
  height: 142px;
  transform: rotate(-90deg);
}

.donut-wrap span {
  position: absolute;
  text-align: center;
  color: #111827;
  font-weight: 800;
  line-height: 1.45;
}

.donut-bg,
.donut-wrap circle {
  fill: none;
  stroke-width: 22;
}

.donut-bg { stroke: #edf2f7; }
.donut-blue { stroke: #2f76e6; }
.donut-green { stroke: #25b875; }
.donut-orange { stroke: #ff9f2d; }
.donut-red { stroke: #ff4444; }
.donut-cyan { stroke: #22c7c9; }
.donut-yellow { stroke: #f5bf35; }

.donut-layout ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.donut-layout li {
  display: grid;
  grid-template-columns: 8px 1fr 43px;
  gap: 6px;
  align-items: center;
  color: #344054;
  font-size: 10px;
}

.donut-layout i,
.similar-tags span {
  border-radius: 2px;
}

.donut-layout i {
  width: 8px;
  height: 8px;
}

.donut-layout .blue { background: #2f76e6; }
.donut-layout .green { background: #25b875; }
.donut-layout .orange { background: #ff9f2d; }
.donut-layout .red { background: #ff4444; }
.donut-layout .cyan { background: #22c7c9; }
.donut-layout .yellow { background: #f5bf35; }

.source-card rect {
  fill: url("#barGradient");
}

.source-card rect {
  fill: #3478ed;
}

.source-card text {
  font-size: 9px;
}

.reason-card {
  display: grid;
  grid-template-rows: 22px repeat(5, 25px) 18px;
}

.reason-row {
  display: grid;
  grid-template-columns: 86px 1fr 20px;
  gap: 8px;
  align-items: center;
}

.reason-row span,
.reason-row em {
  color: #263244;
  font-size: 10px;
  font-style: normal;
}

.reason-row i {
  height: 10px;
  background: #eef3fb;
}

.reason-row b {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2f6fed);
}

.reason-axis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding-left: 94px;
  color: #64748b;
  font-size: 9px;
}

.focus-table-card {
  padding-top: 0;
  overflow: hidden;
}

.result-tabs {
  height: 35px;
  display: flex;
  align-items: end;
  gap: 30px;
  padding: 0 14px;
  border-bottom: 1px solid #edf1f6;
}

.result-tabs button {
  height: 35px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #1f2937;
  font-weight: 800;
  font-size: 12px;
}

.result-tabs .active {
  border-color: var(--reg-red);
  color: var(--reg-red);
}

.table-count {
  height: 30px;
  padding: 9px 14px 0;
  color: #1f2937;
  font-size: 11px;
  line-height: 1;
}

.focus-table-wrap {
  height: 143px;
  margin: 0 10px;
  overflow: hidden;
  border: 1px solid #edf1f6;
  border-bottom: 0;
}

table {
  width: 100%;
  min-width: 0;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  padding: 0 8px;
  border-bottom: 1px solid #edf1f6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  font-size: 10px;
}

th {
  height: 29px;
  background: #f7f9fc;
  color: #4b5563;
  font-weight: 800;
}

td {
  height: 23px;
  color: #1f2937;
}

.focus-table-wrap th:nth-child(1) { width: 91px; }
.focus-table-wrap th:nth-child(2) { width: 103px; }
.focus-table-wrap th:nth-child(3) { width: 124px; }
.focus-table-wrap th:nth-child(4) { width: 67px; }
.focus-table-wrap th:nth-child(5) { width: 67px; }
.focus-table-wrap th:nth-child(6) { width: 58px; }
.focus-table-wrap th:nth-child(8) { width: 72px; }
.focus-table-wrap th:nth-child(9) { width: 205px; }

.focus-table-wrap tr.selected td {
  background: #fff7f7;
}

.risk-tag,
.status-done {
  display: inline-flex;
  align-items: center;
  height: 19px;
  padding: 0 6px;
  border-radius: 3px;
  font-weight: 800;
}

.risk-tag.high { border: 1px solid #ffb1b1; background: #fff0f0; color: #e00000; }
.risk-tag.medium { border: 1px solid #ffd08a; background: #fff7e8; color: #f08a00; }
.risk-tag.low,
.status-done { border: 1px solid #a8dfc0; background: #ecfbf3; color: #0b9b50; }

.row-actions,
.history-actions {
  display: flex;
  gap: 10px;
}

.row-actions button,
.history-actions button {
  border: 0;
  background: transparent;
  color: #1d6fe8;
  font-weight: 700;
  font-size: 10px;
}

.pagination {
  height: 34px;
  display: grid;
  grid-template-columns: 150px 1fr 130px;
  align-items: center;
  padding: 0 12px;
  color: #1f2937;
  font-size: 11px;
}

.pagination div {
  display: flex;
  justify-content: center;
  gap: 6px;
  align-items: center;
}

.pagination button,
.pagination select,
.pagination input {
  height: 24px;
  border: 1px solid #d7dee9;
  border-radius: 3px;
  background: #fff;
  font-size: 11px;
}

.pagination button {
  min-width: 24px;
}

.pagination button.active {
  border-color: var(--reg-red);
  background: var(--reg-red);
  color: #fff;
}

.pagination input {
  width: 40px;
  text-align: center;
}

.process-flow-card {
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: center;
  padding: 0 14px;
}

.process-flow-card h3 {
  font-size: 13px;
}

.process-flow-card small {
  color: #64748b;
  font-weight: 400;
}

.process-flow-card ol {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
}

.process-flow-card li {
  position: relative;
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 8px;
  align-items: center;
}

.process-flow-card li > span {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #16a34a;
  color: #fff;
}

.process-flow-card li.linked > span {
  background: #2f76e6;
}

.process-flow-card li > i {
  position: absolute;
  top: 38px;
  right: 22px;
  width: 58px;
  height: 1px;
  background: #aeb8c8;
}

.process-flow-card li > i::after {
  content: "";
  position: absolute;
  right: 0;
  top: -3px;
  width: 7px;
  height: 7px;
  border-top: 1px solid #aeb8c8;
  border-right: 1px solid #aeb8c8;
  transform: rotate(45deg);
}

.process-flow-card strong {
  font-size: 12px;
}

.process-flow-card p,
.process-flow-card em {
  color: #475569;
  font-size: 10px;
  font-style: normal;
  line-height: 1.4;
}

.history-card {
  padding: 10px 12px;
  overflow: hidden;
}

.history-card h3 {
  margin-bottom: 8px;
  font-size: 13px;
}

.history-card table {
  border: 1px solid #edf1f6;
}

.history-card th,
.history-card td {
  height: 28px;
}

.focus-detail {
  height: 927px;
  display: grid;
  grid-template-rows: 43px minmax(0, 1fr) 64px;
  overflow: hidden;
}

.focus-detail > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid #edf1f6;
}

.focus-detail h3 {
  font-size: 14px;
}

.focus-detail > header button {
  border: 0;
  background: transparent;
  color: #111827;
}

.detail-body {
  overflow-y: auto;
}

.detail-body section {
  padding: 8px 14px;
  border-bottom: 1px solid #edf1f6;
}

.detail-body h4 {
  margin-bottom: 6px;
  font-size: 12px;
}

.detail-body p,
.case-list b,
.case-list small,
.basis-list li,
.decision-row label {
  font-size: 11px;
  line-height: 1.4;
}

.detail-body p,
.basis-list li {
  color: #344054;
}

.case-list,
.basis-list {
  display: grid;
  gap: 5px;
  margin: 0;
  padding-left: 14px;
}

.case-list li {
  position: relative;
  padding-right: 68px;
}

.case-list b,
.case-list small {
  display: block;
  color: #344054;
  font-weight: 600;
}

.case-list small {
  color: #7a8798;
  font-weight: 400;
}

.case-list button {
  position: absolute;
  right: 0;
  top: 2px;
  height: 22px;
  border: 1px solid #bcd5fb;
  border-radius: 3px;
  background: #f5f9ff;
  color: #1d6fe8;
  font-size: 10px;
}

.expand {
  width: 100%;
  margin-top: 5px;
  border: 0;
  background: transparent;
  color: #1d6fe8;
  font-size: 11px;
}

.similar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.similar-tags span {
  padding: 4px 7px;
  background: #f2f5fa;
  color: #344054;
  font-size: 11px;
}

.decision-row {
  display: flex;
  gap: 14px;
  margin-bottom: 7px;
}

.decision-row input {
  accent-color: var(--reg-red);
}

.comment-box {
  position: relative;
  display: block;
}

.comment-box textarea {
  width: 100%;
  height: 58px;
  resize: none;
  padding: 10px;
  border: 1px solid #d7dee9;
  border-radius: 3px;
  font-size: 11px;
}

.comment-box span {
  position: absolute;
  right: 9px;
  bottom: 8px;
  color: #64748b;
  font-size: 10px;
}

.focus-detail footer {
  display: grid;
  grid-template-columns: 1fr 1.1fr 0.8fr;
  gap: 8px;
  align-items: center;
  padding: 12px 10px;
  border-top: 1px solid #edf1f6;
  background: #fff;
}

.focus-detail footer button {
  height: 32px;
  border: 1px solid #d7dee9;
  border-radius: 3px;
  background: #fff;
  color: #344054;
  font-weight: 800;
  font-size: 12px;
}

.focus-detail footer .primary {
  border-color: var(--reg-red);
  background: var(--reg-red);
  color: #fff;
}

.focus-detail footer .outline {
  border-color: #ef9a9a;
  color: var(--reg-red);
}

@media (max-width: 1199px) {
  .reg-result-page {
    width: auto;
    height: auto;
    grid-template-columns: 1fr;
  }

  .reg-result-main {
    grid-template-rows: auto;
  }

  .filter-strip,
  .metric-strip,
  .chart-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-actions,
  .focus-detail {
    grid-column: 1 / -1;
  }

  .focus-detail {
    height: 720px;
  }
}
</style>
