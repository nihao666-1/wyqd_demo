<template>
  <section class="material-file-list" aria-labelledby="material-list-title">
    <header class="list-header">
      <h3 id="material-list-title">文件解析清单</h3>
      <span>共 {{ visibleRows.length }} 条</span>
    </header>

    <div class="desktop-table">
      <table>
        <thead>
          <tr>
            <th>文件名称</th>
            <th>文件类型</th>
            <th>所属能力</th>
            <th>上传状态</th>
            <th>解析状态</th>
            <th>页数/表格数</th>
            <th>元数据状态</th>
            <th>引用状态</th>
            <th class="action-heading">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="file in pagedRows"
            :key="file.id"
            :class="{ selected: file.id === selectedId }"
            :aria-selected="file.id === selectedId"
            tabindex="0"
            @click="emit('select', file.id)"
            @keydown.enter="emit('select', file.id)"
            @keydown.space.prevent="emit('select', file.id)"
          >
            <td class="file-name-cell" :title="file.name">
              <FontAwesomeIcon :class="fileTone(file.type)" :icon="fileIcon(file.type)" aria-hidden="true" />
              <span>{{ file.name }}</span>
            </td>
            <td>{{ file.type || '—' }}</td>
            <td :title="file.ability">{{ file.ability || '—' }}</td>
            <td><StatusTag :value="file.uploadStatus" /></td>
            <td><StatusTag :value="file.parseStatus" /></td>
            <td>{{ file.pagesOrTables || '—' }}</td>
            <td><StatusTag :value="file.metadataStatus" /></td>
            <td><StatusTag :value="file.referenceStatus" /></td>
            <td class="row-actions">
              <button type="button" @click.stop="runAction('detail', file.id)">查看详情</button>
              <button v-if="showMapping(file)" type="button" @click.stop="runAction('map-field', file.id)">字段映射</button>
              <button v-if="showRetry(file)" type="button" @click.stop="runAction('retry', file.id)">重新解析</button>
              <button v-if="showReplace(file)" type="button" @click.stop="runAction('replace', file.id)">替换文件</button>
              <button v-if="showSkip(file)" type="button" @click.stop="runAction('skip', file.id)">跳过</button>
            </td>
          </tr>
          <tr v-if="!pagedRows.length" class="empty-row">
            <td colspan="9">
              <FontAwesomeIcon :icon="faFolderOpen" aria-hidden="true" />
              暂无可展示文件
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-cards" role="list">
      <article
        v-for="file in pagedRows"
        :key="file.id"
        role="listitem"
        :class="{ selected: file.id === selectedId }"
        :aria-selected="file.id === selectedId"
      >
        <button type="button" class="card-select" @click="emit('select', file.id)">
          <span class="card-title">
            <FontAwesomeIcon :class="fileTone(file.type)" :icon="fileIcon(file.type)" aria-hidden="true" />
            <b>{{ file.name }}</b>
          </span>
          <FontAwesomeIcon :icon="faChevronRight" aria-hidden="true" />
        </button>
        <dl>
          <div><dt>解析状态</dt><dd><StatusTag :value="file.parseStatus" /></dd></div>
          <div><dt>所属能力</dt><dd>{{ file.ability || '—' }}</dd></div>
          <div><dt>阻断项</dt><dd :class="{ blocking: isBlocking(file) }">{{ blockingText(file) }}</dd></div>
        </dl>
        <div class="card-actions">
          <button type="button" @click="runAction('detail', file.id)">查看详情</button>
          <button v-if="showMapping(file)" type="button" @click="runAction('map-field', file.id)">字段映射</button>
          <button v-if="showRetry(file)" type="button" @click="runAction('retry', file.id)">重新解析</button>
          <button v-if="showReplace(file)" type="button" @click="runAction('replace', file.id)">替换文件</button>
          <button v-if="showSkip(file)" type="button" @click="runAction('skip', file.id)">跳过</button>
        </div>
      </article>
      <p v-if="!pagedRows.length" class="mobile-empty">暂无可展示文件</p>
    </div>

    <footer class="pagination" aria-label="文件清单分页">
      <span>共 {{ visibleRows.length }} 条</span>
      <div>
        <button type="button" aria-label="上一页" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          <FontAwesomeIcon :icon="faChevronLeft" aria-hidden="true" />
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          :class="{ active: page === currentPage }"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        <button type="button" aria-label="下一页" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
          <FontAwesomeIcon :icon="faChevronRight" aria-hidden="true" />
        </button>
        <span class="page-size">{{ pageSize }} 条/页</span>
      </div>
    </footer>
  </section>
