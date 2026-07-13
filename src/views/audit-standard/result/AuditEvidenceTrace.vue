<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  item: { type: Object, default: null },
  operationTrail: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'confirm-reference', 'replace-source', 'confirm-citation', 'view-original']);

const openSections = ref({ similar: false, chat: false, history: true });
const evidence = computed(() => props.item?.evidence || {});
const itemId = computed(() => props.item?.id || 'CP-03-001');
const latestOperation = computed(() => props.operationTrail.at(-1));

const phases = [
  { label: '创建任务', time: '05-10 09:15', state: 'done' },
  { label: '上传资料', time: '05-10 09:22', state: 'done' },
  { label: '资料解析', time: '05-10 09:28', state: 'done' },
  { label: '能力执行', time: '05-10 10:23', state: 'active' },
  { label: '结果确认', time: '--', state: 'wait' },
  { label: '保存版本', time: '--', state: 'wait' },
  { label: '提交复核', time: '--', state: 'wait' },
  { label: '导出归档', time: '--', state: 'wait' }
];

function toggle(section) {
  openSections.value[section] = !openSections.value[section];
}
</script>

<template>
  <aside class="evidence-trace" data-audit-region="evidence-trace" aria-label="来源依据追溯">
    <header class="evidence-trace__header">
      <h2>来源依据追溯</h2>
      <button class="icon-close" type="button" aria-label="关闭来源依据追溯" @click="emit('close')">×</button>
    </header>

    <div class="evidence-trace__body">
      <div class="evidence-trace__detail">
        <section class="trace-section trace-section--policy">
          <h3>制度条款详情</h3>
          <dl class="detail-list">
            <div><dt>制度名称</dt><dd>{{ evidence.policyName || '费用报销管理办法（2024版）' }}</dd></div>
            <div><dt>条款编号</dt><dd>{{ evidence.clause || '第三十五条' }}</dd></div>
            <div><dt>原文摘要</dt><dd>{{ evidence.excerpt || '报销费用应真实、合法、合规，并按照授权权限履行审批程序。' }}</dd></div>
            <div><dt>页码</dt><dd>{{ evidence.page || '第 35 页' }}</dd></div>
            <div><dt>生效版本</dt><dd>{{ evidence.effectiveVersion || '2024-01-01 起生效' }}</dd></div>
            <div><dt>引用到条目</dt><dd>{{ itemId }} 费用报销审批权限验证</dd></div>
          </dl>
          <div class="policy-action"><button type="button" @click="emit('view-original')">查看原文</button></div>
        </section>

        <section class="trace-section">
          <h3>关联文件</h3>
          <div class="file-reference">
            <span class="file-reference__icon" aria-hidden="true">PDF</span>
            <span class="file-reference__name">{{ evidence.fileName || '费用报销管理办法（2024版）.pdf' }}<small>{{ evidence.page || '第35页' }}</small></span>
            <button type="button" @click="emit('view-original')">预览</button>
            <button class="download" type="button" aria-label="下载关联文件">↓</button>
          </div>
        </section>

        <section class="trace-section">
          <h3>人工处理</h3>
          <dl class="detail-list detail-list--compact">
            <div><dt>处理意见</dt><dd>引用正确，用于条目生成</dd></div>
            <div><dt>处理人</dt><dd>{{ latestOperation?.operator || '李娜（审计员A）' }}</dd></div>
            <div><dt>处理时间</dt><dd>{{ latestOperation?.time || '2025-05-10 10:26:12' }}</dd></div>
          </dl>
        </section>

        <div class="trace-folds">
          <section v-for="section in [
            { key: 'similar', title: '同类条款（3）', content: '已匹配 3 条同类制度条款' },
            { key: 'chat', title: '智能体会话记录', content: '已记录本条目的生成与引用判断过程' },
            { key: 'history', title: '版本历史', content: 'V0.9 生成完成 · V1.0 人工确认草稿' }
          ]" :key="section.key" class="fold-section">
            <button type="button" :aria-expanded="openSections[section.key]" @click="toggle(section.key)">
              <span>{{ section.title }}</span><span aria-hidden="true">{{ openSections[section.key] ? '⌃' : '⌄' }}</span>
            </button>
            <p v-if="openSections[section.key]">{{ section.content }}</p>
          </section>
        </div>
      </div>

      <section class="process-trace" aria-label="流程追溯">
        <h3>流程追溯</h3>
        <ol>
          <li v-for="phase in phases" :key="phase.label" :class="`is-${phase.state}`">
            <span class="process-trace__dot" aria-hidden="true"></span>
            <strong>{{ phase.label }}</strong>
            <small>{{ phase.time }}</small>
          </li>
        </ol>
      </section>
    </div>

    <footer class="evidence-trace__actions">
      <button class="is-primary" type="button" @click="emit('confirm-reference')">确认引用</button>
      <button type="button" @click="emit('replace-source')">替换来源</button>
      <button class="is-danger" type="button" @click="emit('confirm-citation')">确认引庇</button>
      <button class="is-wide" type="button" @click="emit('view-original')">查看原文</button>
    </footer>
  </aside>
