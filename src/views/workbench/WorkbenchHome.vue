<template>
  <div class="workbench-page route-fill-page" :class="isEmptyMode ? 'is-empty' : 'has-data'">
    <template v-if="isEmptyMode">
      <section class="empty-layout">
        <div class="empty-main">
          <section class="workbench-top">
            <div class="capability-grid workbench-metrics">
              <RouterLink
                v-for="item in capabilityMetrics"
                :key="item.title"
                class="metric-card workbench-metric capability-card"
                :to="item.to"
              >
                <div class="capability-card-head">
                  <div class="metric-icon" aria-hidden="true"><AuditIcon :name="item.icon" /></div>
                  <div class="capability-title-block">
                    <span class="capability-title">{{ item.title }}</span>
                  </div>
                  <span class="range-pill">{{ item.range }} <i>⌄</i></span>
                </div>
                <dl class="capability-status-grid">
                  <div v-for="status in item.statuses" :key="status.key" :class="['capability-status', status.key]">
                    <dt>{{ status.label }}</dt>
                    <dd>{{ status.value }}</dd>
                  </div>
                </dl>
                <div class="capability-card-foot">
                  <strong>查看明细 <b aria-hidden="true">›</b></strong>
                </div>
              </RouterLink>
            </div>
          </section>

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
                <RouterLink v-if="showDemoControls" class="btn" to="/demo-guide">查看演示流程</RouterLink>
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

          <section class="panel compact-guide-panel">
            <div class="panel-title"><h3>快速引导</h3></div>
            <div class="flow-strip compact-flow">
              <div v-for="(step, index) in lifecycleSteps.slice(0, 5)" :key="step" class="flow-node">
                <span>{{ index + 1 }}</span>
                <p>{{ step }}</p>
              </div>
            </div>
          </section>
        </div>

        <aside class="summary-rail empty-rail">
          <section class="panel">
            <div class="panel-title"><h3>系统初始化状态</h3></div>
            <div class="status-stack">
              <p v-for="item in initStatus" :key="item.label">
                <span>{{ item.label }}</span>
                <b :class="item.className">{{ item.status }}</b>
              </p>
            </div>
          </section>

        </aside>
      </section>
    </template>

    <template v-else>
      <section class="workbench-top" data-workbench-section="能力指标概览">
        <div class="capability-grid workbench-metrics">
          <RouterLink
            v-for="item in capabilityMetrics"
            :key="item.title"
            class="metric-card workbench-metric capability-card"
            :to="item.to"
          >
            <div class="capability-card-head">
              <div class="metric-icon" aria-hidden="true"><AuditIcon :name="item.icon" /></div>
              <div class="capability-title-block">
                <span class="capability-title">{{ item.title }}</span>
              </div>
              <span class="range-pill">{{ item.range }} <i>⌄</i></span>
            </div>
            <dl class="capability-status-grid">
              <div v-for="status in item.statuses" :key="status.key" :class="['capability-status', status.key]">
                <dt>{{ status.label }}</dt>
                <dd>{{ status.value }}</dd>
              </div>
            </dl>
            <div class="capability-card-foot">
              <strong>查看明细 <b aria-hidden="true">›</b></strong>
            </div>
          </RouterLink>
        </div>
      </section>

      <section class="dashboard-row primary-row">
        <section class="panel todo-panel" data-workbench-section="我的待办">
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
                  <RouterLink class="btn primary" :to="item.detailTo">查看任务</RouterLink>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="panel recent-task-panel" data-workbench-section="最近访问">
          <div class="panel-title">
            <h3>最近访问</h3>
            <RouterLink class="btn" to="/tasks">全部任务</RouterLink>
          </div>
          <div class="compact-table">
            <table class="recent-task-table">
              <colgroup>
                <col class="task-name-col" />
                <col class="unit-col" />
                <col class="stage-col" />
                <col class="status-col" />
                <col class="visited-col" />
                <col class="action-col" />
              </colgroup>
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>审计单位</th>
                  <th>当前阶段</th>
                  <th>状态</th>
                  <th>最近访问</th>
                  <th>入口</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in recentVisitTasks.slice(0, 3)" :key="task.id">
                  <td>{{ task.name }}</td>
                  <td>{{ task.unit }}</td>
                  <td>{{ task.stage }}</td>
                  <td><span class="status-tag" :class="task.statusClass">{{ task.status }}</span></td>
                  <td>{{ task.visitedAt }}</td>
                  <td><RouterLink class="table-link" :to="task.to">查看</RouterLink></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </section>

      <section class="dashboard-row secondary-row">
        <section class="panel risk-panel" data-workbench-section="风险提醒">
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

        <section class="panel quick-panel" data-workbench-section="快捷入口">
          <div class="panel-title">
            <h3>快捷入口</h3>
            <span class="section-note">常用能力直达</span>
          </div>
          <div class="quick-grid">
            <RouterLink v-for="entry in quickEntries" :key="entry.title" class="quick-entry" :to="entry.to">
              <span aria-hidden="true"><AuditIcon :name="entry.icon" /></span>
              <strong>{{ entry.title }}</strong>
            </RouterLink>
          </div>
        </section>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import AuditIcon from '../../components/common/AuditIcon.vue';

