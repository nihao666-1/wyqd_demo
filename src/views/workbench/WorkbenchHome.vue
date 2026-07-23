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
              <span class="eyebrow">审计工作台</span>
              <h2>欢迎使用审计大模型系统</h2>
              <strong>当前暂无需要你处理的事项</strong>
              <p>
                审计工作台用于展示当前登录用户可使用的能力、本人待办、最近任务和近期成果；统一任务查询和完整筛选仍在任务中心完成。
              </p>
              <div class="head-actions">
                <RouterLink class="btn primary" to="/tasks/create">创建审计任务</RouterLink>
                <button class="btn" type="button" @click="store.setDemoDataMode('data')">查看个人工作概况</button>
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
                <p>从统一任务流程、文件上传和一期基础配置入口开始。</p>
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
            <div class="panel-title"><h3>办理路径</h3></div>
            <div class="flow-strip compact-flow">
              <div v-for="(step, index) in lifecycleSteps.slice(0, 5)" :key="step" class="flow-node">
                <span>{{ index + 1 }}</span>
                <p>{{ step }}</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </template>

    <template v-else>
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

      <section class="dashboard-row primary-row">
        <section class="panel todo-panel">
          <div class="panel-title">
            <h3>我的待办</h3>
            <RouterLink class="btn" :to="{ path: '/tasks', query: { view: 'todo', scope: 'mine' } }">查看全部</RouterLink>
          </div>
          <div class="todo-tabs" role="list" aria-label="待办分类">
            <span v-for="tab in todoTabs" :key="tab.label" :class="{ active: tab.active }" role="listitem">
              {{ tab.label }} <b>{{ tab.count }}</b>
            </span>
          </div>
          <div class="todo-list">
            <article v-for="item in todoItems" :key="item.id" class="todo-item">
              <div class="todo-copy">
                <div class="todo-heading">
                  <strong>{{ item.title }}</strong>
                  <span class="status-tag" :class="item.statusClass">{{ item.status }}</span>
                </div>
                <p>{{ item.meta }}</p>
              </div>
              <RouterLink class="btn primary" :to="item.primaryTo">去处理</RouterLink>
            </article>
          </div>
        </section>

        <section class="panel recent-task-panel">
          <div class="panel-title">
            <h3>最近审计任务</h3>
            <div class="panel-actions">
              <RouterLink class="btn primary" to="/tasks/create">创建审计任务</RouterLink>
              <RouterLink class="btn" to="/tasks">任务列表</RouterLink>
            </div>
          </div>
          <div class="compact-table">
            <table class="recent-task-table">
              <colgroup>
                <col class="task-name-col" />
                <col class="unit-col" />
                <col class="period-col" />
                <col class="stage-col" />
                <col class="status-col" />
                <col class="next-action-col" />
                <col class="action-col" />
              </colgroup>
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>审计单位</th>
                  <th>审计期间</th>
                  <th>当前阶段</th>
                  <th>状态</th>
                  <th>下一步</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in recentAuditTasks" :key="task.id">
                  <td>{{ task.name }}</td>
                  <td>{{ task.unit }}</td>
                  <td>{{ task.period }}</td>
                  <td>{{ task.stage }}</td>
                  <td><span class="status-tag" :class="task.statusClass">{{ task.status }}</span></td>
                  <td>{{ task.nextAction }}</td>
                  <td><RouterLink class="table-link" :to="task.to">进入</RouterLink></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </section>

      <section class="dashboard-row secondary-row">
        <section class="panel risk-panel">
          <div class="panel-title">
            <h3>风险提醒</h3>
            <RouterLink class="btn" to="/expense/anomaly/dashboard">风险看板</RouterLink>
          </div>
          <div class="risk-list">
            <article v-for="risk in riskAlerts" :key="risk.title" class="risk-item">
              <div>
                <div class="risk-heading">
                  <strong>{{ risk.title }}</strong>
                  <span class="status-tag" :class="risk.className">{{ risk.status }}</span>
                </div>
                <p>{{ risk.unit }} / {{ risk.time }}</p>
              </div>
              <button class="table-link" type="button" @click="openWorkbenchDrawer('依据详情', risk.title, risk.drawerDetail)">查看依据</button>
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
                <button class="btn" type="button" @click="openWorkbenchDrawer('成果详情', result.name, result.drawerDetail)">详情</button>
              </div>
            </article>
          </div>
        </section>
      </section>

      <div v-if="drawer.open" class="workbench-drawer-layer">
        <button class="workbench-drawer-backdrop" type="button" aria-label="关闭详情抽屉" @click="closeWorkbenchDrawer"></button>
        <aside class="workbench-drawer" role="dialog" aria-modal="true" aria-labelledby="workbench-drawer-title">
          <header>
            <div>
              <span>{{ drawer.eyebrow }}</span>
              <h2 id="workbench-drawer-title">{{ drawer.title }}</h2>
            </div>
            <button type="button" aria-label="关闭" @click="closeWorkbenchDrawer">×</button>
          </header>
          <dl>
            <div v-for="item in drawer.details" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, inject, reactive } from 'vue';
