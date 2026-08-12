<template>
  <div class="expense-anomaly-detail">
    <header class="detail-header">
      <div class="title-block">
        <h2>费用异常详情</h2>
        <span>异常ID：{{ anomalyCode }}</span>
        <button type="button" class="icon-action" aria-label="复制异常ID" @click="copyAnomalyId">
          <FontAwesomeIcon :icon="faCopy" />
        </button>
      </div>
      <div class="header-actions">
        <button type="button" class="primary" @click="confirmCurrent">确认异常</button>
        <button type="button" class="danger-outline" @click="excludeCurrent">排除异常</button>
        <button type="button" class="danger-outline" @click="focusManual">补充说明</button>
      </div>
    </header>

    <button type="button" class="back-button" @click="$emit('back')">
      <FontAwesomeIcon :icon="faArrowLeft" />
      返回异常列表
    </button>

    <section class="summary-grid" aria-label="异常概要">
      <article class="summary-card alert">
        <span class="summary-icon"><FontAwesomeIcon :icon="faTriangleExclamation" /></span>
        <div>
          <small>异常类型</small>
          <strong>{{ anomaly.type }}</strong>
          <em>{{ anomaly.expenseCategory }}监控规则</em>
        </div>
      </article>
      <article class="summary-card blue">
        <span class="summary-icon"><FontAwesomeIcon :icon="faFileLines" /></span>
        <div>
          <small>处理状态</small>
          <strong>{{ anomaly.status }}</strong>
          <em>{{ handlingLabel }}</em>
        </div>
      </article>
      <article class="summary-card money">
        <span class="summary-icon"><FontAwesomeIcon :icon="faYenSign" /></span>
        <div>
          <small>金额</small>
          <strong>{{ currency(anomaly.amount) }}</strong>
          <em>预算金额：{{ currency(anomaly.budgetAmount) }}</em>
        </div>
      </article>
      <article class="summary-card purple">
        <span class="summary-icon"><FontAwesomeIcon :icon="faShieldHalved" /></span>
        <div>
          <small>命中规则</small>
          <strong>{{ anomaly.ruleName || anomaly.basis }}</strong>
          <em>规则编码：{{ anomaly.ruleId }}</em>
        </div>
      </article>
    </section>

    <div class="detail-layout">
      <main class="detail-main">
        <section class="info-section">
          <header><h3>基本信息</h3><FontAwesomeIcon :icon="faChevronUp" /></header>
          <dl class="info-grid compact">
            <div><dt>报销人</dt><dd>{{ anomaly.employee }}</dd></div>
            <div><dt>员工工号</dt><dd>{{ anomaly.employeeNo }}</dd></div>
            <div><dt>部门</dt><dd>{{ anomaly.department }}</dd></div>
            <div><dt>岗位</dt><dd>{{ jobTitle }}</dd></div>
            <div><dt>发生时间</dt><dd>{{ anomaly.occurredAt }}</dd></div>
            <div><dt>报销单号</dt><dd>{{ billNo }}</dd></div>
            <div><dt>报销金额</dt><dd>{{ currency(anomaly.amount) }}</dd></div>
            <div><dt>币种</dt><dd>人民币</dd></div>
            <div><dt>凭证编号</dt><dd>{{ anomaly.voucherNo }}</dd></div>
            <div><dt>提交时间</dt><dd>{{ submitTime }}</dd></div>
            <div><dt>来源系统</dt><dd>{{ anomaly.dataSource }}</dd></div>
            <div><dt>单据状态</dt><dd><span class="tag green">已提交</span></dd></div>
          </dl>
          <h4>票据 OCR 字段</h4>
          <dl class="info-grid">
            <div><dt>票据类型</dt><dd>{{ anomaly.expenseCategory }}电子普通发票</dd></div>
            <div><dt>发票号码</dt><dd>{{ invoiceNo }}</dd></div>
            <div><dt>开票日期</dt><dd>{{ anomaly.occurredAt }}</dd></div>
            <div><dt>价税合计</dt><dd>{{ currency(anomaly.amount) }}</dd></div>
            <div><dt>销售方</dt><dd>{{ vendorName }}</dd></div>
            <div><dt>纳税人识别号</dt><dd>{{ taxpayerNo }}</dd></div>
            <div><dt>金额(不含税)</dt><dd>{{ currency(netAmount) }}</dd></div>
            <div><dt>税额</dt><dd>{{ currency(taxAmount) }}</dd></div>
            <div><dt>备注</dt><dd>{{ anomaly.expenseCategory }}</dd></div>
            <div><dt>证据状态</dt><dd><span class="tag" :class="evidenceTone">{{ evidenceLabel }}</span></dd></div>
          </dl>
        </section>

        <section class="info-section">
          <header><h3>规则命中与判断理由</h3><FontAwesomeIcon :icon="faChevronUp" /></header>
          <dl class="info-grid rule-grid">
            <div><dt>命中规则</dt><dd>{{ anomaly.ruleName || anomaly.basis }}</dd></div>
            <div><dt>规则编码</dt><dd>{{ anomaly.ruleId }}</dd></div>
            <div><dt>规则类型</dt><dd>{{ anomaly.expenseCategory }}规则</dd></div>
            <div><dt>命中时间</dt><dd>{{ hitTime }}</dd></div>
            <div class="wide"><dt>规则描述</dt><dd>{{ evidence.ruleDescription }}</dd></div>
            <div class="wide"><dt>规则条件</dt><dd>{{ ruleCondition }}</dd></div>
            <div class="wide"><dt>标准上限</dt><dd>{{ budgetLine }}</dd></div>
            <div class="wide danger-line"><dt>判断理由</dt><dd>{{ judgmentReason }}</dd></div>
          </dl>
        </section>

        <section class="info-section">
          <header><h3>证据链与关联票据</h3></header>
          <table class="mini-table">
            <thead>
              <tr><th>证据类型</th><th>证据名称</th><th>关联内容</th><th>证据状态</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="file in evidenceFiles" :key="file.name">
                <td>{{ file.type.toUpperCase() }}</td>
                <td>{{ file.name }}</td>
                <td>{{ file.content }}</td>
                <td><span class="tag" :class="file.tone">{{ file.status }}</span></td>
                <td><button type="button" @click="notice('正在预览证据文件')">查看</button><button type="button" @click="notice('证据文件下载已开始')">下载</button></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="info-section approval-section">
          <header><h3>审批链路</h3></header>
          <ol class="approval-chain">
            <li v-for="step in approvalSteps" :key="`${step.label}-${step.time}`" :class="step.state">
              <span class="node"><FontAwesomeIcon :icon="step.state === 'todo' ? faClock : faUserCheck" /></span>
              <strong>{{ step.label }}</strong>
              <small>{{ step.person || '待处理' }}</small>
              <time>{{ step.time || '待处理' }}</time>
            </li>
          </ol>
        </section>
      </main>

      <aside class="detail-side">
        <section class="side-section">
          <header><h3>历史相似记录</h3><button type="button" @click="notice('已展开更多相似记录')">更多</button></header>
          <table class="side-table">
            <thead><tr><th>异常ID</th><th>异常类型</th><th>金额</th><th>处理状态</th></tr></thead>
            <tbody>
              <tr v-for="item in similarRows" :key="item.anomalyId">
                <td>{{ item.anomalyId }}</td>
                <td>{{ item.type || anomaly.type }}</td>
                <td>{{ currency(item.amount) }}</td>
                <td><span class="tag" :class="statusTone(item.status)">{{ item.status || item.riskLevel }}</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section ref="manualPanel" class="side-section manual-section">
          <header><h3>人工处理</h3></header>
          <label class="radio-line">
            <span>处理意见 <b>*</b></span>
            <label><input v-model="manualDecision" value="confirm" type="radio" />确认异常</label>
            <label><input v-model="manualDecision" value="exclude" type="radio" />排除异常</label>
          </label>
          <label class="textarea-field">
            <span>处理说明 <b>*</b></span>
            <textarea v-model="manualReason" maxlength="500" placeholder="请填写处理说明（需说明依据及结论）"></textarea>
            <small>{{ manualReason.length }}/500</small>
          </label>
          <label class="textarea-field">
            <span>补充建议</span>
            <textarea v-model="manualSupplement" maxlength="500" placeholder="如需补充建议，请填写"></textarea>
            <small>{{ manualSupplement.length }}/500</small>
          </label>
          <button type="button" class="submit-button" @click="submitManual">提交处理意见</button>
        </section>

        <section class="side-section">
          <header><h3>回溯口径</h3></header>
          <dl class="trace-grid">
            <div><dt>审计期间</dt><dd>2025-01-01 至 2025-03-31</dd></div>
            <div><dt>适用版本</dt><dd>费用审计规则 v2.3.0</dd></div>
            <div><dt>规则来源</dt><dd>{{ anomaly.basis }}</dd></div>
            <div><dt>费用标准来源</dt><dd>公司费用标准手册（2025版）</dd></div>
            <div><dt>是否追溯</dt><dd>否</dd></div>
            <div><dt>生效时间</dt><dd>2025-01-01</dd></div>
          </dl>
        </section>
      </aside>
    </div>

    <div v-if="toast" class="detail-toast" role="status">{{ toast }}</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faArrowLeft,
  faChevronUp,
  faClock,
  faCopy,
  faFileLines,
  faShieldHalved,
  faTriangleExclamation,
  faUserCheck,
  faYenSign
} from '@fortawesome/free-solid-svg-icons';

