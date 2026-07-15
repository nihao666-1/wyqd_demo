<template>
  <div class="workbench-page route-fill-page" :class="isEmptyMode ? 'is-empty' : 'has-data'">
    <section class="workbench-top">
      <div class="metric-grid workbench-metrics">
        <RouterLink v-for="item in topMetrics" :key="item.label" class="metric-card workbench-metric" :to="item.to">
          <div class="metric-icon" aria-hidden="true"><AuditIcon :name="item.icon" /></div>
          <div>
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}<small>{{ item.unit }}</small></strong>
            <p>{{ item.change }}</p>
          </div>
          <b aria-hidden="true">›</b>
        </RouterLink>
      </div>
      <div class="workbench-actions">
        <RouterLink class="btn primary create-task-btn" to="/tasks/create">创建审计任务</RouterLink>
      </div>
    </section>

    <template v-if="isEmptyMode">
      <section class="empty-layout">
        <div class="empty-main">
          <section class="panel welcome-panel">
            <div class="welcome-copy">
              <span class="eyebrow">首次使用</span>
              <h2>欢迎使用审计大模型系统</h2>
              <strong>当前暂无审计任务</strong>
              <p>
                从创建任务开始，按资料准备、智能分析、人工确认、报告生成和归档追溯推进。也可以导入模拟数据，查看完整工作台样例。
              </p>
              <div class="head-actions">
                <RouterLink class="btn primary" to="/tasks/create">创建审计任务</RouterLink>
                <button class="btn" type="button" @click="store.setDemoDataMode('data')">导入模拟数据</button>
                <RouterLink class="btn" to="/demo-guide">查看演示流程</RouterLink>
              </div>
            </div>
            <div class="welcome-preview" aria-hidden="true">
              <div class="preview-window">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="preview-card card-one"></div>
              <div class="preview-card card-two"></div>
              <div class="preview-doc"></div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-title">
              <div>
                <h3>推荐开始方式</h3>
                <p>选择一个入口完成首次演示，不提前展示业务结果。</p>
              </div>
            </div>
            <div class="start-card-grid">
              <RouterLink v-for="item in startCards" :key="item.title" class="start-card" :to="item.to">
                <div class="start-icon" aria-hidden="true"><AuditIcon :name="item.icon" /></div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.description }}</p>
                <div class="mini-flow">
                  <span v-for="step in item.steps" :key="step">{{ step }}</span>
                </div>
              </RouterLink>
            </div>
          </section>

          <section class="panel">
            <div class="panel-title"><h3>任务流程预览</h3></div>
            <div class="flow-strip">
              <div v-for="(step, index) in lifecycleSteps" :key="step" class="flow-node">
                <span>{{ index + 1 }}</span>
                <p>{{ step }}</p>
              </div>
            </div>
          </section>
        </div>

        <aside class="summary-rail empty-rail">
          <section class="panel guide-panel">
            <div class="panel-title"><h3>新手引导</h3></div>
            <ol class="guide-list">
              <li v-for="item in beginnerGuide" :key="item.title">
                <strong>{{ item.title }}</strong>
                <p>{{ item.description }}</p>
              </li>
            </ol>
          </section>

          <section class="panel">
            <div class="panel-title"><h3>系统初始化状态</h3></div>
            <div class="status-stack">
              <p v-for="item in initStatus" :key="item.label">
                <span>{{ item.label }}</span>
                <b :class="item.className">{{ item.status }}</b>
              </p>
            </div>
          </section>

          <section class="panel empty-log-panel">
            <div class="panel-title"><h3>最近操作空态</h3></div>
            <div class="empty-log">
              <span aria-hidden="true"><AuditIcon name="records" /></span>
              <strong>暂无操作记录</strong>
              <p>创建任务、上传资料或导入模拟数据后，将在此展示最近操作。</p>
            </div>
          </section>
        </aside>
      </section>
    </template>

    <template v-else>
      <section class="dashboard-row primary-row">
        <section class="panel todo-panel">
          <div class="panel-title">
            <h3>我的待办</h3>
            <RouterLink class="btn" to="/tasks">查看全部</RouterLink>
          </div>
          <div class="todo-tabs" role="list" aria-label="待办分类">
            <span v-for="tab in todoTabs" :key="tab.label" :class="{ active: tab.active }" role="listitem">
              {{ tab.label }} <b>{{ tab.count }}</b>
            </span>
          </div>
          <div class="todo-list">
            <article v-for="item in todoItems" :key="item.id" class="todo-item">
              <div class="todo-heading">
                <strong>{{ item.title }}</strong>
                <span class="status-tag" :class="item.statusClass">{{ item.status }}</span>
              </div>
              <div class="todo-support">
                <p>{{ item.meta }}</p>
                <div class="row-actions">
                  <RouterLink class="btn primary" :to="item.primaryTo">去处理</RouterLink>
                  <RouterLink class="btn todo-detail-link" :to="item.detailTo">查看详情</RouterLink>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="panel recent-task-panel">
          <div class="panel-title">
            <h3>最近审计任务</h3>
            <RouterLink class="btn" to="/tasks">任务列表</RouterLink>
          </div>
          <div class="compact-table">
            <table class="recent-task-table">
              <colgroup>
                <col class="task-name-col" />
                <col class="unit-col" />
                <col class="period-col" />
                <col class="stage-col" />
                <col class="progress-col" />
                <col class="status-col" />
                <col class="action-col" />
              </colgroup>
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>审计单位</th>
                  <th>审计期间</th>
                  <th>当前阶段</th>
                  <th>进度</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in recentAuditTasks" :key="task.id">
                  <td>{{ task.name }}</td>
                  <td>{{ task.unit }}</td>
                  <td>{{ task.period }}</td>
                  <td>{{ task.stage }}</td>
                  <td>
                    <div class="progress-cell">
                      <span><i :style="{ width: `${task.progress}%` }"></i></span>
                      <b>{{ task.progress }}%</b>
                    </div>
                  </td>
                  <td><span class="status-tag" :class="task.statusClass">{{ task.status }}</span></td>
                  <td><RouterLink class="table-link" :to="task.to">进入</RouterLink></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <aside class="panel quick-panel">
          <div class="panel-title"><h3>快捷入口</h3></div>
          <div class="quick-grid">
            <RouterLink v-for="item in quickEntries" :key="item.title" :to="item.to" class="quick-entry">
              <span aria-hidden="true"><AuditIcon :name="item.icon" /></span>
              <strong>{{ item.title }}</strong>
            </RouterLink>
          </div>
        </aside>
      </section>

      <section class="dashboard-row secondary-row">
        <section class="panel progress-panel">
          <div class="panel-title">
            <h3>任务进度概览</h3>
            <span class="chart-filter">近30日</span>
          </div>
          <div class="progress-combo" aria-label="任务状态数量和完成率概览">
            <svg viewBox="0 0 320 240" role="img" aria-label="任务进度柱线组合图">
              <g class="svg-legend">
                <path d="M190 15h14" class="legend-bar-line" />
                <text x="209" y="18">任务数量</text>
                <path d="M254 15h14" class="legend-rate-line" />
                <text x="273" y="18">完成率</text>
              </g>
              <g class="grid-lines">
                <line x1="34" y1="42" x2="286" y2="42" />
                <line x1="34" y1="112" x2="286" y2="112" />
                <line x1="34" y1="182" x2="286" y2="182" />
              </g>
              <g class="axis-text">
                <text x="18" y="45">60</text>
                <text x="18" y="115">30</text>
                <text x="22" y="185">0</text>
                <text x="292" y="45">100%</text>
                <text x="292" y="115">50%</text>
                <text x="292" y="185">0%</text>
              </g>
              <g v-for="item in progressChartItems" :key="item.label">
                <rect class="bar-bg" :x="item.x - 8" y="42" width="16" height="140" rx="4" />
                <rect class="bar-value" :x="item.x - 8" :y="item.barY" width="16" :height="item.barHeight" rx="4" />
                <circle class="line-dot" :cx="item.x" :cy="item.lineY" r="3.5" />
                <text class="rate-text" :x="item.x + item.rateDx" :y="item.rateY">{{ item.rate }}%</text>
                <text class="bar-label" :x="item.x" y="216">{{ item.label }}</text>
                <text class="bar-value-text" :class="{ inside: item.valueInside }" :x="item.x" :y="item.valueY">{{ item.value }}</text>
              </g>
              <polyline class="rate-line" :points="progressLinePoints" />
            </svg>
          </div>
        </section>

        <section class="panel risk-panel">
          <div class="panel-title">
            <h3>风险提醒</h3>
            <RouterLink class="btn" to="/expense/anomaly/dashboard">风险看板</RouterLink>
          </div>
          <div class="risk-list">
            <article v-for="risk in riskAlerts" :key="risk.title" class="risk-item">
              <span class="risk-level" :class="risk.className">{{ risk.level }}</span>
              <div>
                <strong>{{ risk.title }}</strong>
                <p>{{ risk.unit }} / {{ risk.time }}</p>
              </div>
              <RouterLink :to="risk.to">查看依据</RouterLink>
            </article>
          </div>
        </section>

        <section class="panel result-panel">
          <div class="panel-title"><h3>最近生成结果</h3></div>
          <div class="result-list">
            <article v-for="result in generatedResults" :key="result.name" class="result-item">
              <div>
                <strong>{{ result.name }}</strong>
                <p>{{ result.type }} / {{ result.time }}</p>
              </div>
              <div class="row-actions">
                <RouterLink class="btn" :to="result.viewTo">查看</RouterLink>
                <RouterLink class="btn" :to="result.downloadTo">下载</RouterLink>
              </div>
            </article>
          </div>
        </section>

        <section class="panel notice-panel">
          <div class="panel-title"><h3>系统通知</h3></div>
          <div class="notice-list">
            <article v-for="notice in notices" :key="notice.title" class="notice-item">
              <span :class="notice.className" aria-hidden="true"></span>
              <div>
                <strong>{{ notice.title }}</strong>
                <p>{{ notice.time }}</p>
              </div>
            </article>
          </div>
        </section>
      </section>

      <section class="panel operation-panel">
        <div class="panel-title">
          <h3>最近操作日志</h3>
          <RouterLink class="btn" to="/records">记录中心</RouterLink>
        </div>
        <div class="compact-table">
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>操作内容</th>
                <th>对象</th>
                <th>操作人</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in operationRows" :key="log.logId">
                <td>{{ log.createdAt }}</td>
                <td>{{ log.action }}</td>
                <td>{{ log.targetType }} {{ log.targetId }}</td>
                <td>{{ log.operator }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import AuditIcon from '../../components/common/AuditIcon.vue';

const store = inject('store');

const isEmptyMode = computed(() => store.demoDataMode === 'empty');

const emptyMetrics = [
  { icon: 'in-progress', label: '进行中任务', value: 0, unit: '个', change: '暂无进行中任务', to: '/tasks' },
  { icon: 'anomaly', label: '待确认异常', value: 0, unit: '条', change: '暂无待确认异常', to: '/expense/anomaly/candidates' },
  { icon: 'review', label: '待复核报告', value: 0, unit: '份', change: '暂无待复核报告', to: '/audit-report/draft' },
  { icon: 'failed', label: '失败任务', value: 0, unit: '个', change: '暂无失败任务', to: '/tasks' }
];

const dataMetrics = [
  { icon: 'in-progress', label: '进行中任务', value: 18, unit: '个', change: '较昨日 +2', to: '/tasks' },
  { icon: 'anomaly', label: '待确认异常', value: 36, unit: '条', change: '较昨日 +5', to: '/expense/anomaly/candidates' },
  { icon: 'review', label: '待复核报告', value: 9, unit: '份', change: '较昨日 +1', to: '/audit-report/draft' },
  { icon: 'failed', label: '失败任务', value: 3, unit: '个', change: '较昨日 -1', to: '/tasks' }
];

const topMetrics = computed(() => (isEmptyMode.value ? emptyMetrics : dataMetrics));

const startCards = [
  {
    icon: 'create',
    title: '创建常规审计任务',
    description: '填写审计对象、期间和能力范围，生成首个任务。',
    steps: ['基础信息', '选择能力', '提交任务'],
    to: '/tasks/create'
  },
  {
    icon: 'upload',
    title: '从文件中心导入资料',
    description: '上传审计资料，完成解析、补字段和引用准备。',
    steps: ['上传资料', '解析资料', '建立引用'],
    to: '/files'
  },
  {
    icon: 'qa',
    title: '体验知识库智能体',
    description: '查询制度、识别变更，辅助形成审计依据。',
    steps: ['制度查询', '制度比对', '引用条款'],
    to: '/audit-standard/policy'
  },
  {
    icon: 'config',
    title: '查看系统配置',
    description: '检查模板、规则、权限和数据源初始化状态。',
    steps: ['模板配置', '规则配置', '权限配置'],
    to: '/config'
  }
];

const lifecycleSteps = ['创建任务', '上传资料', '解析资料', '生成分析', '人工确认', '保存版本', '导出归档'];

const beginnerGuide = [
  { title: '确认审计范围', description: '先确定审计单位、期间和可见部门。' },
  { title: '准备来源资料', description: '上传文件或选择已入库资料。' },
  { title: '选择智能能力', description: '按任务需要勾选费用、制度、报告等能力。' },
  { title: '处理生成结果', description: '人工确认异常、报告和版本。' }
];

const initStatus = [
  { label: '报告模板', status: '已内置', className: 'success' },
  { label: '费用规则', status: '待确认', className: 'warning' },
  { label: '文件中心', status: '暂无资料', className: 'danger' },
  { label: '最近操作', status: '暂无记录', className: 'danger' }
];

const todoTabs = [
  { label: '全部', count: 12, active: true },
  { label: '异常确认', count: 5, active: false },
  { label: '报告复核', count: 3, active: false },
  { label: '失败重试', count: 4, active: false }
];

const todoItems = [
  {
    id: 'TODO-001',
    title: '费用异常 AN-001 待确认',
    meta: '上海分公司 / 经纪业务部 / 高风险',
    status: '待确认',
    statusClass: 'warning',
    primaryTo: '/expense/anomaly/candidates',
    detailTo: '/tasks/detail'
  },
  {
    id: 'TODO-002',
    title: '营业部常规审计报告待复核',
    meta: '审计报告草稿 / 来源依据部分缺失',
    status: '待复核',
    statusClass: 'warning',
    primaryTo: '/audit-report/draft',
    detailTo: '/tasks/detail'
  },
  {
    id: 'TODO-003',
    title: '监督共享资料入库预检',
    meta: '风险事项台账.xlsx / 三字段待确认',
    status: '待预检',
    statusClass: 'warning',
    primaryTo: '/supervision/import/precheck',
    detailTo: '/files/detail'
  },
  {
    id: 'TODO-004',
    title: '制度差异清单待采纳',
    meta: '费用报销管理办法 V2.1 / 3 项差异',
    status: '待处理',
    statusClass: 'success',
    primaryTo: '/audit-standard/diff',
    detailTo: '/audit-standard/library'
  },
  {
    id: 'TODO-005',
    title: '失败任务重试确认',
    meta: '发票 OCR 快照同步失败 / 需重新执行',
    status: '失败重试',
    statusClass: 'danger',
    primaryTo: '/tasks/detail',
    detailTo: '/records'
  }
];

const recentAuditTasks = [
  { id: 'TASK-2026-001', name: '上海分公司二季度费用异常审计', unit: '上海分公司', period: '2026Q2', stage: '候选异常确认', progress: 72, status: '处理中', statusClass: 'warning', to: '/tasks/detail' },
  { id: 'TASK-2026-002', name: '监督共享资料汇总分析', unit: '上海分公司', period: '2026Q1', stage: '入库预检', progress: 48, status: '待预检', statusClass: 'warning', to: '/supervision/import/precheck' },
  { id: 'TASK-2026-003', name: '营业部常规审计报告', unit: '审计部', period: '2026H1', stage: '报告复核', progress: 86, status: '待复核', statusClass: 'success', to: '/audit-report/draft' },
  { id: 'TASK-2026-004', name: '监管案例舆情分析', unit: '经纪业务部', period: '2026Q2', stage: '数据获取', progress: 35, status: '进行中', statusClass: 'warning', to: '/regulatory/workbench' }
];

const quickEntries = [
  { icon: 'create', title: '创建任务', to: '/tasks/create' },
  { icon: 'upload', title: '上传资料', to: '/files' },
  { icon: 'qa', title: '知识库问答', to: '/audit-standard/policy' },
  { icon: 'compare', title: '制度比对', to: '/audit-standard/workbench' },
  { icon: 'monitor', title: '费用异常监控', to: '/expense/anomaly/dashboard' },
  { icon: 'report-generate', title: '报告生成', to: '/audit-report/source-select' }
];

const progressOverview = [
  { label: '进行中', value: 18, rate: 63 },
  { label: '待确认', value: 36, rate: 52 },
  { label: '已完成', value: 52, rate: 87 },
  { label: '失败', value: 3, rate: 12 },
  { label: '已归档', value: 21, rate: 58 }
];

const progressChartItems = computed(() => {
  const plotBottom = 182;
  const plotHeight = 140;
  const maxValue = 60;

  return progressOverview.map((item, index) => {
    const x = 56 + index * 52;
    const barHeight = Math.max(6, Math.round((item.value / maxValue) * plotHeight));
    const barY = plotBottom - barHeight;
    const lineY = plotBottom - Math.round((item.rate / 100) * plotHeight);
    const valueInside = barHeight >= 30;
    const valueY = valueInside ? barY + 17 : barY - 8;
    const rateY = item.rate >= 80 ? lineY - 18 : lineY - 10;
    const rateDx = item.rate >= 80 ? 8 : 0;
    return { ...item, x, barHeight, barY, lineY, valueInside, valueY, rateY, rateDx };
  });
});

const progressLinePoints = computed(() => progressChartItems.value.map((item) => `${item.x},${item.lineY}`).join(' '));

const riskAlerts = [
  { level: '高', title: '招待人均超标准', unit: '经纪业务部', time: '10:42', className: 'danger', to: '/expense/anomaly/candidates' },
  { level: '高', title: '合同付款节点不一致', unit: '计划财务部', time: '10:15', className: 'danger', to: '/expense/anomaly/candidates' },
  { level: '中', title: '报告整改建议依据不足', unit: '审计部', time: '09:58', className: 'warning', to: '/audit-report/gap-list' },
  { level: '中', title: '制度版本引用待确认', unit: '配置管理员', time: '09:30', className: 'warning', to: '/audit-standard/library' }
];

const generatedResults = [
  { name: '制度差异清单', type: '制度比对', time: '10:20', viewTo: '/audit-standard/diff', downloadTo: '/audit-standard/library' },
  { name: '费用异常汇总', type: '费用审计', time: '10:12', viewTo: '/expense/anomaly/dashboard', downloadTo: '/expense/usage/report' },
  { name: '审计报告草稿', type: '报告生成', time: '09:48', viewTo: '/audit-report/draft', downloadTo: '/audit-report/draft' }
];

const notices = [
  { title: '费用规则 V2026.07 已发布', time: '10:30', className: 'notice-success' },
  { title: '发票平台 OCR 同步部分缺失', time: '10:05', className: 'notice-warning' },
  { title: '报告模板 V2.1 可用于新任务', time: '09:40', className: 'notice-success' }
];

const operationRows = computed(() => store.db.operationLogs);
</script>

<style scoped>
.workbench-page {
  display: grid;
  height: 0;
  min-width: 0;
  min-height: 0;
  gap: var(--ui-space-3);
  overflow: auto;
}

.workbench-page.is-empty {
  grid-template-rows: auto minmax(0, 1fr);
}

.workbench-page.has-data {
  grid-template-rows:
    auto
    minmax(clamp(260px, 26vh, 320px), 0.28fr)
    minmax(clamp(300px, 25vh, 320px), 0.12fr)
    minmax(clamp(260px, 22vh, 286px), 1fr);
}

.workbench-page :deep(.panel),
.workbench-page .panel {
  padding: 12px 14px;
  margin-bottom: 0;
  box-shadow: 0 8px 18px rgba(22, 32, 51, 0.06);
}

.workbench-page :deep(.panel-title),
.workbench-page .panel-title {
  margin-bottom: 10px;
  padding-bottom: 8px;
}

.secondary-row :deep(.panel-title),
.secondary-row .panel-title {
  min-height: 38px;
  margin-bottom: 8px;
  padding-bottom: 8px;
}

.workbench-page :deep(.panel-title h3),
.workbench-page .panel-title h3 {
  font-size: 15px;
}

.workbench-page .btn {
  min-height: 28px;
  padding: 5px 10px;
  font-size: 12px;
}

.workbench-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: stretch;
}

