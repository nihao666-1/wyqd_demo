<template>
  <section class="material-file-tree" aria-labelledby="material-tree-title">
    <header class="tree-header">
      <h3 id="material-tree-title">文件夹预览</h3>
    </header>

    <div class="tree-scroll">
      <details class="tree-root" open>
        <summary>
          <FontAwesomeIcon class="tree-expander" :icon="faChevronRight" aria-hidden="true" />
          <FontAwesomeIcon :icon="faFolderOpen" aria-hidden="true" />
          <span>{{ rootLabel }}</span>
          <b>({{ files.length }})</b>
        </summary>

        <details v-for="folder in folders" :key="folder.path" class="tree-folder" open>
          <summary>
            <FontAwesomeIcon class="tree-expander" :icon="faChevronRight" aria-hidden="true" />
            <FontAwesomeIcon :icon="faFolder" aria-hidden="true" />
            <span>{{ folder.name }}</span>
            <b>({{ folder.files.length }})</b>
          </summary>

          <ul>
            <li v-for="file in visibleFiles(folder)" :key="file.id">
              <button
                type="button"
                class="tree-file"
                :class="{ selected: file.id === selectedId }"
                :aria-pressed="file.id === selectedId"
                :title="file.name"
                @click="emit('select', file.id)"
              >
                <FontAwesomeIcon
                  :class="fileTone(file.type)"
                  :icon="fileIcon(file.type)"
                  aria-hidden="true"
                />
                <span>{{ file.name }}</span>
              </button>
            </li>
          </ul>

          <button
            v-if="folder.files.length > previewLimit"
            type="button"
            class="more-files"
            :aria-expanded="expandedFolders.has(folder.path)"
            @click="toggleFolder(folder.path)"
          >
            <FontAwesomeIcon :icon="faEllipsis" aria-hidden="true" />
            {{ expandedFolders.has(folder.path) ? '收起文件' : `更多文件（${folder.files.length - previewLimit}）` }}
          </button>
        </details>
      </details>
    </div>

    <footer class="tree-actions" aria-label="文件批量操作">
      <button type="button" class="danger" @click="emit('batch-retry')">
        <FontAwesomeIcon :icon="faArrowsRotate" aria-hidden="true" />
        批量重新解析
      </button>
      <button type="button" @click="emit('batch-skip')">
        <FontAwesomeIcon :icon="faForward" aria-hidden="true" />
        批量跳过
      </button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faArrowsRotate,
  faChevronRight,
  faEllipsis,
  faFile,
  faFileExcel,
  faFileLines,
  faFilePdf,
  faFileWord,
  faFileZipper,
  faFolder,
  faFolderOpen,
  faForward
} from '@fortawesome/free-solid-svg-icons';

const props = defineProps({
  files: { type: Array, required: true },
  selectedId: { type: String, default: '' }
});

const emit = defineEmits(['select', 'batch-retry', 'batch-skip']);

const previewLimit = 5;
const expandedFolders = ref(new Set());

const normalizedPath = (file) => {
  const path = String(file.folderPath || '其他文件').replaceAll('\\', '/');
  const segments = path.split('/').map((segment) => segment.trim()).filter(Boolean);
  if (segments.at(-1) === file.name) segments.pop();
  return segments.length ? segments : ['其他文件'];
};

const rootLabel = computed(() => {
  const roots = props.files.map((file) => normalizedPath(file)[0]);
  const sharedRoot = roots.length && roots.every((root) => root === roots[0]) ? roots[0] : '';
  return sharedRoot || '上海分公司 Q1 审计资料';
});

const folders = computed(() => {
  const groups = new Map();
  props.files.forEach((file) => {
    const segments = normalizedPath(file);
    const folderSegments = segments[0] === rootLabel.value ? segments.slice(1) : segments;
    const name = folderSegments.join(' / ') || '其他文件';
    const path = segments.join('/');
    if (!groups.has(path)) groups.set(path, { name, path, files: [] });
    groups.get(path).files.push(file);
  });

  return [...groups.values()];
});

function visibleFiles(folder) {
  return expandedFolders.value.has(folder.path) ? folder.files : folder.files.slice(0, previewLimit);
}

