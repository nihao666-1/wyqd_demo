import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

const componentDir = new URL('../src/views/supervision-result/', import.meta.url);

function componentSource(filename) {
  return readFileSync(new URL(filename, componentDir), 'utf8');
}

function compileComponent(filename) {
  const url = new URL(filename, componentDir);
  const source = readFileSync(url, 'utf8');
  const parsed = parse(source, { filename: url.pathname });
  assert.deepEqual(parsed.errors, []);

  const script = compileScript(parsed.descriptor, { id: url.pathname });
  const template = compileTemplate({
    id: url.pathname,
    filename: url.pathname,
    source: parsed.descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings }
  });
  assert.deepEqual(template.errors, []);
}

test('header exposes task actions, metadata regions and the exact six-column contract', () => {
  const source = componentSource('SupervisionShareHeader.vue');

  assert.match(source, /defineProps\([^)]*task[^)]*extraction[^)]*\)/s);
  for (const event of ['back', 'restart', 'generate-report', 'export-excel']) {
    assert.match(source, new RegExp(`['"]${event}['"]`));
  }
  assert.match(source, /data-result-region="result-header"/);
  assert.match(source, /data-result-region="task-meta"/);
  assert.match(source, /监督共享信息分析/);

  for (const action of ['返回任务', '重新提取', '生成报告', '导出Excel']) {
    assert.match(source, new RegExp(action));
  }
  assert.ok(
    ['返回任务', '重新提取', '生成报告', '导出Excel']
      .map((action) => source.indexOf(action))
      .every((position, index, positions) => index === 0 || position > positions[index - 1]),
    'header actions should remain in the required order'
  );

  for (const label of ['被分析单位', '分析期间', '来源部门', '任务状态', '创建时间', '创建人']) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /class="status-chip"/);
  assert.match(source, /extraction\.status/);
});

test('header binds each visible action to its matching emitted intent', () => {
  const source = componentSource('SupervisionShareHeader.vue');
  for (const [label, event] of [
    ['返回任务', 'back'],
    ['重新提取', 'restart'],
    ['生成报告', 'generate-report'],
    ['导出Excel', 'export-excel']
  ]) {
    assert.match(source, new RegExp(`<button[^>]*@click="\\$emit\\('${event}'\\)"[^>]*>${label}</button>`));
  }
});

