<template>
  <section class="report-generation-page route-fill-page" data-report-region="report-generation-page">
    <header class="report-titlebar" data-report-region="title-actions">
      <h2>报告生成</h2>
      <div class="title-actions">
        <button type="button" class="compare-action" @click="openOfficialCompare">回传正式报告比对</button>
        <button type="button" @click="notify('已返回任务详情')">返回任务</button>
        <button type="button" @click="notify('已重新触发报告生成')">重新生成</button>
        <button type="button" @click="saveVersion">保存版本</button>
        <button type="button" class="danger" @click="submitReview">提交复核</button>
        <button type="button" class="danger export" @click="exportReport">导出报告 <FontAwesomeIcon :icon="faChevronDown" /></button>
      </div>
    </header>

    <section v-if="route.query.action || route.query.panel" class="report-merge-hint">
      <strong>{{ route.query.action === 'offline-upload' ? '线下稿上传已并入报告草稿' : '版本对比已并入报告草稿' }}</strong>
      <p>{{ route.query.action === 'offline-upload' ? '可在当前草稿工作区上传线下修改稿并生成复核记录。' : '可在当前草稿工作区打开版本对比面板，查看差异和引用影响。' }}</p>
    </section>

    <section class="task-meta-strip" data-report-region="task-meta">
      <div v-for="item in metaItems" :key="item.label">
        <span>{{ item.label }}</span>
        <strong :class="{ 'status-text': item.status }">{{ item.value }}</strong>
      </div>
    </section>

    <div class="report-generation-grid">
      <aside class="generation-config" data-report-region="generation-config">
        <h3>生成配置</h3>
        <label v-for="control in configControls" :key="control.label">
          <span>{{ control.label }}</span>
          <select :value="control.value" @change="notify(`已切换${control.label}`)">
            <option>{{ control.value }}</option>
          </select>
        </label>
        <button type="button" class="outline-action" @click="notify('已打开引用内容选择')">选择引用内容</button>
        <div class="format-checks">
          <span>输出格式</span>
          <label v-for="format in snapshot.config.outputFormats" :key="format">
            <input type="checkbox" checked />
            {{ format }}
          </label>
        </div>
        <div class="switch-row">
          <span>AI标识</span>
          <button type="button" :aria-pressed="snapshot.config.aiLabel" @click="notify('AI标识已启用')">启用</button>
        </div>
        <div class="switch-row">
          <span>多模型复核</span>
          <button type="button" :aria-pressed="snapshot.config.modelReview" @click="notify('多模型复核已启用')">启用</button>
        </div>
        <button type="button" class="start-button" @click="startGeneration">开始生成</button>
        <p class="hint-title">提示说明</p>
        <p class="hint-text">系统将基于所选模板与引用结果生成完整报告草稿，请在“人工编辑”阶段进行内容完善与确认。</p>
      </aside>

      <main class="generation-center">
        <section class="progress-card" data-report-region="generation-progress">
          <ol class="step-flow">
            <li v-for="(step, index) in snapshot.steps" :key="step.id" :class="step.state">
              <span class="step-dot"><FontAwesomeIcon v-if="step.state === 'done'" :icon="faCheck" /><template v-else>{{ index + 1 }}</template></span>
              <strong>{{ step.label }}</strong>
              <em>{{ step.badge }}</em>
            </li>
          </ol>

          <div class="progress-body">
            <div>
              <h3>执行进度与日志</h3>
              <ul class="generation-logs">
                <li v-for="log in snapshot.logs" :key="`${log.time}-${log.text}`" :class="log.tone">
                  <span>{{ log.time }}</span>
                  <p>{{ log.text }}</p>
                </li>
              </ul>
            </div>
            <div class="progress-metrics">
              <div class="progress-track" aria-label="报告生成进度">
                <span :style="{ width: `${snapshot.progress.percent}%` }"></span>
              </div>
              <strong>{{ snapshot.progress.percent }}%</strong>
              <dl>
                <div><dt>已用时：</dt><dd>{{ snapshot.progress.elapsed }}</dd></div>
                <div><dt>预计剩余：</dt><dd>{{ snapshot.progress.remaining }}</dd></div>
                <div><dt>模型：</dt><dd>{{ snapshot.progress.model }}</dd></div>
                <div><dt>并行任务：</dt><dd>{{ snapshot.progress.parallel }}</dd></div>
              </dl>
              <button type="button" @click="notify('已展开全部日志')">展开日志</button>
            </div>
          </div>

          <h3 class="readiness-title">来源资料就绪情况</h3>
          <div class="readiness-grid">
            <article v-for="source in snapshot.readiness" :key="source.title" :class="source.tone">
              <span class="source-icon"><FontAwesomeIcon :icon="sourceIcon(source.tone)" /></span>
              <div>
                <strong>{{ source.title }}</strong>
                <em>{{ source.status }}</em>
                <p>{{ source.countLabel }}</p>
              </div>
            </article>
          </div>
        </section>

        <section class="editor-card" data-report-region="draft-editor">
          <aside class="chapter-list">
            <h3>章节目录 <span>（共 8 章）</span></h3>
            <button v-for="chapter in snapshot.chapters" :key="chapter.title" type="button" :class="{ active: chapter.active }">
              <FontAwesomeIcon :icon="faCaretRight" />{{ chapter.title }}
            </button>
          </aside>
          <article class="editor-surface">
            <div class="editor-toolbar" aria-label="正文编辑工具栏">
              <select aria-label="段落样式"><option>正文</option></select>
              <button type="button">微</button>
              <button type="button">平</button>
              <select aria-label="字号"><option>11</option></select>
              <button type="button"><strong>B</strong></button>
              <button type="button"><i>I</i></button>
              <button type="button"><u>U</u></button>
              <button type="button">A</button>
              <button type="button" aria-label="左对齐"><FontAwesomeIcon :icon="faAlignLeft" /></button>
              <button type="button" aria-label="居中对齐"><FontAwesomeIcon :icon="faAlignCenter" /></button>
              <button type="button" aria-label="项目列表"><FontAwesomeIcon :icon="faListUl" /></button>
              <button type="button" aria-label="编号列表"><FontAwesomeIcon :icon="faListOl" /></button>
              <button type="button" aria-label="插入链接"><FontAwesomeIcon :icon="faLink" /></button>
              <button type="button" aria-label="插入图片"><FontAwesomeIcon :icon="faImage" /></button>
            </div>
            <div class="doc-paper">
              <h1>上海分公司Q1常规审计报告（草稿）</h1>
              <h4>一、基本情况</h4>
              <h5>（一）被审计单位概况</h5>
              <p class="ai-paragraph">
                <span>AI</span>
                上海分公司在公司战略部署下，主要开展经纪业务、信用业务及相关金融服务。截至 2025 年 3 月末，公司共有员工 358 人，设有营业部 12 家，经营状况总体良好。
                <button type="button" @click="viewSource">依据 3</button>
              </p>
              <h5>（二）审计范围与期间</h5>
              <p>本次审计范围包括上海分公司 2025 年 1 月 1 日至 2025 年 3 月 31 日期间的财务收支、内部控制、业务运营及合规管理活动。<button type="button" class="issue-tag" @click="viewSource">依据 2</button></p>
            </div>
          </article>
          <aside class="chapter-actions">
            <h3>章节操作</h3>
            <button type="button" class="red-outline" @click="regenerateChapter">章节级重新生成</button>
            <button type="button" @click="notify('已进入章节编辑')">编辑章节</button>
            <button type="button" @click="viewSource">查看来源</button>
            <button type="button" @click="notify('当前章节已锁定')">锁定章节</button>
            <dl>
              <div><dt>引用条款</dt><dd>{{ snapshot.chapterStats.references }}</dd></div>
              <div><dt>问题提示</dt><dd class="danger-count">{{ snapshot.chapterStats.issues }}</dd></div>
              <div><dt>字数统计</dt><dd>{{ snapshot.chapterStats.words }}</dd></div>
              <div><dt>最后修改</dt><dd>{{ snapshot.chapterStats.lastEdited }}</dd></div>
            </dl>
          </aside>
        </section>
      </main>

      <aside v-if="sourceRailOpen" class="source-rail" data-report-region="source-rail">
        <header>
          <h3>依据来源</h3>
          <button type="button" aria-label="关闭依据来源" @click="sourceRailOpen = false"><FontAwesomeIcon :icon="faXmark" /></button>
        </header>
        <nav class="source-tabs">
          <button v-for="tab in sourceTabs" :key="tab" type="button" :class="{ active: tab === activeSourceTab }" @click="activeSourceTab = tab">{{ tab }}</button>
        </nav>
        <div class="source-tools">
          <strong>共 156 条引用结果</strong>
          <select aria-label="来源范围"><option>全部来源</option></select>
          <button type="button" aria-label="筛选依据来源"><FontAwesomeIcon :icon="faFilter" /> 筛选</button>
          <button type="button" aria-label="导出依据来源"><FontAwesomeIcon :icon="faDownload" /></button>
        </div>
        <div class="source-list">
          <article v-for="source in snapshot.sources" :key="source.index" class="source-card">
            <div>
              <span class="source-index">{{ source.index }}</span>
              <em>{{ source.type }}</em>
            </div>
            <h4>{{ source.title }}</h4>
            <p>{{ source.excerpt }}</p>
            <dl>
              <div><dt>匹配度：</dt><dd>{{ source.match }}</dd></div>
              <div><dt>来源：</dt><dd>{{ source.source }}</dd></div>
              <div><dt></dt><dd>{{ source.version }}</dd></div>
            </dl>
            <footer>
              <button type="button" @click="viewSource">查看原文</button>
              <button type="button" @click="replaceSource(source)">替换来源</button>
              <button type="button" @click="notify('已引用到当前章节')">引用到章节</button>
            </footer>
          </article>
        </div>
        <div class="pager">
          <button type="button" aria-label="上一页" disabled><FontAwesomeIcon :icon="faChevronLeft" /></button>
          <button type="button" class="active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <span>...</span>
          <button type="button">16</button>
          <button type="button" aria-label="下一页"><FontAwesomeIcon :icon="faChevronRight" /></button>
          <strong>共 156 条</strong>
        </div>
      </aside>
    </div>

    <section class="bottom-row" data-report-region="output-version">
      <div class="output-panel">
        <h3>报告输出与版本</h3>
        <p>输出文件（生成中）</p>
        <div class="output-files">
          <article v-for="file in snapshot.outputs" :key="file.name">
            <span :class="file.tone">{{ file.type }}</span>
            <strong>{{ file.name }}</strong>
            <small>{{ file.size }}</small>
          </article>
        </div>
      </div>
      <div class="version-panel">
        <h3>版本记录</h3>
        <ol>
          <li v-for="version in snapshot.versions" :key="version.id" :class="version.state">
            <span></span>
            <strong>{{ version.id }}</strong>
            <em>{{ version.label }}</em>
            <time>{{ version.time }}</time>
          </li>
        </ol>
      </div>
      <aside class="export-history-panel">
        <h3>{{ snapshot.exportHistory.title }}</h3>
        <p>{{ snapshot.exportHistory.status }}</p>
      </aside>
    </section>

    <button v-if="!sourceRailOpen" type="button" class="reopen-source" @click="sourceRailOpen = true">依据来源</button>
    <section class="official-compare-panel" data-report-region="official-report-compare">
      <header>
        <div>
          <span>正式报告回传比对</span>
          <h3>生成稿与正式稿差异复核</h3>
        </div>
        <button type="button" @click="openOfficialCompare">上传正式报告</button>
      </header>
      <div class="compare-summary-grid">
        <article v-for="item in snapshot.officialCompare.summary" :key="item.label" :class="item.tone">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <em>{{ item.hint }}</em>
        </article>
      </div>
      <div class="compare-detail-row">
        <div>
          <h4>{{ compareResultVisible ? '最近比对结果' : '待回传正式报告' }}</h4>
          <p>{{ compareResultVisible ? snapshot.officialCompare.latestResult : snapshot.officialCompare.emptyHint }}</p>
        </div>
        <ol>
          <li v-for="record in snapshot.officialCompare.records" :key="record.name">
            <strong>{{ record.name }}</strong>
            <span>{{ record.status }}</span>
          </li>
        </ol>
      </div>
    </section>

    <div v-if="compareDialogOpen" class="compare-modal-mask" role="presentation">
      <section class="compare-modal" role="dialog" aria-modal="true" aria-labelledby="compare-modal-title">
        <header>
          <div>
            <span>正式报告回传</span>
            <h3 id="compare-modal-title">回传正式报告比对</h3>
          </div>
          <button type="button" aria-label="关闭回传正式报告比对" @click="compareDialogOpen = false"><FontAwesomeIcon :icon="faXmark" /></button>
        </header>
        <label class="official-upload-box">
          <input type="file" accept=".doc,.docx,.pdf" @change="handleOfficialReportUpload" />
          <FontAwesomeIcon :icon="faFileLines" />
          <strong>{{ officialReportFileName || '上传正式报告文件' }}</strong>
          <span>支持 Word / PDF，用于与当前生成稿进行差异比对</span>
        </label>
        <label class="compare-base-select">
          <span>比对基准</span>
          <select v-model="compareBaseVersion">
            <option v-for="version in snapshot.versions" :key="version.id" :value="version.id">
              {{ version.id }} - {{ version.label }}
            </option>
          </select>
        </label>
        <div class="compare-check-list">
          <span v-for="item in snapshot.officialCompare.checkItems" :key="item">
            <FontAwesomeIcon :icon="faCheck" />{{ item }}
          </span>
        </div>
        <footer>
          <button type="button" @click="compareDialogOpen = false">取消</button>
          <button type="button" class="danger" @click="startOfficialCompare">开始比对</button>
        </footer>
      </section>
    </div>
    <div v-if="toast" class="report-toast" role="status">{{ toast }}</div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faAlignCenter,
  faAlignLeft,
  faCaretRight,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faClipboardCheck,
  faDownload,
  faFileLines,
  faFilter,
  faImage,
  faLink,
  faListOl,
  faListUl,
  faTableList,
  faUserShield,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { getAuditReportGenerationSnapshot } from './auditReportGenerationData.js';

