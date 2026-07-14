<template>
  <div class="supervision-page" data-supervision-result-page>
    <main class="supervision-board" aria-label="监督共享信息分析结果">
      <section class="filter-panel" data-result-region="source-filters">
        
        <div class="filter-grid">
          <label class="filter-field">
            <span>被分析单位</span>
            <select :value="state.filters.organization || state.task.organization" @change="updateFilter({ key: 'organization', value: $event.target.value })">
              <option>上海分公司</option>
              <option>北京分公司</option>
            </select>
          </label>
          <label class="filter-field filter-period">
            <span>分析期间</span>
            <select :value="state.task.period" @change="liveMessage = '分析期间已更新。'">
              <option>2025Q1（2025-01-01 ~ 2025-03-31）</option>
            </select>
          </label>
          <label class="filter-field">
            <span>来源部门</span>
            <select :value="state.filters.department" @change="updateFilter({ key: 'department', value: $event.target.value })">
              <option value="">全部</option>
              <option>合规法务部</option>
              <option>风险管理部</option>
              <option>审计中心</option>
            </select>
          </label>
          <label class="filter-field">
            <span>文件类型</span>
            <select :value="state.filters.fileType" @change="updateFilter({ key: 'fileType', value: $event.target.value })">
              <option value="">全部</option>
              <option value="Excel">Excel</option>
              <option value="Word">Word</option>
              <option value="PDF">PDF</option>
              <option value="Archive">压缩包</option>
            </select>
          </label>
          <label class="filter-field">
            <span>数据标签</span>
            <select :value="state.filters.dataTag" @change="updateFilter({ key: 'dataTag', value: $event.target.value })">
              <option value="">请选择数据标签</option>
              <option value="整改跟踪">整改跟踪</option>
              <option value="风险预警">风险预警</option>
              <option value="关联交易">关联交易</option>
            </select>
          </label>
          <label class="filter-field">
            <span>关键词</span>
            <input aria-label="关键词" :value="state.filters.keyword" placeholder="请输入关键词" @input="updateFilter({ key: 'keyword', value: $event.target.value })" />
          </label>
          <div class="filter-actions">
            <button class="primary" type="button" @click="liveMessage = '已按条件查询。'">查询</button>
            <button type="button" @click="resetFilters">重置</button>
          </div>
        </div>
      </section>

      <section class="metric-strip" data-result-region="task-meta" aria-label="指标汇总">
        <article v-for="metric in metrics" :key="metric.label" class="metric-card">
          <span class="metric-icon" :class="metric.tone" aria-hidden="true"><FontAwesomeIcon :icon="metric.icon" /></span>
          <div>
            <span class="metric-label">{{ metric.label }}</span>
            <p><strong>{{ metric.value }}</strong><small>{{ metric.unit }}</small></p>
            <em>较昨日 +{{ metric.delta }} {{ metric.unit }}</em>
          </div>
        </article>
      </section>

      <section class="chart-grid" data-result-region="extraction-progress">
        <article class="chart-card trend-card">
          <header>
            <h2>来源部门文件趋势</h2>
            <small>近6期</small>
          </header>
          <div class="legend">
            <span><i class="blue"></i>合规法务</span>
            <span><i class="green"></i>风险管理</span>
            <span><i class="orange"></i>审计中心</span>
          </div>
          <div class="bar-chart" aria-label="来源部门文件趋势堆叠柱状图">
            <div class="y-axis"><span>150</span><span>120</span><span>90</span><span>60</span><span>30</span><span>0</span></div>
            <div v-for="bar in trendBars" :key="bar.label" class="stack-bar">
              <div class="bar-stack">
                <span class="seg blue" :style="{ height: `${bar.legal}px` }"></span>
                <span class="seg green" :style="{ height: `${bar.risk}px` }"></span>
                <span class="seg orange" :style="{ height: `${bar.audit}px` }"></span>
              </div>
              <small>{{ bar.label }}</small>
            </div>
            <div class="chart-tooltip">
              <strong>2025Q1</strong>
              <span>合规法务：68份</span>
              <span>风险管理：56份</span>
              <span>审计中心：72份</span>
              <b>合计：196份</b>
            </div>
          </div>
        </article>

        <article class="chart-card donut-card">
          <header>
            <h2>标签主题分布</h2>
            <small>命中条数</small>
          </header>
          <div class="donut-layout">
            <div class="donut" aria-label="标签主题分布环形图">
              <span>合计<strong>1,268条</strong></span>
            </div>
            <ul>
              <li v-for="item in tagTopics" :key="item.name">
                <i :class="item.tone"></i>
                <span>{{ item.name }}</span>
                <b>{{ item.percent }}</b>
                <em>({{ item.count }}条)</em>
              </li>
            </ul>
          </div>
        </article>

        <article class="chart-card keyword-card">
          <header>
            <h2>高频关键词 TOP10</h2>
            <small>命中次数</small>
          </header>
          <div class="keyword-bars" aria-label="高频关键词横向条形图">
            <div v-for="item in keywordTop" :key="item.name" class="keyword-row">
              <span>{{ item.name }}</span>
              <div><i :style="{ width: `${item.width}%` }"></i></div>
              <b>{{ item.value }}</b>
            </div>
            <small>单位：次</small>
          </div>
        </article>
      </section>

      <section class="result-table-panel" data-result-region="tag-results">
        <header>
          <h2>共享文件与标签提取结果</h2>
          <div class="table-tools">
            <button type="button">筛选</button>
            <button type="button" @click="exportExcel">导出</button>
            <button type="button" aria-label="设置">⚙</button>
          </div>
        </header>
        <nav class="result-tabs" aria-label="标签分类">
          <button v-for="tab in resultTabs" :key="tab.label" :class="{ active: tab.active }" type="button">{{ tab.label }}（{{ tab.count }}）</button>
        </nav>
        <div class="dense-table-wrap">
          <table class="dense-table">
            <thead>
              <tr>
                <th>文件编号</th>
                <th>文件名称</th>
                <th>来源部门</th>
                <th>数据归属周期</th>
                <th>命中标签</th>
                <th>关键词</th>
                <th>摘要</th>
                <th>引用状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in visibleRows"
                :key="row.id"
                :class="{ selected: row.id === state.selectedRowId }"
                tabindex="0"
                @click="selectRow(row.id)"
                @keydown.enter="selectRow(row.id)"
              >
                <td>{{ row.code }}</td>
                <td><span class="ellipsis">{{ row.filename }}</span></td>
                <td>{{ row.department }}</td>
                <td>{{ row.ownershipPeriod }}</td>
                <td><span v-for="tag in row.tags.slice(0, 2)" :key="tag" class="tag-pill" :class="tagTone(tag)">{{ tag }}</span></td>
                <td><span class="ellipsis">{{ row.keywords.join('、') }}</span></td>
                <td><span class="ellipsis">{{ row.summary }}</span></td>
                <td><span :class="row.referenced ? 'status-used' : 'status-empty'">{{ row.referenceStatus }}</span></td>
                <td class="row-links">
                  <button type="button" @click.stop="viewSource(row.id)">查看原文</button>
                  <button type="button" @click.stop="referenceRow({ rowId: row.id, sectionId: row.defaultSectionId })">引用到报告</button>
                  <button type="button" @click.stop="restartLabels">重新提取</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer class="pager">
          <span>共 {{ state.resultTotal }} 条</span>
          <button type="button" :disabled="state.pagination.page <= 1" @click="changePage(state.pagination.page - 1)">‹</button>
          <button v-for="page in [1, 2, 3, 4, 5]" :key="page" type="button" :class="{ active: page === state.pagination.page }" @click="changePage(page)">{{ page }}</button>
          <span>…</span>
          <button type="button" @click="changePage(39)">39</button>
          <button type="button" @click="changePage(state.pagination.page + 1)">›</button>
          <select :value="state.pagination.pageSize" aria-label="每页条数" @change="changePageSize($event.target.value)">
            <option :value="10">10条/页</option>
            <option :value="20">20条/页</option>
          </select>
          <label>跳至 <input aria-label="跳转页码" type="number" min="1" @change="changePage($event.target.value)" /> 页</label>
        </footer>
      </section>

      <section class="report-framework" data-result-region="report-outline">
        <h2>汇总分析报告框架</h2>
        <article v-for="section in reportSections" :key="section.id" class="chapter-card">
          <span class="chapter-icon" :class="section.tone" aria-hidden="true"><FontAwesomeIcon :icon="section.icon" /></span>
          <div>
            <strong>{{ section.name }}</strong>
            <small>来源 {{ section.sourceCount }} 份</small>
          </div>
          <em>已完成 {{ section.progress }}%</em>
          <button type="button">查看章节</button>
        </article>
      </section>

      <section class="exports-panel" data-result-region="outputs">
        <h2>输出结果与导出记录</h2>
        <div>
          <article v-for="file in exportFiles" :key="file.name" class="export-card">
            <span :class="file.tone" aria-hidden="true"><FontAwesomeIcon :icon="file.icon" /></span>
            <strong>{{ file.name }}</strong>
            <small>{{ file.type }}</small>
            <small>{{ file.size }}</small>
            <time>{{ file.time }}</time>
            <em>{{ file.owner }}</em>
          </article>
        </div>
      </section>

      <section class="history-panel" data-result-region="version-timeline">
        <h2>历史分析任务</h2>
        <table>
          <thead>
            <tr>
              <th>任务名称</th>
              <th>被分析单位</th>
              <th>分析期间</th>
              <th>状态</th>
              <th>生成数量</th>
              <th>创建人</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in historyTasks" :key="task.name">
              <td>{{ task.name }}</td>
              <td>{{ task.unit }}</td>
              <td>{{ task.period }}</td>
              <td><span>已完成</span></td>
              <td>{{ task.count }}</td>
              <td>{{ task.owner }}</td>
              <td>{{ task.time }}</td>
              <td><button type="button">查看</button></td>
            </tr>
          </tbody>
        </table>
        <a href="#" @click.prevent="liveMessage = '已展开更多历史任务。'">查看更多 ›</a>
      </section>
    </main>

    <aside v-if="!isCompactDetail" class="source-detail-panel" data-result-region="source-detail">
      <button class="new-analysis" type="button" @click="liveMessage = '已准备新建共享信息分析。'">新建共享信息分析</button>
      <section class="source-detail-card">
        <header>
          <h2>来源文件详情</h2>
          <button type="button" aria-label="关闭来源文件详情" @click="closeDetail">×</button>
        </header>
        <div class="detail-content">
          <section>
            <h3>基本信息</h3>
            <dl>
              <div><dt>文件名称</dt><dd>{{ selectedFileDetail.filename }}</dd></div>
              <div><dt>来源部门</dt><dd>{{ selectedFileDetail.department }}</dd></div>
              <div><dt>上传时间</dt><dd>{{ selectedFileDetail.uploadedAt }}</dd></div>
              <div><dt>数据归属周期</dt><dd>{{ selectedFileDetail.ownershipPeriod }}</dd></div>
              <div><dt>标签</dt><dd><span v-for="tag in selectedFileDetail.tags" :key="tag" class="detail-tag" :class="tagTone(tag)">{{ tag }}</span></dd></div>
              <div><dt>可引用状态</dt><dd>{{ selectedFileDetail.referenceStatus }}（1次）</dd></div>
              <div><dt>关联任务</dt><dd>{{ selectedFileDetail.relatedTask }}</dd></div>
              <div><dt>文件大小</dt><dd>1.24 MB</dd></div>
            </dl>
          </section>
          <section>
            <h3>原文摘录（节选）</h3>
            <p>{{ selectedFileDetail.summary }}，涉及金额合计 28,650.00 元，建议加强费用报销流程管控与票据审核。</p>
            <button class="text-link" type="button" @click="viewSource(selectedFileDetail.id)">展开全文⌄</button>
          </section>
          <section>
            <h3>引用章节</h3>
            <ul class="chapter-list">
              <li>报告生成</li>
              <li>第二章 审计发现的主要问题 / 2.3 费用管理方面问题 <button type="button">查看</button></li>
            </ul>
          </section>
          <section>
            <h3>操作日志（近4条）</h3>
            <table class="detail-log">
              <tbody>
                <tr v-for="log in detailLogs" :key="log.time + log.action">
                  <td>{{ log.time }}</td>
                  <td>{{ log.operator }}</td>
                  <td>{{ log.action }}</td>
                  <td>成功</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
        <footer>
          <button type="button" @click="viewSource(selectedFileDetail.id)">查看原文</button>
          <button type="button" @click="referenceRow({ rowId: selectedFileDetail.id, sectionId: selectedFileDetail.defaultSectionId })">引用到报告</button>
          <button class="primary" type="button" @click="saveVersion">保存版本</button>
        </footer>
      </section>
    </aside>

    <div v-if="isCompactDetail && detailOpen" class="detail-overlay" role="presentation">
      <button class="detail-backdrop" type="button" aria-label="关闭来源文件详情" @click="closeDetail"></button>
      <aside class="source-detail-panel compact" data-result-region="source-detail">
        <section class="source-detail-card">
          <header>
            <h2>来源文件详情</h2>
            <button type="button" aria-label="关闭来源文件详情" @click="closeDetail">×</button>
          </header>
          <div class="detail-content">
            <section>
              <h3>基本信息</h3>
              <dl>
                <div><dt>文件名称</dt><dd>{{ selectedFileDetail.filename }}</dd></div>
                <div><dt>来源部门</dt><dd>{{ selectedFileDetail.department }}</dd></div>
                <div><dt>标签</dt><dd>{{ selectedFileDetail.tags?.join('、') }}</dd></div>
              </dl>
            </section>
            <section>
              <h3>原文摘录（节选）</h3>
              <p>{{ selectedFileDetail.summary }}</p>
            </section>
          </div>
          <footer>
            <button type="button" @click="viewSource(selectedFileDetail.id)">查看原文</button>
            <button type="button" @click="referenceRow({ rowId: selectedFileDetail.id, sectionId: selectedFileDetail.defaultSectionId })">引用到报告</button>
            <button class="primary" type="button" @click="saveVersion">保存版本</button>
          </footer>
        </section>
      </aside>
    </div>

    <div v-if="pickerOpen" class="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="file-picker-title">
      <section class="file-picker">
        <header>
          <h3 id="file-picker-title">选择共享文件</h3>
          <button type="button" aria-label="关闭文件选择" @click="closeFilePicker">×</button>
        </header>
        <div class="file-options">
          <label v-for="file in state.selectedFiles" :key="file.id">
            <input v-model="draftSelection" type="checkbox" :value="file.id" />
            <span>{{ file.name }}</span>
          </label>
        </div>
        <footer>
          <button type="button" @click="closeFilePicker">取消</button>
          <button class="primary" type="button" @click="confirmFiles(draftSelection)">确认选择</button>
        </footer>
      </section>
    </div>

    <p class="supervision-live" aria-live="polite">{{ liveMessage }}</p>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faChartSimple,
  faClipboardCheck,
  faFileExcel,
  faFileLines,
  faFileWord,
  faFileZipper,
  faFolderOpen,
  faListCheck,
  faPenToSquare,
  faShieldHalved,
  faTags,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import {
  createSupervisionExcelExport,
  createSupervisionWordExport,
  downloadSupervisionExport
} from './supervisionShareExports.js';
import {
  confirmSelectedFiles,
  createSupervisionShareResultState,
  filterResultRows,
  markOutputGenerated,
  referenceResultRow,
  restartExtraction,
  saveSupervisionVersion,
  selectResultRow,
  setResultPage,
  setResultPageSize,
  updateResultFilter
} from './supervisionShareResultData.js';

