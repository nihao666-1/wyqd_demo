<template>
  <section class="report-review-page route-fill-page" aria-labelledby="report-review-title">
    <header class="review-titlebar">
      <h2 id="report-review-title">报告审核</h2>
      <div class="review-actions" aria-label="报告审核操作">
        <RouterLink class="review-btn" to="/tasks/detail?taskId=TASK-20250428001&tab=reports">返回任务</RouterLink>
        <RouterLink class="review-btn" to="/audit-report/check-upload">上传新版本</RouterLink>
        <button class="review-btn" type="button" @click="recheck"><FontAwesomeIcon :icon="faArrowsRotate" />重新检查</button>
        <button class="review-btn primary" type="button" @click="writeReviewRecord">生成复核记录</button>
        <button class="review-btn" type="button" @click="exportIssues"><FontAwesomeIcon :icon="faDownload" />导出问题清单</button>
      </div>
    </header>

    <section class="task-info-strip" aria-label="任务基础信息">
      <div v-for="item in taskInfo" :key="item.label" class="task-info-item">
        <span>{{ item.label }}</span>
        <strong v-if="item.type !== 'status'">{{ item.value }}</strong>
        <em v-else>{{ item.value }}</em>
      </div>
    </section>

    <div class="review-layout">
      <aside class="upload-panel" aria-labelledby="upload-rule-title">
        <h3 id="upload-rule-title">上传与规则</h3>
        <div class="field-block">
          <span class="field-label">已上传文件</span>
          <div class="file-chip">
            <span class="file-icon word"><FontAwesomeIcon :icon="faFileWord" /></span>
            <div>
              <strong title="审计报告_上海分公司_Q1.docx">审计报告_上海分公司_Q1.docx</strong>
              <p>2.45 MB 上传于 2025-04-28 14:35:12</p>
            </div>
            <FontAwesomeIcon class="ok-mark" :icon="faCircleCheck" />
          </div>
        </div>

        <label v-for="select in ruleSelects" :key="select.label" class="field-block">
          <span class="field-label">
            {{ select.label }}
            <button v-if="select.link" class="text-link" type="button" @click="notice('已打开常规报告审核规则 V1.6。')">查看规则</button>
          </span>
          <select :value="select.value" aria-label="select.label">
            <option>{{ select.value }}</option>
          </select>
        </label>

        <div class="field-block">
          <span class="field-label">检查范围</span>
          <div class="radio-row">
            <label><input type="radio" checked />全篇检查</label>
            <label><input type="radio" />指定章节检查</label>
          </div>
        </div>

        <div class="upload-actions">
          <button type="button" @click="notice('已进入上传新版本。')">上传报告</button>
          <button type="button" @click="recheck">执行检查</button>
        </div>
        <p class="upload-tip">支持 Word / PDF 格式，单个文件最大 100MB</p>
      </aside>

      <main class="review-center" aria-label="审核执行工作区">
        <section class="progress-panel">
          <div class="stage-flow" aria-label="审核进度">
            <div v-for="(stage, index) in stages" :key="stage.name" class="stage-item" :class="stage.state">
              <span class="stage-node">{{ stage.state === 'done' ? '' : index + 1 }}<FontAwesomeIcon v-if="stage.state === 'done'" :icon="faCircleCheck" /></span>
              <strong>{{ stage.name }}</strong>
              <small>{{ stage.time }}</small>
            </div>
          </div>

          <div class="metric-row">
            <article v-for="metric in metrics" :key="metric.label" class="review-metric" :class="metric.tone">
              <span class="metric-icon"><FontAwesomeIcon :icon="metric.icon" /></span>
              <div>
                <span>{{ metric.label }}</span>
                <strong>{{ metric.value }}<small>{{ metric.unit }}</small></strong>
                <p>{{ metric.hint }}</p>
              </div>
            </article>
          </div>
        </section>

        <section class="workbench-panel">
          <div class="issue-list-card">
            <h3>审核问题清单</h3>
            <nav class="issue-tabs" aria-label="问题分类">
              <button v-for="tab in issueTabs" :key="tab" type="button" :class="{ active: tab.startsWith('全部') }">{{ tab }}</button>
            </nav>
            <div class="issue-table-wrap">
              <table class="issue-table">
                <thead>
                  <tr>
                    <th>问题编号</th>
                    <th>问题类型</th>
                    <th>位置</th>
                    <th>页码</th>
                    <th>风险等级</th>
                    <th>建议处理</th>
                    <th>建议状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="issue in issues" :key="issue.issueId" :class="{ selected: issue.issueId === selectedIssue.issueId }" @click="selectIssue(issue)">
                    <td>{{ issue.issueId }}</td>
                    <td>{{ issue.type }}</td>
                    <td>{{ issue.location }}</td>
                    <td>{{ issue.page }}</td>
                    <td><span class="risk-tag" :class="issue.riskTone">{{ issue.risk }}</span></td>
                    <td>{{ issue.suggestionType }}</td>
                    <td><span class="status-pill" :class="issue.statusTone">{{ issue.status }}</span></td>
                    <td class="table-actions">
                      <button type="button" @click.stop="locate(issue)">定位</button>
                      <button type="button" @click.stop="applySuggestion(issue)">采纳建议</button>
                      <button type="button" @click.stop="ignoreSuggestion(issue)">忽略</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="preview-card">
            <div class="preview-head">
              <h3>报告定位预览</h3>
              <div class="preview-tools" aria-label="预览工具">
                <button type="button"><FontAwesomeIcon :icon="faChevronLeft" /></button>
                <span>2 / 56</span>
                <button type="button"><FontAwesomeIcon :icon="faChevronRight" /></button>
                <select aria-label="缩放比例"><option>100%</option></select>
                <button type="button"><FontAwesomeIcon :icon="faMinus" /></button>
                <button type="button"><FontAwesomeIcon :icon="faPlus" /></button>
                <button type="button"><FontAwesomeIcon :icon="faDownload" /></button>
                <button type="button"><FontAwesomeIcon :icon="faMagnifyingGlass" /></button>
              </div>
            </div>

            <article class="report-page">
              <section class="doc-section">
                <h4>二、审计范围 <span class="pin danger">1</span></h4>
                <p class="marked danger">本次审计范围包括上海分公司 2025 年 1 月 1 日至 2025 年 3 月 31 日期间的财务收支、费用管理、业务运营及相关内控制度。</p>
              </section>
              <section class="doc-section">
                <h4>三、审计发现的主要问题</h4>
                <h5>（一）费用管理方面</h5>
                <p class="marked warning">部分费用报销未附完整审批说明，存在跨层级补充不到位的情况。<span class="pin warning">2</span></p>
              </section>
              <table class="doc-table">
                <caption>表 3　报销费用统计表 <span class="pin blue">4</span></caption>
                <thead><tr><th>费用类别</th><th>报销笔数</th><th>金额（元）</th><th>占比（%）</th></tr></thead>
                <tbody>
                  <tr><td>差旅费</td><td>125</td><td>268,650.00</td><td>35.62</td></tr>
                  <tr><td>业务招待费</td><td>56</td><td>176,300.00</td><td>23.37</td></tr>
                  <tr><td>办公费</td><td>78</td><td>98,540.00</td><td>13.06</td></tr>
                  <tr><td>会议费</td><td>42</td><td>72,600.00</td><td>9.62</td></tr>
                  <tr><td>其他</td><td>35</td><td>64,960.00</td><td>8.61</td></tr>
                  <tr><td>合计</td><td>336</td><td>680,950.00</td><td>90.28</td></tr>
                </tbody>
              </table>
            </article>
            <div class="legend-row">
              <span><i class="danger"></i>标题编号</span>
              <span><i class="warning"></i>文字优化</span>
              <span><i class="danger"></i>依据完整性</span>
              <span><i class="blue"></i>表格问题</span>
            </div>
          </div>
        </section>
      </main>

      <aside class="detail-panel" aria-labelledby="issue-detail-title">
        <header>
          <h3 id="issue-detail-title">问题详情与处理</h3>
          <button type="button" aria-label="关闭问题详情" @click="notice('问题详情已收起。')"><FontAwesomeIcon :icon="faXmark" /></button>
        </header>

        <section class="detail-section basic">
          <div class="section-head">
            <h4>基本信息</h4>
            <span class="risk-badge">高风险</span>
          </div>
          <dl>
            <div><dt>问题编号</dt><dd>{{ selectedIssue.issueId }}</dd></div>
            <div><dt>问题类型</dt><dd>{{ selectedIssue.type }}</dd></div>
            <div><dt>所在位置</dt><dd>{{ selectedIssue.page }}</dd></div>
            <div><dt>问题描述</dt><dd>{{ selectedIssue.description }}</dd></div>
            <div><dt>当前状态</dt><dd>{{ selectedIssue.status }}</dd></div>
          </dl>
        </section>

        <section class="detail-section">
          <div class="section-head">
            <h4>规则依据</h4>
            <button class="text-link" type="button" @click="notice('已打开规则详情。')">查看规则</button>
          </div>
          <dl>
            <div><dt>依据条款</dt><dd>《常规报告审核规则》第 3.2.1 条</dd></div>
            <div><dt>要求</dt><dd>标题编号应采用国家标准 GB/T 1.1-2020 规定的层级格式。</dd></div>
          </dl>
        </section>

        <section class="detail-section">
          <h4>修改建议</h4>
          <p>将标题修改为 “（二）审计范围”，保持与前文标题编号格式一致</p>
        </section>

        <section class="detail-section">
          <h4>修改前后对比</h4>
          <div class="compare-row">
            <div><span>修改前</span><strong class="before">二、审计范围</strong></div>
            <div><span>修改后</span><strong class="after">（二）审计范围</strong></div>
          </div>
        </section>

        <section class="detail-section">
          <h4>处理意见</h4>
          <div class="radio-row detail-radio">
            <label><input v-model="decision" type="radio" value="采纳建议" />采纳建议</label>
            <label><input v-model="decision" type="radio" value="忽略建议" />忽略建议</label>
            <label><input v-model="decision" type="radio" value="标记已修复" />标记已修复</label>
          </div>
          <label class="comment-box">
            <textarea ref="commentInput" v-model="comment" maxlength="200" placeholder="请输入处理说明（选填）"></textarea>
            <span>{{ comment.length }}/200</span>
          </label>
        </section>

        <section class="detail-section log-section">
          <h4>操作记录</h4>
          <ul>
            <li><span>2025-04-28 14:38</span><b>系统</b><em>自动检查发现问题</em></li>
            <li><span>2025-04-28 14:40</span><b>审计员A</b><em>查看问题详情</em></li>
          </ul>
        </section>

        <footer class="detail-actions">
          <div>
            <button type="button" class="primary" @click="applySuggestion(selectedIssue)">采纳建议</button>
            <button type="button" @click="ignoreSuggestion(selectedIssue)">忽略建议</button>
            <button type="button" @click="markFixed(selectedIssue)">标记已修复</button>
          </div>
          <button type="button" class="primary wide" @click="writeReviewRecord">写入复核记录</button>
        </footer>
      </aside>

      <section class="export-panel">
        <h3>复核与导出</h3>
        <div class="export-grid">
          <article v-for="file in exportFiles" :key="file.name">
            <span class="file-icon" :class="file.tone"><FontAwesomeIcon :icon="file.icon" /></span>
            <strong>{{ file.name }}</strong>
            <p>{{ file.type }}</p>
            <small>{{ file.size }}</small>
          </article>
        </div>
      </section>

      <section class="version-panel">
        <h3>版本记录时间线</h3>
        <div class="version-line">
          <article v-for="version in versions" :key="version.no" :class="{ current: version.current }">
            <span></span>
            <strong>{{ version.no }}</strong>
            <b>{{ version.title }}</b>
            <small>{{ version.time }}</small>
            <em>{{ version.user }}</em>
          </article>
        </div>
        <footer>
          <span>当前版本： V1.1（人工处理中）</span>
          <button class="text-link" type="button" @click="notice('已打开全部版本记录。')">查看全部版本记录 &gt;</button>
        </footer>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, nextTick, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faArrowsRotate,
  faBell,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faDownload,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faFileWord,
  faMagnifyingGlass,
  faMinus,
  faPlus,
  faShieldHalved,
  faTriangleExclamation,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