const props = defineProps({
  anomaly: { type: Object, required: true },
  evidence: { type: Object, default: () => ({}) },
  similarRows: { type: Array, default: () => [] }
});

const emit = defineEmits(['back', 'confirm', 'exclude', 'supplement']);
const manualPanel = ref(null);
const manualDecision = ref('confirm');
const manualReason = ref('');
const manualSupplement = ref('');
const toast = ref('');
let toastTimer;

const anomalyCode = computed(() => props.anomaly.displayId || props.anomaly.anomalyId);
const evidenceLabel = computed(() => props.anomaly.evidenceStatus || '完整');
const evidenceTone = computed(() => evidenceLabel.value === '不完整' ? 'orange' : 'green');
const handlingLabel = computed(() => props.anomaly.status === '待补充' ? '人工复核中' : props.anomaly.status === '待确认' ? '待人工处理' : '已形成处理结论');
const billNo = computed(() => `BX${props.anomaly.anomalyId?.replace(/\D/g, '').slice(-11) || '20250428001'}`);
const invoiceNo = computed(() => `04500${props.anomaly.employeeNo || '200111'}`);
const submitTime = computed(() => `${props.anomaly.occurredAt || '2025-03-15'} 10:23:45`);
const hitTime = computed(() => `${props.anomaly.occurredAt || '2025-03-15'} 10:23:12`);
const taxpayerNo = computed(() => `9131010${String(props.anomaly.employeeNo || '200111').padEnd(8, 'X')}`);
const taxAmount = computed(() => Math.round(Number(props.anomaly.amount || 0) * 0.06 * 100) / 100);
const netAmount = computed(() => Math.max(0, Number(props.anomaly.amount || 0) - taxAmount.value));
const jobTitle = computed(() => props.anomaly.department?.includes('市场') ? '市场专员' : props.anomaly.department?.includes('财务') ? '财务专员' : '业务专员');
const vendorName = computed(() => props.anomaly.expenseCategory === '住宿费' ? 'XX酒店管理有限公司' : `${props.anomaly.expenseCategory || '费用'}供应商有限公司`);
const ruleCondition = computed(() => {
  if (props.anomaly.type === '超预算未审批') return '报销金额超出预算控制线，且未查询到有效预算调整或加签审批。';
  if (props.anomaly.type === '费用违规报销') return '费用用途、票据信息或审批链路与费用报销管理办法不一致。';
  return '凭证字段、业务说明和审批记录存在不一致，需要人工核验。';
});
const budgetLine = computed(() => {
  const budget = Number(props.anomaly.budgetAmount || 0);
  return budget ? `预算控制线：${currency(budget)}；当前报销：${currency(props.anomaly.amount)}` : `标准上限：${currency(Math.round(Number(props.anomaly.amount || 0) * 0.78))}`;
});
const judgmentReason = computed(() => props.evidence.ruleHit || `${props.anomaly.type}命中${props.anomaly.basis}，需复核报销依据。`);
const approvalSteps = computed(() => props.evidence.approvalSteps?.length ? props.evidence.approvalSteps : [
  { label: '提交报销', person: props.anomaly.employee, time: submitTime.value, state: 'done' },
  { label: '部门负责人审批', person: '部门负责人', time: '', state: 'todo' }
]);
const evidenceFiles = computed(() => {
  const files = props.evidence.evidenceFiles?.length
    ? props.evidence.evidenceFiles
    : (props.anomaly.evidence || []).map((name, index) => ({ type: index % 2 ? 'excel' : 'pdf', name }));
  return files.map((file, index) => ({
    ...file,
    content: index === 0 ? `${props.anomaly.expenseCategory} ${currency(props.anomaly.amount)}` : (props.anomaly.evidence?.[index] || props.anomaly.basis),
    status: index === 2 || evidenceLabel.value === '不完整' ? '证据补充' : '证据完整',
    tone: index === 2 || evidenceLabel.value === '不完整' ? 'orange' : 'green'
  }));
});

