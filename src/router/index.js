import { createRouter, createWebHistory } from 'vue-router';
import WorkbenchHome from '../views/workbench/WorkbenchHome.vue';
import TaskList from '../views/tasks/TaskList.vue';
import TaskCreate from '../views/tasks/TaskCreate.vue';
import TaskDetail from '../views/tasks/TaskDetail.vue';
import SupervisionShareResult from '../views/supervision-result/SupervisionShareResult.vue';
import FileCenter from '../views/files/FileCenter.vue';
import FileDetail from '../views/files/FileDetail.vue';
import DemoGuide from '../views/demo-guide/DemoGuide.vue';
import MaterialImportWorkspace from '../views/materials/MaterialImportWorkspace.vue';
import RegulatoryWorkbench from '../views/regulatory/RegulatoryWorkbench.vue';
import RegulatoryResult from '../views/regulatory/RegulatoryResult.vue';
import AuditStandardGenerate from '../views/audit-standard/AuditStandardGenerate.vue';
import AuditStandardDraft from '../views/audit-standard/AuditStandardDraft.vue';
import AuditStandardLibrary from '../views/audit-standard/AuditStandardLibrary.vue';
import AuditStandardPolicy from '../views/audit-standard/AuditStandardPolicy.vue';
import SupervisionWorkbench from '../views/supervision/SupervisionWorkbench.vue';
import SupervisionReportSourceSelect from '../views/supervision/SupervisionReportSourceSelect.vue';
import SupervisionReportDraft from '../views/supervision/SupervisionReportDraft.vue';
import ExpenseAuditOverview from '../views/expense/ExpenseAuditOverview.vue';
import ExpenseAnomalyDashboard from '../views/expense/ExpenseAnomalyDashboard.vue';
import ExpenseUsageDashboard from '../views/expense/ExpenseUsageDashboard.vue';
import AuditReportWorkbench from '../views/audit-report/AuditReportWorkbench.vue';
import AuditReportTemplate from '../views/audit-report/AuditReportTemplate.vue';
import AuditReportSourceSelect from '../views/audit-report/AuditReportSourceSelect.vue';
import AuditReportGapList from '../views/audit-report/AuditReportGapList.vue';
import AuditReportDraft from '../views/audit-report/AuditReportDraft.vue';
import AuditReportCheckResult from '../views/audit-report/AuditReportCheckResult.vue';
import AuditedEntityBusinessAnalysis from '../views/audit-report/AuditedEntityBusinessAnalysis.vue';

