<script setup>
const props = defineProps({
  exportFiles: { type: Array, default: () => [] },
  saved: { type: Boolean, default: false },
  sideOnly: { type: Boolean, default: false }
});

const emit = defineEmits(['download-file', 'view-task', 'view-version', 'view-trail']);

const fallbackFiles = [
  { id: 'file-1', name: '差异清单', size: '24KB', type: 'xlsx' },
  { id: 'file-2', name: '费用异常汇总', size: '18KB', type: 'xlsx' },
  { id: 'file-3', name: '审计规范', size: '22KB', type: 'xlsx' },
  { id: 'file-4', name: '监管共享分析报告', size: '215KB', type: 'docx' },
  { id: 'file-5', name: '审计报告草稿', size: '1.2MB', type: 'docx' },
  { id: 'file-6', name: '审核问题清单', size: '16KB', type: 'xlsx' }
];
</script>

<template>
  <footer class="audit-result-footer" :class="{ 'side-only': sideOnly }">
    <section v-if="!sideOnly" class="footer-region export-records" data-audit-region="export-records">
      <h2>导出与版本记录</h2>
      <p>可导出文件（生成后可下载）</p>
      <div class="file-cards">
        <button
          v-for="file in (props.exportFiles.length ? props.exportFiles : fallbackFiles)"
          :key="file.id"
          class="file-card"
          type="button"
          :aria-label="`下载${file.name}`"
          @click="emit('download-file', file)"
        >
          <span class="file-card__icon" :class="{ 'is-word': file.type === 'docx' }" aria-hidden="true">
            {{ file.type === 'docx' ? 'W' : 'X' }}
          </span>
          <span class="file-card__name">{{ file.name }}</span>
          <small>{{ file.size }}</small>
        </button>
      </div>
    </section>

    <section v-if="!sideOnly" class="footer-region version-timeline" data-audit-region="version-timeline">
      <h2>版本记录时间线</h2>
      <div class="version-line" aria-label="版本记录">
        <article class="version-node is-complete">
          <span class="version-node__dot" aria-hidden="true"></span>
          <strong>V0.1 任务创建</strong>
          <time>2025-04-28 09:15:32</time>
          <small>审计管理员</small>
        </article>
        <article class="version-node is-complete">
          <span class="version-node__dot" aria-hidden="true"></span>
          <strong>V0.9 生成完成</strong>
          <time>2025-05-10 10:25:45</time>
          <small>系统</small>
        </article>
        <article class="version-node is-current">
          <span class="version-node__dot" aria-hidden="true"></span>
          <strong>V1.0 人工确认草稿</strong>
          <time>{{ saved ? '2025-05-10 10:30:21' : '待保存' }}</time>
          <small>审计员A（李娜）</small>
        </article>
      </div>
    </section>

    <section v-if="sideOnly" class="footer-region quick-actions" data-audit-region="quick-actions">
      <h2>操作快捷入口</h2>
      <div class="quick-action-list">
        <button type="button" @click="emit('view-task')"><span aria-hidden="true">▤</span><b>查看任务详情</b></button>
        <button type="button" @click="emit('view-version')"><span aria-hidden="true">▧</span><b>查看版本对比</b></button>
        <button type="button" @click="emit('view-trail')"><span aria-hidden="true">▥</span><b>查看操作留痕</b></button>
      </div>
    </section>
  </footer>
</template>

<style scoped>
.audit-result-footer { min-width: 0; display: grid; grid-template-columns: minmax(0,1.7fr) minmax(300px,1fr); gap: 10px; color: #27303b; font-size: 11px; }.audit-result-footer.side-only{display:block}.side-only .footer-region{width:100%;height:115px}
.footer-region { min-width: 0; height: 148px; padding: 12px 13px; box-sizing: border-box; border: 1px solid #dfe3ea; background: #fff; overflow: hidden; }
.footer-region h2 { margin: 0; color: #252c36; font-size: 13px; line-height: 1.25; font-weight: 700; }
.export-records > p { margin: 5px 0 7px; color: #657080; font-size: 10px; }
.file-cards { display: grid; grid-template-columns: repeat(6, minmax(64px, 1fr)); gap: 8px; }
.file-card { min-width: 0; height: 74px; display: grid; grid-template-columns: 22px minmax(0, 1fr); grid-template-rows: 1fr auto; align-items: start; gap: 4px 6px; padding: 9px 8px 7px; border: 1px solid #dde3eb; border-radius: 3px; background: #fff; color: #2e3743; text-align: left; cursor: pointer; }
.file-card__icon { width: 20px; height: 20px; display: grid; place-items: center; border-radius: 2px; background: #139b57; color: #fff; font-size: 11px; font-weight: 800; }
.file-card__icon.is-word { background: #286bd5; }
.file-card__name { min-width: 0; align-self: center; line-height: 1.25; overflow-wrap: anywhere; }
.file-card small { grid-column: 1 / -1; align-self: end; color: #697382; font-size: 9px; }
.version-timeline { padding-inline: 14px; }
.version-line { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 23px; }
.version-line::before { content: ''; position: absolute; top: -9px; left: 4px; right: 4px; height: 1px; background: #bdc6d2; }
.version-node { position: relative; display: grid; gap: 4px; min-width: 0; }
.version-node__dot { position: absolute; top: -13px; left: 0; width: 8px; height: 8px; border: 2px solid #98a5b7; border-radius: 50%; background: #fff; box-sizing: border-box; }
.version-node strong { font-size: 10px; line-height: 1.25; white-space: nowrap; }
.version-node time, .version-node small { color: #687383; font-size: 8px; line-height: 1.25; white-space: nowrap; }
.version-node.is-complete:nth-child(2) .version-node__dot { border-color: #3887f5; box-shadow: 0 0 0 2px #d9e9ff; background: #3887f5; }
.version-node.is-current { color: #cf1010; }
.version-node.is-current .version-node__dot { border-color: #d20b0b; box-shadow: 0 0 0 2px #ffdddd; background: #d20b0b; }
.quick-actions { display: flex; flex-direction: column; }
.quick-action-list { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); align-items: center; gap: 3px; }
.quick-action-list button { min-width: 0; display: grid; justify-items: center; gap: 8px; padding: 7px 2px; border: 0; background: transparent; color: #343c48; cursor: pointer; }
.quick-action-list span { font-size: 23px; line-height: 1; font-weight: 400; }
.quick-action-list b { font-size: 10px; line-height: 1.2; font-weight: 500; white-space: nowrap; }
.audit-result-footer button:focus-visible { outline: 2px solid var(--color-info); outline-offset: 1px; }
.file-card:hover { border-color: #aeb9c8; background: #fafbfc; }
.file-card small,
.export-records > p,
.version-node strong,
.version-node time,
.version-node small,
.quick-action-list b {
  font-size: var(--ui-font-xs);
  line-height: 1.3;
}
@media (max-width: 1199px) {
  .audit-result-footer { grid-template-columns: minmax(0, 1fr); gap: 8px; overflow:visible; }
  .footer-region { height: 140px; padding: 10px; }
  .file-cards { gap: 5px; }
  .file-card { padding-inline: 6px; }
}
</style>