test('header scoped styles preserve the measured title, action and metadata dimensions', () => {
  const source = componentSource('SupervisionShareHeader.vue');

  assert.match(source, /<style scoped>/);
  assert.match(source, /\.title-row\s*\{[^}]*height:\s*46px/s);
  assert.match(source, /\.title-row h1\s*\{[^}]*font-size:\s*22px/s);
  assert.match(source, /\.header-actions\s*\{[^}]*gap:\s*9px/s);
  assert.match(source, /\.header-action\s*\{[^}]*height:\s*32px[^}]*border-radius:\s*4px/s);
  assert.match(source, /\.task-meta\s*\{[^}]*height:\s*72px/s);
  assert.match(source, /\.task-meta\s*\{[^}]*width:\s*1043px/s);
  assert.match(source, /grid-template-columns:\s*147px 249px 230px 101px 173px 143px/);
  assert.match(source, /#c9000b/);
  assert.match(source, /#b90008/);
  assert.match(source, /#f08a00/);
});

test('filters expose labeled controls, source totals and all required user intents', () => {
  const source = componentSource('SupervisionSourceFilters.vue');

  for (const prop of ['filters', 'departments', 'availableFiles', 'selectedFileIds', 'pickerOpen']) {
    assert.match(source, new RegExp(prop));
  }
  for (const event of [
    'update-filter', 'open-file-picker', 'confirm-files', 'close-file-picker', 'restart', 'show-selected'
  ]) {
    assert.match(source, new RegExp(`['"]${event}['"]`));
  }
  assert.match(source, /data-result-region="source-filters"/);
  assert.match(source, /来源选择与标签条件/);

  for (const label of ['来源部门', '文件类型', '数据标签', '关键词', '时间范围']) {
    assert.match(source, new RegExp(label));
  }
  for (const [label, control, controlId] of [
    ['来源部门', 'select', 'source-department'],
    ['文件类型', 'select', 'file-type'],
    ['数据标签', 'select', 'data-label'],
    ['关键词', 'input', 'keyword'],
    ['时间范围', 'input', 'start-date']
  ]) {
    assert.match(source, new RegExp(`<label[^>]*for="${controlId}"[^>]*>${label}</label>`));
    assert.match(source, new RegExp(`<${control}[^>]*id="${controlId}"`));
  }
  assert.match(source, /<label[^>]*for="end-date"[^>]*>结束日期<\/label>/);
  assert.match(source, /<input[^>]*id="end-date"/);
  assert.match(source, /选择共享文件/);
  assert.match(source, /重新提取标签/);
  assert.match(source, /已选来源（共 18 份文件）/);
  for (const [name, count] of [['合规法务部', 8], ['风险管理部', 6], ['审计中心', 4]]) {
    assert.match(source, new RegExp(`name: ['"]${name}['"], count: ${count}`));
  }
  assert.match(source, /查看已选文件/);
  assert.match(source, /#0b9b50/);
});

test('filters bind every control and action to the intended existing state key or event', () => {
  const source = componentSource('SupervisionSourceFilters.vue');

  for (const [controlId, key] of [
    ['source-department', 'department'],
    ['file-type', 'fileType'],
    ['data-label', 'dataTag'],
    ['keyword', 'keyword'],
    ['start-date', 'startDate'],
    ['end-date', 'endDate']
  ]) {
    assert.match(source, new RegExp(`id="${controlId}"[^>]*@(?:change|input)="updateFilter\\('${key}', \\$event\\)"`, 's'));
  }

  assert.match(source, /<button[^>]*@click="emit\('open-file-picker'\)"[^>]*>选择共享文件<\/button>/);
  assert.match(source, /<button[^>]*@click="emit\('restart'\)"[^>]*>重新提取标签<\/button>/);
  assert.match(source, /<button[^>]*@click="emit\('show-selected'\)"[^>]*>查看已选文件<\/button>/);
  assert.match(source, /<button[^>]*aria-label="关闭文件选择"[^>]*@click="emit\('close-file-picker'\)"[^>]*>×<\/button>/);
  assert.match(source, /<button[^>]*@click="emit\('close-file-picker'\)"[^>]*>取消<\/button>/);
  assert.match(source, /<button[^>]*@click="confirmSelection"[^>]*>确认选择<\/button>/);
  assert.match(source, /const tagSelectRef = ref\(null\)/);
  assert.match(source, /tagSelectRef\.value\?\.focus\(\)/);
  assert.match(source, /<select[^>]*id="data-label"[^>]*ref="tagSelectRef"/);
  assert.match(source, /<button[^>]*class="filter-icon"[^>]*aria-label="聚焦数据标签筛选"[^>]*@click="focusTagSelect"[^>]*>/);
  assert.match(source, /<option value="整改跟踪">整改跟踪<\/option>/);
  assert.doesNotMatch(source, /<option value="问题整改">问题整改<\/option>/);
});

test('file picker is a semantic conditional dialog with prop-safe draft selection', () => {
  const source = componentSource('SupervisionSourceFilters.vue');

  assert.match(source, /v-if="pickerOpen"[^>]*role="dialog"/s);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby="file-picker-title"/);
  assert.match(source, /id="file-picker-title"[^>]*>选择共享文件</);
  assert.match(source, /v-for="file in availableFiles"/);
  assert.match(source, /type="checkbox"/);
  assert.match(source, /const draftSelection = ref\(\[\]\)/);
  assert.match(source, /watch\(\(\) => props\.pickerOpen/);
  assert.match(source, /draftSelection\.value = \[\.\.\.props\.selectedFileIds\]/);
  assert.match(source, /emit\(['"]confirm-files['"], \[\.\.\.draftSelection\.value\]\)/);
  assert.doesNotMatch(source, /props\.selectedFileIds\s*=/);
  assert.match(source, /aria-label="关闭文件选择"/);
  assert.match(source, />取消</);
  assert.match(source, />确认选择</);
});

test('filters scoped styles preserve the measured panel and control dimensions', () => {
  const source = componentSource('SupervisionSourceFilters.vue');

  assert.match(source, /<style scoped>/);
  assert.match(source, /\.source-filters\s*\{[^}]*width:\s*238px[^}]*min-height:\s*590px[^}]*border:\s*1px solid #dde3eb[^}]*border-radius:\s*4px[^}]*background:\s*#fff/s);
  assert.match(source, /\.filter-control\s*\{[^}]*height:\s*29px/s);
  assert.match(source, /\.wide-action\s*\{[^}]*width:\s*207px[^}]*height:\s*33px/s);
  assert.doesNotMatch(source, /border-radius:\s*(?:[5-9]|[1-9]\d+)px/);
  assert.doesNotMatch(source, /box-shadow:/);
});

test('Task3 header and filters compile as Vue SFCs', () => {
  compileComponent('SupervisionShareHeader.vue');
  compileComponent('SupervisionSourceFilters.vue');
});

test('extraction workspace exposes six accessible stages and deterministic real-time logs', () => {
  const source = componentSource('SupervisionExtractionWorkspace.vue');

  assert.match(source, /defineProps\([^)]*stages[^)]*logs[^)]*\)/s);
  assert.match(source, /defineEmits\(\[['"]show-all-logs['"]\]\)/);
  assert.match(source, /data-result-region="extraction-progress"/);
  assert.match(source, /<ol[^>]*class="progress-steps"/);
  for (const label of ['选择共享文件', '解析元数据', '提取文字内容', '标签归类', '生成汇总分析', '生成报告']) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /:aria-current="stage\.status === 'active' \? 'step' : undefined"/);
  assert.match(source, /执行日志（实时）/);
  assert.match(source, /<button[^>]*class="log-link"[^>]*@click="emit\('show-all-logs'\)"[^>]*>查看完整日志<\/button>/);
  assert.match(source, /v-for="\(log, index\) in logs"/);
  assert.match(source, /:key="`\$\{log\.id\}-\$\{index\}`"/);
  assert.match(source, /log\.time/);
  assert.match(source, /log\.message/);
  assert.match(source, /\.extraction-workspace\s*\{[^}]*width:\s*805px[^}]*height:\s*242px/s);
});

test('tag table exposes exact columns, row intents and reference payload', () => {
  const source = componentSource('SupervisionTagResultTable.vue');

  for (const prop of ['rows', 'page', 'pageSize', 'total', 'selectedRowId']) {
    assert.match(source, new RegExp(prop));
  }
  for (const event of ['select-row', 'view-source', 'reference-row', 'page-change', 'page-size-change']) {
    assert.match(source, new RegExp(`['"]${event}['"]`));
  }
  assert.match(source, /data-result-region="tag-results"/);
  assert.match(source, /标签提取结果（共\s*\{\{ total \}\}\s*条）/);
  for (const header of ['文件名称', '来源部门', '标签', '命中关键词', '摘要', '引用状态']) {
    assert.match(source, new RegExp(`<th[^>]*>${header}<\\/th>`));
  }
  assert.match(source, /v-for="tag in row\.tags"/);
  assert.match(source, /已引用\(\{\{ referencedCount\(row\) \}\}\)/);
  assert.match(source, /未引用/);
  assert.match(source, /@click\.stop="emit\('view-source', row\.id\)"[^>]*>查看原文<\/button>/);
  assert.match(source, /@click\.stop="referenceRow\(row\)"[^>]*>引用到报告<\/button>/);
  assert.match(source, /emit\('reference-row', \{ rowId: row\.id, sectionId: row\.defaultSectionId \}\)/);
  assert.match(source, /:aria-selected="row\.id === selectedRowId"/);
  assert.match(source, /@click="emit\('select-row', row\.id\)"/);
  assert.match(source, /tabindex="0"/);
  assert.match(source, /@keydown\.enter="emit\('select-row', row\.id\)"/);
  assert.match(source, /@keydown\.space\.prevent="emit\('select-row', row\.id\)"/);
  assert.match(source, /tr:focus-visible\s*\{/);
  assert.match(source, /const totalPages = computed\(\(\) => Math\.max\(1, Math\.ceil\(props\.total \/ props\.pageSize\)\)\)/);
  assert.match(source, /page >= totalPages/);
  assert.match(source, /:max="totalPages"/);
  assert.match(source, /:aria-current="pageNumber === page \? 'page' : undefined"/);
  assert.match(source, /const pageNumbers = computed/);
  assert.match(source, /totalPages\.value/);
  assert.match(source, /new Set/);
  assert.match(source, /pageNumber === 'ellipsis'/);
  assert.match(source, />…<\/span>/);
  assert.match(source, /<option :value="10">10条\/页<\/option>/);
  assert.match(source, /aria-label="跳转页码"/);
  assert.match(source, /\.tag-results\s*\{[^}]*width:\s*495px[^}]*height:\s*343px/s);
  assert.match(source, /table-layout:\s*fixed/);
});

test('report outline is display-only and renders the five required sections', () => {
  const source = componentSource('SupervisionReportOutline.vue');

  assert.match(source, /defineProps\([^)]*sections[^)]*\)/s);
  assert.doesNotMatch(source, /defineEmits|\$emit|\bemit\(/);
  assert.match(source, /data-result-region="report-outline"/);
  assert.match(source, /汇总分析框架/);
  for (const title of ['报告摘要', '问题发现及整改', '合规事项', '合规与风险管理情况', '附录（来源文件清单）']) {
    assert.match(source, new RegExp(title.replace(/[（）]/g, '\\$&')));
  }
  assert.match(source, /来源\s*\{\{ section\.sourceCount \}\}\s*份/);
  assert.match(source, /生成中 78%/);
  assert.match(source, /未开始/);
  assert.match(source, /aria-hidden="true"[^>]*>›<\/span>/);
  assert.match(source, /\.report-outline\s*\{[^}]*width:\s*310px[^}]*height:\s*343px/s);
});

test('Task4 workspace, table and outline compile as Vue SFCs', () => {
  compileComponent('SupervisionExtractionWorkspace.vue');
  compileComponent('SupervisionTagResultTable.vue');
  compileComponent('SupervisionReportOutline.vue');
});

test('source detail exposes the complete rail contract and fixed action footer', () => {
  const source = componentSource('SupervisionSourceDetail.vue');

  for (const prop of ['file', 'logs', 'open']) {
    assert.match(source, new RegExp(prop));
  }
  assert.match(source, /open:\s*\{[^}]*default:\s*true/s);
  for (const event of ['close', 'view-source', 'reference', 'save-version']) {
    assert.match(source, new RegExp(`['"]${event}['"]`));
  }
  assert.match(source, /data-result-region="source-detail"/);
  assert.match(source, /<aside\s+v-if="open"/s);
  assert.match(source, /:class="\{ 'is-open': open \}"/);
  assert.match(source, /aria-label="关闭来源文件详情"/);
  for (const title of ['来源文件详情', '基本信息', '原文摘要（节选）', '引用到报告章节', '操作日志（最近5条）']) {
    assert.match(source, new RegExp(title.replace(/[（）]/g, '\\$&')));
  }
  for (const label of ['文件名称', '来源部门', '上传时间', '数据归属周期', '标签', '可引用状态', '关联任务']) {
    assert.match(source, new RegExp(label));
  }
  for (const field of ['uploadedAt', 'ownershipPeriod', 'relatedTask', 'summaryPage', 'referenceChapter', 'referencePage', 'referenceStatus']) {
    assert.match(source, new RegExp(`file\\.${field}`));
  }
  assert.doesNotMatch(source, /file\.(?:date|period|taskName|referenceSection|referenced)\b/);
  for (const forbiddenFallback of ['2025Q1', '上海分公司Q1常规审计任务', '暂无摘要', '合规事项 \/ 关联交易专项核查', '审计管理员']) {
    assert.doesNotMatch(source, new RegExp(forbiddenFallback));
  }
  assert.match(source, /v-for="\(log, index\) in recentLogs"/);
  assert.match(source, /:key="`\$\{log\.id\}-\$\{index\}`"/);
  assert.match(source, /log\.time/);
  assert.match(source, /log\.action/);
  assert.match(source, /log\.operator/);
  assert.match(source, /emit\('view-source', file\.id\)/);
  assert.match(source, /emit\('reference', \{ rowId: file\.id, sectionId: file\.defaultSectionId \}\)/);
  assert.match(source, /emit\('save-version'\)/);
  assert.match(source, /\.source-detail\s*\{[^}]*width:\s*315px[^}]*display:\s*grid[^}]*grid-template-rows:\s*53px minmax\(0,\s*1fr\) auto/s);
  assert.match(source, /\.detail-body\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(source, /\.detail-footer button\s*\{[^}]*height:\s*(?:3[4-9]|[4-9]\d)px/s);
  assert.match(source, /\.detail-section p\s*\{[^}]*font-size:\s*(?:10|11)px/s);
});

