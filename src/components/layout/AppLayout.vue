<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'task-empty-shell': route.path === '/tasks' && isEmptyMode, 'task-parsing-shell': isParsingPhase, 'task-template-shell': isTemplatePhase, 'task-detail-shell': isTaskDetailRoute, 'task-generating-shell': isGeneratingTaskDetail, 'task-archived-shell': isArchivedTaskDetail, 'audit-standard-result-shell': isAuditStandardResult, 'supervision-result-shell': isSupervisionShareResultRoute, 'expense-section-shell': isExpenseSection, 'expense-audit-result-shell': isExpenseAuditResult, 'expense-trend-shell': isExpenseTrendResult, 'audit-report-generation-shell': isAuditReportGeneration, 'report-review-shell': isReportReviewRoute, 'regulatory-empty-shell': isSpecialAuditWorkbench, 'regulatory-result-shell': isRegulatoryResultRoute }">
    <aside class="sidebar">
      <div class="brand">
        <strong>审计大模型系统</strong>
      </div>

      <nav class="main-nav">
        <template v-for="item in businessNavItems" :key="item.path">
          <RouterLink :to="item.path" :active-class="isSupervisionShareResultRoute || isRegulatoryResultRoute ? 'route-active-disabled' : 'router-link-active'" :class="{ 'manual-active': (isTaskSection && item.path === '/workbench') || (isKnowledgeSection && item.path === '/audit-standard/policy') || (isExpenseSection && item.path === '/expense/audit/overview') || (isAuditReportSection && item.path === '/audit-report/business-analysis') }">
            <span class="nav-icon"><AuditIcon :name="item.icon" /></span>
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.children && shouldShowChildren(item)" class="nav-caret">⌄</span>
          </RouterLink>
          <div v-if="item.children && shouldShowChildren(item)" class="nav-children">
            <RouterLink v-for="child in item.children" :key="child.path" :to="child.path" class="nav-child" :active-class="child.mode ? 'route-active-disabled' : 'router-link-active'" :class="{ 'sub-active': isChildActive(child) }">
              <span class="nav-child-dot"></span>
              <span>{{ child.label }}</span>
            </RouterLink>
          </div>
        </template>
      </nav>

      <nav class="bottom-nav">
        <button type="button" @click="toggleSidebar"><span class="nav-icon"><AuditIcon name="collapse" /></span><span class="nav-label">{{ sidebarCollapsed ? '展开导航' : '收起导航' }}</span></button>
        <RouterLink v-if="showDemoControls" to="/demo-guide"><span class="nav-icon"><AuditIcon name="qa" /></span>演示指南</RouterLink>
      </nav>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <div v-if="route.path === '/tasks'" class="task-breadcrumb"><span>审计工作台</span><i>/</i><strong>全部任务</strong></div>
          <div v-else-if="isTaskDetailRoute" class="task-breadcrumb"><span>审计工作台</span><i>/</i><strong>任务详情</strong></div>
          <div v-else-if="isSupervisionShareResultRoute" class="task-breadcrumb"><span>审计知识库</span><i>/</i><span>上海分公司Q1常规审计任务</span><i>/</i><strong>监督共享信息分析</strong></div>
          <div v-else-if="isAuditStandardResult" class="task-breadcrumb"><span>审计知识库</span><i>/</i><span>上海分公司Q1常规审计任务</span><i>/</i><strong>审计规范智能化</strong></div>
          <div v-else-if="isExpenseAuditOverview" class="task-breadcrumb"><span>费用智能化审计</span><i>/</i><strong>费用综合分析</strong></div>
          <div v-else-if="isExpenseAnomalyMonitor" class="task-breadcrumb"><span>费用智能化审计</span><i>/</i><strong>费用异常分析</strong></div>
          <div v-else-if="isExpenseTrendResult" class="task-breadcrumb"><span>费用智能化审计</span><i>/</i><strong>费用综合分析</strong></div>
          <div v-else-if="isReportReviewRoute" class="task-breadcrumb"><span>审计报告智能化</span><i>/</i><span>上海分公司Q1常规审计任务</span><i>/</i><strong>报告智能审核</strong></div>
          <div v-else-if="isAuditReportGeneration" class="task-breadcrumb"><span>审计报告智能化</span><i>/</i><span>上海分公司Q1常规审计任务</span><i>/</i><strong>报告生成</strong></div>
          <div v-else-if="isRegulatoryResultRoute" class="task-breadcrumb"><span>审计知识库</span><i>/</i><strong>监管案例与舆情分析</strong></div>
          <div v-else-if="isSpecialAuditWorkbench" class="task-breadcrumb"><span>审计知识库</span><i>/</i><strong>监管案例与舆情分析</strong></div>
          <div v-else-if="isTaskCreateRoute" class="task-breadcrumb"><span>审计工作台</span><i>/</i><span>当前任务：创建审计任务</span><i>/</i><strong>{{ taskCreateStepLabel }}</strong></div>
          <template v-else>
            <span class="crumb">当前位置</span>
            <h1>{{ route.meta.title || '审计任务工作台' }}</h1>
          </template>
        </div>

        <div class="topbar-right">
          <div v-if="showDemoControls" class="global-data-mode" aria-label="统一演示数据切换">
            <span>演示数据</span>
            <button type="button" :class="{ active: !isEmptyMode }" @click="setDemoDataMode('data')">有</button>
            <button type="button" :class="{ active: isEmptyMode }" @click="setDemoDataMode('empty')">无</button>
          </div>
          <div class="user-scope" aria-label="当前用户">
            <span class="user-avatar"><FontAwesomeIcon :icon="faCircleUser" /></span>
            <strong>审计管理员</strong>
            <span class="user-caret"><FontAwesomeIcon :icon="faChevronDown" /></span>
          </div>
        </div>
      </header>

      <div v-if="store.notice && route.path !== '/workbench'" class="notice">{{ store.notice }}</div>
      <div class="route-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronDown, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import AuditIcon from '../common/AuditIcon.vue';
