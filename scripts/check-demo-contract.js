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
  'src/views/tasks/TaskCreate.vue',
  'src/views/files/FileCenter.vue',
  'src/views/files/FileDetail.vue',
  'src/views/demo-guide/DemoGuide.vue',
  'src/views/audit-report/AuditReportWorkbench.vue',
  'src/views/audit-report/AuditReportCheckUpload.vue',
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
assert(layoutText.includes('/demo-guide'), '左侧菜单缺少演示指南入口 /demo-guide');
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
  '任务流程预览',
  '创建常规审计任务',
  '从文件中心导入资料',
  '体验知识库智能体',
  '查看系统配置',
  '新手引导',
  '系统初始化状态',
  '最近操作空态',
  'demoDataMode',
  'setDemoDataMode',
  '我的待办',
  '最近审计任务',
  '快捷入口',
  '任务进度概览',
  '风险提醒',
  '最近生成结果',
  '系统通知',
  '最近操作日志',
  '知识库问答',
  '制度比对',
  '费用异常监控',
  '报告生成'
]) {
  assert(workbenchText.includes(marker), `工作台红框复刻缺少：${marker}`);
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
  '选择能力',
  'ability-card',
  'ability-grid',
  'selectedIds',
  'toggleCapability',
  '制度查询',
  '制度变更',
  '制度比对',
  '监管案例舆情分析',
  '审计规范生成',
  '监督共享信息分析',
  '费用审计',
  '报告生成',
  '报告审核',
  '所需资料与输出结果',
  '当前选择能力',
  '保存草稿',
  '上一步',
  '下一步'
]) {
  assert(taskCreateText.includes(marker), `任务创建能力卡片页缺少：${marker}`);
}

assert(!taskCreateText.includes('DataTable'), '任务创建能力选择不得继续使用表格替代卡片');

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
assert(auditReportWorkbenchText.includes('/audit-report/material/import'), '审计报告资料导入入口必须指向审计报告专属资料导入链路');
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