</template>

<style scoped>
.evidence-trace { height: 100%; min-height: 636px; display: flex; flex-direction: column; background: #fff; border: 1px solid #dfe3ea; color: #252b36; font-size: 11px; overflow: hidden; }
.evidence-trace__header { height: 48px; flex: 0 0 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; border-bottom: 1px solid #e7e9ee; }
.evidence-trace h2 { margin: 0; font-size: 15px; line-height: 1; font-weight: 700; }
.icon-close { border: 0; padding: 3px; background: transparent; color: #222b38; font-size: 21px; line-height: 1; cursor: pointer; }
.evidence-trace__body { min-height: 0; flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) 82px; }
.evidence-trace__detail { min-width: 0; overflow: auto; border-right: 1px solid #e7e9ee; }
.trace-section { padding: 12px 12px 10px; border-bottom: 1px solid #e7e9ee; }
.trace-section h3, .process-trace h3 { margin: 0 0 10px; font-size: 12px; font-weight: 700; }
.detail-list { display: grid; gap: 8px; margin: 0; }
.detail-list > div { display: grid; grid-template-columns: 58px minmax(0, 1fr); gap: 6px; line-height: 1.5; }
.detail-list dt { color: #626b79; white-space: nowrap; }
.detail-list dd { min-width: 0; margin: 0; color: #303744; overflow-wrap: anywhere; }
.detail-list--compact { gap: 6px; }
.policy-action { display: flex; justify-content: flex-end; margin-top: 8px; }
.policy-action button, .file-reference button { border: 0; background: transparent; color: #1677ff; font-size: inherit; cursor: pointer; }
.policy-action button { min-width: 74px; height: 26px; border: 1px solid #d9dfe8; border-radius: 3px; color: #333b48; background: #fff; }
.file-reference { display: grid; grid-template-columns: 25px minmax(0, 1fr) auto auto; align-items: center; gap: 6px; }
.file-reference__icon { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 2px; background: #e52920; color: #fff; font-size: 7px; font-weight: 700; }
.file-reference__name { min-width: 0; line-height: 1.35; overflow-wrap: anywhere; }
.file-reference__name small { display: block; margin-top: 2px; color: #727b88; font-size: 10px; }
.file-reference .download { padding: 1px; font-size: 16px; }
.trace-folds { border-bottom: 1px solid #e7e9ee; }
.fold-section + .fold-section { border-top: 1px solid #e7e9ee; }
.fold-section > button { width: 100%; height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border: 0; background: #fff; color: #303744; font: inherit; font-weight: 700; cursor: pointer; }
.fold-section p { margin: -2px 12px 10px; color: #687180; line-height: 1.45; }
.process-trace { min-width: 0; padding: 12px 7px; overflow: hidden auto; }
.process-trace h3 { text-align: center; white-space: nowrap; }
.process-trace ol { margin: 0; padding: 0; list-style: none; }
.process-trace li { position: relative; display: grid; justify-items: start; gap: 3px; min-height: 63px; padding: 0 0 7px 18px; color: #78818e; }
.process-trace li:not(:last-child)::before { content: ''; position: absolute; top: 11px; bottom: -1px; left: 5px; width: 1px; background: #cfd5de; }
.process-trace__dot { position: absolute; top: 3px; left: 0; width: 10px; height: 10px; border: 2px solid #bec5cf; border-radius: 50%; background: #fff; box-sizing: border-box; }
.process-trace strong { color: inherit; font-size: 10px; line-height: 1.25; white-space: nowrap; }
.process-trace small { font-size: 8px; line-height: 1.2; white-space: nowrap; }
.process-trace li.is-done { color: #4a5562; }
.process-trace li.is-done::before { background: #18a66a; }
.process-trace li.is-done .process-trace__dot { border-color: #149d61; box-shadow: inset 0 0 0 2px #fff; background: #149d61; }
.process-trace li.is-active { color: #d20b0b; font-weight: 700; }
.process-trace li.is-active .process-trace__dot { border-color: #d20b0b; box-shadow: 0 0 0 2px #ffe0e0; background: #d20b0b; }
.evidence-trace__actions { flex: 0 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 10px 12px 12px; border-top: 1px solid #e7e9ee; background: #fff; }
.evidence-trace__actions button { min-width: 0; height: 30px; border: 1px solid #d6dce5; border-radius: 3px; background: #fff; color: #303744; font-size: 11px; cursor: pointer; white-space: nowrap; }
.evidence-trace__actions .is-primary { border-color: #c70000; background: #c70000; color: #fff; }
.evidence-trace__actions .is-danger { border-color: #e53935; color: #d30e0e; }
.evidence-trace__actions .is-wide { grid-column: 1 / -1; }
.evidence-trace button:focus-visible { outline: 2px solid #1677ff; outline-offset: 1px; }
@media (max-width: 1199px) {
  .evidence-trace { min-height: 560px; }
  .evidence-trace__body { grid-template-columns: minmax(230px, 1fr) 78px; }
  .trace-section { padding-inline: 10px; }
}
</style>