const store = inject('store');

const taskInfo = [
  { label: '被审计单位', value: '上海分公司' },
  { label: '审计期间', value: '2025Q1 (2025-01-01 ~ 2025-03-31)' },
  { label: '报告类型', value: '营业部常规审计报告' },
  { label: '检查规则', value: '常规报告审核规则 V1.6' },
  { label: '任务状态', value: '检查完成', type: 'status' },
  { label: '完成时间', value: '2025-04-28 14:50:21' },
  { label: '创建人', value: '审计管理员' }
];

const ruleSelects = [
  { label: '报告类型', value: '营业部常规审计报告' },
  { label: '母版版本', value: '营业部报告模板 V2.0' },
  { label: '检查规则', value: '常规报告审核规则 V1.6', link: true }
];

const stages = [
  { name: '上传报告', time: '04-28 14:35', state: 'done' },
  { name: '解析文档', time: '04-28 14:36', state: 'done' },
  { name: '格式检查', time: '04-28 14:38', state: 'done' },
  { name: '内容优化', time: '04-28 14:44', state: 'done' },
  { name: '人工处理', time: '进行中', state: 'current' },
  { name: '形成复核记录', time: '待开始', state: 'todo' }
];

const metrics = computed(() => [
  { label: '问题总数', value: 23, unit: '项', hint: '较上次 -5 项', tone: 'total', icon: faFilePdf },
  { label: '高风险', value: 4, unit: '项', hint: '较上次 -2 项', tone: 'danger', icon: faShieldHalved },
  { label: '中风险', value: 11, unit: '项', hint: '较上次 -2 项', tone: 'warning', icon: faTriangleExclamation },
  { label: '低风险', value: 8, unit: '项', hint: '较上次 -1 项', tone: 'blue', icon: faBell },
  { label: '已采纳建议', value: 6, unit: '项', hint: '采纳率 26.1%', tone: 'success', icon: faCircleCheck }
]);

