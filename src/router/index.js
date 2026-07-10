import { createRouter, createWebHistory } from 'vue-router';
import WorkbenchHome from '../views/workbench/WorkbenchHome.vue';
import EmptyStart from '../views/workbench/EmptyStart.vue';
import TaskList from '../views/tasks/TaskList.vue';
import TaskCreate from '../views/tasks/TaskCreate.vue';
import TaskDetail from '../views/tasks/TaskDetail.vue';
import FileCenter from '../views/files/FileCenter.vue';
import FileDetail from '../views/files/FileDetail.vue';
import ConfigCenter from '../views/config/ConfigCenter.vue';
import RecordCenter from '../views/records/RecordCenter.vue';
import DemoGuide from '../views/demo-guide/DemoGuide.vue';
import RegulatoryWorkbench from '../views/regulatory/RegulatoryWorkbench.vue';
import RegulatoryNew from '../views/regulatory/RegulatoryNew.vue';
import RegulatoryDataFetch from '../views/regulatory/RegulatoryDataFetch.vue';
import RegulatoryResult from '../views/regulatory/RegulatoryResult.vue';
import RegulatoryHistory from '../views/regulatory/RegulatoryHistory.vue';
import AuditStandardWorkbench from '../views/audit-standard/AuditStandardWorkbench.vue';
import AuditStandardGenerate from '../views/audit-standard/AuditStandardGenerate.vue';
import AuditStandardUpload from '../views/audit-standard/AuditStandardUpload.vue';
import AuditStandardPrecheck from '../views/audit-standard/AuditStandardPrecheck.vue';
import AuditStandardDraft from '../views/audit-standard/AuditStandardDraft.vue';
import AuditStandardDiff from '../views/audit-standard/AuditStandardDiff.vue';
import AuditStandardLibrary from '../views/audit-standard/AuditStandardLibrary.vue';
import AuditStandardPolicy from '../views/audit-standard/AuditStandardPolicy.vue';
import SupervisionWorkbench from '../views/supervision/SupervisionWorkbench.vue';
import SupervisionUpload from '../views/supervision/SupervisionUpload.vue';
import SupervisionFolderPreview from '../views/supervision/SupervisionFolderPreview.vue';
import SupervisionFieldEdit from '../views/supervision/SupervisionFieldEdit.vue';
import SupervisionMetadata from '../views/supervision/SupervisionMetadata.vue';
import SupervisionPrecheck from '../views/supervision/SupervisionPrecheck.vue';
import SupervisionReportSourceSelect from '../views/supervision/SupervisionReportSourceSelect.vue';
import SupervisionReportDraft from '../views/supervision/SupervisionReportDraft.vue';
import ExpenseWorkbench from '../views/expense/ExpenseWorkbench.vue';
import ExpenseUsageNew from '../views/expense/ExpenseUsageNew.vue';
import ExpenseUsageDashboard from '../views/expense/ExpenseUsageDashboard.vue';
import ExpenseUsageDrilldown from '../views/expense/ExpenseUsageDrilldown.vue';
import ExpenseUsageReport from '../views/expense/ExpenseUsageReport.vue';
import ExpenseAnomalyDashboard from '../views/expense/ExpenseAnomalyDashboard.vue';
import ExpenseCandidates from '../views/expense/ExpenseCandidates.vue';
import AuditReportWorkbench from '../views/audit-report/AuditReportWorkbench.vue';
import AuditReportTemplate from '../views/audit-report/AuditReportTemplate.vue';
import AuditReportTemplateUpload from '../views/audit-report/AuditReportTemplateUpload.vue';
import AuditReportTemplateDiff from '../views/audit-report/AuditReportTemplateDiff.vue';
import AuditReportSourceSelect from '../views/audit-report/AuditReportSourceSelect.vue';
import AuditReportGapList from '../views/audit-report/AuditReportGapList.vue';
import AuditReportMaterialImport from '../views/audit-report/AuditReportMaterialImport.vue';
import AuditReportMaterialFolderPreview from '../views/audit-report/AuditReportMaterialFolderPreview.vue';
import AuditReportMaterialFieldEdit from '../views/audit-report/AuditReportMaterialFieldEdit.vue';
import AuditReportMaterialMetadata from '../views/audit-report/AuditReportMaterialMetadata.vue';
import AuditReportMaterialPrecheck from '../views/audit-report/AuditReportMaterialPrecheck.vue';
import AuditReportSupplementPreview from '../views/audit-report/AuditReportSupplementPreview.vue';
import AuditReportDraft from '../views/audit-report/AuditReportDraft.vue';
import AuditReportOfflineUpload from '../views/audit-report/AuditReportOfflineUpload.vue';
import AuditReportDiff from '../views/audit-report/AuditReportDiff.vue';
import AuditReportCheckUpload from '../views/audit-report/AuditReportCheckUpload.vue';
import AuditReportCheckResult from '../views/audit-report/AuditReportCheckResult.vue';

