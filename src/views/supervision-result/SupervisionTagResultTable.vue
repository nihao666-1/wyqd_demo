<script setup>
import { computed } from 'vue';

const props = defineProps({
  rows: { type: Array, required: true },
  page: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  total: { type: Number, required: true },
  selectedRowId: { type: [String, Number], default: null }
});

const emit = defineEmits(['select-row', 'view-source', 'reference-row', 'page-change', 'page-size-change']);
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const pageNumbers = computed(() => {
  const leadingPages = Array.from({ length: Math.min(5, totalPages.value) }, (_, index) => index + 1);
  const pages = totalPages.value > 6
    ? [...leadingPages, 'ellipsis', totalPages.value]
    : Array.from({ length: totalPages.value }, (_, index) => index + 1);
  return [...new Set(pages)];
});

function referenceRow(row) {
  emit('reference-row', { rowId: row.id, sectionId: row.defaultSectionId });
}

function referencedCount(row) {
  return row.referenceCount || 1;
}

function changePageSize(event) {
  emit('page-size-change', Number(event.target.value));
}

function jumpToPage(event) {
  const nextPage = Number(event.target.value);
  if (nextPage > 0) emit('page-change', nextPage);
}
</script>

<template>
  <section class="tag-results" data-result-region="tag-results">
    <h2>标签提取结果（共 {{ total }} 条）</h2>
    <div class="table-wrap">
      <table>
        <colgroup>
          <col class="file-column" />
          <col class="department-column" />
          <col class="tag-column" />
          <col class="keyword-column" />
          <col class="summary-column" />
          <col class="reference-column" />
        </colgroup>
        <thead>
          <tr>
            <th>文件名称</th>
            <th>来源部门</th>
            <th>标签</th>
            <th>命中关键词</th>
            <th>摘要</th>
            <th>引用状态</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.id"
            :class="{ selected: row.id === selectedRowId }"
            :aria-selected="row.id === selectedRowId"
            tabindex="0"
            @click="emit('select-row', row.id)"
            @keydown.enter="emit('select-row', row.id)"
            @keydown.space.prevent="emit('select-row', row.id)"
          >
            <td><span class="clamp-text">{{ row.filename }}</span></td>
            <td>{{ row.department }}</td>
            <td>
              <span class="tag-list">
                <span v-for="tag in row.tags" :key="tag" class="tag-chip">{{ tag }}</span>
              </span>
            </td>
            <td><span class="keyword-text">{{ row.keywords.join('、') }}</span></td>
            <td><span class="clamp-text">{{ row.summary }}</span></td>
            <td>
              <span v-if="row.referenced" class="reference-used">已引用({{ referencedCount(row) }})</span>
              <span v-else class="reference-empty">未引用</span>
              <span class="row-actions">
                <button type="button" @click.stop="emit('view-source', row.id)">查看原文</button>
                <button type="button" @click.stop="referenceRow(row)">引用到报告</button>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav class="pagination" aria-label="标签结果分页">
      <span class="total">共 {{ total }} 条</span>
      <button type="button" aria-label="上一页" :disabled="page <= 1" @click="emit('page-change', page - 1)">‹</button>
      <template v-for="pageNumber in pageNumbers" :key="pageNumber">
        <span v-if="pageNumber === 'ellipsis'" aria-hidden="true">…</span>
        <button
          v-else
          type="button"
          :aria-current="pageNumber === page ? 'page' : undefined"
          @click="emit('page-change', pageNumber)"
        >{{ pageNumber }}</button>
      </template>
      <button type="button" aria-label="下一页" :disabled="page >= totalPages" @click="emit('page-change', page + 1)">›</button>
      <select aria-label="每页条数" :value="pageSize" @change="changePageSize">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
      </select>
      <label>跳至 <input type="number" min="1" :max="totalPages" aria-label="跳转页码" @change="jumpToPage" /> 页</label>
    </nav>
  </section>
</template>

<style scoped>
.tag-results {
  box-sizing: border-box;
  width: 495px;
  height: 343px;
  overflow: hidden;
  border: 1px solid #dde3eb;
  border-radius: 4px;
  background: #fff;
  color: #202631;
}

h2 {
  height: 36px;
  margin: 0;
  padding: 0 11px;
  border-bottom: 1px solid #edf0f4;
  font-size: 13px;
  line-height: 36px;
}

.table-wrap {
  height: 263px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 8px;
}

.file-column { width: 20%; }
.department-column { width: 13%; }
.tag-column { width: 16%; }
.keyword-column { width: 15%; }
.summary-column { width: 19%; }
.reference-column { width: 17%; }

th {
  height: 30px;
  padding: 0 5px;
  background: #f7f8fa;
  color: #667085;
  font-weight: 500;
  text-align: left;
}

td {
  box-sizing: border-box;
  height: 46px;
  overflow: hidden;
  padding: 3px 5px;
  border-bottom: 1px solid #edf0f4;
  vertical-align: middle;
}

tr.selected td {
  background: #fff4f4;
}

tr:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: -2px;
}

.clamp-text,
.keyword-text {
  display: -webkit-box;
  overflow: hidden;
  min-width: 0;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.tag-list {
  display: flex;
  overflow: hidden;
  min-width: 0;
  max-height: 34px;
  flex-wrap: wrap;
  gap: 2px;
}

.tag-chip {
  max-width: 100%;
  overflow: hidden;
  padding: 1px 3px;
  border-radius: 3px;
  background: #fff0f0;
  color: #c9000b;
  line-height: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reference-used { color: #0b9b50; }
.reference-empty { color: #667085; }

.row-actions {
  display: grid;
  justify-items: start;
  gap: 1px;
  margin-top: 2px;
}

.row-actions button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #1677ff;
  font: inherit;
  cursor: pointer;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  height: 43px;
  padding: 0 8px;
  color: #667085;
  font-size: 8px;
}

.pagination .total { margin-right: auto; }

.pagination button,
.pagination select,
.pagination input {
  box-sizing: border-box;
  height: 21px;
  min-width: 21px;
  border: 1px solid #dde3eb;
  border-radius: 3px;
  background: #fff;
  color: #202631;
  font: inherit;
}

.pagination button[aria-current='page'] {
  border-color: #c9000b;
  color: #c9000b;
}

.pagination select { width: 56px; }
.pagination input { width: 28px; }
</style>