const issueTabs = ['全部问题(23)', '格式问题', '字体字号', '标题编号', '表格问题(3)', '依据完整性(3)', '文字优化(2)'];
const issues = ref(createIssues());
const selectedIssueId = ref('F-2025-00023');
const selectedIssue = computed(() => issues.value.find((issue) => issue.issueId === selectedIssueId.value) || issues.value[0]);
const decision = ref('采纳建议');
const comment = ref('');
const commentInput = ref(null);

const exportFiles = [
  { name: '审核问题清单', type: 'Excel', size: '24KB', tone: 'excel', icon: faFileExcel },
  { name: '修订建议', type: 'Word', size: '38KB', tone: 'word', icon: faFileWord },
  { name: '复核记录（草稿）', type: 'PDF', size: '156KB', tone: 'pdf', icon: faFilePdf },
  { name: '操作日志', type: 'CSV', size: '18KB', tone: 'csv', icon: faFileCsv }
];

const versions = [
  { no: 'V0.1', title: '上传版本', time: '2025-04-28 14:35', user: '审计管理员' },
  { no: 'V1.0', title: '检查完成', time: '2025-04-28 14:50', user: '系统' },
  { no: 'V1.1', title: '人工处理中', time: '2025-04-28 15:02', user: '审计员A', current: true },
  { no: 'V1.2', title: '复核报告', time: '待开启', user: '' }
];