import { resolveTaskDetailView } from '../../domain/taskDetail/taskDetailViewState.js';
import { taskRows } from '../../views/tasks/taskCenterData.js';

const store = inject('store');
const route = useRoute();
const sidebarCollapsed = ref(false);

watch(
  () => route.fullPath,
  () => {
    store.closeDrawer();
    store.notice = '';
  }
);

const businessNavItems = [
  { icon: 'workbench', label: '审计工作台', path: '/workbench' },
  {
    icon: 'knowledge',
    label: '审计知识库',
    path: '/audit-standard/policy',
    children: [
      { label: '制度查询与比对', path: '/audit-standard/policy', area: 'policy', section: 'knowledge' },
      { label: '监管案例与舆情分析', path: '/regulatory/workbench', area: 'cases', section: 'knowledge' },
      { label: '审计规范智能化', path: '/audit-standard/generate', area: 'standard', section: 'knowledge' },
      { label: '监督共享信息分析', path: '/supervision/workbench', area: 'supervision', section: 'knowledge' }
    ]
  },
  {
    icon: 'expense',
    label: '费用智能化审计',
    path: '/expense/audit/overview',
    children: [
      { label: '费用综合分析', path: '/expense/audit/overview', area: 'overview', section: 'expense' },
      { label: '费用异常分析', path: '/expense/anomaly/dashboard', area: 'anomaly', section: 'expense' }
    ]
  },
  {
    icon: 'report',
    label: '审计报告智能化',
    path: '/audit-report/business-analysis',
    children: [
      { label: '被审计单位业务分析', path: '/audit-report/business-analysis', mode: 'business', section: 'report' },
      { label: '报告生成', path: '/audit-report/workbench', mode: 'generate', section: 'report' },
      { label: '报告智能审核', path: '/audit-report/workbench?mode=review', mode: 'review', section: 'report' },
      { label: '模板管理', path: '/audit-report/template', section: 'report' }
    ]
  },
  { icon: 'files', label: '文件中心', path: '/files' }
];