</template>

<script setup>
import { computed, defineComponent, h, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleInfo,
  faCircleNotch,
  faClone,
  faFile,
  faFileCircleXmark,
  faFileExcel,
  faFileLines,
  faFilePdf,
  faFileWord,
  faFileZipper,
  faFolderOpen,
  faLink,
  faLinkSlash,
  faMinus,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

const statusMeta = (value) => {
  const text = value || '—';
  if (/(失败|异常|未通过|映射失败)/.test(text)) return { tone: 'danger', icon: faFileCircleXmark };
  if (/(解析中|处理中|上传中)/.test(text)) return { tone: 'processing', icon: faCircleNotch, spin: true };
  if (/(成功|已上传|已映射|已完成|已引用|完整)/.test(text)) return { tone: 'success', icon: faCircleCheck };
  if (/(重复)/.test(text)) return { tone: 'duplicate', icon: faClone };
  if (/(待|缺失|部分|未映射)/.test(text)) return { tone: 'warning', icon: faTriangleExclamation };
  if (/(未引用)/.test(text)) return { tone: 'muted', icon: faLinkSlash };
  if (/(引用)/.test(text)) return { tone: 'info', icon: faLink };
  if (text === '—') return { tone: 'muted', icon: faMinus };
  return { tone: 'neutral', icon: faCircleInfo };
};

const StatusTag = defineComponent({
  name: 'MaterialStatusTag',
  props: { value: { type: String, default: '' } },
  setup(statusProps) {
    return () => {
      const meta = statusMeta(statusProps.value);
      return h('span', { class: ['status-tag', meta.tone] }, [
        h(FontAwesomeIcon, { icon: meta.icon, spin: meta.spin, 'aria-hidden': 'true' }),
        statusProps.value || '—'
      ]);
    };
  }
});

const props = defineProps({
  files: { type: Array, required: true },
  selectedId: { type: String, default: '' }
});

const emit = defineEmits(['select', 'action', 'page-change']);
const pageSize = 20;
const currentPage = ref(1);

const visibleRows = computed(() => props.files.filter((file) => file.visibleInTable !== false));
const totalPages = computed(() => Math.max(1, Math.ceil(visibleRows.value.length / pageSize)));
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return visibleRows.value.slice(start, start + pageSize);
});

watch(totalPages, (total) => {
  if (currentPage.value > total) currentPage.value = total;
});

function changePage(page) {
  const nextPage = Math.min(Math.max(page, 1), totalPages.value);
  if (nextPage === currentPage.value) return;
  currentPage.value = nextPage;
  emit('page-change', nextPage);
}

function runAction(type, id) {
  emit('action', { type, id });
}

function normalizedStatus(file) {
  return String(file.parseStatus || '');
}

function showMapping(file) {
  return /成功/.test(normalizedStatus(file));
}

function showRetry(file) {
  return /失败/.test(normalizedStatus(file));
}

function showReplace(file) {
  return /(失败|异常)/.test(normalizedStatus(file));
}

function showSkip(file) {
  return /(异常|重复)/.test(normalizedStatus(file));
}

function isBlocking(file) {
  return file.blocksSubmission === true && file.parseStatus !== '已跳过';
}

