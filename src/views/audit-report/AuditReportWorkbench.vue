<template>
  <div class="report-ai-page route-fill-page" :class="`mode-${activeMode}`">
    <section class="panel report-closure-strip" aria-live="polite">
      <div><strong>最小演示流程</strong><span>{{ reportDemoState.status }}</span></div>
      <p>业务分析确认 → 生成草稿 → 智能审核 → 导出报告</p>
      <small>导出状态：{{ reportDemoState.exportStatus }}</small>
    </section>
    <template v-if="activeMode === 'generate'">
      <section class="generate-page">
        <section class="panel gen-toolbar">
          <label><span>审计任务</span><select><option>上海分公司 Q1 常规审计任务</option></select></label>
          <label><span>报告类型</span><select><option>审计报告（正式）</option></select></label>
          <label><span>报告模板</span><select><option>常规审计报告模板 V3.2</option></select></label>
          <label><span>输出格式</span><select><option>Word（.docx）</option></select></label>
          <div class="toggle-stack">
            <label><span>AI 标识</span><input type="checkbox" checked /></label>
            <label><span>多模型复核</span><input type="checkbox" checked /></label>
          </div>
          <div class="toolbar-actions">
            <RouterLink class="toolbar-link" to="/materials/import?scene=audit-report">资料导入</RouterLink>
            <RouterLink class="toolbar-link" to="/audit-report/template">模板管理</RouterLink>
            <button class="primary" type="button" @click="store.handleReportDemoAction('generate')">开始生成</button>
            <RouterLink class="toolbar-link" to="/audit-report/workbench?mode=review" @click="store.handleReportDemoAction('review')">提交审核</RouterLink>
            <button class="outline-danger" type="button" @click="store.handleReportDemoAction('export')">导出报告</button>
          </div>
        </section>

        <section class="gen-workspace">
          <aside class="panel chapter-nav">
            <h3>报告章节</h3>
            <input placeholder="搜索章节内容" />
            <ul>
              <li v-for="chapter in chapters" :key="chapter.title">
                <button type="button" class="chapter-row chapter-title-row" :class="{ active: activeChapter === chapter.title }" @click="activeChapter = chapter.title">{{ chapter.title }}</button>
                <button v-for="child in chapter.children" :key="child" type="button" class="chapter-row" :class="{ active: activeChapter === child }" @click="activeChapter = child">{{ child }}</button>
              </li>
            </ul>
            <div class="chapter-add">
              <button type="button" @click="showNotice('已新增章节。')">＋ 新增章节</button>
              <button type="button" aria-label="章节设置" @click="showNotice('已打开章节设置。')">⚙</button>
            </div>
          </aside>

          <main class="panel editor-panel">
            <header>
              <h3>报告编辑预览</h3>
              <div class="editor-tools">
                <span>正文</span><span>微软雅黑</span><span>小四</span><b>B</b><b>I</b><b>U</b><span>A</span><span>≡</span><span>☷</span><span>•</span><span>🔗</span><span>▧</span><span>▦</span><em>格式检查</em>
              </div>
            </header>
            <article class="doc-preview">
              <h2>一、基本情况</h2>
              <h4>（一）被审计单位概况</h4>
              <p class="ai">上海分公司系公司在沪地区的重要经营机构，主要开展经纪业务、信用业务及相关金融服务。<em>依据 3</em></p>
              <h4>（二）审计范围与期间</h4>
              <p>本次审计范围包括上海分公司 2025 年 1 月 1 日至 2025 年 3 月 31 日期间的财务收支、内部控制、业务运营及相关管理活动。<em class="warn">依据 2</em></p>
              <h4>（三）审计依据与方法</h4>
              <p class="ai">本次审计主要依据《中华人民共和国审计法》《证券公司监督管理条例》及公司内部相关制度。<em>依据 4</em></p>
              <h2>二、审计发现的主要问题</h2>
              <h4>（一）内部控制问题</h4>
              <p class="issue">经复核费用报销单据及审批记录，发现存在超预算报销未充分说明、审批层级不完整等情况。<em class="danger">问题 1</em></p>
            </article>
          </main>

          <aside class="panel source-rail">
            <h3>依据来源</h3>
            <nav>
              <button class="active">引用结果</button><button>制度条款</button><button>费用异常</button><button>监督共享资料</button><button>审核建议</button>
            </nav>
            <p>共 18 条引用结果</p>
            <article v-for="item in evidenceItems" :key="item.title">
              <strong><b>{{ item.no }}</b>{{ item.title }}</strong>
              <p>{{ item.desc }}</p>
              <div class="source-meta">
                <small>来源：{{ item.source }}</small>
                <small>匹配度：{{ item.rate }}</small>
                <button type="button" @click="showNotice(`查看原文：${item.title}`)">查看原文</button>
              </div>
            </article>
            <footer><label><input type="checkbox" checked /> 只显示高匹配度（≥80%）</label><button @click="showNotice('依据来源已刷新。')">刷新</button></footer>
          </aside>
        </section>

      </section>
    </template>

    <template v-else>
      <section class="review-page">
        <header class="review-top">
          <h2>报告智能审核</h2>
          <div>
            <button @click="showNotice('已返回任务。')">← 返回任务</button>
            <button @click="showNotice('已上传新版本。')">上传新版本</button>
            <button @click="store.handleReportDemoAction('review')">重新检查</button>
            <button class="primary" @click="store.handleReportDemoAction('review')">完成审核</button>
            <button class="outline-danger" @click="store.handleReportDemoAction('export')">导出问题清单</button>
          </div>
        </header>
        <section class="review-board">
          <section class="panel review-base">
            <span><b>审计单位</b>上海分公司</span><span><b>审计期间</b>2025Q1</span><span><b>报告类型</b>营业部常规审计报告</span><span><b>检查规则</b>常规报告审核规则 V1.6</span><span><b>状态</b><em>检查完成</em></span><span><b>检查完成时间</b>2025-05-10 14:35:21</span>
          </section>

          <aside class="panel upload-rule">
            <h3>上传与规则选择</h3>
            <div class="upload-file">📄 审计报告_上海分公司_Q1.docx <small>24.5 MB｜2025-05-10 14:10:08</small></div>
            <label>报告类型<select><option>营业部常规审计报告</option></select></label>
            <label>模板版本<select><option>常规审计报告模板 V2.0</option></select></label>
            <label>检查规则<select><option>常规报告审核规则 V1.6</option></select></label>
            <label>检查范围<select><option>全文检查（含附件）</option></select></label>
          </aside>

          <section class="panel review-progress">
            <h3>审核进度</h3>
            <div class="audit-steps"><span v-for="step in auditSteps" :key="step.title" :class="step.state"><b>{{ step.no }}</b>{{ step.title }}<small>{{ step.time }}</small></span></div>
            <div class="issue-stats"><article v-for="stat in issueStats" :key="stat.label"><i :class="stat.tone">{{ stat.icon }}</i><div><span>{{ stat.label }}</span><strong>{{ stat.value }}</strong></div></article></div>
          </section>

          <section class="panel upload-check">
            <h3>上传检查</h3>
            <p><em>通过：</em>系统已解析报告正文、内容、依据完整性等基础信息，并给出校验摘要。</p>
          </section>

          <section class="panel issue-list">
            <nav><button class="active">全部问题（23）</button><button>格式问题（8）</button><button>字号字号（3）</button><button>标题编号（4）</button><button>表格问题（2）</button><button>依据完整性（4）</button><button>文字优化（2）</button></nav>
            <table>
              <thead><tr><th>问题编号</th><th>问题类型</th><th>位置</th><th>问题描述</th><th>风险等级</th><th>建议处理</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="item in issues" :key="item.id">
                  <td :title="item.id">{{ item.id }}</td>
                  <td :title="item.type">{{ item.type }}</td>
                  <td :title="item.pos">{{ item.pos }}</td>
                  <td :title="item.desc">{{ item.desc }}</td>
                  <td :title="item.risk"><em :class="item.riskTone">{{ item.risk }}</em></td>
                  <td :title="item.suggest">{{ item.suggest }}</td>
                  <td :title="item.status">{{ item.status }}</td>
                  <td title="定位、采纳建议、忽略、人工修改"><button @click="selectedIssue = item">定位</button><button>采纳建议</button><button>忽略</button><button>人工修改</button></td>
                </tr>
              </tbody>
            </table>
            <footer><span>共 23 条</span><div><button>‹</button><button class="active">1</button><button>2</button><button>3</button><button>›</button></div><span>10 条/页　跳至 <input value="1" readonly /> 页</span></footer>
          </section>

          <section class="panel report-preview">
            <h3>报告定位预览</h3>
            <header><span>第 15 页⌄</span><span>−</span><span>100%</span><span>＋</span><span>适应宽度⌄</span><span>⛶</span></header>
            <article>
              <b class="mark-dot dot-1">1</b><b class="mark-dot dot-2">2</b><b class="mark-dot dot-3">3</b><b class="mark-dot dot-4">4</b>
              <h3>二、审计发现的主要问题</h3>
              <h4>（一）客户管理方面</h4>
              <p><mark>部分客户适当性评估提示与实际风险承受能力不匹配，未能有效识别客户风险承受能力。</mark></p>
              <p>上述问题主要发生在部分新开户及存量客户等级调整过程中，涉及 123 户客户，占抽样客户总数的12.34%。</p>
              <h4>（二）业务操作方面</h4>
              <p>个别客户信息更新记录不完整，未能获取客户资金来源等关键信息。</p>
            </article>
          </section>

          <section class="panel export-row">
            <h3>复核与导出</h3>
            <article v-for="item in exportItems" :key="item.title"><div class="export-logo"><i :class="item.tone">{{ item.icon }}</i><button>查看</button></div><div class="export-copy"><strong>{{ item.title }}</strong><small>{{ item.format }}</small><em>{{ item.desc }}</em><button>下载</button></div></article>
          </section>

          <section class="panel version-line">
            <header><h3>版本时间线</h3><p><span class="done">已完成</span><span class="active">进行中</span><span class="todo">待处理</span></p></header>
            <div><span class="done">上线 V1<br><small>2025-05-10<br />14:10</small></span><span class="done">检查完成<br><small>2025-05-10<br />14:21</small></span><span class="active">人工处理<br><small>2025-05-10<br />14:21</small></span><span class="todo">复核归档<br><small>待生成</small></span></div>
          </section>

          <aside class="panel issue-detail">
            <header><h3>问题详情与处理</h3><button>×</button></header>
            <nav><button class="active">基本信息</button><button>规则依据</button><button>修改建议</button><button>修改前后对比</button><button>处理记录</button></nav>
            <dl>
              <dt>问题编号</dt><dd>{{ selectedIssue.id }}</dd><dt>问题类型</dt><dd>{{ selectedIssue.type }}</dd><dt>位置</dt><dd>{{ selectedIssue.pos }}</dd><dt>风险等级</dt><dd><em>{{ selectedIssue.risk }}</em></dd><dt>检查规则</dt><dd>常规报告审核规则 V1.6 - 第3.2条</dd><dt>问题描述</dt><dd>{{ selectedIssue.desc }}</dd><dt>综合建议</dt><dd>建议补充风险成因分析与影响范围说明，并引用相关依据。</dd>
            </dl>
            <h4>处理意见</h4>
            <div class="radio-row"><label><input type="radio" checked /> 采纳建议</label><label><input type="radio" /> 忽略建议</label><label><input type="radio" /> 标记已修复</label></div>
            <textarea placeholder="请输入处理说明（选填）"></textarea>
            <h4>操作记录</h4>
            <div class="operation-record">
              <span>时间</span><span>操作人</span><span>操作</span><span>结果</span>
              <strong title="2025-05-10 14:21:33">2025-05-10 14:21:33</strong><strong title="系统">系统</strong><strong title="问题创建">问题创建</strong><strong title="--">--</strong>
            </div>
            <footer><button class="primary">采纳建议</button><button>忽略建议</button><button>标记已修复</button><button class="wide">写入复核记录</button></footer>
          </aside>
        </section>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const store = inject('store');