const isEmptyMode = computed(() => store.demoDataMode === 'empty');
const isTaskDetailRoute = computed(() => route.path === '/tasks/detail');
const isSupervisionShareResultRoute = computed(() => route.path === '/tasks/detail/supervision-share');
const isAuditStandardResult = computed(() => route.path === '/audit-standard/draft');
const isExpenseAuditOverview = computed(() => route.path === '/expense/audit/overview');
const isExpenseAnomalyMonitor = computed(() => route.path === '/expense/anomaly/dashboard');
const isExpenseAuditResult = computed(() => isExpenseAuditOverview.value || isExpenseAnomalyMonitor.value);
const isExpenseTrendResult = computed(() => route.path === '/expense/usage/dashboard');
const isAuditReportGeneration = computed(() => route.path === '/audit-report/draft');
const isReportReviewRoute = computed(() => route.path === '/audit-report/check-result');
const isRegulatoryResultRoute = computed(() => route.path === '/regulatory/result');
const isSpecialAuditWorkbench = computed(() => route.path === '/regulatory/workbench');
const isKnowledgeSection = computed(() =>
  route.path.startsWith('/audit-standard') ||
  route.path.startsWith('/regulatory') ||
  route.path.startsWith('/supervision') ||
  isSupervisionShareResultRoute.value
);
const isExpenseSection = computed(() => route.path.startsWith('/expense'));
const isAuditReportSection = computed(() => route.path.startsWith('/audit-report'));
const isTaskSection = computed(() => ['/tasks', '/tasks/create', '/tasks/detail'].includes(route.path));
const showDemoControls = computed(() => import.meta.env.DEV || route.query.demo === '1');
const selectedTask = computed(() => taskRows.find((task) => task.id === route.query.taskId));
const detailView = computed(() => resolveTaskDetailView(route.query, selectedTask.value));
const isGeneratingTaskDetail = computed(() => isTaskDetailRoute.value && detailView.value === 'generating');
const isArchivedTaskDetail = computed(() => isTaskDetailRoute.value && detailView.value === 'archived');
const isTaskRoute = computed(() => route.path === '/tasks' || route.path === '/tasks/create');
const isTaskCreateRoute = computed(() => route.path === '/tasks/create');
const isParsingPhase = computed(() => route.path === '/tasks/create' && route.query.phase === 'parse');
const isTemplatePhase = computed(() => route.path === '/tasks/create' && (route.query.phase === 'confirm' || route.query.phase === 'template'));
const taskCreateStepLabel = computed(() => {
  const phase = String(route.query.phase || 'ability');
  if (phase === 'basic') return '填写基础信息';
  if (phase === 'materials') return '资料选择';
  if (phase === 'parse') return '资料解析';
  if (phase === 'confirm' || phase === 'template') return '模板与输出设置';
  return '选择能力';
});

function setDemoDataMode(mode) {
  store.setDemoDataMode(mode);
  store.notice = '';
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

function isReportChildActive(child) {
  if (child.mode === 'business') return route.path === '/audit-report/business-analysis';
  if (child.mode === 'generate') {
    return (route.path === '/audit-report/workbench' && route.query.mode !== 'review') || isAuditReportGeneration.value;
  }
  if (child.mode === 'review') {
    return (route.path === '/audit-report/workbench' && route.query.mode === 'review') || isReportReviewRoute.value;
  }
  return route.path === '/audit-report/template';
}

function isChildActive(child) {
  if (child.section === 'report') return isReportChildActive(child);
  if (child.section === 'knowledge') {
    if (child.area === 'policy') return route.path === '/audit-standard/policy';
    if (child.area === 'cases') return route.path.startsWith('/regulatory');
    if (child.area === 'standard') return route.path.startsWith('/audit-standard') && route.path !== '/audit-standard/policy';
    return route.path.startsWith('/supervision') || isSupervisionShareResultRoute.value;
  }
  if (child.section === 'expense') {
    return child.area === 'anomaly' ? route.path.startsWith('/expense/anomaly') : !route.path.startsWith('/expense/anomaly');
  }
  return Boolean(child.mode && route.query.mode === child.mode);
}

function shouldShowChildren(item) {
  return Boolean(
    item.children &&
    ((isKnowledgeSection.value && item.path === '/audit-standard/policy') ||
      (isExpenseSection.value && item.path === '/expense/audit/overview') ||
      (isAuditReportSection.value && item.path === '/audit-report/business-analysis'))
  );
}
</script>