const COMPACT_DETAIL_BREAKPOINT = 1320;

const route = useRoute();
const router = useRouter();
const state = ref(enhanceState(createSupervisionShareResultState()));
const pickerOpen = ref(false);
const detailOpen = ref(true);
const isCompactDetail = ref(false);
const liveMessage = ref('');
const draftSelection = ref([]);
let lastTrigger = null;

const metrics = [
  { label: '共享文件', value: '384', unit: '份', delta: '28', icon: faFolderOpen, tone: 'blue' },
  { label: '标签命中', value: '1,268', unit: '条', delta: '96', icon: faTags, tone: 'green' },
  { label: '问题发现', value: '72', unit: '项', delta: '6', icon: faTriangleExclamation, tone: 'orange' },
  { label: '整改事项', value: '45', unit: '项', delta: '3', icon: faClipboardCheck, tone: 'red' },
  { label: '汇总报告', value: '16', unit: '份', delta: '2', icon: faChartSimple, tone: 'purple' }
];

const trendBars = [
  { label: '2024Q4', legal: 23, risk: 35, audit: 38 },
  { label: '2024Q1', legal: 31, risk: 43, audit: 54 },
  { label: '2024Q2', legal: 38, risk: 51, audit: 57 },
  { label: '2024Q3', legal: 30, risk: 46, audit: 44 },
  { label: '2024Q4', legal: 42, risk: 61, audit: 49 },
  { label: '2025Q1', legal: 54, risk: 45, audit: 68 }
];