import AuditIcon from '../../components/common/AuditIcon.vue';

const store = inject('store');

const isEmptyMode = computed(() => store.demoDataMode === 'empty');
const drawer = reactive({ open: false, eyebrow: '', title: '', details: [] });

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
    title: '创建审计任务',
    description: '进入统一创建流程，只选择一期已开放的任务类能力。',
    steps: ['选择能力', '上传资料', '提交任务'],
    to: '/tasks/create'
  },
  {
    icon: 'upload',
    title: '上传基础资料',
    description: '优先完成文件上传、多文件上传和基础查看。',
    steps: ['上传文件', '解析状态', '查看文件'],
    to: '/files'
  },
  {
    icon: 'tasks',
    title: '查看任务中心',
    description: '统一查询本人、本部门和权限范围内的审计任务。',
    steps: ['筛选任务', '进入详情', '查看时间线'],
    to: '/tasks'
  },
  {
    icon: 'config',
    title: '维护一期配置',
    description: '维护报告模板、规范模板、费用规则、标签和权限菜单。',
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

const todoTabs = [
  { label: '全部', count: 5, active: true },
  { label: '待确认', count: 2, active: false },
  { label: '待复核', count: 1, active: false },
  { label: '执行异常', count: 2, active: false }
];

const todoItems = [
  {
    id: 'TODO-001',
    title: '费用异常 AN-001 待确认',
    meta: '上海分公司二季度费用异常审计 / 候选异常确认',
    status: '待确认',
    statusClass: 'warning',
    primaryTo: '/expense/anomaly/candidates',
    detailTo: '/tasks/detail'
  },
  {
    id: 'TODO-002',
    title: '营业部常规审计报告待复核',
    meta: '营业部常规审计报告 / 报告审核',
    status: '待复核',
    statusClass: 'warning',
    primaryTo: '/audit-report/draft',
    detailTo: '/tasks/detail'
  },
  {
    id: 'TODO-003',
    title: '监督共享资料入库预检',
    meta: '监督共享资料汇总分析 / 文件解析异常待处理',
    status: '待预检',
    statusClass: 'warning',
    primaryTo: '/materials/import?scene=supervision&step=precheck',
    detailTo: '/files/detail'
  },
  {
    id: 'TODO-004',
    title: '制度差异清单待采纳',
    meta: '制度差异复核任务 / 生成结果待确认',
    status: '待确认',
    statusClass: 'success',
    primaryTo: '/audit-standard/library?panel=diff',
    detailTo: '/audit-standard/library'
  },
  {
    id: 'TODO-005',
    title: '失败任务重试确认',
    meta: '费用异常核查任务 / 模型调用异常',
    status: '执行异常',
    statusClass: 'danger',
    primaryTo: '/tasks/detail',
    detailTo: '/tasks/detail'
  }
];

const recentAuditTasks = [
  { id: 'TASK-2026-001', name: '上海分公司二季度费用异常审计', unit: '上海分公司', period: '2026Q2', stage: '候选异常确认', status: '待确认', statusClass: 'warning', nextAction: '确认或排除异常', to: '/tasks/detail' },
  { id: 'TASK-2026-002', name: '监督共享资料汇总分析', unit: '上海分公司', period: '2026Q1', stage: '文件解析异常', status: '执行异常', statusClass: 'danger', nextAction: '处理解析异常', to: '/materials/import?scene=supervision&step=precheck' },
  { id: 'TASK-2026-003', name: '营业部常规审计报告', unit: '审计部', period: '2026H1', stage: '报告复核', status: '待复核', statusClass: 'success', nextAction: '处理审核建议', to: '/audit-report/draft' },
  { id: 'TASK-2026-004', name: '监管案例舆情分析', unit: '经纪业务部', period: '2026Q2', stage: '结果生成中', status: '执行中', statusClass: 'warning', nextAction: '查看阶段日志', to: '/regulatory/workbench' }
];

const quickEntries = [
  { icon: 'create', title: '创建任务', to: '/tasks/create' },
  { icon: 'upload', title: '上传资料', to: '/files' },
  { icon: 'qa', title: '知识库问答', to: '/audit-standard/policy' },
  { icon: 'compare', title: '制度比对', to: '/audit-standard/workbench' },
  { icon: 'monitor', title: '费用异常监控', to: '/expense/anomaly/dashboard' },
  { icon: 'report-generate', title: '报告生成', to: '/audit-report/source-select' }
];

const riskAlerts = [
  {
    title: '招待人均超标准',
    unit: '经纪业务部',
    time: '10:42',
    status: '高风险',
    className: 'danger',
    drawerDetail: [
      { label: '关联任务', value: '上海分公司二季度费用异常审计' },
      { label: '依据来源', value: '费用报销管理办法 V2.1 第 15 条' },
      { label: '处理建议', value: '进入任务详情确认异常、排除或补充说明。' }
    ]
  },
  {
    title: '合同付款节点不一致',
    unit: '计划财务部',
    time: '10:15',
    status: '高风险',
    className: 'danger',
    drawerDetail: [
      { label: '关联任务', value: '合同合规性专项审计' },
      { label: '依据来源', value: '合同付款管理细则第 8 条' },
      { label: '处理建议', value: '核验付款凭证和审批链后形成确认意见。' }
    ]
  },
  {
    title: '报告整改建议依据不足',
    unit: '审计部',
    time: '09:58',
    status: '中风险',
    className: 'warning',
    drawerDetail: [
      { label: '关联任务', value: '营业部常规审计报告' },
      { label: '依据来源', value: '报告审核规则 / 整改建议章节' },
      { label: '处理建议', value: '补充来源材料或将问题标记为忽略。' }
    ]
  },
  {
    title: '制度版本引用待确认',
    unit: '审计部',
    time: '09:30',
    status: '中风险',
    className: 'warning',
    drawerDetail: [
      { label: '关联任务', value: '制度差异复核任务' },
      { label: '依据来源', value: '费用报销管理办法 V2.1 / 历史版本 V1.8' },
      { label: '处理建议', value: '进入任务详情确认引用版本。' }
    ]
  }
];

const generatedResults = [
  {
    name: '制度差异清单',
    type: '制度比对',
    time: '10:20',
    viewTo: '/audit-standard/library?panel=diff',
    drawerDetail: [
      { label: '来源任务', value: '制度差异复核任务' },
      { label: '输出文件', value: '制度差异清单.xlsx' },
      { label: '当前状态', value: '待确认差异 3 项' }
    ]
  },
  {
    name: '费用异常汇总',
    type: '费用审计',
    time: '10:12',
    viewTo: '/expense/anomaly/dashboard',
    drawerDetail: [
      { label: '来源任务', value: '上海分公司二季度费用异常审计' },
      { label: '输出文件', value: '费用异常汇总.xlsx' },
      { label: '当前状态', value: '候选异常待人工确认' }
    ]
  },
  {
    name: '审计报告草稿',
    type: '报告生成',
    time: '09:48',
    viewTo: '/audit-report/draft',
    drawerDetail: [
      { label: '来源任务', value: '营业部常规审计报告' },
      { label: '输出文件', value: '审计报告草稿.docx' },
      { label: '当前状态', value: '报告复核中' }
    ]
  }
];

const notices = [
  { title: '费用规则 V2026.07 已发布', time: '10:30', className: 'notice-success' },
  { title: '发票平台 OCR 同步部分缺失', time: '10:05', className: 'notice-warning' },
  { title: '报告模板 V2.1 可用于新任务', time: '09:40', className: 'notice-success' }
];

const operationRows = computed(() => store.db.operationLogs);

function openWorkbenchDrawer(eyebrow, title, details) {
  drawer.open = true;
  drawer.eyebrow = eyebrow;
  drawer.title = title;
  drawer.details = details;
}

function closeWorkbenchDrawer() {
  drawer.open = false;
  drawer.eyebrow = '';
  drawer.title = '';
  drawer.details = [];
}
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
    auto
    auto;
  align-content: start;
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

.panel-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
}