const store = inject('store');
const route = useRoute();

const isEmptyMode = computed(() => store.demoDataMode === 'empty');
const showDemoControls = computed(() => import.meta.env.DEV || route.query.demo === '1');

const legacyWorkbenchMetricLabels = ['进行中任务', '待确认异常', '待复核报告', '失败任务'];

const capabilityDefinitions = [
  {
    icon: 'analysis',
    title: '监管案例舆情分析',
    description: '监管案例检索、舆情风险识别',
    range: '近7天',
    update: '最近更新 10:42',
    to: '/regulatory/workbench',
    data: { success: 36, failed: 3, pending: 8, running: 12 }
  },
  {
    icon: 'expense',
    title: '费用分析',
    description: '费用结构、异常波动和明细穿透',
    range: '本月',
    update: '最近更新 10:38',
    to: '/expense/workbench',
    data: { success: 28, failed: 2, pending: 14, running: 7 }
  },
  {
    icon: 'report-generate',
    title: '报告生成',
    description: '审计发现整理、报告初稿输出',
    range: '近30天',
    update: '最近更新 09:56',
    to: '/audit-report/workbench',
    data: { success: 19, failed: 1, pending: 5, running: 9 }
  },
  {
    icon: 'files',
    title: '监督共享信息分析',
    description: '多源监督数据关联和线索筛查',
    range: '自定义',
    update: '最近更新 09:41',
    to: '/supervision/workbench',
    data: { success: 43, failed: 4, pending: 17, running: 6 }
  },
  {
    icon: 'knowledge',
    title: '审计规范生成',
    description: '规范、清单和工作指引生成',
    range: '本季度',
    update: '最近更新 09:20',
    to: '/audit-standard/workbench',
    data: { success: 22, failed: 0, pending: 4, running: 3 }
  }
];

const buildCapabilityMetrics = (empty = false) =>
  capabilityDefinitions.map((item) => {
    const values = empty ? { success: 0, failed: 0, pending: 0, running: 0 } : item.data;
    return {
      ...item,
      update: empty ? '暂无任务数据' : item.update,
      statuses: [
        { key: 'success', label: '成功', value: values.success },
        { key: 'failed', label: '失败', value: values.failed },
        { key: 'pending', label: '待确认', value: values.pending },
        { key: 'running', label: '进行中', value: values.running }
      ]
    };
  });

const capabilityMetrics = computed(() => buildCapabilityMetrics(false));

const startCards = [
  {
    icon: 'create',
    title: '创建常规审计任务',
    description: '填写审计对象、期间和能力范围，生成首个任务。',
    steps: ['选择能力', '填写基础信息', '提交任务'],
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
    detailTo: '/tasks/detail'
  },
  {
    id: 'TODO-002',
    title: '营业部常规审计报告待复核',
    meta: '审计报告草稿 / 来源依据部分缺失',
    status: '待复核',
    statusClass: 'warning',
    detailTo: '/tasks/detail'
  },
  {
    id: 'TODO-003',
    title: '监督共享资料入库预检',
    meta: '风险事项台账.xlsx / 三字段待确认',
    status: '待预检',
    statusClass: 'warning',
    detailTo: '/tasks/detail'
  },
  {
    id: 'TODO-004',
    title: '制度差异清单待采纳',
    meta: '费用报销管理办法 V2.1 / 3 项差异',
    status: '待处理',
    statusClass: 'success',
    detailTo: '/tasks/detail'
  },
  {
    id: 'TODO-005',
    title: '失败任务重试确认',
    meta: '发票 OCR 快照同步失败 / 需重新执行',
    status: '失败重试',
    statusClass: 'danger',
    detailTo: '/tasks/detail'
  }
];

const recentAuditTasks = [
  { id: 'TASK-2026-001', name: '上海分公司二季度费用异常审计', unit: '上海分公司', stage: '候选异常确认', status: '处理中', statusClass: 'warning', visitedAt: '10 分钟前', to: '/tasks/detail' },
  { id: 'TASK-2026-002', name: '监督共享资料汇总分析', unit: '上海分公司', stage: '入库预检', status: '待预检', statusClass: 'warning', visitedAt: '35 分钟前', to: '/tasks/detail' },
  { id: 'TASK-2026-003', name: '营业部常规审计报告', unit: '审计部', stage: '报告复核', status: '待复核', statusClass: 'success', visitedAt: '今天 09:48', to: '/tasks/detail' },
  { id: 'TASK-2026-004', name: '监管案例舆情分析', unit: '经纪业务部', stage: '数据获取', status: '进行中', statusClass: 'warning', visitedAt: '昨天 16:20', to: '/tasks/detail' },
  { id: 'TASK-2026-005', name: '年度制度执行情况审计', unit: '审计部', stage: '资料准备', status: '待开始', statusClass: 'warning', visitedAt: '昨天 14:05', to: '/tasks/detail' }
];