.workbench-metrics {
  margin-bottom: 0;
}

.workbench-metric {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 14px;
  gap: 10px;
  align-items: center;
  min-height: clamp(82px, 10.5vh, 102px);
  padding: clamp(10px, 1.25vh, 14px) clamp(12px, 1vw, 16px);
  color: var(--color-text);
}

.workbench-metric b {
  color: var(--color-muted);
  font-size: 18px;
  font-weight: 400;
}

.workbench-metric strong {
  display: flex;
  gap: 4px;
  align-items: baseline;
}

.workbench-metric small {
  font-size: 12px;
  color: var(--color-muted);
  font-weight: 700;
}

.metric-icon,
.start-icon,
.quick-entry span,
.empty-log span {
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #fff3f4;
  color: var(--color-primary);
  box-shadow: inset 0 0 0 1px rgba(166, 25, 46, 0.08);
}

.metric-icon {
  width: 34px;
  height: 34px;
  font-size: 19px;
}

.start-icon,
.quick-entry span {
  width: 34px;
  height: 34px;
  font-size: 18px;
}

.empty-log span {
  width: 42px;
  height: 42px;
  font-size: 22px;
}

.workbench-actions {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.create-task-btn {
  align-self: start;
  min-height: 44px;
  white-space: nowrap;
}

.create-task-btn {
  min-width: 126px;
}

.empty-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 292px;
  gap: 12px;
  min-height: 0;
  align-items: stretch;
}