export const routes = [
  { path: '/', redirect: '/workbench' },
  { path: '/workbench', component: WorkbenchHome, meta: { title: '审计工作台' } },
  { path: '/empty-start', redirect: '/workbench' },
  { path: '/tasks', component: TaskList, meta: { title: '全部任务' } },
  { path: '/tasks/create', component: TaskCreate, meta: { title: '创建审计任务' } },
  { path: '/tasks/detail', component: TaskDetail, meta: { title: '任务详情' } },
  { path: '/tasks/detail/supervision-share', component: SupervisionShareResult, meta: { title: '监督共享信息分析' } },
  { path: '/files', component: FileCenter, meta: { title: '文件中心' } },
  { path: '/files/detail', component: FileDetail, meta: { title: '文件详情' } },
  { path: '/system', redirect: '/workbench' },
  { path: '/config', redirect: '/workbench' },
  { path: '/records', redirect: '/workbench' },
  { path: '/demo-guide', component: DemoGuide, meta: { title: '演示指南' } },
  { path: '/materials/import', component: MaterialImportWorkspace, meta: { title: '资料导入工作区' } },
  { path: '/regulatory/workbench', component: RegulatoryWorkbench, meta: { title: '监管案例与舆情分析' } },
  { path: '/regulatory/new', redirect: { path: '/regulatory/workbench', query: { action: 'create' } } },
  { path: '/regulatory/data-fetch', redirect: { path: '/regulatory/result', query: { panel: 'fetch' } } },
  { path: '/regulatory/result', component: RegulatoryResult, meta: { title: '监管分析结果' } },
  { path: '/regulatory/history', redirect: { path: '/regulatory/result', query: { tab: 'history' } } },
  { path: '/audit-standard/workbench', redirect: '/audit-standard/policy' },
  { path: '/audit-standard/generate', component: AuditStandardGenerate, meta: { title: '审计规范生成配置' } },
  { path: '/audit-standard/upload', redirect: { path: '/audit-standard/library', query: { action: 'upload' } } },
  { path: '/audit-standard/precheck', redirect: { path: '/audit-standard/generate', query: { step: 'precheck' } } },
  { path: '/audit-standard/draft', component: AuditStandardDraft, meta: { title: '审计规范草稿' } },
  { path: '/audit-standard/diff', redirect: { path: '/audit-standard/library', query: { panel: 'diff' } } },
  { path: '/audit-standard/library', component: AuditStandardLibrary, meta: { title: '审计规范库' } },
  { path: '/audit-standard/policy', component: AuditStandardPolicy, meta: { title: '制度查询与比对' } },
  { path: '/supervision/workbench', component: SupervisionWorkbench, meta: { title: '监督共享入口' } },
  { path: '/supervision/import/upload', redirect: { path: '/materials/import', query: { scene: 'supervision', step: 'upload' } } },
  { path: '/supervision/import/folder-preview', redirect: { path: '/materials/import', query: { scene: 'supervision', step: 'folder-preview' } } },
  { path: '/supervision/import/field-edit', redirect: { path: '/materials/import', query: { scene: 'supervision', step: 'field-edit' } } },
  { path: '/supervision/import/metadata', redirect: { path: '/materials/import', query: { scene: 'supervision', step: 'metadata' } } },
  { path: '/supervision/import/precheck', redirect: { path: '/materials/import', query: { scene: 'supervision', step: 'precheck' } } },
  { path: '/supervision/report/source-select', component: SupervisionReportSourceSelect, meta: { title: '监督共享报告来源选择' } },
  { path: '/supervision/report/draft', component: SupervisionReportDraft, meta: { title: '监督共享报告草稿' } },
  { path: '/expense/workbench', redirect: '/expense/audit/overview' },
  { path: '/expense/audit/overview', component: ExpenseAuditOverview, meta: { title: '费用综合分析' } },
  { path: '/expense/usage/new', redirect: { path: '/expense/workbench', query: { action: 'create-usage' } } },
  { path: '/expense/usage/dashboard', component: ExpenseUsageDashboard, meta: { title: '费用趋势分析' } },
  { path: '/expense/usage/drilldown', redirect: { path: '/expense/usage/dashboard', query: { panel: 'drilldown' } } },
  { path: '/expense/usage/report', redirect: { path: '/expense/usage/dashboard', query: { panel: 'report' } } },
  { path: '/expense/anomaly/dashboard', component: ExpenseAnomalyDashboard, meta: { title: '费用异常分析' } },
  { path: '/expense/anomaly/candidates', redirect: '/expense/anomaly/dashboard' },
  { path: '/audit-report/business-analysis', component: AuditedEntityBusinessAnalysis, meta: { title: '被审计单位业务分析' } },
  { path: '/audit-report/workbench', component: AuditReportWorkbench, meta: { title: '报告生成与审核' } },
  { path: '/audit-report/template', component: AuditReportTemplate, meta: { title: '报告模板管理' } },
  { path: '/audit-report/template-upload', redirect: { path: '/audit-report/template', query: { action: 'upload' } } },
  { path: '/audit-report/template-diff', redirect: { path: '/audit-report/template', query: { panel: 'diff' } } },
  { path: '/audit-report/source-select', component: AuditReportSourceSelect, meta: { title: '报告来源选择' } },
  { path: '/audit-report/gap-list', component: AuditReportGapList, meta: { title: '资料缺口清单' } },
  { path: '/audit-report/material/import', redirect: { path: '/materials/import', query: { scene: 'audit-report', step: 'upload' } } },
  { path: '/audit-report/material/folder-preview', redirect: { path: '/materials/import', query: { scene: 'audit-report', step: 'folder-preview' } } },
  { path: '/audit-report/material/field-edit', redirect: { path: '/materials/import', query: { scene: 'audit-report', step: 'field-edit' } } },
  { path: '/audit-report/material/metadata', redirect: { path: '/materials/import', query: { scene: 'audit-report', step: 'metadata' } } },
  { path: '/audit-report/material/precheck', redirect: { path: '/materials/import', query: { scene: 'audit-report', step: 'precheck' } } },
  { path: '/audit-report/material/supplement-preview', redirect: { path: '/materials/import', query: { scene: 'audit-report', step: 'supplement-preview' } } },
  { path: '/audit-report/draft', component: AuditReportDraft, meta: { title: '报告草稿工作区' } },
  { path: '/audit-report/offline-upload', redirect: { path: '/audit-report/draft', query: { action: 'offline-upload' } } },
  { path: '/audit-report/diff', redirect: { path: '/audit-report/draft', query: { panel: 'diff' } } },
  { path: '/audit-report/check-upload', redirect: { path: '/audit-report/workbench', query: { mode: 'review' } } },
  { path: '/audit-report/check-result', component: AuditReportCheckResult, meta: { title: '报告检查结果' } }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