watch(() => props.anomaly.anomalyId, () => {
  manualDecision.value = props.anomaly.status === '已排除' ? 'exclude' : 'confirm';
  manualReason.value = props.anomaly.exclusionReason || props.anomaly.supplementNote || '';
  manualSupplement.value = props.anomaly.remediation || '';
}, { immediate: true });

function currency(value) {
  return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusTone(status = '') {
  if (status.includes('确认')) return 'red';
  if (status.includes('排除')) return 'green';
  if (status.includes('补充')) return 'orange';
  return 'blue';
}

function notice(message) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = '';
  }, 1800);
}

function copyAnomalyId() {
  navigator.clipboard?.writeText(props.anomaly.anomalyId);
  notice('异常ID已复制');
}

function focusManual() {
  manualPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  notice('请在人工处理区填写补充建议');
}

function confirmCurrent() {
  emit('confirm', props.anomaly);
  notice('已确认该异常');
}

function excludeCurrent() {
  const reason = manualReason.value.trim() || '经人工复核排除';
  emit('exclude', props.anomaly, reason);
  notice('已排除该异常');
}

function submitManual() {
  const reason = manualReason.value.trim();
  const supplement = manualSupplement.value.trim();
  if (manualDecision.value === 'exclude') {
    emit('exclude', props.anomaly, reason || '经人工复核排除');
    notice('处理意见已提交');
    return;
  }
  if (supplement) emit('supplement', props.anomaly, supplement);
  emit('confirm', props.anomaly);
  notice('处理意见已提交');
}
</script>