.empty-main,
.summary-rail,
.todo-list,
.risk-list,
.result-list,
.notice-list,
.status-stack {
  display: grid;
  gap: 12px;
}

.welcome-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
  align-items: center;
  min-height: 250px;
  overflow: hidden;
}

.welcome-copy h2 {
  margin: 8px 0 10px;
  font-size: 22px;
  line-height: 1.25;
}

.welcome-copy strong {
  display: block;
  margin-bottom: 12px;
  color: var(--color-primary);
  font-size: 16px;
}

.welcome-copy p,
.panel-title p,
.guide-list p,
.empty-log p,
.todo-item p,
.risk-item p,
.result-item p,
.notice-item p {
  color: var(--color-muted);
}

.welcome-copy p {
  max-width: 640px;
  margin-bottom: 20px;
  line-height: 1.8;
}

.welcome-preview {
  position: relative;
  height: 180px;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius);
  background: linear-gradient(180deg, #fbfcfe, #eef2f7);
}

.preview-window,
.preview-card,
.preview-doc {
  position: absolute;
  border: 1px solid #d7dfeb;
  border-radius: 8px;
  background: #fff;
  box-shadow: var(--shadow-subtle);
}

.preview-window {
  left: 70px;
  top: 32px;
  width: 204px;
  height: 118px;
  padding: 16px;
  display: grid;
  gap: 10px;
  align-content: start;
}