const tagTopics = [
  { name: '监管关注', percent: '28.5%', count: 361, tone: 'blue' },
  { name: '问题整改', percent: '25.3%', count: 321, tone: 'green' },
  { name: '合规问责', percent: '18.6%', count: 236, tone: 'orange' },
  { name: '风险提示', percent: '16.7%', count: 212, tone: 'red' },
  { name: '法律诉讼', percent: '10.9%', count: 138, tone: 'purple' }
];

const keywordTop = [
  ['客户适当性', 186], ['反洗钱', 172], ['合规管理', 158], ['内控缺陷', 143], ['数据治理', 121],
  ['费用报销', 115], ['权限管理', 98], ['系统安全', 92], ['信息披露', 78], ['审计整改', 68]
].map(([name, value]) => ({ name, value, width: Math.round((value / 186) * 100) }));

const resultTabs = [
  { label: '全部文件', count: 384, active: true },
  { label: '合规事项', count: 126 },
  { label: '风险提示', count: 98 },
  { label: '问题整改', count: 96 },
  { label: '法律诉讼', count: 42 }
];

const reportSections = computed(() => [
  { id: 'summary', name: '报告摘要', icon: faFileLines, tone: 'blue', sourceCount: 384, progress: 100 },
  { id: 'findings', name: '问题发现及整改', icon: faPenToSquare, tone: 'red', sourceCount: 126, progress: 92 },
  { id: 'compliance', name: '合规事项', icon: faListCheck, tone: 'green', sourceCount: 98, progress: 88 },
  { id: 'risk', name: '合规与风险管理情况', icon: faShieldHalved, tone: 'orange', sourceCount: 74, progress: 85 },
  { id: 'appendix', name: '附录（来源文件清单）', icon: faFolderOpen, tone: 'purple', sourceCount: 384, progress: 100 }
]);