const route = useRoute();
const snapshot = ref(getAuditReportGenerationSnapshot());
const toast = ref('');
const sourceRailOpen = ref(true);
const activeSourceTab = ref('引用结果');
const sourceTabs = ['引用结果', '制度条款', '费用异常', '监督共享资料', '历史报告'];
const compareDialogOpen = ref(false);
const compareResultVisible = ref(false);
const officialReportFileName = ref('');
const compareBaseVersion = ref('V1.0');
let toastTimer;

const metaItems = computed(() => [
  { label: '被审计单位', value: snapshot.value.task.unit },
  { label: '审计期间', value: snapshot.value.task.period },
  { label: '报告类型', value: snapshot.value.task.reportType },
  { label: '当前模板', value: snapshot.value.task.template },
  { label: '任务状态', value: snapshot.value.task.status, status: true },
  { label: '更新时间', value: snapshot.value.task.updatedAt }
]);

const configControls = computed(() => [
  { label: '任务选择', value: snapshot.value.config.taskName },
  { label: '报告类型', value: snapshot.value.config.reportType },
  { label: '报告模板', value: snapshot.value.config.reportTemplate },
  { label: '格式模板', value: snapshot.value.config.formatTemplate }
]);

function notify(message) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = '';
  }, 2200);
}

function startGeneration() {
  snapshot.value.progress.percent = 72;
  snapshot.value.logs.unshift({ time: '14:12:02', text: '已开始新一轮报告草稿生成', tone: 'active' });
  notify('报告生成已开始');
}