export const routes = [
  { path: '/', redirect: '/workbench' },
  { path: '/workbench', component: WorkbenchHome, meta: { title: '审计工作台' } },
  { path: '/empty-start', component: EmptyStart, meta: { title: '首次使用引导' } },
  { path: '/tasks', component: TaskList, meta: { title: '任务列表' } },
  { path: '/tasks/create', component: TaskCreate, meta: { title: '创建审计任务' } },
  { path: '/tasks/detail', component: TaskDetail, meta: { title: '任务详情' } },
  { path: '/files', component: FileCenter, meta: { title: '文件中心' } },
  { path: '/files/detail', component: FileDetail, meta: { title: '文件详情' } },
  { path: '/config', component: ConfigCenter, meta: { title: '配置中心' } },
  { path: '/records', component: RecordCenter, meta: { title: '记录中心' } },
  { path: '/demo-guide', component: DemoGuide, meta: { title: '演示指南' } },
  { path: '/regulatory/workbench', component: RegulatoryWorkbench, meta: { title: '监管分析工作台' } },
  { path: '/regulatory/new', component: RegulatoryNew, meta: { title: '新建监管分析任务' } },
  { path: '/regulatory/data-fetch', component: RegulatoryDataFetch, meta: { title: '监管分析数据获取' } },
  { path: '/regulatory/result', component: RegulatoryResult, meta: { title: '监管分析结果' } },
  { path: '/regulatory/history', component: RegulatoryHistory, meta: { title: '监管分析历史查询' } },
  { path: '/audit-standard/workbench', component: AuditStandardWorkbench, meta: { title: '审计规范工作台' } },
  { path: '/audit-standard/generate', component: AuditStandardGenerate, meta: { title: '审计规范生成配置' } },
  { path: '/audit-standard/upload', component: AuditStandardUpload, meta: { title: '上传标准规范' } },
  { path: '/audit-standard/precheck', component: AuditStandardPrecheck, meta: { title: '审计规范生成前预检' } },
  { path: '/audit-standard/draft', component: AuditStandardDraft, meta: { title: '审计规范草稿' } },
  { path: '/audit-standard/diff', component: AuditStandardDiff, meta: { title: '审计规范差异分析' } },
  { path: '/audit-standard/library', component: AuditStandardLibrary, meta: { title: '审计规范库' } },
  { path: '/audit-standard/policy', component: AuditStandardPolicy, meta: { title: '制度查询变更比对' } },
  { path: '/supervision/workbench', component: SupervisionWorkbench, meta: { title: '监督共享入口' } },
  { path: '/supervision/import/upload', component: SupervisionUpload, meta: { title: '监督共享文件导入' } },
  { path: '/supervision/import/folder-preview', component: SupervisionFolderPreview, meta: { title: '文件夹预览' } },
  { path: '/supervision/import/field-edit', component: SupervisionFieldEdit, meta: { title: '三字段补全' } },
  { path: '/supervision/import/metadata', component: SupervisionMetadata, meta: { title: '元数据映射' } },
  { path: '/supervision/import/precheck', component: SupervisionPrecheck, meta: { title: '入库前预检' } },
  { path: '/supervision/report/source-select', component: SupervisionReportSourceSelect, meta: { title: '监督共享报告来源选择' } },
  { path: '/supervision/report/draft', component: SupervisionReportDraft, meta: { title: '监督共享报告草稿' } },
  { path: '/expense/workbench', component: ExpenseWorkbench, meta: { title: '费用审计入口' } },
  { path: '/expense/usage/new', component: ExpenseUsageNew, meta: { title: '新建费用综合分析' } },
  { path: '/expense/usage/dashboard', component: ExpenseUsageDashboard, meta: { title: '费用综合分析看板' } },
  { path: '/expense/usage/drilldown', component: ExpenseUsageDrilldown, meta: { title: '费用综合分析下钻' } },
  { path: '/expense/usage/report', component: ExpenseUsageReport, meta: { title: '费用综合分析报告' } },
  { path: '/expense/anomaly/dashboard', component: ExpenseAnomalyDashboard, meta: { title: '费用异常审计看板' } },
  { path: '/expense/anomaly/candidates', component: ExpenseCandidates, meta: { title: '候选异常清单' } },
  { path: '/audit-report/workbench', component: AuditReportWorkbench, meta: { title: '审计报告入口' } },
  { path: '/audit-report/template', component: AuditReportTemplate, meta: { title: '报告模板管理' } },
  { path: '/audit-report/template-upload', component: AuditReportTemplateUpload, meta: { title: '上传报告模板' } },
  { path: '/audit-report/template-diff', component: AuditReportTemplateDiff, meta: { title: '模板差异识别' } },
  { path: '/audit-report/source-select', component: AuditReportSourceSelect, meta: { title: '报告来源选择' } },
  { path: '/audit-report/gap-list', component: AuditReportGapList, meta: { title: '资料缺口清单' } },
  { path: '/audit-report/material/import', component: AuditReportMaterialImport, meta: { title: '审计报告资料导入' } },
  { path: '/audit-report/material/folder-preview', component: AuditReportMaterialFolderPreview, meta: { title: '报告资料文件夹预览' } },
  { path: '/audit-report/material/field-edit', component: AuditReportMaterialFieldEdit, meta: { title: '报告资料三字段补全' } },
  { path: '/audit-report/material/metadata', component: AuditReportMaterialMetadata, meta: { title: '报告资料元数据映射' } },
  { path: '/audit-report/material/precheck', component: AuditReportMaterialPrecheck, meta: { title: '报告资料入库预检' } },
  { path: '/audit-report/material/supplement-preview', component: AuditReportSupplementPreview, meta: { title: '报告补充资料预览' } },
  { path: '/audit-report/draft', component: AuditReportDraft, meta: { title: '报告草稿工作区' } },
  { path: '/audit-report/offline-upload', component: AuditReportOfflineUpload, meta: { title: '线下修改稿回传' } },
  { path: '/audit-report/diff', component: AuditReportDiff, meta: { title: '报告版本差异比对' } },
  { path: '/audit-report/check-upload', component: AuditReportCheckUpload, meta: { title: '报告检查上传' } },
  { path: '/audit-report/check-result', component: AuditReportCheckResult, meta: { title: '报告检查结果' } }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