function createIssues() {
  const base = [
    ['F-2025-00023', '标题编号', 'P53审计范围', '第 2 页', '高风险', '定位修正', '待处理', '二级标题“审计范围”编号格式应为“（二）”'],
    ['F-2025-00022', '表格问题', 'P8-清单3', '第 8 页', '中风险', '补充说明', '待处理', '表格标题与正文引用编号不一致'],
    ['F-2025-00021', '依据完整性', 'P12费用', '第 12 页', '高风险', '补充依据', '待处理', '费用结论缺少对应抽样依据'],
    ['F-2025-00020', '字体字号', 'P55章节标题', '第 11 页', '低风险', '统一为 4号', '已采纳', '标题字号与模板不一致'],
    ['F-2025-00019', '文字优化', 'P16段落', '第 3 页', '低风险', '优化表述', '待处理', '段落表述偏口语化'],
    ['F-2025-00018', '表格问题', 'P20表格', '第 5 页', '低风险', '合并标题', '已采纳', '表头层级不清晰'],
    ['F-2025-00017', '依据完整性', 'P23审计发现', '第 9 页', '中风险', '引用缺失', '待处理', '审计发现缺少数据来源说明'],
    ['F-2025-00016', '格式问题', 'P32页码', '封面', '中风险', '补充页码', '待处理', '封面页码格式不符合模板']
  ];
  return base.map(([issueId, type, location, page, risk, suggestionType, status, description]) => ({
    issueId,
    type,
    location,
    page,
    risk,
    suggestionType,
    status,
    description,
    riskTone: risk === '高风险' ? 'danger' : risk === '中风险' ? 'warning' : 'low',
    statusTone: status === '已采纳' ? 'done' : 'pending'
  }));
}

function selectIssue(issue) {
  selectedIssueId.value = issue.issueId;
}

function locate(issue) {
  selectIssue(issue);
  issue.status = '已定位';
  issue.statusTone = 'located';
  store.addLog('报告审核问题定位', '审核问题', issue.issueId);
  notice(`${issue.issueId} 已定位到报告预览第 2 页。`);
}

function recheck() {
  const firstPending = issues.value.find((issue) => issue.status === '待处理');
  if (firstPending) {
    firstPending.status = '已定位';
    firstPending.statusTone = 'located';
  }
  store.db.recheckRecords.unshift({ recordId: `RC-${Date.now()}`, result: '重新检查完成，剩余 17 项待处理', createdBy: store.db.currentUser.name });
  store.addLog('报告审核重新检查', '报告审核', 'CHK-RPT-001');
  notice('重新检查已完成，问题状态和复查记录已同步。');
}

