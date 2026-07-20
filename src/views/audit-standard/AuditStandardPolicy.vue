<template>
  <div class="audit-policy-assistant-page route-fill-page" data-page="audit-policy-assistant">
    <section class="assistant-workspace" :class="{ 'has-result': activeMode }">
      <article class="chat-panel" aria-label="审计制度智能体会话">
        <header class="workspace-heading">
          <div class="workspace-title">
            <span class="title-accent" aria-hidden="true"></span>
            <h2>审计制度智能体</h2>
          </div>
          <div class="chat-toolbar">
            <div class="history-wrap">
              <button type="button" class="toolbar-button" @click="historyVisible = !historyVisible">
                <FontAwesomeIcon :icon="faClockRotateLeft" />历史会话
              </button>
              <section v-if="historyVisible" class="history-popover" aria-label="历史会话">
                <header>
                  <strong>历史会话</strong>
                  <span>共 {{ filteredHistory.length }} 条</span>
                  <button type="button" aria-label="关闭历史会话" @click="historyVisible = false">
                    <FontAwesomeIcon :icon="faXmark" />
                  </button>
                </header>
                <label class="history-search">
                  <FontAwesomeIcon :icon="faMagnifyingGlass" />
                  <input v-model="historySearch" type="search" placeholder="搜索历史对话" />
                </label>
                <p class="history-section-title">最近会话</p>
                <button
                  v-for="item in filteredHistory"
                  :key="item.id"
                  type="button"
                  class="history-item"
                  @click="restoreHistory(item)"
                >
                  <FontAwesomeIcon :icon="faFileLines" />
                  <span><strong>{{ item.title }}</strong><small>{{ item.mode }} · {{ item.time }}</small></span>
                </button>
              </section>
            </div>
            <button type="button" class="toolbar-button" @click="startNewConversation">
              <FontAwesomeIcon :icon="faPlus" />新会话
            </button>
            <button type="button" class="toolbar-button" @click="clearConversation">
              <FontAwesomeIcon :icon="faTrashCan" />清空会话
            </button>
          </div>
        </header>

        <div class="message-body" aria-live="polite">
          <div v-if="!messages.length" class="empty-conversation">
            <span><FontAwesomeIcon :icon="faRobot" /></span>
            <strong>新会话已准备好</strong>
            <p>输入制度查询或制度比对需求，智能体会自动识别并呈现对应结果。</p>
          </div>

          <div v-for="message in messages" :key="message.id" class="message-row" :class="message.role">
            <span class="message-avatar" aria-hidden="true">
              <FontAwesomeIcon :icon="message.role === 'user' ? faUser : faRobot" />
            </span>
            <div class="message-main">
              <div class="message-meta">
                <strong>{{ message.role === 'user' ? '我' : '审计制度智能体' }}</strong>
                <time>{{ message.time }}</time>
              </div>
              <div class="message-bubble"><p>{{ message.content }}</p></div>
              <div v-if="message.showSuggestions" class="suggestion-area">
                <div class="suggestion-label"><FontAwesomeIcon :icon="faLightbulb" />推荐问题</div>
                <button
                  v-for="item in suggestions"
                  :key="item.question"
                  type="button"
                  class="suggestion-chip"
                  @click="runSuggestion(item.question, item.mode)"
                >
                  {{ item.question }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer class="input-area">
          <div v-if="uploadedFile" class="uploaded-file">
            <FontAwesomeIcon :icon="faFileLines" />
            <span>{{ uploadedFile }}</span>
            <button type="button" aria-label="移除上传文件" @click="uploadedFile = ''"><FontAwesomeIcon :icon="faXmark" /></button>
          </div>
          <div class="upload-hint"><FontAwesomeIcon :icon="faPaperclip" />可上传文件（PDF/Word/Excel，≤ 50MB）</div>
          <div class="composer">
            <textarea
              v-model="questionDraft"
              rows="3"
              aria-label="请输入您的问题"
              placeholder="请输入您的问题，支持自然语言提问..."
              @keydown.enter.exact.prevent="submitQuestion"
            ></textarea>
            <div class="composer-actions">
              <input ref="fileInput" class="visually-hidden" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" @change="handleFileChange" />
              <button type="button" class="upload-button" @click="fileInput?.click()"><FontAwesomeIcon :icon="faPaperclip" />上传</button>
              <button type="button" class="send-button" :disabled="!questionDraft.trim()" @click="submitQuestion">发送</button>
            </div>
          </div>
        </footer>
      </article>

      <aside v-if="activeMode" class="result-panel" :aria-label="resultTitle">
        <header class="result-heading">
          <div class="workspace-title">
            <span class="title-accent" aria-hidden="true"></span>
            <h2>{{ resultTitle }}</h2>
          </div>
          <span class="result-status"><FontAwesomeIcon :icon="faCircleCheck" />已生成</span>
        </header>

        <template v-if="activeMode === 'query'">
          <div class="result-tabs" role="tablist" aria-label="制度查询结果分类">
            <button
              v-for="tab in queryTabs"
              :key="tab.key"
              type="button"
              role="tab"
              :aria-selected="activeQueryTab === tab.key"
              :class="{ active: activeQueryTab === tab.key }"
              @click="activeQueryTab = tab.key"
            >{{ tab.label }} <span>({{ tab.count }})</span></button>
          </div>
          <div class="result-summary">
            <span><FontAwesomeIcon :icon="faMagnifyingGlass" /></span>
            <div><strong>共检索到 {{ policyRows.length }} 项相关制度</strong><p>结果按相关度、有效状态与引用关系综合排序。</p></div>
          </div>
          <div class="result-table-wrap">
            <table>
              <thead><tr><th>序号</th><th>制度名称</th><th>版本</th><th>适用部门</th><th>状态</th><th>引用状态</th></tr></thead>
              <tbody>
                <tr v-for="(row, index) in policyRows" :key="row.policyId">
                  <td>{{ index + 1 }}</td><td class="primary-cell">{{ row.name }}</td><td>{{ row.version }}</td><td>{{ row.effectiveDept }}</td>
                  <td><span class="status-tag success">{{ row.status }}</span></td><td>{{ row.referenceStatus }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <section class="linked-detail">
            <h3>所选制度节选内容</h3>
            <div>
              <article><span>相关条款</span><strong>费用报销审批与合同付款管理</strong><p>付款节点应与合同约定一致，审批材料需完整留痕并满足分级授权要求。</p></article>
              <article><span>智能建议</span><strong>建议关联审计检查项</strong><p>核验合同、发票、审批记录与付款流水的一致性，关注跨期或越权审批情形。</p></article>
            </div>
          </section>
        </template>

        <template v-else>
          <div class="result-tabs" role="tablist" aria-label="制度比对结果分类">
            <button type="button" role="tab" aria-selected="true" class="active">全部差异 <span>({{ compareRows.length }})</span></button>
            <button type="button" role="tab" aria-selected="false">重要差异 <span>(1)</span></button>
            <button type="button" role="tab" aria-selected="false">一般差异 <span>(1)</span></button>
          </div>
          <div class="compare-metrics">
            <article><span>比对条款</span><strong>36</strong><small>已完成全文语义匹配</small></article>
            <article><span>发现差异</span><strong>{{ compareRows.length }}</strong><small>需进一步人工复核</small></article>
            <article class="risk"><span>高风险差异</span><strong>1</strong><small>建议优先处理</small></article>
          </div>
          <div class="result-table-wrap compare-table">
            <table>
              <thead><tr><th>序号</th><th>比对章节</th><th>内部制度</th><th>外部法规</th><th>差异判断</th><th>建议处理</th></tr></thead>
              <tbody>
                <tr v-for="(row, index) in compareRows" :key="row.compareId">
                  <td>{{ index + 1 }}</td><td class="primary-cell">{{ row.section }}</td><td>{{ row.internalRule }}</td><td>{{ row.externalRule }}</td>
                  <td><span class="status-tag" :class="index ? 'warning' : 'success'">{{ row.result }}</span></td><td>{{ row.action }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <section class="compare-advice">
            <FontAwesomeIcon :icon="faTriangleExclamation" />
            <div><strong>智能比对建议</strong><p>建议优先补充合同付款审批链要求，并将差异项引用到审计规范生成任务。</p></div>
            <button type="button" @click="store.setNotice('比对差异已加入待处理清单。')">加入待处理</button>
          </section>
        </template>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faCircleCheck,
  faClockRotateLeft,
  faFileLines,
  faLightbulb,
  faMagnifyingGlass,
  faPaperclip,
  faPlus,
  faRobot,
  faTrashCan,
  faTriangleExclamation,
  faUser,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

const store = inject('store');
const fileInput = ref(null);
const questionDraft = ref('');
const uploadedFile = ref('');
const activeMode = ref('');
const activeQueryTab = ref('policies');
const historyVisible = ref(false);
const historySearch = ref('');

function currentTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function initialMessages() {
  return [{
    id: 'welcome',
    role: 'assistant',
    time: currentTime(),
    content: '您好，我是审计制度智能体。请选择推荐问题，或直接输入审计查询需求。',
    showSuggestions: true
  }];
}

const messages = ref(initialMessages());
const suggestions = [
  { mode: 'query', question: '客户风险等级更新不及时的相关制度有哪些？' },
  { mode: 'compare', question: '上传外部法规并比对内部制度覆盖情况' },
  { mode: 'compare', question: '对比客户适当性管理办法的新旧版本差异' }
];
const historyItems = [
  { id: 'history-query', title: '费用报销制度查询', mode: '制度查询', time: '今天 09:42', question: '查询费用报销管理办法的现行有效版本', resultMode: 'query' },
  { id: 'history-compare', title: '合同付款条款比对', mode: '制度比对', time: '昨天 16:18', question: '比对内外规中的合同付款要求', resultMode: 'compare' }
];

const policyRows = computed(() => store.db.policyLibrary || []);
const compareRows = computed(() => store.db.policyCompareItems || []);
const resultTitle = computed(() => activeMode.value === 'query' ? '制度查询结果' : '制度比对结果');
const queryTabs = computed(() => [
  { key: 'policies', label: '命中制度', count: policyRows.value.length },
  { key: 'clauses', label: '命中条款', count: 6 },
  { key: 'rules', label: '监管规则', count: 3 },
  { key: 'cases', label: '相关案例', count: 4 }
]);
const filteredHistory = computed(() => {
  const keyword = historySearch.value.trim();
  return keyword ? historyItems.filter((item) => item.title.includes(keyword) || item.mode.includes(keyword)) : historyItems;
});

function runSuggestion(question, mode) {
  const resolvedMode = mode || (/\u6bd4\u5bf9|\u5bf9\u6bd4|\u5dee\u5f02|\u8986\u76d6|\u5916\u89c4/.test(question) ? 'compare' : 'query');
  const time = currentTime();
  messages.value = messages.value.map((message) => ({ ...message, showSuggestions: false }));
  messages.value.push({ id: `user-${Date.now()}`, role: 'user', time, content: question });
  messages.value.push({
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    time,
    content: resolvedMode === 'query'
      ? '已识别为制度查询需求，右侧已生成制度、条款与引用关系结果。'
      : '已识别为制度比对需求，右侧已生成差异判断与优先处理建议。'
  });
  activeMode.value = resolvedMode;
  store.handlePolicyCapability(resolvedMode === 'query' ? 'query' : 'compare');
}

function submitQuestion() {
  const question = questionDraft.value.trim();
  if (!question) return;
  runSuggestion(question);
  questionDraft.value = '';
}

function startNewConversation() {
  messages.value = initialMessages();
  activeMode.value = '';
  uploadedFile.value = '';
  historyVisible.value = false;
}

function clearConversation() {
  messages.value = [];
  activeMode.value = '';
  uploadedFile.value = '';
}

function restoreHistory(item) {
  startNewConversation();
  runSuggestion(item.question, item.resultMode);
  historyVisible.value = false;
}

function handleFileChange(event) {
  uploadedFile.value = event.target.files?.[0]?.name || '';
  event.target.value = '';
}
</script>

<style scoped>
.audit-policy-assistant-page { height: 0; min-height: 0; min-width: 0; overflow: hidden; }
.assistant-workspace { display: grid; height: 100%; min-height: 0; grid-template-columns: minmax(0, 1fr); gap: 12px; }
.assistant-workspace.has-result { grid-template-columns: minmax(410px, 0.92fr) minmax(540px, 1.08fr); }
.chat-panel, .result-panel { min-width: 0; min-height: 0; display: flex; flex-direction: column; border: 1px solid #dde2e9; border-radius: 6px; background: #fff; box-shadow: 0 2px 10px rgba(30, 42, 58, .05); overflow: hidden; }
.workspace-heading, .result-heading { position: relative; display: flex; min-height: 92px; padding: 20px 22px 14px; align-items: flex-start; justify-content: space-between; gap: 14px; border-bottom: 1px solid #eceff3; }
.workspace-title { display: flex; align-items: center; gap: 10px; }
.workspace-title h2 { margin: 0; color: #242932; font-size: 20px; line-height: 1.4; }
.title-accent { width: 4px; height: 22px; border-radius: 2px; background: #d71920; }
.chat-toolbar { position: absolute; left: 22px; bottom: 13px; display: flex; gap: 8px; }
.toolbar-button, .upload-button { display: inline-flex; height: 30px; padding: 0 11px; align-items: center; gap: 6px; border: 1px solid #cfd4dc; border-radius: 2px; color: #4c5360; background: #fff; font-size: 12px; cursor: pointer; }
.toolbar-button:hover, .upload-button:hover { border-color: #d71920; color: #c8161d; }
.history-wrap { position: relative; }
.history-popover { position: absolute; z-index: 10; top: 38px; left: 0; width: 320px; padding: 14px; border: 1px solid #dfe3e9; border-radius: 6px; background: #fff; box-shadow: 0 10px 28px rgba(24, 32, 45, .16); }
.history-popover::before { position: absolute; top: -6px; left: 28px; width: 10px; height: 10px; border-top: 1px solid #dfe3e9; border-left: 1px solid #dfe3e9; background: #fff; content: ''; transform: rotate(45deg); }
.history-popover header { display: flex; align-items: center; gap: 8px; }
.history-popover header strong { flex: 1; font-size: 15px; }
.history-popover header span { color: #8a919c; font-size: 12px; }
.history-popover header button, .uploaded-file button { border: 0; color: #8a919c; background: transparent; cursor: pointer; }
.history-search { display: flex; height: 34px; margin-top: 12px; padding: 0 10px; align-items: center; gap: 8px; border: 1px solid #dfe3e9; border-radius: 3px; color: #9aa1ab; }
.history-search input { min-width: 0; flex: 1; border: 0; outline: none; }
.history-section-title { margin: 12px 0 6px; color: #8a919c; font-size: 12px; }
.history-item { display: flex; width: 100%; padding: 10px; align-items: center; gap: 10px; border: 0; border-radius: 4px; text-align: left; background: transparent; cursor: pointer; }
.history-item:hover { background: #fff3f3; }
.history-item > svg { color: #d71920; }
.history-item span { display: grid; min-width: 0; gap: 3px; }
.history-item strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.history-item small { color: #9299a4; }
.message-body { min-height: 0; flex: 1; padding: 22px; overflow: auto; }
.message-row { display: flex; margin-bottom: 22px; gap: 12px; }
.message-row.user { flex-direction: row-reverse; }
.message-avatar { display: grid; width: 36px; height: 36px; flex: 0 0 36px; place-items: center; border-radius: 50%; color: #fff; background: #1687d9; }
.message-row.user .message-avatar { background: #e62b32; }
.message-main { max-width: calc(100% - 48px); }
.message-row.user .message-main { display: grid; justify-items: end; }
.message-meta { display: flex; margin-bottom: 7px; align-items: center; gap: 10px; color: #333944; font-size: 13px; }
.message-meta time { color: #9aa1ab; font-size: 12px; }
.message-bubble { max-width: 620px; padding: 13px 16px; border: 1px solid #e1e5ea; border-radius: 5px; color: #4a505b; background: #fff; box-shadow: 0 3px 12px rgba(36, 45, 60, .06); }
.message-row.user .message-bubble { border-color: #f3d7d9; background: #fff0f0; }
.message-bubble p { margin: 0; line-height: 1.7; }
.suggestion-area { display: grid; margin-top: 17px; justify-items: start; gap: 10px; }
.suggestion-label { display: flex; align-items: center; gap: 7px; color: #343a44; font-weight: 700; }
.suggestion-label svg { color: #d71920; }
.suggestion-chip { max-width: 100%; min-height: 38px; padding: 8px 18px; border: 1px solid #efcfd1; border-radius: 20px; color: #c8161d; text-align: left; background: #fff; font-weight: 600; cursor: pointer; }
.suggestion-chip:hover { border-color: #d71920; background: #fff7f7; }
.empty-conversation { display: grid; height: 100%; place-content: center; justify-items: center; color: #7e8691; text-align: center; }
.empty-conversation > span { display: grid; width: 52px; height: 52px; margin-bottom: 14px; place-items: center; border-radius: 50%; color: #fff; background: #1687d9; font-size: 22px; }
.empty-conversation p { margin: 8px 0 0; }
.input-area { padding: 10px 22px 20px; border-top: 1px solid #eceff3; background: #fff; }
.upload-hint { display: flex; margin-bottom: 9px; align-items: center; gap: 8px; color: #7e8691; font-size: 12px; }
.uploaded-file { display: flex; width: fit-content; max-width: 100%; margin-bottom: 8px; padding: 7px 10px; align-items: center; gap: 8px; border: 1px solid #dfe3e9; border-radius: 3px; color: #4f5661; background: #f8f9fb; font-size: 12px; }
.uploaded-file span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.composer { display: grid; grid-template-columns: minmax(0, 1fr) 86px; border: 1px solid #cdd2d9; background: #fff; }
.composer textarea { min-width: 0; height: 74px; padding: 11px 12px; resize: none; border: 0; outline: none; color: #343a44; font: inherit; line-height: 1.5; }
.composer-actions { display: grid; padding: 0 0 0 10px; align-content: stretch; gap: 8px; border-left: 1px solid #e3e6ea; }
.upload-button, .send-button { width: 76px; justify-content: center; }
.send-button { border: 0; border-radius: 2px; color: #fff; background: #d71920; cursor: pointer; }
.send-button:disabled { color: #fff; background: #b9bcc2; cursor: not-allowed; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.result-heading { min-height: 62px; padding: 16px 18px; align-items: center; }
.result-status { display: inline-flex; padding: 5px 9px; align-items: center; gap: 5px; border-radius: 14px; color: #26825c; background: #eaf7f1; font-size: 12px; }
.result-tabs { display: flex; min-height: 48px; padding: 0 18px; align-items: end; gap: 24px; border-bottom: 1px solid #e3e7ec; overflow-x: auto; }
.result-tabs button { position: relative; height: 47px; flex: 0 0 auto; border: 0; color: #5d6470; background: transparent; cursor: pointer; }
.result-tabs button.active { color: #c8161d; font-weight: 700; }
.result-tabs button.active::after { position: absolute; right: 0; bottom: 0; left: 0; height: 2px; background: #d71920; content: ''; }
.result-tabs span { color: #999fa8; }
.result-summary { display: flex; margin: 16px 18px 10px; padding: 13px 15px; align-items: center; gap: 12px; border: 1px solid #dce8f4; border-radius: 4px; background: #f5f9fd; }
.result-summary > span { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 50%; color: #fff; background: #1687d9; }
.result-summary strong { color: #303640; }
.result-summary p { margin: 4px 0 0; color: #7d8490; font-size: 12px; }
.result-table-wrap { min-height: 0; margin: 0 18px; overflow: auto; border: 1px solid #dfe3e9; }
.result-table-wrap table { width: 100%; min-width: 680px; border-collapse: collapse; font-size: 12px; }
.result-table-wrap th { height: 40px; padding: 8px 10px; color: #505762; text-align: left; background: #f4f6f8; border-right: 1px solid #e0e4e9; }
.result-table-wrap td { padding: 12px 10px; color: #5a616c; border-top: 1px solid #e3e6ea; border-right: 1px solid #edf0f3; line-height: 1.5; }
.result-table-wrap tbody tr:hover { background: #fffafa; }
.primary-cell { color: #252b34 !important; font-weight: 600; }
.status-tag { display: inline-block; padding: 3px 7px; border-radius: 3px; white-space: nowrap; }
.status-tag.success { color: #227a56; background: #eaf7f1; }
.status-tag.warning { color: #aa6900; background: #fff4df; }
.linked-detail { margin: 14px 18px 18px; padding: 15px; border: 1px solid #e0e4e9; background: #fafbfc; }
.linked-detail h3 { margin: 0 0 12px; font-size: 14px; }
.linked-detail > div { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.linked-detail article { padding: 12px; border-left: 3px solid #d71920; background: #fff; }
.linked-detail article span { display: block; margin-bottom: 6px; color: #8b929d; font-size: 11px; }
.linked-detail article strong { color: #343a44; font-size: 13px; }
.linked-detail article p { margin: 6px 0 0; color: #6e7580; font-size: 12px; line-height: 1.6; }
.compare-metrics { display: grid; margin: 16px 18px 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.compare-metrics article { display: grid; padding: 13px; gap: 3px; border: 1px solid #e0e4e9; border-radius: 4px; background: #fafbfc; }
.compare-metrics span, .compare-metrics small { color: #7f8792; font-size: 11px; }
.compare-metrics strong { color: #303640; font-size: 23px; }
.compare-metrics .risk strong { color: #d71920; }
.compare-table { flex: 1; }
.compare-advice { display: flex; margin: 14px 18px 18px; padding: 13px 14px; align-items: center; gap: 11px; border: 1px solid #f2d5b1; border-radius: 4px; color: #9a650d; background: #fff9ef; }
.compare-advice > svg { font-size: 20px; }
.compare-advice div { min-width: 0; flex: 1; }
.compare-advice p { margin: 3px 0 0; color: #7c6a4c; font-size: 12px; }
.compare-advice button { flex: 0 0 auto; height: 30px; padding: 0 12px; border: 1px solid #d89a35; border-radius: 3px; color: #9a650d; background: #fff; cursor: pointer; }
@media (max-width: 1180px) {
  .assistant-workspace.has-result { grid-template-columns: minmax(360px, .82fr) minmax(500px, 1.18fr); }
  .workspace-heading { padding-inline: 16px; }
  .chat-toolbar { left: 16px; }
  .message-body, .input-area { padding-inline: 16px; }
}
@media (max-width: 900px) {
  .audit-policy-assistant-page { height: auto; overflow: visible; }
  .assistant-workspace, .assistant-workspace.has-result { grid-template-columns: 1fr; }
  .chat-panel { min-height: 720px; }
  .result-panel { min-height: 620px; }
}
@media (max-width: 620px) {
  .workspace-heading { min-height: 132px; }
  .chat-toolbar { right: 16px; flex-wrap: wrap; }
  .history-popover { width: min(320px, calc(100vw - 64px)); }
  .linked-detail > div, .compare-metrics { grid-template-columns: 1fr; }
}
</style>