function regenerateChapter() {
  snapshot.value.logs.unshift({ time: '14:12:18', text: '已重新生成“一、基本情况”章节', tone: 'active' });
  notify('章节级重新生成已完成');
}

function viewSource() {
  sourceRailOpen.value = true;
  activeSourceTab.value = '引用结果';
  notify('已定位到依据来源');
}

function replaceSource(source) {
  notify(`已打开“${source.type}”替换来源`);
}

function saveVersion() {
  snapshot.value.versions = snapshot.value.versions.map((version) => version.id === 'V1.0' ? { ...version, label: '人工编辑草稿', time: '已保存' } : version);
  notify('V1.0 版本已保存');
}

function submitReview() {
  snapshot.value.task.status = '等待复核';
  notify('报告已提交复核');
}

function exportReport() {
  notify('已生成 Word 与 PDF 导出任务');
}

function openOfficialCompare() {
  compareDialogOpen.value = true;
  notify('请上传线下定稿后的正式报告');
}

function handleOfficialReportUpload(event) {
  const [file] = Array.from(event.target.files || []);
  officialReportFileName.value = file?.name || '';
}

function startOfficialCompare() {
  officialReportFileName.value ||= '上海分公司Q1常规审计正式报告.docx';
  compareResultVisible.value = true;
  compareDialogOpen.value = false;
  snapshot.value.officialCompare.summary = [
    { label: '内容差异', value: '12', hint: '新增 4 / 修改 8', tone: 'red' },
    { label: '结构差异', value: '2', hint: '章节顺序需复核', tone: 'orange' },
    { label: '依据差异', value: '3', hint: '引用来源变化', tone: 'blue' },
    { label: '风险提示', value: '1', hint: '影响审计结论', tone: 'red' }
  ];
  snapshot.value.officialCompare.latestResult = `${officialReportFileName.value} 已与 ${compareBaseVersion.value} 生成稿完成比对，发现 18 处差异，其中 1 处可能影响审计结论，建议进入复核处理。`;
  snapshot.value.officialCompare.records.unshift({
    name: officialReportFileName.value,
    status: '已完成比对'
  });
  notify('正式报告比对已完成');
}

