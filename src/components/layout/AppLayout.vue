<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'task-empty-shell': route.path === '/tasks' && isEmptyMode, 'task-parsing-shell': isParsingPhase, 'task-template-shell': isTemplatePhase, 'task-detail-shell': isTaskDetailRoute, 'task-generating-shell': isGeneratingTaskDetail, 'task-archived-shell': isArchivedTaskDetail, 'audit-standard-result-shell': isAuditStandardResult, 'supervision-result-shell': isSupervisionShareResultRoute, 'expense-section-shell': isExpenseSection, 'expense-empty-shell': isExpenseWorkbenchRoute, 'expense-audit-result-shell': isExpenseAuditResult, 'expense-trend-shell': isExpenseTrendResult, 'audit-report-generation-shell': isAuditReportGeneration, 'report-review-shell': isReportReviewRoute, 'regulatory-empty-shell': isSpecialAuditWorkbench, 'regulatory-result-shell': isRegulatoryResultRoute }" @click.capture="handleGlobalUploadClick">
    <aside class="sidebar">
      <div class="brand">
        <strong>审计大模型系统</strong>
      </div>

      <nav class="main-nav">
        <template v-for="item in businessNavItems" :key="item.path">
          <RouterLink :to="item.path" :active-class="isSupervisionShareResultRoute || isRegulatoryResultRoute ? 'route-active-disabled' : 'router-link-active'" :class="{ 'manual-active': (isAuditStandardResult && item.path === '/tasks') || (isSupervisionShareResultRoute && item.path === '/regulatory/workbench') || (isRegulatoryResultRoute && item.path === '/regulatory/workbench') || (isExpenseAuditResult && item.path === '/expense/workbench') || (isExpenseSection && item.path === '/expense/workbench') || ((isAuditReportGeneration || isReportReviewRoute) && item.path === '/audit-report/workbench') || isNavParentActive(item) }">
            <span class="nav-icon"><AuditIcon :name="item.icon" /></span>
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.children && shouldShowChildren(item)" class="nav-caret">⌄</span>
          </RouterLink>
          <div v-if="item.children && shouldShowChildren(item)" class="nav-children">
            <RouterLink v-for="child in item.children" :key="child.path" :to="child.path" class="nav-child" active-class="route-active-disabled" :class="{ 'sub-active': isNavChildActive(child) }">
              <span class="nav-child-dot"></span>
              <span>{{ child.label }}</span>
            </RouterLink>
          </div>
        </template>
      </nav>

      <nav class="bottom-nav">
        <button type="button" @click="toggleSidebar"><span class="nav-icon"><AuditIcon name="collapse" /></span><span class="nav-label">{{ sidebarCollapsed ? '展开导航' : '收起导航' }}</span></button>
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

    <div v-if="uploadDialogOpen" class="global-upload-mask" role="presentation">
      <section class="global-upload-modal" role="dialog" aria-modal="true" aria-labelledby="global-upload-title">
        <header>
          <div>
            <span>{{ uploadDialog.context }}</span>
            <h2 id="global-upload-title">本地文件上传</h2>
          </div>
          <button type="button" aria-label="关闭上传弹窗" @click="closeUploadDialog">×</button>
        </header>
        <label class="global-upload-drop">
          <input type="file" :multiple="uploadDialog.multiple" @change="handleUploadFiles" />
          <strong>{{ uploadFileSummary }}</strong>
          <span>支持选择本地文件，上传后进入资料校验和解析流程。</span>
        </label>
        <div class="global-upload-form">
          <label>
            <span>归属任务</span>
            <select v-model="uploadDialog.task">
              <option>上海分公司 Q1 常规审计任务</option>
              <option>营业部费用异常审计任务</option>
              <option>暂不绑定任务</option>
            </select>
          </label>
          <label>
            <span>资料类型</span>
            <select v-model="uploadDialog.fileType">
              <option>审计资料</option>
              <option>报告文件</option>
              <option>制度规范</option>
              <option>费用明细</option>
            </select>
          </label>
          <label class="upload-note">
            <span>上传说明</span>
            <textarea v-model="uploadDialog.note" placeholder="可填写资料来源、版本或补充说明"></textarea>
          </label>
        </div>
        <footer>
          <button type="button" @click="closeUploadDialog">取消</button>
          <button type="button" class="primary" @click="confirmUploadDialog">确认上传</button>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronDown, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import AuditIcon from '../common/AuditIcon.vue';
import { resolveTaskDetailView } from '../../domain/taskDetail/taskDetailViewState.js';
import { taskRows } from '../../views/tasks/taskCenterData.js';