function applySuggestion(issue) {
  selectIssue(issue);
  issue.status = '已采纳';
  issue.statusTone = 'done';
  decision.value = '采纳建议';
  store.addLog('采纳报告审核建议', '审核问题', issue.issueId);
  notice(`${issue.issueId} 已采纳系统建议。`);
}

async function ignoreSuggestion(issue) {
  selectIssue(issue);
  decision.value = '忽略建议';
  if (!comment.value.trim()) {
    notice('请先填写忽略原因，再忽略建议。');
    await nextTick();
    commentInput.value?.focus();
    return;
  }
  issue.status = '已忽略';
  issue.statusTone = 'ignored';
  store.addLog('忽略报告审核建议', '审核问题', issue.issueId);
  notice(`${issue.issueId} 已记录忽略原因。`);
}

function markFixed(issue) {
  selectIssue(issue);
  issue.status = '已修复';
  issue.statusTone = 'done';
  decision.value = '标记已修复';
  store.addLog('标记报告审核问题已修复', '审核问题', issue.issueId);
  notice(`${issue.issueId} 已标记为已修复。`);
}

function writeReviewRecord() {
  store.db.reviewRecords.unshift({
    reviewLogId: `REV-${Date.now()}`,
    objectName: `${selectedIssue.value.issueId} / ${selectedIssue.value.description}`,
    reviewer: store.db.currentUser.name,
    action: `报告审核处理：${decision.value}`,
    result: '成功',
    createdAt: store.now()
  });
  store.addLog('写入报告审核复核记录', '审核问题', selectedIssue.value.issueId);
  notice('复核记录已写入记录中心。');
}

function exportIssues() {
  if (typeof store.downloadCheckResult === 'function') {
    store.downloadCheckResult();
    notice('审核问题清单已导出 Excel，并写入导出记录。');
  } else {
    notice('审核问题清单已导出。');
  }
}

function notice(message) {
  store.setNotice(message);
}

</script>

<style scoped>
.report-review-page {
  --review-red: var(--color-primary);
  --review-red-dark: var(--color-primary-dark);
  --review-line: #dfe5ee;
  --review-soft: var(--color-bg);
  --review-muted: #6b7280;
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  display: flex;
  height: 0;
  min-height: 0;
  flex-direction: column;
  overflow: auto;
  margin: 0;
  color: #111827;
  font-size: 12px;
}

.review-titlebar {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  border-bottom: 2px solid var(--review-red);
}

.review-titlebar h2 {
  font-size: 23px;
  line-height: 1;
}

.review-actions {
  display: flex;
  gap: 8px;
}

.review-btn {
  height: 30px;
  min-width: 72px;
  padding: 0 14px;
  border: 1px solid #cfd6e2;
  border-radius: 3px;
  background: #fff;
  color: #111827;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
}

.review-btn.primary,
.detail-actions .primary,
.upload-actions button:first-child {
  border-color: var(--review-red);
  background: var(--review-red);
  color: #fff;
}

.task-info-strip {
  height: 63px;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: center;
  margin-bottom: 12px;
  border: 1px solid var(--review-line);
  background: #fff;
}

.task-info-item {
  min-width: 0;
  height: 38px;
  display: grid;
  align-content: center;
  gap: 7px;
  padding: 0 16px;
  border-right: 1px solid #edf0f5;
}

.task-info-item:last-child {
  border-right: 0;
}

.task-info-item span {
  color: var(--review-muted);
  font-size: 11px;
}

.task-info-item strong {
  overflow: hidden;
  color: #111827;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-info-item em {
  width: max-content;
  padding: 3px 8px;
  border-radius: 3px;
  background: #e8f8ef;
  color: #138a4a;
  font-style: normal;
  font-weight: 700;
}

.review-layout {
  display: grid;
  grid-template-columns: minmax(210px, 240px) minmax(0, 1fr) minmax(300px, 360px);
  grid-template-rows: auto auto;
  gap: 14px;
}

.upload-panel,
.progress-panel,
.issue-list-card,
.preview-card,
.detail-panel,
.export-panel,
.version-panel {
  border: 1px solid var(--review-line);
  border-radius: 4px;
  background: #fff;
}

.upload-panel {
  grid-row: 1;
  padding: 17px 12px;
}

.upload-panel h3,
.export-panel h3,
.version-panel h3 {
  margin-bottom: 16px;
  font-size: 13px;
}

