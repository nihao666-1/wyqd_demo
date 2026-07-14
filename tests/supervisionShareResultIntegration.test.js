import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const router = fs.readFileSync(new URL('../src/router/index.js', import.meta.url), 'utf8');
const layout = fs.readFileSync(new URL('../src/components/layout/AppLayout.vue', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/styles/layout.css', import.meta.url), 'utf8');
const taskDetail = fs.readFileSync(new URL('../src/views/tasks/TaskDetailGenerating.vue', import.meta.url), 'utf8');
const resultPageUrl = new URL('../src/views/supervision-result/SupervisionShareResult.vue', import.meta.url);
const resultPage = fs.existsSync(resultPageUrl) ? fs.readFileSync(resultPageUrl, 'utf8') : '';
const parsedResultPage = parse(resultPage, { filename: 'SupervisionShareResult.vue' });

test('监督共享结果页注册精确路由并编译完整父页', () => {
  assert.match(router, /import SupervisionShareResult from ['"]\.\.\/views\/supervision-result\/SupervisionShareResult\.vue['"]/);
  assert.match(router, /path:\s*['"]\/tasks\/detail\/supervision-share['"][^}]*component:\s*SupervisionShareResult[^}]*title:\s*['"]监督共享信息分析['"]/s);
  assert.deepEqual(parsedResultPage.errors, []);
  const script = compileScript(parsedResultPage.descriptor, { id: 'SupervisionShareResult.vue' });
  const template = compileTemplate({
    id: 'SupervisionShareResult.vue',
    filename: 'SupervisionShareResult.vue',
    source: parsedResultPage.descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings }
  });
  assert.deepEqual(template.errors, []);
});

test('监督共享能力查看结果跳转独立页面且其他能力仍打开抽屉', () => {
  assert.match(taskDetail, /if \(capability\.id === ['"]supervision-share['"]\)\s*{\s*router\.push\(\{\s*path:\s*['"]\/tasks\/detail\/supervision-share['"],\s*query:\s*\{\s*taskId:\s*snapshot\.task\.id\s*}\s*}\);\s*return;\s*}/s);
  assert.match(taskDetail, /return;\s*}\s*openDrawer\(['"]生成结果['"]/s);
});

test('结果路由仅启用专用壳并显示目标面包屑与通知角标', () => {
  assert.match(layout, /const isSupervisionShareResultRoute = computed\(\(\) => route\.path === ['"]\/tasks\/detail\/supervision-share['"]\)/);
  assert.match(layout, /['"]supervision-result-shell['"]:\s*isSupervisionShareResultRoute/);
  assert.match(layout, /v-else-if="isSupervisionShareResultRoute" class="task-breadcrumb"><span>任务中心<\/span><i>\/<\/i><span>上海分公司Q1常规审计任务<\/span><i>\/<\/i><strong>监督共享信息分析<\/strong><\/div>/);
  assert.match(layout, /class="global-data-mode"/);
  assert.match(layout, /!isEmptyMode \|\| isTaskDetailRoute" class="notice-dot"/);
  assert.match(layout, /v-else-if="isSupervisionShareResultRoute" class="notice-dot"/);
  assert.doesNotMatch(layout, /['"]task-detail-shell['"]:\s*isTaskDetailRoute\s*\|\|\s*isSupervisionShareResultRoute/);
  assert.doesNotMatch(layout, /['"]task-generating-shell['"]:\s*isGeneratingTaskDetail\s*\|\|\s*isSupervisionShareResultRoute/);
});

test('结果壳选中专项审计分析并提供基线尺寸与颜色', () => {
  assert.match(layout, /['"]manual-active['"]:\s*\([^}]*isSupervisionShareResultRoute[^}]*item\.path === ['"]\/regulatory\/workbench['"]/s);
  assert.match(layout, /:active-class="[^"]*isSupervisionShareResultRoute[^"]*\? 'route-active-disabled' : 'router-link-active'"/);
  assert.doesNotMatch(layout, /\(isSupervisionShareResultRoute && item\.path === ['"]\/tasks['"]\)/);
  assert.match(css, /\.supervision-result-shell \.sidebar\s*\{[^}]*width:\s*264px[^}]*flex:\s*0 0 264px[^}]*background:\s*#fff/s);
  assert.match(css, /\.supervision-result-shell \.brand\s*\{[^}]*min-height:\s*57px[^}]*background:\s*var\(--color-primary\)/s);
  assert.match(css, /\.supervision-result-shell \.topbar\s*\{[^}]*min-height:\s*58px[^}]*height:\s*58px/s);
  assert.match(css, /\.supervision-result-shell \.main-nav a\.manual-active\s*\{[^}]*color:\s*var\(--color-primary\)/s);
  assert.match(css, /\.supervision-result-shell \.main-nav a\.manual-active::before\s*\{[^}]*background:\s*var\(--color-primary\)/s);
});

test('结果页父容器落地目标图九个功能区并消费确定性状态与导出函数', () => {
  for (const fn of [
    'createSupervisionShareResultState',
    'filterResultRows',
    'updateResultFilter',
    'confirmSelectedFiles',
    'selectResultRow',
    'referenceResultRow',
    'restartExtraction',
    'markOutputGenerated',
    'saveSupervisionVersion',
    'setResultPage',
    'setResultPageSize'
  ]) {
    assert.match(resultPage, new RegExp(`\\b${fn}\\b`));
  }

  assert.match(resultPage, /createSupervisionExcelExport/);
  assert.match(resultPage, /createSupervisionWordExport/);
  assert.match(resultPage, /downloadSupervisionExport/);
  assert.match(resultPage, /data-supervision-result-page/);
  for (const region of [
    'task-meta',
    'source-filters',
    'extraction-progress',
    'tag-results',
    'report-outline',
    'source-detail',
    'outputs',
    'version-timeline'
  ]) {
    assert.match(resultPage, new RegExp(`data-result-region="${region}"`));
  }
  for (const requiredText of [
    
    '共享文件',
    '标签命中',
    '来源部门文件趋势',
    '标签主题分布',
    '高频关键词 TOP10',
    '共享文件与标签提取结果',
    '汇总分析报告框架',
    '输出结果与导出记录',
    '历史分析任务',
    '来源文件详情'
  ]) {
    assert.match(resultPage, new RegExp(requiredText));
  }
});

test('结果页父容器接通用户动作到状态转换、下载和页面交互', () => {
  for (const handler of [
    'updateFilter',
    'resetFilters',
    'openFilePicker',
    'confirmFiles',
    'closeFilePicker',
    'restartLabels',
    'selectRow',
    'viewSource',
    'referenceRow',
    'changePage',
    'changePageSize',
    'saveVersion',
    'exportExcel'
  ]) {
    assert.match(resultPage, new RegExp(`\\b${handler}\\b`));
  }

  assert.match(resultPage, /downloadSupervisionExport\(createSupervisionExcelExport\(state\.value\)\)/);
  assert.match(resultPage, /downloadSupervisionExport\(createSupervisionWordExport\(state\.value\)\)/);
  assert.match(resultPage, /referenceResultRow\(state\.value,\s*payload\.rowId,\s*payload\.sectionId\)/);
  assert.doesNotMatch(resultPage, /open-section|open-output|show-history/);
});

test('结果页表格数据始终按当前分页切片，不因无筛选而绕过分页', () => {
  assert.match(resultPage, /const visibleRows = computed\(\(\) => \{\s*const start = \(state\.value\.pagination\.page - 1\) \* state\.value\.pagination\.pageSize;\s*return filteredRows\.value\.slice\(start, start \+ state\.value\.pagination\.pageSize\);\s*}\);/s);
  assert.doesNotMatch(resultPage, /if \(!hasFilters\) return filteredRows\.value/);
});

test('结果页使用自适应网格、紧凑详情抽屉和卸载清理', () => {
  assert.match(resultPage, /const COMPACT_DETAIL_BREAKPOINT = 1320/);
  assert.match(resultPage, /window\.innerWidth <= COMPACT_DETAIL_BREAKPOINT/);
  assert.match(resultPage, /window\.addEventListener\('resize', updateCompactDetail\)/);
  assert.match(resultPage, /window\.removeEventListener\('resize', updateCompactDetail\)/);
  assert.match(resultPage, /window\.addEventListener\('keydown', handleGlobalKeydown\)/);
  assert.match(resultPage, /window\.removeEventListener\('keydown', handleGlobalKeydown\)/);
  assert.match(resultPage, /isCompactDetail/);
  assert.match(resultPage, /class="detail-overlay"/);
  assert.match(resultPage, /Escape/);
  assert.match(resultPage, /\.supervision-page\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(300px, 320px\)/s);
  assert.match(resultPage, /\.supervision-board\s*\{[^}]*grid-template-rows:\s*72px 92px minmax\(224px, \.9fr\) minmax\(314px, 1\.25fr\) minmax\(139px, \.7fr\)/s);
  assert.match(resultPage, /\.source-detail-card\s*\{[^}]*width:\s*100%[^}]*height:\s*100%/s);
  assert.match(resultPage, /@media \(max-width: 1679px\)[\s\S]*\.supervision-board\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/s);
  assert.doesNotMatch(`${resultPage}\n${css}`, /--supervision-result-(?:scale|compact-scale)|supervision-result-scaled|html\.supervision-result-compact/);
});