const exportFiles = [
  { name: '监督共享信息汇总表', type: 'Excel', size: '256KB', time: '2025-04-28 11:05', owner: '审计员A', icon: faFileExcel, tone: 'excel' },
  { name: '监督共享信息分析报告', type: 'Word', size: '1.25MB', time: '2025-04-28 11:08', owner: '审计员A', icon: faFileWord, tone: 'word' },
  { name: '附录明细表', type: 'Excel', size: '128KB', time: '2025-04-28 11:08', owner: '审计员A', icon: faFileExcel, tone: 'excel' },
  { name: '附件包（来源文件）', type: 'ZIP', size: '58.6MB', time: '2025-04-28 11:08', owner: '系统', icon: faFileZipper, tone: 'zip' }
];

const historyTasks = [
  { name: '上海分公司 Q1 监督共享分析', unit: '上海分公司', period: '2025Q1', count: 1, owner: '审计员A', time: '2025-04-28 11:10' },
  { name: '上海分公司 2024Q4 共享分析', unit: '上海分公司', period: '2024Q4', count: 1, owner: '审计员A', time: '2025-04-10 09:35' },
  { name: '上海分公司 Q3 监督共享分析', unit: '上海分公司', period: '2024Q3', count: 1, owner: '审计员A', time: '2024-11-15 14:22' }
];

const detailLogs = computed(() => [
  { time: '2025-03-10 14:22', operator: '审计员A', action: '引用到报告' },
  { time: '2025-03-10 11:05', operator: '审计员A', action: '查看原文' },
  { time: '2025-03-05 10:24', operator: '系统', action: '上传文件' },
  { time: '2025-03-05 10:26', operator: '系统', action: '解析完成' }
]);

const filteredRows = computed(() => filterResultRows(state.value));
const visibleRows = computed(() => {
  const start = (state.value.pagination.page - 1) * state.value.pagination.pageSize;
  return filteredRows.value.slice(start, start + state.value.pagination.pageSize);
});

const selectedFileDetail = computed(() => (
  state.value.resultRows.find((row) => row.id === state.value.selectedRowId)
  || state.value.resultRows[0]
  || {}
));

watch(pickerOpen, (isOpen) => {
  if (isOpen) draftSelection.value = [...state.value.selectedFileIds];
});

function enhanceState(nextState) {
  const resultRows = nextState.resultRows.map((row, index) => ({
    ...row,
    code: row.code || `SF-${20250301 + index}-${String(index + 1).padStart(4, '0')}`
  }));
  return { ...nextState, resultRows };
}

function setState(nextState) {
  if (nextState !== state.value) state.value = enhanceState(nextState);
}

function updateFilter(payload) {
  if (payload.key === 'organization') {
    liveMessage.value = '被分析单位已更新。';
    return;
  }
  setState(updateResultFilter(state.value, payload.key, payload.value));
  liveMessage.value = '筛选条件已更新。';
}

function resetFilters() {
  let nextState = state.value;
  for (const key of ['keyword', 'dataTag', 'department', 'fileType', 'startDate', 'endDate']) {
    nextState = updateResultFilter(nextState, key, '');
  }
  setState(nextState);
  liveMessage.value = '筛选条件已重置。';
}