.field-block {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.field-label {
  display: flex;
  justify-content: space-between;
  color: #4b5563;
  font-size: 11px;
  font-weight: 700;
}

.file-chip {
  height: 58px;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 8px;
  padding: 9px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #fbfdff;
}

.file-chip strong {
  display: block;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-chip p,
.upload-tip {
  color: var(--review-muted);
  font-size: 11px;
  line-height: 1.4;
}

.file-icon {
  width: 24px;
  height: 24px;
  border-radius: 3px;
  display: inline-grid;
  place-items: center;
  color: #fff;
}

.file-icon.word,
.file-icon.csv { background: var(--color-info); }
.file-icon.excel { background: var(--color-success); }
.file-icon.pdf { background: var(--color-primary); }
.ok-mark { color: var(--color-success); }

select {
  width: 100%;
  height: 32px;
  padding: 0 9px;
  border: 1px solid #d4dbe6;
  border-radius: 3px;
  background: #fff;
  color: #111827;
  font-size: 12px;
}

.text-link {
  border: 0;
  background: transparent;
  color: var(--color-info);
  font-size: 11px;
  font-weight: 700;
}

.radio-row {
  display: flex;
  gap: 26px;
  align-items: center;
}

.radio-row label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #374151;
  white-space: nowrap;
}

input[type="radio"] {
  accent-color: var(--review-red);
}

.upload-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 22px;
}

.upload-actions button {
  height: 35px;
  border: 1px solid var(--review-red);
  border-radius: 3px;
  background: #fff;
  color: var(--review-red);
  font-weight: 700;
}

.upload-tip {
  margin-top: 12px;
}

.review-center {
  min-width: 0;
}

.progress-panel {
  height: 169px;
  padding: 18px 14px 12px;
  margin-bottom: 14px;
}

.stage-flow {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  margin-bottom: 19px;
}

.stage-item {
  position: relative;
  display: grid;
  gap: 5px;
  color: #111827;
}

.stage-item::before {
  content: "";
  position: absolute;
  top: 8px;
  left: 24px;
  right: 9px;
  height: 2px;
  background: #cbd5e1;
}