const recentVisitTasks = recentAuditTasks.slice(0, 4);

const quickEntries = [
  { icon: 'create', title: '创建任务', to: '/tasks/create' },
  { icon: 'upload', title: '上传资料', to: '/files' },
  { icon: 'qa', title: '知识库问答', to: '/audit-standard/policy' },
  { icon: 'compare', title: '制度比对', to: '/audit-standard/workbench' },
  { icon: 'monitor', title: '费用异常分析', to: '/expense/anomaly/dashboard' },
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
  grid-template-rows: minmax(0, 1fr);
}

.workbench-page.has-data {
  grid-template-rows:
    auto
    minmax(clamp(260px, 32vh, 360px), 0.7fr)
    minmax(clamp(260px, 30vh, 340px), 0.6fr);
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
  min-width: 0;
}

.section-note {
  margin: 3px 0 0;
  color: var(--color-muted);
  font-size: var(--ui-font-xs);
}

.workbench-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 0;
}

.workbench-metric {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 168px;
  padding: 14px 18px 12px;
  border: 1px solid #e1e7ef;
  border-radius: 8px;
  background: #fff;
  color: var(--color-text);
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  overflow: hidden;
  box-shadow: 0 8px 18px rgba(22, 32, 51, 0.06);
}

.workbench-metric::before {
  content: "";
  position: absolute;
  left: 0;
  top: 18px;
  bottom: 18px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: var(--color-primary);
}

.workbench-metric > div {
  min-width: 0;
}

.capability-card-head {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.capability-title-block {
  display: grid;
  gap: 3px;
}

.capability-title {
  display: -webkit-box;
  min-height: 22px;
  overflow: hidden;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.25;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.capability-title-block p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--color-muted);
  font-size: 11px;
  line-height: 1.35;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.range-pill {
  display: inline-flex;
  min-width: 80px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #d9e0ea;
  border-radius: 6px;
  background: #fbfcff;
  color: #5a6678;
  font-size: 14px;
  line-height: 1;
  align-items: center;
  justify-content: center;
  gap: 3px;
  white-space: nowrap;
}

.range-pill i {
  color: #7b8493;
  font-style: normal;
}

.capability-status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
}

.capability-status {
  min-width: 0;
  padding: 0 10px;
  border-right: 1px solid #dde3ec;
  text-align: center;
}

.capability-status:last-child {
  border-right: 0;
}

.capability-status dt {
  min-height: 18px;
  overflow: visible;
  color: var(--color-muted);
  font-size: 14px;
  line-height: 1.25;
  white-space: normal;
}

.capability-status dd {
  margin: 8px 0 0;
  color: #34465d;
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
}

.capability-status.success dd {
  color: #2f6c5d;
}

.capability-status.failed dd {
  color: #9a2a3a;
}

.capability-status.pending dd {
  color: #8a6124;
}

.capability-status.running dd {
  color: #3d5f8c;
}

.capability-card-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 11px;
  border-top: 1px solid #e9edf3;
  color: var(--color-muted);
  line-height: 1;
}

.capability-card-foot strong {
  display: inline-flex;
  margin: 0;
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 800;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

.capability-card-foot b {
  color: inherit;
  font-size: 16px;
  font-weight: 400;
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
  width: 30px;
  height: 30px;
  font-size: 16px;
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
  align-items: center;
  justify-content: center;
  align-self: stretch;
}

.create-task-btn {
  align-self: center;
  min-height: 38px;
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
    grid-template-rows: minmax(158px, 0.68fr);
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
  grid-template-columns: minmax(330px, 0.9fr) minmax(500px, 1.45fr);
  min-height: clamp(260px, 32vh, 360px);
}

.secondary-row {
  grid-template-columns: minmax(300px, 1fr) minmax(300px, 1fr);
  min-height: clamp(260px, 30vh, 340px);
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
  width: 32%;
}

.recent-task-table .unit-col {
  width: 17%;
}

.recent-task-table .stage-col {
  width: 20%;
}

.recent-task-table .status-col {
  width: 12%;
}

.recent-task-table .visited-col {
  width: 12%;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
  text-decoration: none;
}

.quick-entry strong {
  font-size: var(--ui-font-sm);
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

@media (max-width: 1080px) {
  .workbench-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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

  .workbench-metrics {
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

.workbench-page .capability-title {
  font-size: 16px;
}

.workbench-page .range-pill,
.workbench-page .capability-status dt {
  font-size: 14px;
}

.workbench-page .capability-status dd {
  font-size: 26px;
}

.workbench-page .capability-card-foot strong,
.workbench-page .capability-card-foot b {
  font-size: 16px;
}

.workbench-page .metric-icon {
  width: 30px;
  height: 30px;
}
</style>