function rememberTrigger() {
  lastTrigger = document.activeElement;
}

function restoreTriggerFocus() {
  nextTick(() => lastTrigger?.focus?.());
}

function openFilePicker() {
  rememberTrigger();
  pickerOpen.value = true;
}

function closeFilePicker() {
  pickerOpen.value = false;
  restoreTriggerFocus();
}

function confirmFiles(fileIds) {
  setState(confirmSelectedFiles(state.value, fileIds));
  pickerOpen.value = false;
  liveMessage.value = '共享文件选择已确认。';
  restoreTriggerFocus();
}

function restartLabels() {
  setState(restartExtraction(state.value));
  liveMessage.value = '标签提取已重新执行。';
}

function selectRow(rowId) {
  setState(selectResultRow(state.value, rowId));
}

function viewSource(rowId) {
  rememberTrigger();
  setState(selectResultRow(state.value, rowId));
  detailOpen.value = true;
  liveMessage.value = '已打开共享文件原文摘要。';
}

function referenceRow(payload) {
  setState(referenceResultRow(state.value, payload.rowId, payload.sectionId));
  detailOpen.value = true;
  liveMessage.value = '已引用到报告章节。';
}

function changePage(page) {
  setState(setResultPage(state.value, page));
}

function changePageSize(pageSize) {
  setState(setResultPageSize(state.value, pageSize));
}

function generateReport() {
  setState(markOutputGenerated(markOutputGenerated(state.value, 'word'), 'appendix'));
  downloadSupervisionExport(createSupervisionWordExport(state.value));
  liveMessage.value = 'Word汇总分析报告已生成。';
}

function exportExcel() {
  setState(markOutputGenerated(state.value, 'excel'));
  downloadSupervisionExport(createSupervisionExcelExport(state.value));
  liveMessage.value = 'Excel汇总表已导出。';
}

function closeDetail() {
  detailOpen.value = false;
  restoreTriggerFocus();
}

function saveVersion() {
  setState(saveSupervisionVersion(state.value));
  liveMessage.value = '当前版本已保存。';
}

function tagTone(tag) {
  if (tag.includes('风险') || tag.includes('高风险')) return 'risk';
  if (tag.includes('整改')) return 'fix';
  if (tag.includes('关联')) return 'relation';
  return 'default';
}

function updateCompactDetail() {
  const compact = window.innerWidth <= COMPACT_DETAIL_BREAKPOINT;
  isCompactDetail.value = compact;
  if (compact && !pickerOpen.value) detailOpen.value = false;
}

function handleGlobalKeydown(event) {
  if (event.key !== 'Escape') return;
  if (pickerOpen.value) {
    closeFilePicker();
    return;
  }
  if (isCompactDetail.value && detailOpen.value) closeDetail();
}

onMounted(() => {
  updateCompactDetail();
  window.addEventListener('resize', updateCompactDetail);
  window.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCompactDetail);
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style scoped>
.supervision-page {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 320px);
  gap: 12px;
  width: 100%;
  min-height: calc(var(--shell-viewport-height, 100vh) - 82px);
  margin: 0;
  color: #1f2937;
}

.supervision-board {
  display: grid;
  grid-template-rows: 72px 92px minmax(224px, .9fr) minmax(314px, 1.25fr) minmax(139px, .7fr);
  gap: 6px;
  min-width: 0;
  min-height: calc(var(--shell-viewport-height, 100vh) - 82px);
}

.filter-panel,
.metric-strip,
.chart-card,
.result-table-panel,
.report-framework,
.exports-panel,
.history-panel,
.source-detail-card {
  box-sizing: border-box;
  border: 1px solid #dfe5ee;
  border-radius: 4px;
  background: #fff;
}

.filter-panel {
  display: grid;
  align-items: center;
  padding: 4px 14px 8px;
}

.filter-head {
  height: 34px;
  display: flex;
  align-items: center;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  font-size: 22px;
  line-height: 28px;
}

h2 {
  font-size: 14px;
  line-height: 20px;
}

h3 {
  font-size: 13px;
}

.filter-grid {
  display: grid;
  grid-template-columns: minmax(100px, .9fr) minmax(160px, 1.6fr) repeat(2, minmax(100px, 1fr)) minmax(130px, 1.3fr) minmax(100px, 1fr) auto;
  align-items: center;
  gap: 14px;
}

.filter-field {
  display: grid;
  gap: 4px;
  min-width: 0;
  color: #111827;
  font-size: 12px;
  font-weight: 600;
}

.filter-field select,
.filter-field input {
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  border: 1px solid #d8dee8;
  border-radius: 4px;
  background: #fff;
  padding: 0 9px;
  color: #1f2937;
  font: inherit;
  font-size: 11px;
  font-weight: 400;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

button {
  font: inherit;
  cursor: pointer;
}

button:focus-visible,
select:focus-visible,
input:focus-visible,
tr:focus-visible {
  outline: 2px solid var(--color-info);
  outline-offset: 1px;
}

.filter-actions button,
.table-tools button {
  height: 32px;
  border: 1px solid #d8dee8;
  border-radius: 4px;
  background: #fff;
  padding: 0 14px;
  color: #374151;
  font-size: 12px;
}

.filter-actions .primary,
.file-picker .primary,
.source-detail-card footer .primary {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.metric-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  overflow: hidden;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 17px;
  min-width: 0;
  min-height: 0;
  padding: 0 20px;
  border-right: 1px solid #e6ebf2;
}

.metric-card:last-child {
  border-right: 0;
}

.metric-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 10px;
  font-size: 24px;
  font-weight: 700;
}

