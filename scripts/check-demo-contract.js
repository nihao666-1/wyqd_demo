import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const requiredFiles = [
  'src/router/index.js',
  'src/store/index.js',
  'src/mock/index.js',
  'src/views/workbench/WorkbenchHome.vue',
  'src/views/tasks/TaskList.vue',
  'src/views/tasks/TaskCenterEmptyState.vue',
  'src/views/tasks/TaskCreate.vue',
  'src/views/files/FileCenter.vue',
  'src/views/files/FileDetail.vue',
  'src/views/demo-guide/DemoGuide.vue',
  'src/views/audit-report/AuditReportWorkbench.vue',
  'src/views/audit-report/AuditReportCheckResult.vue',
  'src/domain/lifecycle/reportActionGuard.js',
  'src/domain/lifecycle/assetReferenceGuard.js'
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `缺少必要文件：${file}`);
}

const routerText = read('src/router/index.js');
const requiredRoutes = [
  '/workbench',
  '/tasks',
  '/tasks/create',
  '/tasks/detail',
  '/files',
  '/files/detail',
  '/config',
  '/records',
  '/demo-guide',
  '/regulatory/workbench',
  '/audit-standard/workbench',
  '/audit-standard/policy',
  '/supervision/import/upload',
  '/expense/usage/new',
  '/expense/anomaly/dashboard',
  '/audit-report/workbench',
  '/audit-report/source-select',
  '/audit-report/check-upload',
  '/audit-report/check-result'
];

for (const route of requiredRoutes) {
  assert(routerText.includes(route), `缺少 P0 路由：${route}`);
}

const layoutText = read('src/components/layout/AppLayout.vue');
assert(layoutText.includes('制度与规范'), '左侧菜单缺少合并后的制度与规范分组');
assert(layoutText.includes('showDemoControls') && layoutText.includes('import.meta.env.DEV'), '演示入口和演示数据开关应仅在开发或显式演示模式显示');
assert(!layoutText.includes('faBell') && !layoutText.includes('faCircleQuestion'), '顶部通知/帮助按钮应从全局导航移除');
const storeText = read('src/store/index.js');
for (const marker of ['demoDataMode', 'setDemoDataMode', 'resetDemoState']) {
  assert(storeText.includes(marker), `演示状态能力缺少：${marker}`);
}

const workbenchText = read('src/views/workbench/WorkbenchHome.vue');
for (const marker of [
  '欢迎使用审计大模型系统',
  '当前暂无审计任务',
  '进行中任务',
  '待确认异常',
  '待复核报告',
  '失败任务',
  '推荐开始方式',
  '创建常规审计任务',
  '从文件中心导入资料',
  '体验知识库智能体',
  '查看系统配置',
  '快速引导',
  '系统初始化状态',
  'demoDataMode',
  'setDemoDataMode',
  '我的待办',
  '最近审计任务',
  '风险提醒',
  '最近生成结果',
  '知识库问答',
  '制度比对',
  '费用异常监控',
  '报告生成'
]) {
  assert(workbenchText.includes(marker), `工作台红框复刻缺少：${marker}`);
}

for (const marker of [
  '<h3>任务流程预览</h3>',
  '<h3>新手引导</h3>',
  '<h3>最近操作空态</h3>',
  '<h3>快捷入口</h3>',
  '<h3>任务进度概览</h3>',
  '<h3>系统通知</h3>',
  '<h3>最近操作日志</h3>'
]) {
  assert(!workbenchText.includes(marker), `工作台页面内部应减负移除：${marker}`);
}

for (const route of [
  '/tasks/create',
  '/tasks',
  '/tasks/detail',
  '/regulatory/workbench',
  '/audit-standard/workbench',
  '/audit-standard/policy',
  '/files',
  '/expense/anomaly/dashboard',
  '/audit-report/source-select'
]) {
  assert(workbenchText.includes(route), `工作台入口缺少跳转：${route}`);
}