const store = inject('store');
const route = useRoute();
const sidebarCollapsed = ref(false);
const uploadDialogOpen = ref(false);
const uploadDialog = reactive({
  context: '上传文件',
  multiple: false,
  files: [],
  task: '上海分公司 Q1 常规审计任务',
  fileType: '审计资料',
  note: ''
});

const uploadFileSummary = computed(() => {
  if (!uploadDialog.files.length) return '选择本地文件';
  if (uploadDialog.files.length === 1) return uploadDialog.files[0].name;
  return `已选择 ${uploadDialog.files.length} 个文件`;
});

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
  {
    icon: 'knowledge',
    label: '制度与规范',
    path: '/audit-standard/policy',
    children: [
      { label: '制度查询', path: '/audit-standard/policy' },
      { label: '制度比对', path: '/audit-standard/workbench' },
      { label: '规范生成', path: '/audit-standard/generate' },
      { label: '规范库', path: '/audit-standard/library' }
    ]
  },
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
  {
    icon: 'report',
    label: '报告智能化',
    path: '/audit-report/workbench',
    children: [
      { label: '报告生成', path: '/audit-report/workbench?mode=generate', mode: 'generate' },
      { label: '报告审核', path: '/audit-report/workbench?mode=review', mode: 'review' },
      { label: '模板管理', path: '/audit-report/template' }
    ]
  },
  { icon: 'files', label: '文件中心', path: '/files' },
  {
    icon: 'config',
    label: '配置中心',
    path: '/config',
    children: [
      { label: '模板规则标签权限', path: '/config' },
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
const isAuditReportSection = computed(() => route.path.startsWith('/audit-report'));
const isRegulatoryResultRoute = computed(() => route.path === '/regulatory/result');
const isSpecialAuditWorkbench = computed(() => route.path === '/regulatory/workbench');
const isAuditStandardSection = computed(() => route.path.startsWith('/audit-standard'));
const isSpecialAuditSection = computed(() => route.path.startsWith('/regulatory') || route.path.startsWith('/supervision') || isSupervisionShareResultRoute.value);
const isExpenseSection = computed(() => route.path.startsWith('/expense'));
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

function isNavChildActive(child) {
  const targetPath = child.path.split('?')[0];
  if (route.path !== targetPath) return false;
  const defaultMode = targetPath === '/audit-report/workbench' ? 'generate' : '';
  if (child.mode) return String(route.query.mode || defaultMode) === child.mode;
  if (route.query.mode) return false;
  return true;
}

function isNavParentActive(item) {
  if (!item.children) return false;
  return item.children.some((child) => isNavChildActive(child)) ||
    (item.path === '/audit-standard/policy' && isAuditStandardSection.value) ||
    (item.path === '/regulatory/workbench' && isSpecialAuditSection.value) ||
    (item.path === '/expense/workbench' && isExpenseSection.value) ||
    (item.path === '/audit-report/workbench' && isAuditReportSection.value) ||
    (item.path === '/config' && route.path === '/config');
}

function handleGlobalUploadClick(event) {
  const action = event.target.closest?.('button, a');
  if (!action || action.closest('.global-upload-modal, .official-workflow-modal, .official-upload-modal, .compare-modal')) return;

  const label = action.textContent?.replace(/\s+/g, '') || '';
  const uploadLabels = ['上传文件', '上传文件夹', '上传资料', '上传报告', '上传新版本', '上传规范', '上传标准规范', '批量上传', '新建文件导入', '进入文件导入'];
  if (!uploadLabels.some((text) => label.includes(text))) return;

  event.preventDefault();
  event.stopPropagation();
  openUploadDialog(label);
}

function openUploadDialog(label) {
  uploadDialog.context = label || '上传文件';
  uploadDialog.multiple = /批量|文件夹|资料/.test(label);
  uploadDialog.files = [];
  uploadDialog.fileType = /报告|新版本/.test(label) ? '报告文件' : /规范|标准/.test(label) ? '制度规范' : '审计资料';
  uploadDialog.note = '';
  uploadDialogOpen.value = true;
}

function handleUploadFiles(event) {
  uploadDialog.files = Array.from(event.target.files || []);
}

function closeUploadDialog() {
  uploadDialogOpen.value = false;
}

function confirmUploadDialog() {
  const count = uploadDialog.files.length || 1;
  store.setNotice(`${uploadDialog.context}已提交，${count} 个文件进入校验队列。`);
  uploadDialogOpen.value = false;
}

function shouldShowChildren(item) {
  return Boolean(
    item.children &&
    ((isAuditStandardSection.value && item.path === '/audit-standard/policy') ||
      (isSpecialAuditSection.value && item.path === '/regulatory/workbench') ||
      (isExpenseSection.value && item.path === '/expense/workbench') ||
      (isAuditReportSection.value && item.path === '/audit-report/workbench') ||
      (route.path === '/config' && item.path === '/config'))
  );
}
</script>