test('output panel is display-only and renders the three compact output cards', () => {
  const source = componentSource('SupervisionOutputPanel.vue');

  assert.match(source, /defineProps\([^)]*outputs[^)]*\)/s);
  assert.doesNotMatch(source, /defineEmits|\$emit|\bemit\(/);
  assert.match(source, /data-result-region="outputs"/);
  assert.match(source, /输出结果（预览）/);
  for (const label of ['Excel汇总表', 'Word汇总分析报告', '附录明细']) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /v-for="\(card, index\) in outputCards"/);
  assert.match(source, /output\.name/);
  assert.match(source, /card\.name/);
  assert.match(source, /card\.size/);
  assert.match(source, /生成中\{\{ card\.progress \}\}%/);
  assert.match(source, /card\.status/);
  assert.match(source, /未生成/);
  assert.doesNotMatch(source, /生成中78%/);
  assert.match(source, /\.output-panel\s*\{[^}]*width:\s*453px[^}]*height:\s*176px/s);
  assert.match(source, /\.output-cards\s*\{[^}]*gap:\s*7px/s);
  assert.match(source, /\.output-card\s*\{[^}]*width:\s*133px[^}]*height:\s*115px[^}]*border-radius:\s*4px/s);
  assert.match(source, /\.filename\s*\{[^}]*font-size:\s*(?:10|11|12)px/s);
  assert.match(source, /small\s*\{[^}]*font-size:\s*(?:10|11|12)px/s);
  assert.match(source, /\.status\s*\{[^}]*font-size:\s*(?:10|11|12)px/s);
  assert.doesNotMatch(source, /box-shadow:/);
});