const taskCreateText = read('src/views/tasks/TaskCreate.vue');
for (const marker of [
  'data-page="task-create"',
  'data-step="basic-info"',
  '基础信息',
  '任务说明',
  '后续步骤影响',
  '预计所需资料',
  'data-step="material-selection"',
  '所需资料清单',
  '资料完成度',
  'materials-workspace',
  'materialRows',
  'materialProgress',
  'simulateFillMaterials',
  '审计口径与数据范围',
  '数据范围（可多选）',
  '风险等级',
  '当前步骤',
  '默认输出模板',
  'validateTaskCreateForm',
  '@media (max-width:899px)',
  '选择能力',
  'ability-card',
  'ability-grid',
  'selectedIds',
  'selectCapability',
  'role="radiogroup"',
  'role="radio"',
  '制度查询',
  '制度变更',
  '制度比对',
  '监管案例舆情分析',
  '审计规范生成',
  '监督共享信息分析',
  '费用审计',
  '报告生成',
  '保存草稿',
  '上一步',
  '下一步'
]) {
  assert(taskCreateText.includes(marker), `任务创建页面缺少：${marker}`);
}

assert(!taskCreateText.includes('DataTable'), '任务创建能力选择不得继续使用表格替代卡片');

const taskListText = read('src/views/tasks/TaskList.vue');
for (const marker of [
  'task-center-page',
  'demoDataMode',
  '全部任务',
  '执行中',
  '待确认',
  '已归档',
  '失败/异常',
  '导入模拟任务',
  'paginateTaskRows',
  '全部任务',
  '创建审计任务'
]) {
  assert(taskListText.includes(marker), `任务中心红框复刻缺少：${marker}`);
}

for (const marker of ['今日待办与提醒', '失败任务', '最近操作日志', '快捷入口', 'task-rail']) {
  assert(!taskListText.includes(marker), `任务中心重复右栏应移除：${marker}`);
}

const taskEmptyText = read('src/views/tasks/TaskCenterEmptyState.vue');
for (const marker of [
  '任务中心',
  '任务名称',
  '被审计单位',
  '审计期间',
  '任务类型',
  '任务状态',
  '负责人',
  '全部任务',
  '草稿',
  '待解析',
  '生成中',
  '待确认',
  '已完成',
  '任务列表',
  '暂无审计任务',
  '推荐演示路径',
  '任务状态说明',
  "setDemoDataMode('data')",
  'auditPersonnel',
  'organizations'
]) {
  assert(taskEmptyText.includes(marker), `任务中心无数据态缺少：${marker}`);
}

for (const marker of [
  '任务说明',
  'watch(() => form.taskType',
  '基础信息',
  '保存草稿'
]) {
  assert(taskCreateText.includes(marker), `任务创建基础信息缺少：${marker}`);
}

const fileCenterText = read('src/views/files/FileCenter.vue');
for (const marker of [
  '文件中心',
  '文件库为空',
  '上传文件',
  '上传文件夹',
  '从任务导入',
  '文件接入流程',
  '支持格式',
  'isEmptyMode',
  'demoDataMode',
  'file-empty'
]) {
  assert(fileCenterText.includes(marker), `文件中心空状态缺少：${marker}`);
}

for (const forbidden of ['门禁', '办理门禁', '资料门禁', '能力门禁', '门禁校验']) {
  const offenders = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(full);
      if (entry.isFile() && /\.(vue|js|css)$/.test(entry.name)) {
        const text = fs.readFileSync(full, 'utf8');
        if (text.includes(forbidden)) offenders.push(path.relative(src, full).replaceAll('\\', '/'));
      }
    }
  }
  scan(src);
  assert(offenders.length === 0, `客户可见术语不得出现“${forbidden}”：${offenders.join(', ')}`);
}

const auditReportWorkbenchText = read('src/views/audit-report/AuditReportWorkbench.vue');
assert(auditReportWorkbenchText.includes('/materials/import?scene=audit-report'), '审计报告资料导入入口必须指向合并后的资料导入工作区并带审计报告场景');
assert(!auditReportWorkbenchText.includes('/supervision/import/upload'), '审计报告资料导入入口不得跳转监督共享文件导入');

const reportCheckFiles = [];
function walkVue(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkVue(full);
    if (entry.isFile() && entry.name.endsWith('.vue')) {
      const text = fs.readFileSync(full, 'utf8');
      if (text.includes('报告检查')) reportCheckFiles.push(path.relative(src, full).replaceAll('\\', '/'));
    }
  }
}
walkVue(src);
const invalidReportCheck = reportCheckFiles.filter((file) => !file.startsWith('views/audit-report/'));
assert(invalidReportCheck.length === 0, `报告检查出现在非审计报告模块：${invalidReportCheck.join(', ')}`);

const result = {
  checkedAt: new Date().toISOString(),
  requiredFiles: requiredFiles.length,
  requiredRoutes: requiredRoutes.length,
  reportCheckFiles,
  failures
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