const activeMode = computed(() => route.query.mode === 'review' ? 'review' : 'generate');
const reportDemoState = computed(() => store.db.reportDemoState || { status: '待生成', exportStatus: '未导出' });
const notice = ref('');
const activeChapter = ref('一、基本情况');

function showNotice(message) {
  notice.value = message;
}

const chapters = [
  { title: '一、基本情况', children: ['（一）被审计单位概况', '（二）审计范围与期间', '（三）审计依据与方法'] },
  { title: '二、审计发现的主要问题', children: ['（一）内部控制问题', '（二）财务收支问题', '（三）费用管理问题'] },
  { title: '三、审计意见及整改要求', children: ['（一）审计意见', '（二）整改要求', '（三）后续跟踪建议'] },
  { title: '四、附件材料', children: ['（一）附件清单', '（二）重要资料复印件'] }
];
const evidenceItems = [
  { no: 1, title: '《证券公司信息隔离墙制度指引》', desc: '第六条 公司应建立健全信息隔离制度。', source: '公司制度库', rate: '98%' },
  { no: 2, title: '《财务管理制度》', desc: '费用报销应遵循真实性、合规性和完整性原则。', source: '公司制度库', rate: '96%' },
  { no: 3, title: '上海分公司组织架构及人员情况表', desc: '包含人员分公司架构、人员编制及营业网点信息。', source: '监督共享平台', rate: '92%' },
  { no: 4, title: '费用异常：超预算报销', desc: '涉及金额 28,650.00 元，发生日期 2025-03-12。', source: '费用智能化审计', rate: '91%' },
  { no: 5, title: '财务费用明细单据', desc: '报销单据、发票、附件和审批流信息。', source: '任务附件', rate: '89%' }
];
const auditSteps = [
  { no: 1, title: '上传报告', time: '05-10 14:10', state: 'done' },
  { no: 2, title: '解析文档', time: '05-10 14:11', state: 'done' },
  { no: 3, title: '格式检查', time: '05-10 14:15', state: 'done' },
  { no: 4, title: '内容优化', time: '05-10 14:21', state: 'done' },
  { no: 5, title: '人工处理', time: '待处理', state: 'active' },
  { no: 6, title: '形成复核记录', time: '待生成', state: '' }
];
const issueStats = [
  { label: '问题总数', value: '23 条', icon: '▯', tone: 'red' },
  { label: '高风险', value: '4 条', icon: '▣', tone: 'red' },
  { label: '中风险', value: '11 条', icon: '▧', tone: 'orange' },
  { label: '低风险', value: '8 条', icon: '✓', tone: 'blue' },
  { label: '已采纳建议', value: '6 条', icon: '✓', tone: 'green' }
];
const issues = [
  { id: 'C-20250510-002', type: '文字优化', pos: '第15页', desc: '建议补充风险成因分析与影响范围说明', risk: '中风险', riskTone: 'mid', suggest: '补充风险说明', status: '待处理' },
  { id: 'F-20250510-001', type: '标题编号', pos: '第12页', desc: '三级标题编号缺失', risk: '低风险', riskTone: 'low', suggest: '修正编号', status: '待处理' },
  { id: 'R-20250510-004', type: '依据完整性', pos: '第26页', desc: '审计结论缺少引用依据', risk: '高风险', riskTone: 'high', suggest: '补充依据', status: '待处理' },
  { id: 'T-20250510-005', type: '字号字号', pos: '第33页', desc: '正文部分使用了小于小四的字号', risk: '低风险', riskTone: 'low', suggest: '统一为小四号字', status: '待处理' },
  { id: 'N-20250510-006', type: '标题编号', pos: '第41页', desc: '章节标题编号缺失', risk: '中风险', riskTone: 'mid', suggest: '补充章节编号', status: '待处理' },
  { id: 'C-20250510-007', type: '文字优化', pos: '第46页', desc: '语句冗长，建议优化表达', risk: '低风险', riskTone: 'low', suggest: '优化语句表达', status: '待处理' }
];
const selectedIssue = ref(issues[0]);
const exportItems = [
  { icon: '表', title: '审核问题清单', format: 'Excel', desc: '23 条问题', action: '下载', tone: 'green' },
  { icon: 'W', title: '修订建议报告', format: 'Word', desc: '23 条建议', action: '下载', tone: 'blue' },
  { icon: '记', title: '复核记录', format: 'Word', desc: '待生成', action: '生成', tone: 'slate' },
  { icon: '志', title: '操作日志', format: 'Zip', desc: '共 132 条记录', action: '下载', tone: 'blue' }
];
</script>

