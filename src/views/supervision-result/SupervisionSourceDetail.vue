<script setup>
import { computed } from 'vue';

const props = defineProps({
  file: { type: Object, default: () => ({}) },
  logs: { type: Array, default: () => [] },
  open: { type: Boolean, default: true }
});

const emit = defineEmits(['close', 'view-source', 'reference', 'save-version']);

const recentLogs = computed(() => props.logs.slice(-5).reverse());
</script>

<template>
  <aside
    v-if="open"
    class="source-detail"
    :class="{ 'is-open': open }"
    data-result-region="source-detail"
  >
    <header class="detail-header">
      <h2>来源文件详情</h2>
      <button type="button" aria-label="关闭来源文件详情" @click="emit('close')">×</button>
    </header>

    <div class="detail-body">
      <section class="detail-section">
        <h3>基本信息</h3>
        <dl>
          <div><dt>文件名称</dt><dd>{{ file.filename || '—' }}</dd></div>
          <div><dt>来源部门</dt><dd>{{ file.department || '—' }}</dd></div>
          <div><dt>上传时间</dt><dd>{{ file.uploadedAt || '—' }}</dd></div>
          <div><dt>数据归属周期</dt><dd>{{ file.ownershipPeriod || '—' }}</dd></div>
          <div><dt>标签</dt><dd>{{ file.tags?.join('、') || '—' }}</dd></div>
          <div><dt>可引用状态</dt><dd>{{ file.referenceStatus || '—' }}</dd></div>
          <div><dt>关联任务</dt><dd>{{ file.relatedTask || '—' }}</dd></div>
        </dl>
      </section>

      <section class="detail-section">
        <h3>原文摘要（节选）</h3>
        <p>{{ file.summary || '—' }}</p>
        <small class="page-marker">{{ file.summaryPage ? `第 ${file.summaryPage} 页` : '—' }}</small>
      </section>

      <section class="detail-section">
        <h3>引用到报告章节</h3>
        <p>{{ file.referenceChapter || '—' }}</p>
        <small class="page-marker">{{ file.referencePage ? `第 ${file.referencePage} 页` : '—' }}</small>
      </section>

      <section class="detail-section log-section">
        <h3>操作日志（最近5条）</h3>
        <ul>
          <li v-for="(log, index) in recentLogs" :key="`${log.id}-${index}`">
            <span class="status-dot" :class="log.status" aria-hidden="true"></span>
            <span class="log-copy">
              <time>{{ log.time }}</time>
              <strong>{{ log.action }}</strong>
              <small>{{ log.operator || '—' }}</small>
            </span>
          </li>
        </ul>
      </section>
    </div>

    <footer class="detail-footer">
      <div class="footer-row">
        <button type="button" @click="emit('view-source', file.id)">查看原文</button>
        <button type="button" @click="emit('reference', { rowId: file.id, sectionId: file.defaultSectionId })">引用到报告</button>
      </div>
      <button type="button" class="save-button" @click="emit('save-version')">保存版本</button>
    </footer>
  </aside>
</template>

<style scoped>
.source-detail {
  box-sizing: border-box;
  width: 315px;
  height: 590px;
  display: grid;
  grid-template-rows: 53px minmax(0, 1fr) auto;
  border: 1px solid #dde3eb;
  border-radius: 4px;
  background: #fff;
  color: #202631;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid #edf0f4;
}

.detail-header h2 {
  margin: 0;
  font-size: 16px;
}

.detail-header button {
  border: 0;
  background: transparent;
  color: #667085;
  font-size: 19px;
  cursor: pointer;
}

.detail-body {
  min-height: 0;
  overflow-y: auto;
  padding: 0 14px;
}

.detail-section {
  padding: 12px 0;
  border-bottom: 1px solid #edf0f4;
}

.detail-section h3 {
  margin: 0 0 9px;
  font-size: 13px;
}

dl,
p,
ul {
  margin: 0;
}

dl > div {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 8px;
  margin-top: 7px;
  font-size: 10px;
}

dt {
  color: #667085;
}

dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}

.detail-section p {
  color: #202631;
  font-size: 10px;
  line-height: 1.65;
}

.page-marker {
  display: block;
  margin-top: 7px;
  color: var(--color-info);
  font-size: 10px;
}

ul {
  padding: 0;
  list-style: none;
}

li {
  display: grid;
  grid-template-columns: 7px minmax(0, 1fr);
  gap: 8px;
  padding: 6px 0;
}

.status-dot {
  width: 7px;
  height: 7px;
  margin-top: 3px;
  border-radius: 50%;
  background: #0b9b50;
}

.status-dot.active {
  background: var(--color-info);
}

.status-dot.failed {
  background: var(--color-primary);
}

.log-copy {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr) auto;
  gap: 5px;
  font-size: 10px;
}

.log-copy time,
.log-copy small {
  color: #667085;
  font-size: 9px;
}

.log-copy strong {
  font-weight: 500;
}

.detail-footer {
  padding: 10px 14px 12px;
  border-top: 1px solid #dde3eb;
  background: #fff;
}

.footer-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.detail-footer button {
  height: 34px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background: #fff;
  color: var(--color-primary);
  font-size: 12px;
  cursor: pointer;
}

.detail-footer .save-button {
  width: 100%;
  border-color: #b90008;
  background: var(--color-primary);
  color: #fff;
}
</style>