function blockingText(file) {
  if (!isBlocking(file)) return '无阻断';
  if (file.blockers?.length) return `${file.blockers.length} 项待处理`;
  if (file.missingFields?.length) return `缺失 ${file.missingFields.length} 个字段`;
  return '阻断提交';
}

function fileIcon(type) {
  const normalized = String(type || '').toLowerCase();
  if (normalized.includes('pdf')) return faFilePdf;
  if (normalized.includes('excel') || normalized.includes('xls')) return faFileExcel;
  if (normalized.includes('word') || normalized.includes('doc')) return faFileWord;
  if (normalized.includes('zip') || normalized.includes('压缩')) return faFileZipper;
  if (normalized.includes('txt') || normalized.includes('文本')) return faFileLines;
  return faFile;
}

function fileTone(type) {
  const normalized = String(type || '').toLowerCase();
  if (normalized.includes('pdf')) return 'pdf';
  if (normalized.includes('excel') || normalized.includes('xls')) return 'excel';
  if (normalized.includes('word') || normalized.includes('doc')) return 'word';
  if (normalized.includes('zip') || normalized.includes('压缩')) return 'zip';
  return 'default';
}
</script>

<style scoped>
.material-file-list {
  --list-primary: var(--color-primary, var(--color-primary));
  --list-line: var(--color-line, #e4e7ed);
  display: grid;
  min-width: 0;
  min-height: 0;
  height: 100%;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid var(--list-line);
  border-radius: 4px;
  background: var(--color-surface, #fff);
  color: var(--color-text, #172033);
}

.list-header {
  display: flex;
  min-height: 30px;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  border-bottom: 1px solid var(--list-line);
}

.list-header h3 {
  margin: 0;
  font-size: 12px;
  line-height: 1.3;
}

.list-header span,
.pagination > span {
  color: var(--color-muted, #66728a);
  font-size: 10px;
}

.desktop-table {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
}

table {
  width: 100%;
  min-width: 760px;
  border-spacing: 0;
  border-collapse: separate;
  table-layout: fixed;
}

th,
td {
  box-sizing: border-box;
  height: 25px;
  padding: 3px 7px;
  overflow: hidden;
  border-right: 1px solid #edf0f4;
  border-bottom: 1px solid #e8ebf0;
  color: #435064;
  font-size: 10px;
  line-height: 1.2;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

th {
  position: sticky;
  z-index: 3;
  top: 0;
  height: 26px;
  background: #f7f8fa;
  color: #273345;
  font-weight: 700;
}

th:first-child { width: 134px; }
th:nth-child(2) { width: 50px; }
th:nth-child(3) { width: 72px; }
th:nth-child(4) { width: 58px; }
th:nth-child(5) { width: 64px; }
th:nth-child(6) { width: 68px; }
th:nth-child(7) { width: 65px; }
th:nth-child(8) { width: 58px; }
th:last-child { width: 144px; }

tbody tr {
  outline: none;
  cursor: pointer;
}

tbody tr:hover td,
tbody tr:focus-visible td {
  background: #fafbfd;
}

tbody tr.selected td {
  background: #fff0f0;
}

tbody tr:focus-visible td:first-child {
  box-shadow: inset 3px 0 var(--list-primary);
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.file-name-cell span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-name-cell svg,
.card-title svg {
  flex: 0 0 auto;
  font-size: 12px;
}

.file-name-cell svg.pdf,
.card-title svg.pdf { color: #ed3038; }
.file-name-cell svg.excel,
.card-title svg.excel { color: var(--color-success); }
.file-name-cell svg.word,
.card-title svg.word { color: #2d6fd2; }
.file-name-cell svg.zip,
.card-title svg.zip { color: #ef8a18; }
.file-name-cell svg.default,
.card-title svg.default { color: #778397; }

:deep(.status-tag) {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 3px;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 9px;
  line-height: 1.2;
  white-space: nowrap;
}

:deep(.status-tag svg) { flex: 0 0 auto; }
:deep(.status-tag.success) { background: #eaf8ef; color: #078a3f; }
:deep(.status-tag.processing) { background: #edf5ff; color: var(--color-info); }
:deep(.status-tag.danger) { background: #fff0f0; color: #d91f2a; }
:deep(.status-tag.duplicate) { background: #fff5e8; color: #e87500; }
:deep(.status-tag.warning) { background: #fff6e5; color: #c96d00; }
:deep(.status-tag.info) { background: #eef4ff; color: #2d68d7; }
:deep(.status-tag.muted),
:deep(.status-tag.neutral) { background: #f1f3f6; color: #697587; }

.action-heading,
.row-actions {
  position: sticky;
  right: 0;
  border-left: 1px solid #e4e8ef;
  border-right: 0;
}

.action-heading {
  z-index: 5;
  text-align: center;
}

.row-actions {
  z-index: 2;
  background: #fff;
  box-shadow: -5px 0 8px rgba(31, 41, 55, .04);
  text-align: left;
}

tbody tr:hover .row-actions,
tbody tr:focus-visible .row-actions { background: #fafbfd; }
tbody tr.selected .row-actions { background: #fff0f0; }

.row-actions button,
.card-actions button {
  padding: 0;
  border: 0;
  margin-right: 5px;
  background: transparent;
  color: #2470d9;
  font-family: inherit;
  font-size: 9px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
}

.row-actions button:hover,
.card-actions button:hover {
  color: var(--list-primary);
}

.row-actions button:focus-visible,
.card-actions button:focus-visible,
.card-select:focus-visible,
.pagination button:focus-visible {
  outline: 2px solid rgba(200, 0, 0, .25);
  outline-offset: 2px;
}

.empty-row td {
  height: 110px;
  color: var(--color-muted, #66728a);
  text-align: center;
}

.empty-row svg {
  margin-right: 6px;
}

.pagination {
  display: flex;
  min-height: 32px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 8px;
  border-top: 1px solid var(--list-line);
  background: #fff;
}

.pagination > div {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination button {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  padding: 0;
  border: 1px solid #d9dee7;
  border-radius: 3px;
  background: #fff;
  color: #425066;
  font-family: inherit;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
}

.pagination button.active {
  border-color: var(--list-primary);
  background: var(--list-primary);
  color: #fff;
}

.pagination button:disabled {
  color: #b9c1ce;
  cursor: not-allowed;
}

.page-size {
  padding: 5px 7px;
  border: 1px solid #d9dee7;
  border-radius: 3px;
  color: #4d596b;
  font-size: 10px;
  white-space: nowrap;
}

.mobile-cards {
  display: none;
}

@media (max-width: 767px) {
  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: grid;
    min-height: 0;
    gap: 8px;
    padding: 8px;
    overflow-y: auto;
  }

  .mobile-cards article {
    padding: 10px;
    border: 1px solid var(--list-line);
    border-radius: 4px;
    background: #fff;
  }

  .mobile-cards article.selected {
    border-color: #e26b6b;
    background: #fff8f8;
  }

  .card-select {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #273345;
    cursor: pointer;
  }

  .card-title {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 7px;
  }

  .card-title b {
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  dl {
    display: grid;
    gap: 7px;
    margin: 10px 0;
  }

  dl div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  dt,
  dd {
    margin: 0;
    font-size: 10px;
  }

  dt { color: var(--color-muted, #66728a); }
  dd { color: #354052; text-align: right; }
  dd.blocking { color: #d91f2a; font-weight: 600; }

  .card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    padding-top: 8px;
    border-top: 1px solid #edf0f4;
  }

  .card-actions button {
    min-height: 24px;
    margin: 0;
    font-size: 10px;
  }

  .mobile-empty {
    margin: 30px 0;
    color: var(--color-muted, #66728a);
    font-size: 12px;
    text-align: center;
  }

  .pagination {
    align-items: flex-start;
    padding: 7px 8px;
  }

  .page-size {
    display: none;
  }
}
</style>