.preview-window span {
  height: 10px;
  border-radius: 999px;
  background: #e8edf5;
}

.card-one {
  left: 26px;
  top: 84px;
  width: 88px;
  height: 58px;
}

.card-two {
  right: 22px;
  top: 74px;
  width: 76px;
  height: 68px;
}

.preview-doc {
  left: 126px;
  bottom: 18px;
  width: 58px;
  height: 68px;
}

.start-card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.start-card {
  display: grid;
  gap: 8px;
  min-height: 130px;
  padding: 12px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: #fff;
  color: var(--color-text);
  box-shadow: var(--shadow-subtle);
}

.start-card:hover,
.quick-entry:hover,
.workbench-metric:hover {
  border-color: rgba(166, 25, 46, 0.45);
}

.start-card p {
  line-height: 1.6;
}

.mini-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mini-flow span {
  padding: 3px 7px;
  border-radius: 999px;
  background: var(--color-soft);
  color: var(--color-muted);
  font-size: 12px;
}

.flow-strip {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.flow-node {
  display: grid;
  justify-items: center;
  gap: 8px;
  color: var(--color-muted);
  text-align: center;
}

.flow-node span {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid #cfd7e3;
  border-radius: 50%;
  background: #fff;
  color: var(--color-primary);
  font-weight: 800;
}

.guide-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: guide;
}