test('version timeline is display-only and keeps exactly the V0.1 to V1.1 lifecycle', () => {
  const source = componentSource('SupervisionVersionTimeline.vue');

  for (const prop of ['versions', 'currentVersion', 'autoSave', 'versionDirty']) {
    assert.match(source, new RegExp(prop));
  }
  assert.doesNotMatch(source, /defineEmits|\$emit|\bemit\(/);
  assert.match(source, /data-result-region="version-timeline"/);
  assert.match(source, /版本与过程记录/);
  assert.match(source, /v-for="version in timelineVersions"/);
  for (const version of ['V0.1', 'V0.5', 'V0.8', 'V0.9', 'V1.0', 'V1.1']) {
    assert.match(source, new RegExp(version.replace('.', '\\.')));
  }
  assert.doesNotMatch(source, /V1\.2/);
  assert.match(source, /completed/);
  assert.match(source, /active/);
  assert.match(source, /pending/);
  assert.match(source, /当前版本/);
  assert.match(source, /const currentVersionNode = computed/);
  assert.match(source, /currentVersionNode\.value\?\.saved/);
  assert.match(source, /currentVersionNode\.value\?\.status === 'saved'/);
  assert.match(source, /versionDirty/);
  assert.match(source, /未保存/);
  assert.match(source, /已保存/);
  assert.match(source, /自动保存：已开启/);
  assert.match(source, /查看版本记录/);
  assert.match(source, /\.version-timeline\s*\{[^}]*width:\s*575px[^}]*height:\s*169px/s);
  assert.match(source, /\.timeline-track::before\s*\{[^}]*z-index:\s*0/s);
  assert.match(source, /li small,\s*li time\s*\{[^}]*font-size:\s*(?:10|11|12)px/s);
  assert.match(source, /footer\s*\{[^}]*font-size:\s*(?:10|11|12)px/s);
});

test('Task5 detail, outputs and timeline compile as Vue SFCs', () => {
  compileComponent('SupervisionSourceDetail.vue');
  compileComponent('SupervisionOutputPanel.vue');
  compileComponent('SupervisionVersionTimeline.vue');
});
