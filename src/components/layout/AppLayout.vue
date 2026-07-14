<template>
  <div class="app-shell" :class="{ 'task-empty-shell': route.path === '/tasks' && isEmptyMode, 'task-parsing-shell': isParsingPhase, 'task-template-shell': isTemplatePhase, 'task-detail-shell': isTaskDetailRoute, 'task-generating-shell': isGeneratingTaskDetail, 'task-archived-shell': isArchivedTaskDetail, 'audit-standard-result-shell': isAuditStandardResult, 'supervision-result-shell': isSupervisionShareResultRoute, 'expense-section-shell': isExpenseSection, 'expense-empty-shell': isExpenseWorkbenchRoute, 'expense-audit-result-shell': isExpenseAuditResult, 'expense-trend-shell': isExpenseTrendResult, 'audit-report-generation-shell': isAuditReportGeneration, 'report-review-shell': isReportReviewRoute, 'regulatory-empty-shell': isSpecialAuditWorkbench, 'regulatory-result-shell': isRegulatoryResultRoute }">
    <aside class="sidebar">
      <div class="brand">
        <strong>审计大模型系统</strong>
      </div>

      <nav class="main-nav">
        <template v-for="item in businessNavItems" :key="item.path">
          <RouterLink :to="item.path" :active-class="isSupervisionShareResultRoute || isRegulatoryResultRoute ? 'route-active-disabled' : 'router-link-active'" :class="{ 'manual-active': (isAuditStandardResult && item.path === '/tasks') || (isSupervisionShareResultRoute && item.path === '/regulatory/workbench') || (isRegulatoryResultRoute && item.path === '/regulatory/workbench') || (isExpenseAuditResult && item.path === '/expense/workbench') || (isExpenseSection && item.path === '/expense/workbench') || ((isAuditReportGeneration || isReportReviewRoute) && item.path === '/audit-report/workbench') }">
            <span class="nav-icon"><AuditIcon :name="item.icon" /></span>
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.children && shouldShowChildren(item)" class="nav-caret">⌄</span>
          </RouterLink>
          <div v-if="item.children && shouldShowChildren(item)" class="nav-children">
            <RouterLink v-for="child in item.children" :key="child.path" :to="child.path" class="nav-child" active-class="router-link-active" :class="{ 'sub-active': child.mode && route.query.mode === child.mode }">
              <span class="nav-child-dot"></span>
              <span>{{ child.label }}</span>
            </RouterLink>
          </div>
        </template>
      </nav>

      <nav class="bottom-nav">
        <RouterLink to="/demo-guide"><span class="nav-icon"><AuditIcon name="collapse" /></span>收起导航</RouterLink>
      </nav>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <div v-if="route.path === '/tasks' && isEmptyMode" class="task-breadcrumb"><span>审计工作台</span><i>/</i><strong>任务中心</strong></div>
          <h1 v-else-if="route.path === '/tasks'" class="task-page-title">任务中心</h1>
          <div v-else-if="isTaskDetailRoute" class="task-breadcrumb"><span>任务中心</span><i>/</i><strong>任务详情</strong></div>
          <div v-else-if="isSupervisionShareResultRoute" class="task-breadcrumb"><span>任务中心</span><i>/</i><span>上海分公司Q1常规审计任务</span><i>/</i><strong>监督共享信息分析</strong></div>
          <div v-else-if="isAuditStandardResult" class="task-breadcrumb"><span>任务中心</span><i>/</i><span>上海分公司Q1常规审计任务</span><i>/</i><strong>审计规范生成</strong></div>
          <div v-else-if="isExpenseWorkbenchRoute" class="task-breadcrumb"><span>审计工作台</span><i>/</i><strong>费用审计分析</strong></div>
          <div v-else-if="isExpenseAuditOverview" class="task-breadcrumb"><span>审计工作台</span><i>/</i><strong>费用审计分析</strong></div>
          <div v-else-if="isExpenseAnomalyMonitor" class="task-breadcrumb"><span>审计工作台</span><i>/</i><span>费用审计分析</span><i>/</i><strong>费用异常监控</strong></div>
          <div v-else-if="isExpenseTrendResult" class="task-breadcrumb"><span>审计工作台</span><i>/</i><span>费用审计分析</span><i>/</i><strong>费用趋势分析</strong></div>
          <div v-else-if="isReportReviewRoute" class="task-breadcrumb"><span>任务中心</span><i>/</i><span>上海分公司Q1常规审计任务</span><i>/</i><strong>报告审核</strong></div>
          <div v-else-if="isAuditReportGeneration" class="task-breadcrumb"><span>任务中心</span><i>/</i><span>上海分公司Q1常规审计任务</span><i>/</i><strong>报告生成</strong></div>
          <div v-else-if="isRegulatoryResultRoute" class="task-breadcrumb"><span>审计工作台</span><i>/</i><strong>专项审计分析</strong></div>
          <div v-else-if="isSpecialAuditWorkbench" class="task-breadcrumb"><span>审计工作台</span><i>/</i><strong>专项审计分析</strong></div>
          <div v-else-if="isTaskRoute" class="task-breadcrumb"><span>审计工作台</span><i>/</i><strong v-if="!isParsingPhase">创建审计任务</strong><template v-else><span>创建审计任务</span><i>/</i><strong>资料解析</strong></template></div>
          <template v-else>
            <span class="crumb">当前位置</span>
            <h1>{{ route.meta.title || '审计任务工作台' }}</h1>
          </template>
        </div>

        <div class="topbar-right">
          <div class="global-data-mode" aria-label="统一演示数据切换">
            <span>演示数据</span>
            <button type="button" :class="{ active: !isEmptyMode }" @click="setDemoDataMode('data')">有</button>
            <button type="button" :class="{ active: isEmptyMode }" @click="setDemoDataMode('empty')">无</button>
          </div>
          <div class="top-icons" aria-label="全局操作">
            <button class="icon-btn" type="button" aria-label="通知">
              <FontAwesomeIcon :icon="faBell" />
              <span v-if="isExpenseWorkbenchRoute" class="notice-dot">0</span>
              <span v-else-if="isExpenseTrendResult" class="notice-dot">12</span>
              <span v-else-if="!isEmptyMode || isTaskDetailRoute" class="notice-dot">12</span>
              <span v-else-if="isSupervisionShareResultRoute" class="notice-dot">12</span>
              <span v-else-if="isAuditStandardResult" class="notice-dot">12</span>
            </button>
            <button class="icon-btn" type="button" aria-label="帮助"><FontAwesomeIcon :icon="faCircleQuestion" /></button>
          </div>
          <div class="user-scope" aria-label="当前用户">
            <span class="user-avatar"><FontAwesomeIcon :icon="faCircleUser" /></span>
            <strong>审计管理员</strong>
            <span class="user-caret"><FontAwesomeIcon :icon="faChevronDown" /></span>
          </div>
        </div>
      </header>

      <div v-if="store.notice && route.path !== '/workbench'" class="notice">{{ store.notice }}</div>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed, inject, watch } from 'vue';
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBell, faChevronDown, faCircleQuestion, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import AuditIcon from '../common/AuditIcon.vue';
import { resolveTaskDetailView } from '../../domain/taskDetail/taskDetailViewState.js';
import { taskRows } from '../../views/tasks/taskCenterData.js';