.metric-icon.blue { background: #eaf3ff; color: var(--color-info); }
.metric-icon.green { background: #eaf8ef; color: #16a05d; }
.metric-icon.orange { background: #fff4e4; color: #ff9800; }
.metric-icon.red { background: #fff0f0; color: #e3323a; }
.metric-icon.purple { background: #f3efff; color: #6f668f; }

.metric-label {
  font-size: 13px;
  font-weight: 600;
}

.metric-card p {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-top: 1px;
}

.metric-card strong {
  margin: 0;
  font-size: 23px;
  line-height: 24px;
}

.metric-card small,
.metric-card em {
  color: #4b5563;
  font-size: 12px;
  font-style: normal;
  line-height: 14px;
}

.metric-card em {
  display: block;
  margin-top: 1px;
}

.chart-grid {
  display: grid;
  grid-template-columns: 314px 335px 1fr;
  gap: 7px;
}

.chart-card {
  min-width: 0;
  padding: 11px 15px;
}

.chart-card header {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.chart-card header small {
  color: #6b7280;
  font-size: 11px;
}

.legend {
  display: flex;
  gap: 18px;
  margin-top: 11px;
  font-size: 11px;
}

.legend i,
.donut-layout li i {
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 6px;
  border-radius: 1px;
}

.blue { background: var(--color-info); }
.green { background: #20b56b; }
.orange { background: #ffa726; }
.red { background: var(--color-primary); }
.purple { background: #7c5cff; }

.bar-chart {
  position: relative;
  display: grid;
  grid-template-columns: 28px repeat(6, 1fr);
  align-items: end;
  height: 158px;
  margin-top: 5px;
  border-bottom: 1px solid #e6ebf2;
}

.y-axis {
  display: grid;
  align-self: stretch;
  color: #6b7280;
  font-size: 10px;
}

.stack-bar {
  display: grid;
  justify-items: center;
  align-items: end;
  height: 100%;
  color: #4b5563;
  font-size: 10px;
}

.bar-stack {
  display: flex;
  align-items: end;
  width: 21px;
  height: 126px;
}

.bar-stack .seg {
  display: block;
  width: 100%;
}

.seg.blue { background: var(--color-info); }
.seg.green { background: #20b56b; }
.seg.orange { background: #ffa726; }

.chart-tooltip {
  position: absolute;
  right: 0;
  bottom: 31px;
  display: grid;
  gap: 2px;
  width: 101px;
  padding: 10px;
  border-radius: 4px;
  background: rgb(17 24 39 / 88%);
  color: #fff;
  font-size: 11px;
  line-height: 16px;
}

.donut-layout {
  display: grid;
  grid-template-columns: 146px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  height: 174px;
}

.donut {
  display: grid;
  place-items: center;
  width: 136px;
  height: 136px;
  border-radius: 50%;
  background: conic-gradient(var(--color-info) 0 28.5%, #20b56b 28.5% 53.8%, #ffa726 53.8% 72.4%, var(--color-primary) 72.4% 89.1%, #7c5cff 89.1% 100%);
}

.donut::before {
  position: absolute;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: #fff;
  content: '';
}

.donut span {
  position: relative;
  display: grid;
  justify-items: center;
  font-size: 12px;
}

.donut strong {
  margin-top: 4px;
  font-size: 15px;
}

.donut-layout ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 11px;
}

.donut-layout li {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) 40px 48px;
  align-items: center;
}

.donut-layout b {
  font-weight: 500;
  text-align: right;
}

.donut-layout em {
  color: #4b5563;
  font-style: normal;
  text-align: right;
}

.keyword-bars {
  display: grid;
  gap: 6px;
  margin-top: 12px;
  font-size: 11px;
}

.keyword-row {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr) 30px;
  align-items: center;
  gap: 8px;
}

.keyword-row div {
  height: 2px;
  background: #e6ebf2;
}

.keyword-row i {
  display: block;
  height: 2px;
  background: #126bff;
}

.keyword-row b {
  font-weight: 500;
}

.keyword-bars > small {
  justify-self: end;
  color: #4b5563;
}

.result-table-panel {
  min-width: 0;
  overflow: hidden;
}

.result-table-panel header,
.report-framework h2,
.exports-panel h2,
.history-panel h2 {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 12px;
  border-bottom: 1px solid #e6ebf2;
}

.result-table-panel header {
  justify-content: space-between;
}

.table-tools {
  display: flex;
  gap: 6px;
}

.table-tools button {
  height: 28px;
  padding: 0 11px;
}

.result-tabs {
  display: flex;
  gap: 22px;
  height: 34px;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #edf0f4;
}

.result-tabs button {
  position: relative;
  height: 100%;
  border: 0;
  background: transparent;
  color: #5f6774;
  font-size: 11px;
}

.result-tabs .active {
  color: var(--color-primary);
  font-weight: 600;
}

.result-tabs .active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: var(--color-primary);
  content: '';
}

.dense-table-wrap {
  height: 205px;
  overflow: hidden;
}

.dense-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 9px;
}

.dense-table th {
  height: 30px;
  background: #f8fafc;
  color: #343b46;
  font-weight: 600;
}

.dense-table th,
.dense-table td {
  padding: 0 5px;
  border-bottom: 1px solid #edf0f4;
  text-align: left;
}

.dense-table td {
  height: 31px;
  color: #1f2937;
}

.dense-table tr.selected td {
  background: #fff8f8;
}

.dense-table th:nth-child(1) { width: 86px; }
.dense-table th:nth-child(2) { width: 115px; }
.dense-table th:nth-child(3) { width: 61px; }
.dense-table th:nth-child(4) { width: 72px; }
.dense-table th:nth-child(5) { width: 92px; }
.dense-table th:nth-child(6) { width: 81px; }
.dense-table th:nth-child(7) { width: 114px; }
.dense-table th:nth-child(8) { width: 58px; }
.dense-table th:nth-child(9) { width: 93px; }

.ellipsis {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-pill,
.detail-tag {
  display: inline-block;
  max-width: 56px;
  overflow: hidden;
  margin-right: 3px;
  padding: 1px 4px;
  border-radius: 3px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-pill.fix,
.detail-tag.fix {
  background: #eaf8ef;
  color: #079455;
}

.tag-pill.risk,
.detail-tag.risk {
  background: #fff0f0;
  color: var(--color-primary);
}

.tag-pill.relation,
.detail-tag.relation {
  background: #fff7e8;
  color: #e06f00;
}

.tag-pill.default,
.detail-tag.default {
  background: #eef5ff;
  color: var(--color-info);
}

.status-used { color: #079455; }
.status-empty { color: #6b7280; }

.row-links {
  white-space: nowrap;
}

.row-links button,
.history-panel button,
.chapter-list button,
.text-link {
  border: 0;
  background: transparent;
  color: var(--color-info);
  padding: 0 2px;
  font-size: 9px;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  height: 38px;
  padding: 0 10px;
  color: #5f6774;
  font-size: 10px;
}

.pager > span:first-child {
  margin-right: auto;
}

.pager button,
.pager select,
.pager input {
  box-sizing: border-box;
  height: 22px;
  min-width: 22px;
  border: 1px solid #d8dee8;
  border-radius: 3px;
  background: #fff;
  color: #1f2937;
  font: inherit;
}

.pager button.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pager select { width: 68px; }
.pager input { width: 32px; }

.report-framework {
  display: grid;
  grid-template-rows: 34px repeat(5, 52px);
  gap: 8px;
  padding-bottom: 10px;
}

.report-framework h2 {
  border-bottom: 0;
}

.chapter-card {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 72px 62px;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 52px;
  margin: 0 10px;
  padding: 0 8px;
  border: 1px solid #e1e7ef;
  border-radius: 6px;
}

.chapter-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}

.chapter-icon.blue { background: var(--color-info); }
.chapter-icon.red { background: var(--color-primary); }
.chapter-icon.green { background: #16a05d; }
.chapter-icon.orange { background: #ff9800; }
.chapter-icon.purple { background: #6f668f; }

.chapter-card strong {
  display: block;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-card small {
  color: #5f6774;
  font-size: 10px;
}

.chapter-card em {
  color: #079455;
  font-size: 10px;
  font-style: normal;
}

.chapter-card button {
  height: 26px;
  border: 1px solid #d8dee8;
  border-radius: 4px;
  background: #fff;
  color: #344054;
  font-size: 10px;
}

.exports-panel {
  grid-column: 1;
}

.exports-panel > div {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 10px 12px;
}

.export-card {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  grid-template-rows: 18px 16px 16px 16px;
  gap: 1px 8px;
  min-width: 0;
  height: 92px;
  padding: 9px;
  border: 1px solid #e1e7ef;
  border-radius: 6px;
}

.export-card span {
  display: grid;
  grid-row: 1 / 3;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: #fff;
  font-weight: 700;
}

.export-card .excel { background: #16a05d; }
.export-card .word { background: var(--color-info); }
.export-card .zip { background: #ff9800; }

.export-card strong,
.export-card small,
.export-card time,
.export-card em {
  overflow: hidden;
  font-size: 10px;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.export-card time,
.export-card em,
.export-card small {
  color: #5f6774;
  font-style: normal;
}

.history-panel {
  grid-column: 2;
  grid-row: 5;
  width: auto;
  margin-left: 0;
  min-width: 0;
}

.supervision-board {
  grid-template-columns: minmax(0, 2.4fr) minmax(302px, 1fr);
}

.filter-panel,
.metric-strip,
.chart-grid {
  grid-column: 1 / 3;
}

.result-table-panel {
  grid-column: 1;
}

.report-framework {
  grid-column: 2;
}

.exports-panel {
  grid-column: 1;
  grid-row: 5;
  width: auto;
}

.history-panel table {
  width: calc(100% - 18px);
  margin: 8px 9px 0;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 9px;
}

.history-panel th,
.history-panel td {
  height: 24px;
  overflow: hidden;
  border-bottom: 1px solid #edf0f4;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-panel th {
  color: #343b46;
  font-weight: 600;
}

.history-panel td span {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 3px;
  background: #eaf8ef;
  color: #079455;
}

.history-panel a {
  display: block;
  margin: 7px 13px 0 0;
  color: var(--color-info);
  font-size: 10px;
  text-align: right;
  text-decoration: none;
}

.source-detail-panel {
  position: relative;
  min-width: 0;
}

.new-analysis {
  position: absolute;
  top: 10px;
  right: 0;
  height: 34px;
  padding: 0 18px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background: var(--color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.source-detail-card {
  position: absolute;
  top: 57px;
  right: 0;
  display: grid;
  grid-template-rows: 43px minmax(0, 1fr) 57px;
  width: 303px;
  height: 100%;
  overflow: hidden;
}

.source-detail-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 13px;
  border-bottom: 1px solid #e6ebf2;
}

.source-detail-card header button {
  border: 0;
  background: transparent;
  color: #344054;
  font-size: 18px;
}

.detail-content {
  min-height: 0;
  overflow: hidden;
  padding: 0 13px;
}

.detail-content section {
  padding: 13px 0;
  border-bottom: 1px solid #edf0f4;
}

.detail-content dl {
  display: grid;
  gap: 8px;
  margin: 10px 0 0;
}

.detail-content dl div {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 8px;
  font-size: 11px;
}

.detail-content dt {
  color: #5f6774;
}

.detail-content dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}

.detail-content p {
  margin-top: 10px;
  font-size: 11px;
  line-height: 20px;
}

.text-link {
  display: block;
  margin: 9px auto 0;
  font-size: 11px;
}

.chapter-list {
  display: grid;
  gap: 8px;
  margin: 10px 0 0;
  padding-left: 12px;
  font-size: 11px;
}

.detail-log {
  width: 100%;
  min-width: 0;
  margin-top: 9px;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 10px;
}

.detail-log td {
  height: 22px;
  color: #344054;
}

.detail-log td:last-child {
  color: #079455;
  text-align: right;
}

.source-detail-card footer {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #e1e7ef;
}

.source-detail-card footer button {
  height: 32px;
  border: 1px solid #d8dee8;
  border-radius: 4px;
  background: #fff;
  color: #344054;
  font-size: 12px;
}

.source-detail-card footer button:nth-child(2) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.detail-overlay,
.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgb(32 38 49 / 24%);
}

.detail-backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: transparent;
}

.source-detail-panel.compact {
  position: absolute;
  top: 0;
  right: 0;
  width: 303px;
  height: 100vh;
  background: #fff;
}

.source-detail-panel.compact .source-detail-card {
  top: 0;
  height: 100vh;
}

.dialog-backdrop {
  display: grid;
  place-items: center;
}

.file-picker {
  width: 430px;
  max-height: 560px;
  overflow: hidden;
  border: 1px solid #dfe5ee;
  border-radius: 4px;
  background: #fff;
}

.file-picker header,
.file-picker footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 14px;
  border-bottom: 1px solid #edf0f4;
}

.file-picker header button {
  border: 0;
  background: transparent;
  font-size: 20px;
}

.file-options {
  max-height: 430px;
  overflow: auto;
  padding: 7px 14px;
}

.file-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  border-bottom: 1px solid #edf0f4;
  font-size: 11px;
}

.file-picker footer {
  justify-content: flex-end;
  gap: 8px;
  border-bottom: 0;
  border-top: 1px solid #edf0f4;
}

.file-picker footer button {
  height: 29px;
  padding: 0 13px;
  border: 1px solid #d8dee8;
  border-radius: 4px;
  background: #fff;
}

.supervision-live {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.supervision-page {
  box-sizing: border-box;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 320px);
  gap: 12px;
  align-items: start;
  width: 100%;
  max-width: none;
  height: auto;
  min-height: calc(var(--shell-viewport-height, 100vh) - 82px);
  margin: 0;
  overflow: visible;
}

.supervision-board {
  grid-template-rows: 72px 92px minmax(224px, .9fr) minmax(314px, 1.25fr) minmax(139px, .7fr);
  gap: 6px;
  min-width: 0;
  min-height: calc(var(--shell-viewport-height, 100vh) - 82px);
}

.source-detail-panel {
  position: sticky;
  top: 70px;
  display: grid;
  grid-template-rows: 34px minmax(0, 1fr);
  gap: 12px;
  min-width: 0;
  height: calc(var(--shell-viewport-height, 100vh) - 82px);
}

.new-analysis {
  position: static;
  justify-self: end;
}

.source-detail-card {
  position: static;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.detail-content {
  overflow-y: auto;
}

.result-table-panel {
  display: grid;
  grid-template-rows: 34px 34px minmax(205px, 1fr) 38px;
}

.dense-table-wrap {
  height: auto;
  min-height: 0;
  overflow: auto;
}

.dense-table {
  height: 100%;
}

.report-framework {
  grid-template-rows: 34px repeat(5, minmax(46px, 1fr));
  min-height: 0;
}

.chapter-card {
  height: auto;
  min-height: 46px;
}

.chart-card {
  display: flex;
  min-height: 0;
  flex-direction: column;
}

.bar-chart,
.donut-layout {
  height: auto;
  min-height: 174px;
  flex: 1;
}

.keyword-bars {
  flex: 1;
  align-content: space-between;
}

.exports-panel {
  display: grid;
  grid-template-rows: 34px minmax(0, 1fr);
}

.exports-panel > div {
  min-height: 0;
}

.export-card {
  height: 100%;
  min-height: 92px;
}

.dense-table-wrap,
.history-panel {
  overflow-x: auto;
}

@media (max-width: 1679px) {
  .supervision-board {
    grid-template-rows: none;
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
  }

  .filter-panel,
  .metric-strip,
  .chart-grid,
  .result-table-panel,
  .report-framework,
  .exports-panel,
  .history-panel {
    grid-column: 1;
    grid-row: auto;
    width: auto;
    margin-left: 0;
  }
}

@media (max-width: 1320px) {
  .supervision-page {
    grid-template-columns: minmax(0, 1fr);
  }

  .source-detail-panel.compact {
    display: block;
    width: min(360px, 100vw);
    height: 100vh;
  }
}

@media (max-width: 1100px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-actions {
    justify-content: flex-end;
  }

  .metric-card {
    min-height: 76px;
  }
}

@media (max-width: 900px) {
  .filter-grid,
  .metric-strip,
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