<style scoped>
.expense-anomaly-detail {
  min-height: 0;
  height: calc(100dvh - 56px);
  overflow: auto;
  padding: 12px 14px;
  background: #f5f7fb;
  color: #172033;
}

.detail-header,
.summary-card,
.info-section,
.side-section {
  border: 1px solid #e3e8f0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(15, 23, 42, .04);
}

.detail-header {
  display: flex;
  min-height: 54px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 0 14px;
}

.title-block,
.header-actions,
.back-button,
.radio-line,
.approval-chain li {
  display: flex;
  align-items: center;
}

.title-block {
  gap: 10px;
  min-width: 0;
}

.title-block h2 {
  margin: 0;
  color: #14213d;
  font-size: 20px;
}

.title-block span,
.title-block button,
.side-section header button,
.mini-table button {
  color: #5f6b7c;
  font-size: 12px;
}

.icon-action,
.mini-table button,
.side-section header button {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.header-actions {
  gap: 10px;
}

.header-actions button,
.submit-button {
  height: 34px;
  min-width: 98px;
  border-radius: 4px;
  padding: 0 16px;
  font-weight: 700;
  cursor: pointer;
}

.primary,
.submit-button {
  border: 1px solid #d81424;
  background: #d81424;
  color: #fff;
}

.danger-outline {
  border: 1px solid #e3383f;
  background: #fff;
  color: #d81424;
}

.back-button {
  gap: 8px;
  height: 30px;
  margin: 8px 0;
  border: 1px solid #d8dee8;
  border-radius: 4px;
  padding: 0 12px;
  background: #fff;
  color: #4b5566;
  cursor: pointer;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.summary-card {
  display: grid;
  min-height: 82px;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
}

.summary-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 50%;
  font-size: 24px;
}

.summary-card small,
.summary-card em {
  display: block;
  color: #667085;
  font-size: 12px;
  font-style: normal;
}

.summary-card strong {
  display: block;
  overflow: hidden;
  margin: 5px 0 4px;
  color: #172033;
  font-size: 17px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-card.alert .summary-icon { background: #ffe7e7; color: #e11d2e; }
.summary-card.blue .summary-icon { background: #e9f1ff; color: #2166d1; }
.summary-card.money .summary-icon { background: #ffe8e8; color: #d81424; }
.summary-card.purple .summary-icon { background: #f1e6ff; color: #7b3fbd; }

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(350px, .88fr);
  gap: 10px;
  margin-top: 10px;
}

.detail-main,
.detail-side {
  display: grid;
  gap: 10px;
  align-content: start;
  min-width: 0;
}

.info-section,
.side-section {
  overflow: hidden;
}

.info-section > header,
.side-section > header {
  display: flex;
  min-height: 38px;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid #edf1f6;
}

h3,
h4 {
  margin: 0;
  font-size: 15px;
}

h4 {
  padding: 10px 14px 6px;
}

.info-grid,
.trace-grid {
  display: grid;
  margin: 0;
}

.info-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid #edf1f6;
  border-left: 1px solid #edf1f6;
}

.info-grid.compact {
  border-top: 0;
}

.info-grid > div,
.trace-grid > div {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  min-height: 34px;
  align-items: center;
  border-right: 1px solid #edf1f6;
  border-bottom: 1px solid #edf1f6;
}

.info-grid dt,
.trace-grid dt {
  align-self: stretch;
  padding: 9px 12px;
  background: #f7f9fc;
  color: #596579;
  font-size: 12px;
}

.info-grid dd,
.trace-grid dd {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  padding: 0 12px;
  color: #172033;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rule-grid > .wide {
  grid-column: 1 / -1;
}

.rule-grid > .wide dd {
  white-space: normal;
  line-height: 1.5;
}

.danger-line {
  background: #fff3f3;
}

.danger-line dd {
  color: #b42318;
}

.mini-table,
.side-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.mini-table th,
.mini-table td,
.side-table th,
.side-table td {
  height: 32px;
  overflow: hidden;
  border-bottom: 1px solid #edf1f6;
  padding: 0 10px;
  color: #172033;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-table th,
.side-table th {
  background: #f7f9fc;
  color: #586579;
}

.mini-table button + button {
  margin-left: 10px;
}

.tag {
  display: inline-flex;
  align-items: center;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
}

.tag.green { border: 1px solid #bfe7d1; background: #ebf8f1; color: #108855; }
.tag.orange { border: 1px solid #ffd9b3; background: #fff7ed; color: #c36a13; }
.tag.red { border: 1px solid #ffcaca; background: #fff1f1; color: #d81424; }
.tag.blue { border: 1px solid #cfe0ff; background: #eff6ff; color: #2166d1; }

.approval-section {
  padding-bottom: 12px;
}

.approval-chain {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  margin: 14px 22px 6px;
  padding: 0;
  list-style: none;
}

.approval-chain li {
  position: relative;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.approval-chain li::before {
  position: absolute;
  top: 14px;
  right: 50%;
  left: -50%;
  height: 2px;
  background: #e11d2e;
  content: "";
}

.approval-chain li:first-child::before {
  display: none;
}

.approval-chain li.todo::before {
  background: linear-gradient(90deg, #e11d2e 0 45%, #cfd7e5 45% 100%);
}

.node {
  z-index: 1;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: #e11d2e;
  color: #fff;
  font-size: 12px;
}

.todo .node {
  border: 2px solid #a8b2c1;
  background: #fff;
  color: #667085;
}

.approval-chain strong {
  margin-top: 3px;
  font-size: 12px;
}

.approval-chain small,
.approval-chain time {
  color: #667085;
  font-size: 11px;
}

.side-section {
  padding-bottom: 12px;
}

.side-section header button {
  color: #667085;
}

.manual-section {
  padding: 0 14px 14px;
}

.manual-section header {
  margin: 0 -14px 12px;
}

.radio-line {
  gap: 16px;
  margin-bottom: 10px;
  color: #172033;
  font-size: 12px;
}

.radio-line span {
  min-width: 68px;
}

b {
  color: #d81424;
}

.radio-line label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.textarea-field {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr);
  gap: 10px;
  margin-top: 8px;
  color: #172033;
  font-size: 12px;
}

.textarea-field textarea {
  min-height: 62px;
  resize: vertical;
  border: 1px solid #d8dee8;
  border-radius: 4px;
  padding: 9px 10px;
  color: #172033;
  font: inherit;
}

.textarea-field small {
  grid-column: 2;
  margin-top: -4px;
  text-align: right;
  color: #8a94a6;
}

.submit-button {
  margin: 10px 0 0 78px;
}

.trace-grid {
  border-top: 1px solid #edf1f6;
}

.trace-grid > div {
  grid-template-columns: 110px minmax(0, 1fr);
  border-right: 0;
}

.detail-toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 30;
  border-radius: 4px;
  padding: 9px 14px;
  background: rgba(23, 32, 51, .92);
  color: #fff;
  font-size: 12px;
}

@media (max-width: 1360px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 920px) {
  .expense-anomaly-detail {
    height: auto;
    min-height: calc(100dvh - 56px);
  }

  .detail-header,
  .header-actions {
    flex-wrap: wrap;
  }

  .summary-grid,
  .info-grid,
  .approval-chain {
    grid-template-columns: 1fr;
  }

  .approval-chain li::before {
    display: none;
  }
}
</style>