const store = inject('store');
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    store.closeDrawer();
    store.notice = '';
  }
);

const businessNavItems = [
  { icon: 'workbench', label: '审计工作台', path: '/workbench' },
  { icon: 'tasks', label: '任务中心', path: '/tasks' },
  { icon: 'knowledge', label: '审计知识库', path: '/audit-standard/policy' },
  { icon: 'compare', label: '制度比对', path: '/audit-standard/workbench' },
  {
    icon: 'analysis',
    label: '专项审计分析',
    path: '/regulatory/workbench',
    children: [
      { label: '专项审计入口', path: '/regulatory/workbench' },
      { label: '监管案例舆情分析', path: '/regulatory/result' },
      { label: '监督共享信息分析', path: '/tasks/detail/supervision-share' }
    ]
  },
  {
    icon: 'expense',
    label: '费用审计分析',
    path: '/expense/workbench',
    children: [
      { label: '费用审计入口', path: '/expense/workbench' },
      { label: '费用审计分析', path: '/expense/audit/overview' },
      { label: '费用异常监控', path: '/expense/anomaly/dashboard' },
      { label: '费用趋势分析', path: '/expense/usage/dashboard' }
    ]
  },
  { icon: 'report', label: '报告智能化', path: '/audit-report/workbench' },
  { icon: 'files', label: '文件中心', path: '/files' },
  {
    icon: 'config',
    label: '配置中心',
    path: '/config',
    children: [
      { label: '配置与记录中心', path: '/config?mode=records', mode: 'records' },
      { label: '系统参数配置', path: '/config?mode=params', mode: 'params' }
    ]
  },
  { icon: 'records', label: '记录中心', path: '/records' }
];

const isEmptyMode = computed(() => store.demoDataMode === 'empty');
const isTaskDetailRoute = computed(() => route.path === '/tasks/detail');
const isSupervisionShareResultRoute = computed(() => route.path === '/tasks/detail/supervision-share');
const isAuditStandardResult = computed(() => route.path === '/audit-standard/draft');
const isExpenseWorkbenchRoute = computed(() => route.path === '/expense/workbench');
const isExpenseAuditOverview = computed(() => route.path === '/expense/audit/overview');
const isExpenseAnomalyMonitor = computed(() => route.path === '/expense/anomaly/dashboard');
const isExpenseAuditResult = computed(() => isExpenseAuditOverview.value || isExpenseAnomalyMonitor.value);
const isExpenseTrendResult = computed(() => route.path === '/expense/usage/dashboard');
const isAuditReportGeneration = computed(() => route.path === '/audit-report/draft');
const isReportReviewRoute = computed(() => route.path === '/audit-report/check-result');
const isRegulatoryResultRoute = computed(() => route.path === '/regulatory/result');
const isSpecialAuditWorkbench = computed(() => route.path === '/regulatory/workbench');
const isSpecialAuditSection = computed(() => route.path.startsWith('/regulatory') || route.path.startsWith('/supervision') || isSupervisionShareResultRoute.value);
const isExpenseSection = computed(() => route.path.startsWith('/expense'));
const selectedTask = computed(() => taskRows.find((task) => task.id === route.query.taskId));
const detailView = computed(() => resolveTaskDetailView(route.query, selectedTask.value));
const isGeneratingTaskDetail = computed(() => isTaskDetailRoute.value && detailView.value === 'generating');
const isArchivedTaskDetail = computed(() => isTaskDetailRoute.value && detailView.value === 'archived');
const isTaskRoute = computed(() => route.path === '/tasks' || route.path === '/tasks/create');
const isParsingPhase = computed(() => route.path === '/tasks/create' && route.query.phase === 'parse');
const isTemplatePhase = computed(() => route.path === '/tasks/create' && (route.query.phase === 'confirm' || route.query.phase === 'template'));

function setDemoDataMode(mode) {
  store.setDemoDataMode(mode);
  store.notice = '';
}

function shouldShowChildren(item) {
  return Boolean(
    item.children &&
    ((isSpecialAuditSection.value && item.path === '/regulatory/workbench') ||
      (isExpenseSection.value && item.path === '/expense/workbench') ||
      (route.path === '/config' && item.path === '/config'))
  );
}
</script>