function sourceIcon(tone) {
  return { red: faFileLines, green: faTableList, orange: faClipboardCheck }[tone] || faUserShield;
}
</script>

<style scoped>
.report-generation-page{position:relative;width:100%;max-width:none;margin:0;padding:14px 8px 14px;color:#172033;font-size:12px}.report-titlebar{height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 9px;border:1px solid #ffd7d7;background:#fff}.report-titlebar h2{font-size:21px;line-height:1;font-weight:800}.title-actions{display:flex;align-items:center;gap:8px}.title-actions button,.source-tools button,.source-card footer button,.chapter-actions button,.progress-metrics button,.outline-action{height:30px;padding:0 14px;border:1px solid #d4dbe5;border-radius:4px;background:#fff;color:#1f2937;font-size:12px;font-weight:700}.title-actions .danger{border-color:var(--color-primary);background:var(--color-primary);color:#fff}.title-actions .export{min-width:107px;justify-content:center;display:inline-flex;gap:8px}.report-merge-hint{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:42px;margin:8px 335px 0 9px;padding:7px 12px;border:1px solid #ffd7d7;background:#fff}.report-merge-hint strong{color:var(--color-primary)}.report-merge-hint p{margin:0;color:#667085}.task-meta-strip{height:58px;margin:8px 335px 10px 9px;display:grid;grid-template-columns:106px 252px 178px 190px 104px 1fr;border:1px solid #e2e6ec;background:#fff}.task-meta-strip div{min-width:0;padding:9px 13px;border-right:1px solid #e2e6ec}.task-meta-strip div:last-child{border-right:0}.task-meta-strip span{display:block;margin-bottom:8px;color:#556070;font-size:11px;font-weight:700}.task-meta-strip strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.task-meta-strip .status-text{display:inline-flex;height:20px;align-items:center;padding:0 7px;border-radius:3px;background:#fff0df;color:var(--color-warning)}
.report-generation-grid{display:grid;grid-template-columns:204px minmax(640px,790px) 326px;gap:12px;align-items:start}.generation-config,.progress-card,.editor-card,.source-rail,.output-panel,.version-panel,.export-history-panel{border:1px solid #e2e7ef;border-radius:4px;background:#fff}.generation-config{height:654px;padding:12px 10px;display:flex;flex-direction:column;gap:11px}.generation-config h3,.progress-card h3,.chapter-list h3,.chapter-actions h3,.source-rail h3,.output-panel h3,.version-panel h3,.export-history-panel h3{font-size:13px;font-weight:800}.generation-config label{display:grid;gap:6px;color:#303848;font-size:12px;font-weight:700}.generation-config label>span::before{content:"• ";color:var(--color-danger)}.generation-config select{width:100%;height:32px;border:1px solid #d8dee8;border-radius:4px;background:#fbfcfe;color:#344054;font-size:12px}.outline-action{align-self:center;width:118px}.format-checks{display:grid;grid-template-columns:1fr 1fr;gap:8px 9px}.format-checks>span{grid-column:1/-1;font-weight:800}.format-checks label{display:flex;align-items:center;gap:6px;font-weight:700}.format-checks input{accent-color:var(--color-primary)}.switch-row{display:flex;align-items:center;justify-content:space-between}.switch-row span{font-weight:800}.switch-row button{position:relative;width:40px;height:20px;border:0;border-radius:99px;background:var(--color-primary);color:#fff;font-size:0}.switch-row button::after{content:"";position:absolute;right:3px;top:3px;width:14px;height:14px;border-radius:50%;background:#fff}.start-button{height:34px;margin-top:5px;border:0;border-radius:4px;background:var(--color-primary);color:#fff;font-weight:800}.hint-title{margin-top:10px;font-weight:800}.hint-text{color:#667085;font-size:11px;line-height:1.8}
.generation-center{display:grid;gap:12px}.progress-card{height:334px;padding:18px 12px 10px}.step-flow{list-style:none;margin:0;padding:0 10px 15px;display:grid;grid-template-columns:repeat(6,1fr);position:relative}.step-flow::before{content:"";position:absolute;left:43px;right:43px;top:12px;height:2px;background:#d9dee8}.step-flow li{position:relative;z-index:1;display:grid;justify-items:center;gap:5px;color:#6b7280}.step-dot{width:23px;height:23px;border-radius:50%;display:grid;place-items:center;background:#9aa3b2;color:#fff;font-size:12px;font-weight:800}.step-flow li.done .step-dot{background:var(--color-success)}.step-flow li.active .step-dot{background:var(--color-primary)}.step-flow li strong{font-size:12px;color:#1f2937}.step-flow li em{height:20px;padding:2px 8px;border-radius:3px;background:#f3f5f8;font-style:normal;font-size:11px}.step-flow li.done em{background:#e8f8ef;color:var(--color-success)}.step-flow li.active em{background:#fff0f0;color:var(--color-primary)}.progress-body{display:grid;grid-template-columns:minmax(0,1fr) 405px;gap:24px}.generation-logs{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:7px}.generation-logs li{display:grid;grid-template-columns:58px 1fr;align-items:center;gap:8px;position:relative;padding-left:12px}.generation-logs li::before{content:"";position:absolute;left:0;top:7px;width:6px;height:6px;border-radius:50%;background:var(--color-info)}.generation-logs li.success::before{background:var(--color-success)}.generation-logs li.active::before{background:var(--color-primary)}.generation-logs span{color:#667085}.generation-logs p{line-height:1.25;color:#344054}.progress-metrics{padding-top:27px;display:grid;grid-template-columns:minmax(0,1fr) 40px;gap:11px;align-items:center}.progress-track{height:7px;border-radius:99px;background:#e8ebf1;overflow:hidden}.progress-track span{display:block;height:100%;border-radius:inherit;background:var(--color-primary)}.progress-metrics strong{color:var(--color-primary)}.progress-metrics dl{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:9px 22px;margin:0}.progress-metrics div{display:flex}.progress-metrics dt{color:#667085}.progress-metrics dd{margin:0;color:#344054}.progress-metrics button{justify-self:end;grid-column:2}.readiness-title{margin:12px 0 9px}.readiness-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.readiness-grid article{height:72px;border:1px solid #e1e7ef;border-radius:6px;background:#fff;display:flex;gap:10px;align-items:center;padding:10px}.source-icon{width:30px;height:30px;border-radius:6px;display:grid;place-items:center;font-size:14px}.readiness-grid .red .source-icon{background:#fff1f1;color:var(--color-primary)}.readiness-grid .green .source-icon{background:#eaf8ef;color:var(--color-success)}.readiness-grid .orange .source-icon{background:#fff4e6;color:var(--color-warning)}.readiness-grid strong{display:block;margin-bottom:5px}.readiness-grid em{display:inline-flex;height:19px;align-items:center;padding:0 7px;border-radius:3px;background:#eaf8ef;color:var(--color-success);font-style:normal;font-size:11px}.readiness-grid .orange em{background:#fff4e6;color:var(--color-warning)}.readiness-grid p{margin-top:7px;color:#667085;line-height:1}
.editor-card{height:306px;display:grid;grid-template-columns:146px minmax(0,1fr) 126px}.chapter-list{border-right:1px solid #e2e7ef;padding:10px 8px}.chapter-list h3 span{color:#667085;font-weight:700}.chapter-list button{width:100%;height:27px;border:0;border-radius:4px;background:transparent;text-align:left;font-size:11px;font-weight:700;color:#1f2937}.chapter-list button.active{background:#fff0f0;color:var(--color-primary)}.chapter-list span{margin-right:5px}.editor-surface{min-width:0}.editor-toolbar{height:34px;border-bottom:1px solid #e2e7ef;display:flex;align-items:center;gap:5px;padding:0 8px}.editor-toolbar button,.editor-toolbar select{height:24px;border:0;background:#fff;color:#344054;font-size:12px}.editor-toolbar select{border:1px solid #dde3eb;border-radius:3px}.doc-paper{height:271px;padding:17px 30px;overflow:hidden}.doc-paper h1{text-align:center;font-size:18px;margin-bottom:16px}.doc-paper h4,.doc-paper h5{margin:0 0 8px;font-size:13px}.doc-paper p{margin:0 0 10px;font-size:12px;line-height:1.75}.ai-paragraph{position:relative;border:1px solid #b9d3ff;border-radius:4px;background:#f4f8ff;padding:8px 45px 8px 34px}.ai-paragraph span{position:absolute;left:8px;top:10px;width:18px;height:18px;border-radius:3px;background:var(--color-info);color:#fff;display:grid;place-items:center;font-size:10px;font-weight:800}.ai-paragraph button,.issue-tag{height:22px;border:1px solid #ffb3a8;border-radius:4px;background:#fff1ef;color:var(--color-primary);font-size:11px}.ai-paragraph button{position:absolute;right:8px;top:20px}.chapter-actions{border-left:1px solid #e2e7ef;padding:10px 9px;display:grid;align-content:start;gap:8px}.chapter-actions button{width:100%;height:29px;padding:0 6px}.chapter-actions .red-outline{border-color:#ff9f9f;color:var(--color-primary)}.chapter-actions dl{margin:9px 0 0;display:grid;gap:6px}.chapter-actions dl div{display:flex;justify-content:space-between}.chapter-actions dt{color:#667085}.chapter-actions dd{margin:0}.danger-count{color:var(--color-primary)}
.source-rail{position:absolute;right:14px;top:62px;width:326px;height:auto;display:grid;grid-template-rows:42px 43px 43px minmax(0,1fr) 43px}.source-rail header{display:flex;align-items:center;justify-content:space-between;padding:0 12px}.source-rail header button{border:0;background:#fff;font-size:22px}.source-tabs{display:flex;align-items:end;gap:14px;padding:0 10px;border-bottom:1px solid #e2e7ef;overflow-x:auto}.source-tabs button{height:36px;border:0;background:#fff;color:#344054;font-size:12px;font-weight:800;white-space:nowrap}.source-tabs .active{color:var(--color-primary);border-bottom:2px solid var(--color-primary)}.source-tools{display:flex;align-items:center;gap:8px;padding:0 10px}.source-tools strong{margin-right:auto}.source-tools select{height:28px;width:84px;border:1px solid #d8dee8;border-radius:4px;background:#fff;font-size:11px}.source-tools button{height:28px;padding:0 9px}.source-list{overflow:auto;padding:0 9px 8px;display:grid;gap:8px;align-content:start}.source-card{min-height:192px;border:1px solid #e1e7ef;border-radius:6px;background:#fff;padding:12px}.source-card>div:first-child{display:flex;align-items:center;gap:8px}.source-index{width:18px;height:18px;border-radius:4px;background:var(--color-info);color:#fff;display:grid;place-items:center;font-weight:800}.source-card em{height:22px;padding:0 8px;border-radius:4px;background:#eaf3ff;color:var(--color-info);display:inline-flex;align-items:center;font-style:normal;font-weight:800}.source-card h4{margin:10px 0 7px;font-size:13px}.source-card p{height:42px;overflow:hidden;color:#344054;font-size:12px;line-height:1.7}.source-card dl{display:grid;grid-template-columns:1fr 1fr 45px;margin:6px 0 9px}.source-card dl div{display:flex;gap:3px}.source-card dt{color:#667085}.source-card dd{margin:0}.source-card footer{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.source-card footer button{height:28px;padding:0;border-color:#dbe2ec;font-size:11px}.pager{display:flex;align-items:center;justify-content:center;gap:7px;border-top:1px solid #e2e7ef}.pager button{width:24px;height:24px;border:1px solid #dbe2ec;border-radius:4px;background:#fff}.pager button.active{border-color:var(--color-primary);background:var(--color-primary);color:#fff}.pager strong{font-weight:700;color:#344054}
.bottom-row{width:100%;display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,358px) minmax(120px,160px);gap:10px;margin-top:10px;margin-left:0}.output-panel,.version-panel,.export-history-panel{height:122px;padding:9px 10px}.output-panel p{margin:6px 0 8px;color:#344054;font-weight:700;line-height:1}.output-files{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.output-files article{height:60px;border:1px solid #e2e7ef;border-radius:4px;background:#fff;display:grid;align-content:center;justify-items:start;padding:8px;gap:4px}.output-files span{height:18px;min-width:18px;border-radius:3px;color:#fff;display:inline-grid;place-items:center;font-size:9px;font-weight:800}.output-files .word{background:var(--color-info)}.output-files .pdf{background:var(--color-primary)}.output-files .zip{background:var(--color-warning)}.output-files .excel{background:var(--color-success)}.output-files strong{font-size:11px}.output-files small{color:#667085}.version-panel ol{position:relative;list-style:none;margin:15px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,1fr)}.version-panel ol::before{content:"";position:absolute;left:16px;right:16px;top:7px;border-top:2px dotted #c4ccd8}.version-panel li{position:relative;display:grid;gap:4px}.version-panel li span{width:10px;height:10px;border-radius:50%;background:#8f99a8;z-index:1}.version-panel li.active span{background:var(--color-info)}.version-panel li.current span{background:var(--color-primary)}.version-panel strong{font-size:13px}.version-panel em,.version-panel time{font-style:normal;font-size:11px;color:#344054}.version-panel time{color:#667085}.export-history-panel p{margin-top:34px;color:#667085;text-align:center;line-height:1.4}.report-toast{position:fixed;right:24px;top:68px;z-index:80;padding:9px 14px;border-radius:4px;background:rgba(31,41,55,.94);color:#fff}.reopen-source{position:fixed;right:16px;top:120px;z-index:30;height:34px;border:1px solid var(--color-primary);border-radius:4px;background:#fff;color:var(--color-primary);font-weight:800}
.title-actions .compare-action{border-color:#a32035;background:#fff7f7;color:#a32035}.official-compare-panel{margin-top:10px;border:1px solid #e2e7ef;border-left:3px solid #a32035;border-radius:4px;background:#fff;padding:10px 12px}.official-compare-panel>header{display:flex;align-items:center;justify-content:space-between;gap:12px}.official-compare-panel>header span,.compare-modal header span{display:block;margin-bottom:4px;color:#667085;font-size:11px;font-weight:800}.official-compare-panel h3,.compare-modal h3{font-size:14px;font-weight:800}.official-compare-panel>header button{height:30px;padding:0 14px;border:1px solid #a32035;border-radius:4px;background:#a32035;color:#fff;font-size:12px;font-weight:800}.compare-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}.compare-summary-grid article{min-height:62px;border:1px solid #e2e7ef;border-radius:4px;background:#fbfcfe;padding:8px}.compare-summary-grid span{display:block;color:#667085;font-size:11px;font-weight:800}.compare-summary-grid strong{display:block;margin-top:5px;font-size:22px;line-height:1;color:#344054}.compare-summary-grid em{display:block;margin-top:6px;color:#667085;font-size:11px;font-style:normal}.compare-summary-grid .red strong{color:#a32035}.compare-summary-grid .orange strong{color:#8a5a16}.compare-summary-grid .blue strong{color:#315d96}.compare-detail-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,360px);gap:14px;margin-top:10px;padding-top:10px;border-top:1px solid #edf0f5}.compare-detail-row h4{margin:0 0 5px;font-size:13px}.compare-detail-row p{margin:0;color:#344054;line-height:1.7}.compare-detail-row ol{list-style:none;margin:0;padding:0;display:grid;gap:6px}.compare-detail-row li{display:flex;align-items:center;justify-content:space-between;gap:10px}.compare-detail-row li strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.compare-detail-row li span{height:22px;display:inline-flex;align-items:center;padding:0 8px;border-radius:3px;background:#fff0f0;color:#a32035;font-size:11px;font-weight:800;white-space:nowrap}.compare-modal-mask{position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:rgba(15,23,42,.28)}.compare-modal{width:min(520px,calc(100vw - 32px));border:1px solid #e2e7ef;border-radius:6px;background:#fff;box-shadow:0 18px 48px rgba(15,23,42,.18);padding:16px}.compare-modal header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.compare-modal header button{width:30px;height:30px;border:0;background:#fff;color:#344054}.official-upload-box{min-height:116px;border:1px dashed #d5adad;border-radius:6px;background:#fff8f8;display:grid;place-items:center;align-content:center;gap:7px;color:#a32035;cursor:pointer}.official-upload-box input{position:absolute;inline-size:1px;block-size:1px;opacity:0}.official-upload-box svg{font-size:22px}.official-upload-box strong{font-size:14px}.official-upload-box span{color:#667085;font-size:12px}.compare-base-select{display:grid;gap:6px;margin-top:12px;font-weight:800}.compare-base-select select{height:34px;border:1px solid #d8dee8;border-radius:4px;background:#fff;color:#344054}.compare-check-list{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.compare-check-list span{height:30px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:4px;background:#f3f5f8;color:#344054;font-size:12px;font-weight:800}.compare-check-list svg{color:#2d7a5f}.compare-modal footer{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.compare-modal footer button{height:32px;padding:0 16px;border:1px solid #d4dbe5;border-radius:4px;background:#fff;font-weight:800}.compare-modal footer .danger{border-color:#a32035;background:#a32035;color:#fff}
@media (max-width:1500px){.report-generation-page{width:100%;max-width:none;margin:0}.report-titlebar,.task-meta-strip,.report-generation-grid,.bottom-row{transform-origin:top left}}
@media (max-width:1180px){.report-generation-page{transform:none;width:100%;max-width:none;overflow:hidden}.task-meta-strip{margin-right:0;grid-template-columns:repeat(3,1fr);height:auto}.report-generation-grid{grid-template-columns:204px minmax(0,1fr)}.source-rail{position:fixed;right:0;top:56px;z-index:40;width:326px}.bottom-row{grid-template-columns:1fr;width:100%}}
.report-generation-page{box-sizing:border-box;width:100%;max-width:none;margin:0;padding:12px;color:#172033}.report-generation-grid{grid-template-columns:minmax(180px,220px) minmax(0,1fr) minmax(280px,326px);min-width:0}.task-meta-strip{margin-right:0;grid-template-columns:repeat(6,minmax(0,1fr))}.source-rail{position:static;width:auto;height:auto;min-width:0}.bottom-row{width:100%;grid-template-columns:minmax(0,1fr) minmax(260px,358px) minmax(120px,160px)}
@media (max-width:1400px){.report-generation-grid{grid-template-columns:minmax(180px,220px) minmax(0,1fr)}.source-rail{grid-column:1 / -1}.bottom-row{grid-template-columns:1fr}.task-meta-strip{grid-template-columns:repeat(3,minmax(0,1fr));height:auto}}
@media (max-width:900px){.report-generation-grid{grid-template-columns:1fr}.task-meta-strip{grid-template-columns:1fr}}
.report-generation-page{display:flex;min-height:calc(var(--shell-viewport-height, 100vh) - 82px);flex-direction:column}
.report-generation-grid{min-height:654px;flex:1;grid-template-rows:minmax(654px,1fr);align-items:stretch}
.generation-config{height:auto;min-height:654px}
.generation-center{min-height:654px;grid-template-rows:minmax(334px,1.05fr) minmax(306px,.95fr)}
.progress-card,.editor-card{height:auto;min-height:0}
.doc-paper{height:calc(100% - 34px);overflow:auto}
.source-rail{height:auto;min-height:654px;align-self:stretch}
@media (max-width:1400px){.source-rail{min-height:480px}}
.report-generation-page{height:0;min-height:0;overflow:auto}
.progress-card {
  overflow: hidden;
}

.progress-body {
  grid-template-columns: minmax(220px, 1fr) minmax(260px, 320px);
  gap: 16px;
}

.progress-metrics {
  padding-top: var(--ui-space-4);
}

.progress-metrics button {
  width: auto;
  min-width: 72px;
}

.output-panel,
.version-panel,
.export-history-panel {
  height: auto;
  min-height: 122px;
  overflow: visible;
}

.task-meta-strip span,
.hint-text,
.step-flow li em,
.readiness-grid em,
.chapter-list button,
.ai-paragraph span,
.ai-paragraph button,
.issue-tag,
.source-tools select,
.source-card footer button,
.output-files span,
.output-files strong,
.output-files small,
.version-panel em,
.version-panel time {
  font-size: var(--ui-font-xs);
}

/* Keep the generation workspace readable when the evidence rail reduces the center column. */
.generation-logs,
.generation-logs p {
  min-width: 0;
}

.generation-logs li {
  grid-template-columns: 58px minmax(0, 1fr);
}

.editor-card {
  overflow: hidden;
}

.editor-card > * {
  min-width: 0;
  min-height: 0;
}

.chapter-list,
.chapter-actions {
  height: auto;
  overflow: auto;
}

.chapter-list button {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor-surface {
  height: 100%;
  overflow: hidden;
}

.doc-paper {
  box-sizing: border-box;
}

@media (min-width:1401px) and (max-width:1600px) {
  .report-generation-grid {
    min-height: 734px;
    flex: 0 0 auto;
    grid-template-rows: auto;
  }

  .generation-center {
    min-height: 734px;
    grid-template-rows: 416px 306px;
  }

  .generation-config,
  .source-rail {
    min-height: 734px;
  }

}

@media (max-width:1400px) {
  .report-generation-grid {
    min-height: 0;
    flex: 0 0 auto;
    grid-template-rows: auto auto;
  }

  .generation-center {
    min-height: 698px;
    grid-template-rows: 380px 306px;
  }

  .generation-config {
    min-height: 698px;
  }

  .source-rail {
    min-height: 480px;
  }

  .source-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    overflow: visible;
  }

}

@media (max-width:900px) {
  .source-list {
    grid-template-columns: 1fr;
  }
}
</style>