.guide-list li {
  counter-increment: guide;
  display: grid;
  gap: 2px;
  min-height: 46px;
  padding: 6px 10px 6px 34px;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  background: #fff;
  position: relative;
}

.guide-list li::before {
  content: counter(guide);
  position: absolute;
  left: 10px;
  top: 10px;
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--color-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}

.status-stack p {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 10px;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  background: #fff;
}

.status-stack b.success {
  color: var(--color-success);
}

.status-stack b.warning {
  color: var(--color-warning);
}

.status-stack b.danger {
  color: var(--color-danger);
}

.empty-log {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 16px 10px;
  text-align: center;
}

@media (min-width: 1281px) and (min-height: 880px) {
  .workbench-page.is-empty {
    height: calc(100dvh - 98px);
  }

  .empty-layout {
    height: 100%;
  }

  .is-empty .empty-main {
    min-height: 0;
    grid-template-rows: minmax(236px, 1.1fr) minmax(182px, 0.78fr) minmax(108px, 0.42fr);
  }

  .is-empty .empty-rail {
    min-height: 0;
    grid-template-rows: minmax(252px, 1.02fr) minmax(158px, 0.68fr) minmax(148px, 0.6fr);
  }

  .is-empty .empty-main > .panel,
  .is-empty .empty-rail > .panel {
    min-height: 0;
    margin-bottom: 0;
  }

  .is-empty .empty-main > .panel:not(.welcome-panel),
  .is-empty .empty-rail > .panel {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .is-empty .start-card-grid,
  .is-empty .flow-strip {
    height: 100%;
  }

  .is-empty .start-card-grid {
    grid-auto-rows: minmax(0, 1fr);
  }

  .is-empty .start-card {
    min-height: 0;
  }

  .is-empty .guide-list {
    align-content: start;
    grid-template-rows: repeat(4, minmax(0, 1fr));
  }

  .is-empty .status-stack {
    grid-template-rows: repeat(4, minmax(0, 1fr));
  }

  .is-empty .empty-log,
  .is-empty .flow-strip {
    align-content: center;
  }

  .is-empty .welcome-preview {
    height: clamp(180px, 22vh, 240px);
  }
}

.dashboard-row {
  display: grid;
  gap: 10px;
  align-items: stretch;
}

.primary-row {
  grid-template-columns: minmax(330px, 0.9fr) minmax(500px, 1.45fr) minmax(220px, 0.72fr);
  min-height: clamp(260px, 26vh, 320px);
}

.secondary-row {
  grid-template-columns: minmax(260px, 0.95fr) minmax(270px, 1fr) minmax(260px, 1fr) minmax(220px, 0.85fr);
  min-height: clamp(300px, 25vh, 320px);
}

.primary-row > .panel,
.secondary-row > .panel {
  min-height: 0;
  overflow: hidden;
}

.todo-panel {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
}

.has-data .primary-row,
.has-data .secondary-row {
  height: 100%;
}

.has-data .primary-row > .panel,
.has-data .secondary-row > .panel,
.has-data .operation-panel {
  height: 100%;
}

.todo-list,
.risk-list,
.result-list,
.notice-list {
  min-height: 0;
}

.todo-list {
  max-height: none;
  overflow: auto;
  gap: 4px;
}

.todo-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.todo-tabs span {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 24px;
  padding: 3px 8px;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  color: var(--color-muted);
  background: #fff;
  font-size: 12px;
}

.todo-tabs span.active {
  border-color: rgba(166, 25, 46, 0.4);
  background: #fff5f6;
  color: var(--color-primary-dark);
}

.todo-item,
.risk-item,
.result-item,
.notice-item {
  display: grid;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  background: #fff;
}

.todo-item {
  grid-template-rows: auto auto;
  gap: 2px;
  min-height: 44px;
  padding: 2px 6px;
}

.todo-heading,
.todo-support {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px;
  align-items: center;
  min-width: 0;
}

.todo-item strong,
.todo-item p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-item strong {
  display: block;
  font-size: 12px;
  line-height: 1.2;
}

.todo-item p {
  font-size: 11px;
  line-height: 1.2;
}

.todo-item .status-tag {
  justify-self: end;
}

.todo-item .row-actions {
  justify-self: end;
  flex-wrap: nowrap;
  gap: 4px;
}

.workbench-page .todo-item .btn {
  min-height: 18px;
  padding: 1px 6px;
  line-height: 14px;
}

.todo-item .status-tag {
  min-height: 18px;
  padding: 0 5px;
  line-height: 16px;
}

.todo-item .todo-detail-link {
  border-color: transparent;
  background: transparent;
  color: var(--color-muted);
}

.row-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.compact-table {
  overflow: auto;
}

.compact-table table {
  min-width: 0;
  table-layout: fixed;
}

.recent-task-table .task-name-col {
  width: 27%;
}

.recent-task-table .unit-col {
  width: 14%;
}

.recent-task-table .period-col {
  width: 11%;
}

.recent-task-table .stage-col {
  width: 16%;
}

.recent-task-table .progress-col {
  width: 15%;
}

.recent-task-table .status-col {
  width: 10%;
}

.recent-task-table .action-col {
  width: 7%;
}

.compact-table th,
.compact-table td {
  padding: 7px 8px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-cell {
  display: grid;
  grid-template-columns: minmax(80px, 1fr) 38px;
  align-items: center;
  gap: 8px;
}

.progress-cell span {
  height: 8px;
  border-radius: 999px;
  background: #edf1f6;
  overflow: hidden;
}

.progress-cell i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-primary);
}