function toggleFolder(path) {
  const next = new Set(expandedFolders.value);
  if (next.has(path)) next.delete(path);
  else next.add(path);
  expandedFolders.value = next;
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
.material-file-tree {
  --tree-primary: var(--color-primary, var(--color-primary));
  --tree-line: var(--color-line, #e4e7ed);
  display: grid;
  min-width: 0;
  min-height: 0;
  height: 100%;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid var(--tree-line);
  border-radius: 4px;
  background: var(--color-surface, #fff);
  color: var(--color-text, #172033);
}

.tree-header {
  display: flex;
  min-height: 34px;
  align-items: center;
  padding: 0 10px;
  border-bottom: 1px solid var(--tree-line);
}

.tree-header h3 {
  margin: 0;
  font-size: 12px;
  line-height: 1.3;
}

.tree-scroll {
  min-height: 0;
  padding: 5px 7px 10px;
  overflow: auto;
  scrollbar-gutter: stable;
}

details,
summary,
ul {
  margin: 0;
  padding: 0;
}

details {
  min-width: 0;
}

summary {
  display: grid;
  min-height: 27px;
  grid-template-columns: 8px 14px minmax(0, 1fr) auto;
  align-items: center;
  gap: 5px;
  color: #354052;
  font-size: 11px;
  line-height: 1.3;
  list-style: none;
  cursor: pointer;
}

summary::-webkit-details-marker {
  display: none;
}

summary svg {
  color: #f2a313;
  font-size: 12px;
}

summary .tree-expander {
  color: #758196;
  font-size: 8px;
  transform: rotate(90deg);
  transition: transform .15s ease;
}

details:not([open]) > summary .tree-expander {
  transform: rotate(0deg);
}

summary span,
.tree-file span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

summary b {
  color: #66728a;
  font-size: 10px;
  font-weight: 500;
}

.tree-root > summary {
  padding-left: 2px;
  font-weight: 700;
}

.tree-folder {
  padding-left: 16px;
}

.tree-folder > summary {
  font-weight: 600;
}

ul {
  list-style: none;
}

.tree-file,
.more-files {
  width: 100%;
  border: 0;
  background: transparent;
  color: #4a5568;
  font-family: inherit;
  font-size: 10px;
  line-height: 1.3;
  cursor: pointer;
}

.tree-file {
  display: grid;
  min-height: 25px;
  grid-template-columns: 13px minmax(0, 1fr);
  align-items: center;
  gap: 5px;
  padding: 2px 5px 2px 15px;
  border-radius: 3px;
  text-align: left;
}

.tree-file:hover,
.tree-file:focus-visible,
.tree-file.selected {
  background: #fff1f1;
  color: var(--tree-primary);
}

.tree-file:focus-visible,
.more-files:focus-visible,
.tree-actions button:focus-visible,
summary:focus-visible {
  outline: 2px solid rgba(200, 0, 0, .25);
  outline-offset: 1px;
}

.tree-file svg {
  font-size: 12px;
}

.tree-file svg.pdf { color: #ed3038; }
.tree-file svg.excel { color: var(--color-success); }
.tree-file svg.word { color: #2d6fd2; }
.tree-file svg.zip { color: #ef8a18; }
.tree-file svg.default { color: #778397; }

.more-files {
  display: flex;
  min-height: 26px;
  align-items: center;
  gap: 6px;
  padding-left: 31px;
  text-align: left;
}

.more-files:hover {
  color: var(--tree-primary);
}

.tree-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, .9fr);
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--tree-line);
  background: var(--color-surface, #fff);
}

.tree-actions button {
  display: inline-flex;
  min-width: 0;
  min-height: 32px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 7px;
  border: 1px solid #cfd6e1;
  border-radius: 3px;
  background: #fff;
  color: #354052;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
}

.tree-actions button.danger {
  border-color: #e96969;
  color: var(--tree-primary);
}

@media (max-width: 767px) {
  .material-file-tree {
    max-height: 380px;
  }

  .tree-actions {
    grid-template-columns: 1fr;
  }
}
</style>