.workbench-page .btn {
  min-height: 28px;
  padding: 5px 10px;
  font-size: 12px;
}

.workbench-top {
  min-width: 0;
}

.workbench-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 0;
}

.workbench-metric {
  display: flex;
  min-width: 0;
  min-height: 142px;
  padding: 12px 12px 9px;
  color: var(--color-text);
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
}

.workbench-metric > div {
  min-width: 0;
}

.capability-card-head {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
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
  line-height: 1.35;
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
  min-width: 74px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid #d9e0ea;
  border-radius: 6px;
  background: #fbfcff;
  color: #5a6678;
  font-size: 13px;
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
  font-size: 13px;
  line-height: 1.25;
  white-space: normal;
}

.capability-status dd {
  margin: 8px 0 0;
  color: #34465d;
  font-size: 22px;
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
  padding-top: 10px;
  border-top: 1px solid #e9edf3;
  color: var(--color-muted);
  line-height: 1;
}

.capability-card-foot strong {
  display: inline-flex;
  margin: 0;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 700;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

.capability-card-foot b {
  color: inherit;
  font-size: 13px;
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
  width: 32px;
  height: 32px;
  font-size: 18px;
}

.workbench-metric {
  border-color: #d9e1ea;
  border-radius: 4px;
  background: #fff;
  box-shadow: none;
}

.workbench-metric::before {
  display: none;
}

.workbench-metric .metric-icon {
  width: 28px;
  height: 28px;
  border: 1px solid #d9e1ea;
  border-radius: 4px;
  background: #fff;
  color: #526173;
  box-shadow: none;
}

.workbench-metric .capability-card-head {
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: center;
}

.workbench-metric .capability-title {
  color: #172033;
  font-size: 14px;
  font-weight: 700;
}

.workbench-metric .range-pill {
  display: none;
  min-width: 0;
  height: 0;
  border-radius: 4px;
  background: #fff;
  color: #526173;
}

.workbench-metric .capability-status-grid {
  border-top: 1px solid #e7ecf2;
  border-bottom: 1px solid #e7ecf2;
  padding: 9px 0;
}

.workbench-metric .capability-status dt {
  font-size: 11px;
}

.workbench-metric .capability-status dd {
  margin-top: 6px;
  font-size: 19px;
}

.workbench-metric .capability-card-foot {
  border-top: 0;
  padding-top: 0;
}

.workbench-metric .capability-card-foot strong {
  color: #8a1f2d;
  font-weight: 700;
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
  grid-template-columns: minmax(0, 1fr);
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
  min-height: 0;
}

.secondary-row {
  grid-template-columns: minmax(300px, 1fr) minmax(300px, 1fr);
  min-height: 0;
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
  height: auto;
}

.has-data .primary-row > .panel,
.has-data .secondary-row > .panel,
.has-data .operation-panel {
  height: auto;
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
  grid-template-columns: minmax(0, 1fr) 72px;
  gap: 12px;
  min-height: 58px;
  padding: 10px 12px;
}

.todo-copy {
  min-width: 0;
}

.todo-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.todo-item strong,
.todo-item p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-item strong {
  display: block;
  min-width: 0;
  font-size: 13px;
  line-height: 1.25;
}

.todo-item p {
  margin-top: 5px;
  color: #667085;
  font-size: 12px;
  line-height: 1.35;
}

.todo-item .status-tag {
  flex: 0 0 auto;
}

.workbench-page .todo-item .btn {
  justify-self: end;
  min-width: 72px;
  min-height: 26px;
  padding: 4px 10px;
  line-height: 16px;
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
  width: 27%;
}

.recent-task-table .unit-col {
  width: 14%;
}

.recent-task-table .period-col {
  width: 11%;
}

.recent-task-table .stage-col {
  width: 15%;
}

.recent-task-table .status-col {
  width: 10%;
}

.recent-task-table .next-action-col {
  width: 16%;
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

.table-link {
  display: inline-flex;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
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

.risk-item {
  grid-template-columns: minmax(0, 1fr) auto;
}

.risk-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.risk-heading strong {
  min-width: 0;
}

.risk-heading .status-tag {
  flex: 0 0 auto;
  min-height: 18px;
  padding: 0 5px;
  line-height: 16px;
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

.workbench-drawer-layer {
  position: fixed;
  z-index: 80;
  inset: 0;
}

.workbench-drawer-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: rgba(17, 24, 39, 0.22);
}

.workbench-drawer {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  width: min(390px, 92vw);
  height: 100%;
  box-sizing: border-box;
  grid-template-rows: auto minmax(0, 1fr);
  padding: 18px;
  border-left: 1px solid #dfe5ec;
  background: #fff;
  box-shadow: -8px 0 28px rgba(23, 31, 43, 0.16);
}

.workbench-drawer header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e4e9f0;
}

.workbench-drawer header span {
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
}

.workbench-drawer h2 {
  margin: 5px 0 0;
  color: #172033;
  font-size: 18px;
  line-height: 1.35;
}

.workbench-drawer header button {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid #dce3ec;
  border-radius: 4px;
  background: #fff;
  color: #344054;
  cursor: pointer;
  font-size: 20px;
}

.workbench-drawer dl {
  min-height: 0;
  margin: 14px 0 0;
  overflow: auto;
}

.workbench-drawer dl > div {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid #eef1f4;
}

.workbench-drawer dt {
  color: #667085;
  font-size: 12px;
}

.workbench-drawer dd {
  min-width: 0;
  margin: 0;
  color: #263548;
  font-size: 12px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

@media (max-width: 1500px) {
  .workbench-metrics {
    grid-template-columns: repeat(5, minmax(0, 1fr));
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

  .workbench-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
</style>