.progress-cell b,
.table-link {
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  height: calc(100% - 42px);
}

.quick-entry {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 6px;
  min-height: 0;
  padding: 7px 6px;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  background: #fff;
  color: var(--color-text);
  text-align: center;
}

.chart-filter {
  min-height: 24px;
  padding: 3px 8px;
  border: 1px solid var(--color-line);
  border-radius: 6px;
  color: var(--color-muted);
  background: #fff;
  font-size: 12px;
}

.progress-combo {
  display: grid;
  align-content: start;
  min-height: 0;
  height: calc(100% - 46px);
}

.progress-combo svg {
  display: block;
  width: 100%;
  height: min(100%, clamp(250px, 30vh, 320px));
}

.grid-lines line {
  stroke: #edf1f6;
  stroke-width: 1;
}

.axis-text text {
  fill: #8b97aa;
  font-size: 9px;
}

.svg-legend text {
  fill: var(--color-muted);
  font-size: 9px;
}

.legend-bar-line,
.legend-rate-line {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
}

.legend-bar-line {
  stroke: #3f6fb7;
}

.legend-rate-line {
  stroke: #d98a20;
  stroke-width: 2;
}

.bar-bg {
  fill: #edf1f6;
}

.bar-value {
  fill: #3f6fb7;
}