<style scoped>
.report-closure-strip{display:flex;align-items:center;gap:18px;margin-bottom:10px;padding:12px 14px}.report-closure-strip div{display:grid;gap:4px}.report-closure-strip span{color:var(--color-primary);font-weight:800}.report-closure-strip p{flex:1;margin:0;color:#667085}.report-closure-strip small{white-space:nowrap;color:#667085}
.report-ai-page { display:flex; height:0; min-height:0; flex-direction:column; overflow:auto; color:#111827; min-width:0; }
.report-title { display:flex; justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:8px; }
.report-title p { color:#667085; font-size:13px; }
.report-title h2 { margin-top:4px; font-size:22px; }
.primary { background:var(--color-primary) !important; color:#fff !important; border-color:var(--color-primary) !important; }
.panel { border:1px solid #e1e7ef; border-radius:6px; background:#fff; box-shadow:0 8px 18px rgba(31,41,55,.04); }
button, input, select, textarea { font:inherit; }
button { cursor:pointer; }

.red { color:var(--color-primary); background:#fff1f1; } .blue { color:var(--color-info); background:#eef4ff; } .orange { color:var(--color-warning); background:#fff4e8; } .purple { color:#6f668f; background:#f3edff; } .green { color:var(--color-success); background:#eaf8f1; }
.issue-list table, .history-table { width:100%; border-collapse:collapse; table-layout:fixed; }
.issue-list th,.issue-list td { padding:9px 8px; border-top:1px solid #edf1f5; text-align:center; font-size:12px; }

.generate-page { display:grid; gap:10px; }
.gen-toolbar { display:grid; grid-template-columns:repeat(4,minmax(150px,1fr)) 96px minmax(340px,auto); column-gap:14px; row-gap:10px; align-items:end; padding:12px; overflow:hidden; }
.gen-toolbar label { min-width:0; display:grid; gap:7px; color:#344054; font-size:12px; font-weight:800; }
.gen-toolbar select,.chapter-nav input,.upload-rule select,.upload-rule input { width:100%; height:36px; border:1px solid #d7dee9; border-radius:4px; padding:0 12px; background:#fff; font-weight:700; }
.toggle-stack { align-self:end; display:grid; gap:8px; padding-bottom:1px; font-size:12px; }
.toggle-stack label { height:17px; display:flex; align-items:center; justify-content:flex-end; gap:8px; white-space:nowrap; }
.toggle-stack input { margin:0; }
.toolbar-actions { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
.toolbar-actions button,.toolbar-link,.review-top button,.detail-actions button,.issue-detail footer button { height:32px; border:1px solid #d7dee9; background:#fff; border-radius:4px; padding:0 12px; font-weight:800; }
.toolbar-link { display:inline-flex; align-items:center; color:#344054; text-decoration:none; }
.toolbar-link:hover { border-color:var(--color-primary); color:var(--color-primary); }
.outline-danger { color:var(--color-primary); border-color:#efb2b8 !important; background:#fff !important; }
.gen-workspace { display:grid; grid-template-columns:210px minmax(0,1fr) 318px; gap:10px; align-items:stretch; }
.chapter-nav,.editor-panel,.source-rail { min-height:560px; }
.chapter-nav { padding:12px; display:flex; flex-direction:column; gap:10px; }
.chapter-nav ul { display:grid; gap:6px; padding:0; list-style:none; }
.chapter-nav li { display:grid; gap:4px; }
.chapter-row { width:100%; min-height:27px; padding:5px 8px; border:1px solid transparent; border-radius:4px; background:transparent; text-align:left; color:#475467; font-size:12px; cursor:pointer; }
.chapter-title-row { color:#111827; font-weight:800; }
.chapter-row.active { border-color:var(--color-primary); background:#fffafa; color:#111827; }
.chapter-add { margin-top:auto; display:grid; grid-template-columns:1fr 38px; gap:8px; padding:4px; border:1px solid #edf1f5; border-radius:6px; box-shadow:0 2px 8px rgba(16,24,40,.05) inset; }
.chapter-add button { height:34px; border:0; border-radius:4px; background:#fff; color:#667085; font-weight:800; }
.chapter-add button:first-child { border-right:1px solid #edf1f5; }
.editor-panel header { padding:10px 12px; border-bottom:1px solid #edf1f5; }
.editor-tools { display:flex; align-items:center; flex-wrap:nowrap; gap:12px; margin-top:8px; padding:8px 10px; border:1px solid #edf1f5; border-radius:4px; color:#344054; font-size:12px; overflow:hidden; }
.editor-tools span,.editor-tools b { flex:0 0 auto; }
.editor-tools em { margin-left:auto; color:var(--color-info); font-style:normal; font-weight:800; }
.doc-preview { max-width:760px; margin:auto; padding:28px 34px; line-height:1.8; }
.doc-preview h2 { text-align:center; margin:22px 0; }
.doc-preview p { position:relative; margin:12px 0; padding:10px 12px; border-radius:5px; }
.doc-preview .ai { border:1px solid #75a7ff; background:#f8fbff; }
.doc-preview .issue { border:1px solid #d9a1a1; background:#fffafa; }
.doc-preview em { float:right; padding:1px 5px; border-radius:3px; background:#eaf2ff; color:var(--color-info); font-size:11px; font-style:normal; }
.doc-preview .warn { background:#fff2e6; color:var(--color-warning); } .doc-preview .danger { background:#fff0f0; color:var(--color-primary); }
.source-rail { padding:12px; display:grid; align-content:start; gap:10px; }
.source-rail nav { display:flex; gap:8px; overflow:auto; }
.source-rail nav button { border:0; background:transparent; white-space:nowrap; font-weight:800; }
.source-rail nav .active { color:var(--color-primary); }
.source-rail article { border:1px solid #edf1f5; border-radius:6px; padding:10px; }
.source-rail article b { display:inline-grid; place-items:center; width:18px; height:18px; margin-right:6px; border-radius:3px; background:var(--color-info); color:#fff; }
.source-rail article:nth-of-type(1) b { background:var(--color-info); }
.source-rail article:nth-of-type(2) b { background:var(--color-success); }
.source-rail article:nth-of-type(3) b { background:var(--color-warning); }
.source-rail article:nth-of-type(4) b { background:#8b5cf6; }
.source-rail article:nth-of-type(5) b { background:var(--color-primary); }
.source-rail article p { display:block; margin-top:6px; color:#667085; font-size:11px; line-height:1.5; }
.source-meta { display:grid; grid-template-columns:minmax(0,1fr) auto auto; align-items:center; gap:8px; margin-top:8px; color:#667085; font-size:11px; }
.source-meta small { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.source-meta button { height:24px; padding:0 8px; border:1px solid #d7dee9; background:#fff; border-radius:4px; font-size:11px; white-space:nowrap; }
.source-rail footer { display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:12px; }
.gen-bottom { display:grid; grid-template-columns:minmax(0,1fr) 220px; gap:10px; }
.generate-flow { display:grid; grid-template-columns:110px repeat(6,1fr); gap:8px; align-items:center; padding:12px; }
.generate-flow h3 { font-size:13px; }
.generate-flow span { text-align:center; color:#667085; font-size:11px; }
.generate-flow b { display:inline-grid; place-items:center; width:22px; height:22px; border-radius:50%; background:#98a2b3; color:#fff; }
.generate-flow .done b { background:var(--color-success); } .generate-flow .active b { background:var(--color-info); }
.generate-flow strong,.generate-flow small,.generate-flow em { display:block; margin-top:4px; font-style:normal; }
.progress-card { position:relative; padding:16px; }
.progress-card p { color:var(--color-success); margin:8px 0; }
.ring { position:absolute; right:18px; top:24px; width:70px; height:70px; border:8px solid #d7f2e6; border-top-color:var(--color-success); border-radius:50%; display:grid; place-items:center; font-weight:900; }

.review-page { display:grid; gap:10px; }
.review-top { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:8px 10px; border-bottom:1px solid #edf1f5; }
.review-top div { display:flex; gap:8px; flex-wrap:wrap; }
.review-board { display:grid; grid-template-columns:186px minmax(0,1.18fr) 324px 306px; grid-template-areas:"base base base detail" "upload progress progress detail" "upload check preview detail" "issues issues preview detail" "export export version detail"; gap:10px; align-items:stretch; }
.review-base { grid-area:base; display:grid; grid-template-columns:repeat(6,1fr); gap:8px; padding:12px; min-height:60px; }
.review-base span { color:#111827; font-size:12px; }
.review-base b { display:block; color:#667085; margin-bottom:5px; }
.review-base em { color:var(--color-success); font-style:normal; }
.upload-rule { grid-area:upload; padding:12px; display:grid; gap:12px; align-content:start; min-height:300px; }
.upload-file { padding:12px; border-radius:6px; background:#fff4f4; color:#344054; font-size:12px; }
.upload-file small { display:block; color:#667085; margin-top:5px; }
.upload-rule label { display:grid; gap:5px; font-size:12px; font-weight:800; color:#344054; }
.review-progress { grid-area:progress; padding:16px 18px; display:grid; gap:16px; min-height:150px; }
.audit-steps { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; position:relative; }
.audit-steps::before { content:""; position:absolute; left:8%; right:8%; top:11px; height:1px; background:#cfd4dc; }
.audit-steps span { position:relative; display:grid; justify-items:center; align-content:start; gap:4px; text-align:center; font-size:11px; color:#667085; }
.audit-steps b { position:relative; z-index:1; display:inline-grid; place-items:center; width:22px; height:22px; border-radius:50%; background:#98a2b3; color:#fff; margin-bottom:4px; }
.audit-steps .done b { background:var(--color-primary); } .audit-steps .active b { background:var(--color-primary); }
.audit-steps small { display:block; color:#667085; font-size:10px; line-height:1.25; }
.issue-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
.issue-stats article { min-height:82px; display:flex; align-items:center; gap:12px; border:1px solid #edf1f5; border-radius:6px; padding:12px; }
.issue-stats i { flex:0 0 26px; width:26px; height:26px; display:grid; place-items:center; border-radius:6px; font-style:normal; font-weight:900; }
.issue-stats i.red { color:var(--color-primary); background:#fff1f1; }
.issue-stats i.orange { color:var(--color-warning); background:#fff7e6; }
.issue-stats i.blue { color:var(--color-info); background:#eff6ff; }
.issue-stats i.green { color:var(--color-success); background:#eaf8f1; }
.issue-stats article span { display:block; color:#344054; font-size:12px; margin-bottom:8px; }
.issue-stats strong { font-size:20px; display:block; }
.upload-check { grid-area:check; min-height:90px; padding:12px; }
.upload-check h3 { color:var(--color-primary); margin-bottom:8px; font-size:13px; }
.upload-check p { color:#667085; font-size:12px; line-height:1.6; }
.upload-check em { color:var(--color-success); font-style:normal; font-weight:800; }
.issue-list { grid-area:issues; overflow:hidden; min-height:260px; }
.issue-list nav { display:flex; gap:10px; padding:8px 10px; overflow:hidden; border-bottom:1px solid #edf1f5; }
.issue-list nav button { border:0; background:transparent; white-space:nowrap; font-weight:800; font-size:11px; }
.issue-list nav .active { color:var(--color-primary); }
.issue-list table { min-width:0; table-layout:fixed; }
.issue-list th,.issue-list td { padding:7px 4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:11px; }
.issue-list th:nth-child(1),.issue-list td:nth-child(1){width:14%}
.issue-list th:nth-child(2),.issue-list td:nth-child(2){width:9%}
.issue-list th:nth-child(3),.issue-list td:nth-child(3){width:7%}
.issue-list th:nth-child(4),.issue-list td:nth-child(4){width:25%}
.issue-list th:nth-child(5),.issue-list td:nth-child(5){width:8%}
.issue-list th:nth-child(6),.issue-list td:nth-child(6){width:13%}
.issue-list th:nth-child(7),.issue-list td:nth-child(7){width:7%}
.issue-list th:nth-child(8),.issue-list td:nth-child(8){width:17%}
.issue-list td button { border:0; background:transparent; color:var(--color-info); font-size:11px; padding:0 1px; }
.issue-list td:nth-child(8) { font-size:0; }
.issue-list td:nth-child(8) button { font-size:11px; }
.issue-list em { padding:2px 5px; border-radius:3px; font-style:normal; white-space:nowrap; }
.issue-list footer { height:34px; display:flex; align-items:center; justify-content:space-between; padding:0 10px; border-top:1px solid #edf1f5; color:#344054; font-size:11px; }
.issue-list footer div { display:flex; gap:5px; }
.issue-list footer button { min-width:22px; height:22px; border:1px solid #d7dee9; border-radius:4px; background:#fff; color:#344054; }
.issue-list footer button.active { border-color:var(--color-primary); color:var(--color-primary); }
.issue-list footer input { width:28px; height:22px; border:1px solid #d7dee9; border-radius:4px; text-align:center; }
.high { color:var(--color-primary); background:#fff0f0; } .mid { color:var(--color-warning); background:#fff4e8; } .low { color:var(--color-success); background:#eaf8f1; }
.report-preview { grid-area:preview; min-height:360px; padding:10px; }
.report-preview > h3 { margin-bottom:8px; font-size:13px; }
.report-preview header { display:flex; flex-wrap:nowrap; justify-content:space-between; gap:6px; padding:0 0 10px; border-bottom:0; }
.report-preview header span { min-width:30px; height:30px; display:grid; place-items:center; border:1px solid #d7dee9; padding:0 7px; border-radius:4px; font-size:12px; white-space:nowrap; }
.report-preview article { position:relative; padding:26px 28px; border:1px solid #edf1f5; border-radius:5px; line-height:1.62; }
.report-preview article h3 { margin-bottom:22px; text-align:left; }
.report-preview article h4 { margin:14px 0 10px; }
.report-preview article p { margin:8px 0; }
.report-preview mark { background:#fff4f4; border:1px solid #d9a1a1; color:var(--color-primary); }
.mark-dot { position:absolute; right:10px; width:18px; height:18px; display:grid; place-items:center; border-radius:50%; background:var(--color-primary); color:#fff; font-size:11px; font-style:normal; }
.dot-1 { top:70px; } .dot-2 { top:150px; } .dot-3 { top:230px; background:var(--color-info); } .dot-4 { top:300px; }
.export-row { grid-area:export; display:grid; grid-template-columns:repeat(4,1fr); gap:10px; align-items:start; padding:30px 12px 12px; min-height:116px; position:relative; }
.export-row h3 { position:absolute; left:12px; top:10px; font-size:13px; }
.export-row article { min-height:86px; border:1px solid #edf1f5; border-radius:6px; padding:10px; display:grid; grid-template-columns:38px 1fr; gap:8px; align-items:stretch; }
.export-logo { display:grid; grid-template-rows:32px 1fr 22px; justify-items:center; gap:0; height:100%; }
.export-logo button { grid-row:3; }
.export-copy { display:grid; grid-template-rows:auto auto auto 1fr 22px; gap:2px; justify-items:start; height:100%; }
.export-row i { width:32px; height:32px; display:grid; place-items:center; border-radius:5px; color:#fff; font-style:normal; font-weight:900; }
.export-row i.green { background:var(--color-success); } .export-row i.blue { background:var(--color-info); } .export-row i.slate { background:#475467; }
.export-row strong { display:block; font-size:12px; }
.export-row small,.export-row em { display:block; color:#667085; font-size:10px; font-style:normal; }
.export-row button { height:22px; padding:0 8px; border:1px solid #d7dee9; background:#fff; border-radius:4px; font-size:10px; }
.export-copy button { grid-row:5; }
.version-line { grid-area:version; padding:12px; min-height:92px; }
.version-line header { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:18px; }
.version-line header h3 { font-size:13px; }
.version-line header p { display:flex; gap:14px; color:#667085; font-size:11px; }
.version-line header span::before { content:""; display:inline-block; width:7px; height:7px; margin-right:5px; border-radius:50%; background:#98a2b3; vertical-align:middle; }
.version-line header .done::before { background:var(--color-success); } .version-line header .active::before { background:var(--color-primary); }
.version-line div { display:grid; grid-template-columns:repeat(4,1fr); gap:0; color:#667085; font-size:12px; text-align:center; position:relative; }
.version-line div::before { content:""; position:absolute; left:12%; right:12%; top:14px; height:2px; background:#d9e1ec; }
.version-line div span { position:relative; z-index:1; font-weight:800; }
.version-line div span::before { content:"✓"; display:grid; place-items:center; width:28px; height:28px; margin:0 auto 10px; border-radius:50%; background:var(--color-success); color:#fff; }
.version-line div .active { color:var(--color-primary); }
.version-line div .active::before { content:"◆"; background:#fff; color:var(--color-primary); border:2px solid var(--color-primary); }
.version-line div .todo::before { content:""; background:#98a2b3; }
.version-line small { display:block; margin-top:5px; color:#667085; font-weight:400; line-height:1.35; }
.issue-detail { grid-area:detail; padding:18px 14px; min-height:720px; overflow:hidden; }
.issue-detail header { display:flex; justify-content:space-between; align-items:center; }
.issue-detail header button { border:0; background:transparent; font-size:18px; }
.issue-detail nav { display:flex; gap:10px; margin:12px 0; overflow:auto; }
.issue-detail nav button { border:0; background:transparent; white-space:nowrap; font-weight:800; font-size:12px; }
.issue-detail nav .active { color:var(--color-primary); border-bottom:2px solid var(--color-primary); }
.issue-detail dl { display:grid; grid-template-columns:72px 1fr; gap:10px; font-size:12px; line-height:1.6; }
.issue-detail dt { color:#667085; font-weight:800; }
.issue-detail dd { margin:0; }
.issue-detail dd em { color:var(--color-warning); background:#fff4e8; padding:2px 6px; border-radius:4px; font-style:normal; }
.radio-row { display:flex; gap:16px; margin:10px 0; font-size:12px; }
.issue-detail textarea { width:100%; min-height:70px; border:1px solid #d7dee9; border-radius:5px; padding:10px; resize:none; }
.operation-record { display:grid; grid-template-columns:minmax(0,1.45fr) minmax(0,.7fr) minmax(0,.9fr) minmax(0,.45fr); margin:10px 0 22px; border-top:1px solid #edf1f5; border-left:1px solid #edf1f5; }
.operation-record span,.operation-record strong { min-width:0; padding:9px 4px; border-right:1px solid #edf1f5; border-bottom:1px solid #edf1f5; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:11px; }
.operation-record span { background:#f8fafc; color:#667085; font-weight:800; }
.operation-record strong { color:#111827; font-weight:400; }
.issue-detail footer { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
.issue-detail footer button { min-width:0; padding:0 6px; }
.issue-detail footer .wide { grid-column:1 / -1; color:var(--color-primary); border-color:#efb2b8; }

@media (max-width: 1280px) {
  .gen-toolbar { grid-template-columns:repeat(4,minmax(138px,1fr)) 92px; }
  .toolbar-actions { grid-column:1 / -1; }
  .gen-workspace { grid-template-columns:200px minmax(0,1fr) 286px; }
  .review-board { grid-template-columns:176px minmax(0,1.16fr) 304px 286px; }
}
@media (max-width: 1120px) {
  .gen-workspace,.review-board,.gen-bottom { grid-template-columns:1fr; }
  .review-board { grid-template-areas:"base" "upload" "progress" "check" "issues" "preview" "export" "version" "detail"; }
  .review-base { grid-template-columns:1fr; }
  .generate-flow,.audit-steps,.issue-stats { grid-template-columns:repeat(2,1fr); }
}
@media (max-width: 720px) {
  .report-title,.review-top { flex-direction:column; align-items:stretch; }
  .toolbar-actions,.review-top div { width:100%; flex-wrap:wrap; }
  .gen-toolbar { grid-template-columns:1fr; }
}
</style>