.stage-item.done::before { background: #15803d; }
.stage-item.current::before { background: var(--review-red); }
.stage-item:last-child::before { display: none; }

.stage-node {
  position: relative;
  z-index: 1;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  background: #fff;
  color: #6b7280;
  font-size: 10px;
  font-weight: 800;
}

.stage-item.done .stage-node {
  color: #11823b;
}

.stage-item.current .stage-node {
  background: var(--review-red);
  color: #fff;
}

.stage-item strong {
  font-size: 12px;
}

.stage-item small {
  color: #6b7280;
  font-size: 10px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.review-metric {
  height: 72px;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  gap: 9px;
  padding: 9px;
  border: 1px solid #e5eaf2;
  border-radius: 5px;
  background: #fff;
}

.metric-icon {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.review-metric.total .metric-icon,
.review-metric.danger .metric-icon { background: #ffe8e8; color: var(--color-danger); }
.review-metric.warning .metric-icon { background: #fff3df; color: #f08a00; }
.review-metric.blue .metric-icon { background: #eaf3ff; color: #2b77e5; }
.review-metric.success .metric-icon { background: #e8f8ef; color: var(--color-success); }

.review-metric span {
  color: #4b5563;
  font-size: 11px;
  font-weight: 700;
}

.review-metric strong {
  display: block;
  margin: 2px 0;
  font-size: 23px;
}

.review-metric strong small {
  margin-left: 2px;
  font-size: 11px;
}

.review-metric p {
  color: #6b7280;
  font-size: 10px;
  line-height: 1;
}

.workbench-panel {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 10px;
  height: 432px;
}

.issue-list-card,
.preview-card {
  min-width: 0;
  padding: 10px;
  overflow: hidden;
}

.issue-list-card h3,
.preview-card h3 {
  margin-bottom: 10px;
  font-size: 13px;
}

.issue-tabs {
  display: flex;
  gap: 7px;
  height: 26px;
  overflow: hidden;
  border-bottom: 1px solid #eef2f7;
}

.issue-tabs button {
  border: 0;
  background: transparent;
  color: #4b5563;
  font-size: 9px;
  white-space: nowrap;
}

.issue-tabs button.active {
  color: var(--review-red);
  font-weight: 800;
}

.issue-table-wrap {
  height: 354px;
  overflow: auto;
}

.issue-table {
  width: 100%;
  min-width: 0;
  border-collapse: collapse;
}

.issue-table th,
.issue-table td {
  padding: 8px 6px;
  border-bottom: 1px solid #edf1f6;
  font-size: 10px;
  white-space: nowrap;
}

.issue-table th {
  background: #f8fafc;
  color: #697386;
}

.issue-table tr.selected td {
  background: #fff5f5;
}

.risk-tag,
.status-pill {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border-radius: 3px;
  font-weight: 800;
}

.risk-tag.danger { background: #ffe8e8; color: var(--color-danger); }
.risk-tag.warning { background: #fff3df; color: #e67800; }
.risk-tag.low { background: #e8f8ef; color: var(--color-success); }
.status-pill.pending { background: #fff5e6; color: #e67800; }
.status-pill.done { background: #e8f8ef; color: var(--color-success); }
.status-pill.located { background: #eaf3ff; color: #2b77e5; }
.status-pill.ignored { background: #f1f5f9; color: #64748b; }

.table-actions {
  display: flex;
  gap: 7px;
}

.table-actions button {
  border: 0;
  background: transparent;
  color: var(--color-info);
  font-size: 10px;
}

.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-tools {
  display: flex;
  align-items: center;
  gap: 4px;
}

.preview-tools button,
.preview-tools select {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid #d7dee9;
  border-radius: 3px;
  background: #fff;
  color: #374151;
  font-size: 10px;
}

.preview-tools span {
  min-width: 44px;
  text-align: center;
  color: #4b5563;
}

.preview-tools select {
  width: 54px;
}

.report-page {
  height: 327px;
  padding: 22px 24px 10px;
  border: 1px solid #e4e9f1;
  border-radius: 4px;
  background: #fff;
  box-shadow: inset 0 0 0 1px #f5f7fb;
}

.doc-section {
  margin-bottom: 8px;
}

.doc-section h4 {
  margin-bottom: 6px;
  font-size: 13px;
}

.doc-section h5 {
  margin: 4px 0;
  font-size: 12px;
}

.marked {
  position: relative;
  padding: 6px 10px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 10px;
  line-height: 1.35;
}

.marked.danger { border-color: #ff7b7b; background: #fffafa; }
.marked.warning { border-color: #ffb25a; background: #fffdf8; }

.pin {
  min-width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  color: #fff;
  font-size: 9px;
  font-weight: 900;
}

.pin.danger { background: #e00000; }
.pin.warning { background: var(--color-warning); }
.pin.blue { background: #2b77e5; }

.doc-table {
  width: 100%;
  min-width: 0;
  border-collapse: collapse;
  font-size: 9px;
  line-height: 1.12;
}

.doc-table caption {
  margin-bottom: 3px;
  text-align: left;
  font-weight: 700;
}

.doc-table th,
.doc-table td {
  padding: 1px 5px;
  border: 1px solid #e1e7f0;
  text-align: center;
  font-size: 10px;
}

.legend-row {
  height: 38px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  align-items: center;
  color: #374151;
  font-size: 10px;
}

.legend-row span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.legend-row i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.legend-row .danger { background: #e00000; }
.legend-row .warning { background: var(--color-warning); }
.legend-row .blue { background: #2b77e5; }

.detail-panel {
  grid-column: 3;
  grid-row: 1 / 3;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 12px 14px 98px;
  overflow: hidden;
}

.detail-panel > header {
  height: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.detail-panel h3 {
  font-size: 14px;
}

.detail-panel > header button {
  border: 0;
  background: transparent;
  color: #374151;
}

.detail-section {
  padding: 5px 0;
  border-bottom: 1px solid #edf1f6;
}

.detail-section h4,
.section-head h4 {
  margin-bottom: 4px;
  font-size: 12px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.risk-badge {
  padding: 4px 8px;
  border-radius: 3px;
  background: #ffe8e8;
  color: var(--color-danger);
  font-weight: 800;
}

dl {
  display: grid;
  gap: 3px;
  margin: 0;
}

dl div {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 8px;
}

dt {
  color: #6b7280;
}

dd {
  margin: 0;
  color: #111827;
  line-height: 1.22;
}

.detail-section p {
  color: #111827;
  font-size: 12px;
  line-height: 1.25;
}

.compare-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.compare-row div {
  display: grid;
  gap: 3px;
}

.compare-row span {
  color: #6b7280;
}

.compare-row strong {
  height: 27px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 4px;
  font-size: 12px;
}

.compare-row .before {
  border: 1px solid #ffb3b3;
  background: #fff5f5;
  color: var(--color-primary-dark);
}

.compare-row .after {
  border: 1px solid #a8dfc0;
  background: #f0fbf6;
  color: #12805c;
}

.detail-radio {
  justify-content: space-between;
  gap: 8px;
}

.detail-radio label {
  font-size: 11px;
}

.comment-box {
  position: relative;
  display: block;
  margin-top: 7px;
}

.comment-box textarea {
  width: 100%;
  height: 42px;
  resize: none;
  padding: 10px;
  border: 1px solid #d7dee9;
  border-radius: 4px;
  color: #111827;
  font-size: 12px;
}

.comment-box span {
  position: absolute;
  right: 8px;
  bottom: 6px;
  color: #6b7280;
  font-size: 10px;
}

.log-section ul {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.log-section li {
  display: grid;
  grid-template-columns: 82px 42px 1fr;
  gap: 8px;
  color: #4b5563;
  font-size: 11px;
}

.log-section b,
.log-section em {
  font-style: normal;
  font-weight: 400;
}

.detail-actions {
  position: absolute;
  right: 14px;
  bottom: 14px;
  left: 14px;
  padding-top: 7px;
  background: #fff;
}

.detail-actions div {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 7px;
}

.detail-actions button {
  height: 30px;
  border: 1px solid #ef9a9a;
  border-radius: 4px;
  background: #fff;
  color: var(--review-red);
  font-weight: 800;
}

.detail-actions .wide {
  width: 100%;
}

.export-panel {
  grid-column: 1;
  grid-row: 2;
  padding: 13px 12px;
}

.export-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.export-grid article {
  height: 89px;
  display: grid;
  grid-template-columns: 28px 1fr;
  grid-template-rows: 24px 19px 18px;
  gap: 4px 9px;
  align-content: center;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.export-grid .file-icon {
  grid-row: 1 / 4;
}

.export-grid strong {
  font-size: 12px;
}

.export-grid p,
.export-grid small {
  color: #4b5563;
}

.version-panel {
  grid-column: 2;
  grid-row: 2;
  padding: 13px 12px;
}

.export-panel {
  min-width: 0;
}

.version-line {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  position: relative;
  margin: 22px 24px 12px;
}

.version-line::before {
  content: "";
  position: absolute;
  top: 8px;
  left: 10px;
  right: 10px;
  height: 2px;
  background: #8aa5ca;
}

.version-line article {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 3px;
  color: #374151;
}

.version-line article span {
  z-index: 1;
  width: 14px;
  height: 14px;
  border: 3px solid #fff;
  border-radius: 50%;
  background: var(--color-info);
  box-shadow: 0 0 0 1px #8aa5ca;
}

.version-line article.current span {
  background: var(--review-red);
  box-shadow: 0 0 0 2px #ffb6b6;
}

.version-line strong,
.version-line b,
.version-line small,
.version-line em {
  font-size: 10px;
  font-style: normal;
}

.version-line b {
  font-weight: 800;
}

.version-line small,
.version-line em {
  color: #6b7280;
}

.version-panel footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #374151;
}

@media (max-width: 1199px) {
  .review-titlebar,
  .task-info-strip,
  .review-layout,
  .workbench-panel,
  .export-grid,
  .detail-actions div {
    display: grid;
    grid-template-columns: 1fr;
    height: auto;
  }

  .review-titlebar {
    gap: 12px;
    align-items: start;
  }

  .review-actions,
  .task-info-strip {
    overflow-x: auto;
  }

  .review-layout {
    grid-template-rows: auto;
  }

  .detail-panel,
  .export-panel,
  .version-panel {
    grid-column: auto;
    grid-row: auto;
    width: auto;
    transform: none;
  }
}

@media (min-width: 1200px) and (max-width: 1700px) {
  .review-layout {
    grid-template-columns: minmax(210px, 240px) minmax(0, 1fr);
  }

  .workbench-panel {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }

  .issue-table {
    min-width: 780px;
  }

  .preview-card {
    min-height: 432px;
  }

  .detail-panel,
  .export-panel,
  .version-panel {
    grid-column: 1 / -1;
    grid-row: auto;
    width: auto;
    transform: none;
  }
}

@media (min-width: 1701px) and (max-width: 2150px) {
  .issue-table th:nth-child(3),
  .issue-table td:nth-child(3),
  .issue-table th:nth-child(4),
  .issue-table td:nth-child(4) {
    display: none;
  }
}

@media (min-width: 1701px) {
  .report-review-page {
    overflow: hidden;
  }

  .review-layout {
    min-height: 0;
    flex: 1;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .review-center {
    display: flex;
    min-height: 0;
    flex-direction: column;
  }

  .workbench-panel {
    height: auto;
    min-height: 0;
    flex: 1;
  }

  .issue-list-card,
  .preview-card,
  .detail-panel {
    min-height: 0;
  }

  .issue-list-card,
  .preview-card {
    display: flex;
    flex-direction: column;
  }

  .issue-table-wrap,
  .report-page {
    height: auto;
    min-height: 0;
    flex: 1;
    overflow: auto;
  }
}
</style>