.rate-line {
  fill: none;
  stroke: #d98a20;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.line-dot {
  fill: #fff;
  stroke: #d98a20;
  stroke-width: 2;
}

.bar-label,
.bar-value-text,
.rate-text {
  text-anchor: middle;
  font-size: 10px;
}

.bar-label {
  fill: var(--color-muted);
}

.bar-value-text {
  fill: var(--color-text);
  font-weight: 800;
}

.bar-value-text.inside {
  fill: #fff;
}

.rate-text {
  fill: #d98a20;
  font-size: 9px;
  font-weight: 800;
}

.risk-item {
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.risk-level {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.secondary-row .risk-list,
.secondary-row .result-list,
.secondary-row .notice-list {
  gap: 0;
}

.secondary-row .risk-item,
.secondary-row .result-item,
.secondary-row .notice-item {
  min-height: 35px;
  padding: 5px 0;
  border: 0;
  border-bottom: 1px solid var(--color-line);
  border-radius: 0;
  background: transparent;
}

.secondary-row .risk-item strong,
.secondary-row .result-item strong,
.secondary-row .notice-item strong,
.secondary-row .risk-item p,
.secondary-row .result-item p,
.secondary-row .notice-item p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secondary-row .risk-item:last-child,
.secondary-row .result-item:last-child,
.secondary-row .notice-item:last-child {
  border-bottom: 0;
}

.risk-level.danger {
  background: #fff1f2;
  color: var(--color-danger);
}

.risk-level.warning {
  background: #fff7e8;
  color: var(--color-warning);
}

.risk-level.success {
  background: #f0fbf6;
  color: var(--color-success);
}

.risk-item a {
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
}

.result-item {
  grid-template-columns: minmax(0, 1fr) auto;
}

.notice-item {
  grid-template-columns: auto minmax(0, 1fr);
}

.notice-item > span {
  width: 9px;
  height: 9px;
  border-radius: 999px;
}

.notice-success {
  background: var(--color-success);
}

.notice-warning {
  background: var(--color-warning);
}

.notice-danger {
  background: var(--color-danger);
}

.operation-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  margin-bottom: 0;
  min-height: clamp(260px, 22vh, 286px);
}

.operation-panel .compact-table {
  min-height: 0;
}

.operation-panel .compact-table table {
  width: 100%;
}

.operation-panel .compact-table th,
.operation-panel .compact-table td {
  padding-top: 8px;
  padding-bottom: 8px;
  line-height: 1.35;
}

@media (max-width: 1200px) {
  .workbench-top {
    grid-template-columns: 1fr;
  }

  .workbench-actions {
    justify-self: end;
  }

  .start-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1180px) {
  .empty-layout,
  .welcome-panel,
  .primary-row,
  .secondary-row {
    grid-template-columns: 1fr;
  }

  .create-task-btn,
  .workbench-actions {
    justify-self: start;
  }

  .primary-row,
  .secondary-row {
    height: auto;
  }

  .primary-row > .panel,
  .secondary-row > .panel {
    height: auto;
    overflow: visible;
  }
}

@media (max-width: 760px) {
  .flow-strip,
  .quick-grid,
  .progress-overview,
  .start-card-grid,
  .todo-item,
  .result-item {
    grid-template-columns: 1fr;
  }

  .welcome-preview {
    display: none;
  }

  .row-actions {
    justify-content: flex-start;
  }
}

/* Viewport-scaled visible dimensions for the shared 2560x1440 baseline. */
.workbench-page :deep(.panel),
.workbench-page .panel {
  padding: var(--ui-space-4) var(--ui-space-5);
}

.workbench-page :deep(.panel-title h3),
.workbench-page .panel-title h3,
.workbench-page strong {
  font-size: var(--ui-font-sm);
}

.workbench-page p,
.workbench-page span,
.workbench-page td,
.workbench-page th,
.workbench-page a,
.workbench-page button {
  font-size: var(--ui-font-xs);
}

.workbench-page .btn {
  min-height: var(--ui-control-sm);
  padding: var(--ui-space-2) var(--ui-space-4);
}

.workbench-page .metric-icon,
.workbench-page .start-icon {
  width: var(--ui-icon-lg);
  height: var(--ui-icon-lg);
}
</style>
