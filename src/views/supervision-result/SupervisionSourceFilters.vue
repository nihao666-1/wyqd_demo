<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  filters: { type: Object, required: true },
  departments: { type: Array, required: true },
  availableFiles: { type: Array, required: true },
  selectedFileIds: { type: Array, required: true },
  pickerOpen: { type: Boolean, required: true }
});

const emit = defineEmits([
  'update-filter',
  'open-file-picker',
  'confirm-files',
  'close-file-picker',
  'restart',
  'show-selected'
]);

const defaultDepartments = [
  { name: '合规法务部', count: 8 },
  { name: '风险管理部', count: 6 },
  { name: '审计中心', count: 4 }
];

const draftSelection = ref([]);
const tagSelectRef = ref(null);
const sourceSummary = computed(() => props.departments.length ? props.departments : defaultDepartments);

watch(() => props.pickerOpen, (isOpen) => {
  if (isOpen) draftSelection.value = [...props.selectedFileIds];
}, { immediate: true });

function updateFilter(key, event) {
  emit('update-filter', { key, value: event.target.value });
}

function confirmSelection() {
  emit('confirm-files', [...draftSelection.value]);
}

function focusTagSelect() {
  tagSelectRef.value?.focus();
}

function departmentName(department) {
  return typeof department === 'string' ? department : department.name;
}

function departmentCount(department) {
  return typeof department === 'string' ? 0 : department.count;
}
</script>

<template>
  <aside class="source-filters" data-result-region="source-filters">
    <h2>来源选择与标签条件</h2>

    <div class="filter-form">
      <div class="field-group">
        <label for="source-department">来源部门</label>
        <select
          id="source-department"
          class="filter-control"
          :value="filters.department"
          @change="updateFilter('department', $event)"
        >
          <option value="">全部部门</option>
          <option v-for="department in departments" :key="departmentName(department)" :value="departmentName(department)">
            {{ departmentName(department) }}
          </option>
        </select>
      </div>

      <div class="field-group">
        <label for="file-type">文件类型</label>
        <select id="file-type" class="filter-control" :value="filters.fileType" @change="updateFilter('fileType', $event)">
          <option value="">全部类型</option>
          <option value="Excel">Excel</option>
          <option value="Word">Word</option>
          <option value="PDF">PDF</option>
          <option value="Archive">压缩包</option>
        </select>
      </div>

      <div class="field-group">
        <label for="data-label">数据标签</label>
        <div class="control-with-action">
          <select id="data-label" ref="tagSelectRef" class="filter-control" :value="filters.dataTag" @change="updateFilter('dataTag', $event)">
            <option value="">全部标签</option>
            <option value="关联交易">关联交易</option>
            <option value="整改跟踪">整改跟踪</option>
            <option value="风险预警">风险预警</option>
          </select>
          <button class="filter-icon" type="button" aria-label="聚焦数据标签筛选" @click="focusTagSelect">⌕</button>
        </div>
      </div>

      <div class="field-group">
        <label for="keyword">关键词</label>
        <input
          id="keyword"
          class="filter-control"
          type="text"
          placeholder="请输入关键词"
          :value="filters.keyword"
          @input="updateFilter('keyword', $event)"
        />
      </div>

      <div class="field-group time-group">
        <label for="start-date">时间范围</label>
        <div class="date-range">
          <input id="start-date" class="filter-control" type="date" :value="filters.startDate" @change="updateFilter('startDate', $event)" />
          <span aria-hidden="true">—</span>
          <label class="sr-only" for="end-date">结束日期</label>
          <input id="end-date" class="filter-control" type="date" :value="filters.endDate" @change="updateFilter('endDate', $event)" />
        </div>
      </div>
    </div>

    <div class="source-actions">
      <button class="wide-action action-primary" type="button" @click="emit('open-file-picker')">选择共享文件</button>
      <button class="wide-action action-outline" type="button" @click="emit('restart')">重新提取标签</button>
    </div>

    <section class="selected-sources" aria-labelledby="selected-source-heading">
      <h3 id="selected-source-heading">已选来源（共 18 份文件）</h3>
      <ul>
        <li v-for="department in sourceSummary" :key="departmentName(department)">
          <span class="success-check" aria-hidden="true">✓</span>
          <span>{{ departmentName(department) }}</span>
          <strong>{{ departmentCount(department) }}份</strong>
        </li>
      </ul>
      <button class="selected-link" type="button" @click="emit('show-selected')">查看已选文件</button>
    </section>

    <div v-if="pickerOpen" class="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="file-picker-title">
      <section class="file-picker">
        <header>
          <h3 id="file-picker-title">选择共享文件</h3>
          <button class="dialog-close" type="button" aria-label="关闭文件选择" @click="emit('close-file-picker')">×</button>
        </header>
        <div class="file-options">
          <label v-for="file in availableFiles" :key="file.id" class="file-option">
            <input v-model="draftSelection" type="checkbox" :value="file.id" />
            <span>{{ file.name }}</span>
          </label>
        </div>
        <footer>
          <button type="button" @click="emit('close-file-picker')">取消</button>
          <button class="confirm-button" type="button" @click="confirmSelection">确认选择</button>
        </footer>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.source-filters {
  position: relative;
  box-sizing: border-box;
  width: 238px;
  min-height: 590px;
  border: 1px solid #dde3eb;
  border-radius: 4px;
  background: #fff;
  padding: 14px 15px;
  color: #202631;
}

h2,
h3 {
  margin: 0;
}

h2 {
  font-size: 14px;
  font-weight: 600;
}

.filter-form {
  display: grid;
  gap: 10px;
  margin-top: 15px;
}

.field-group {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.field-group > label,
.field-group > legend {
  display: block;
  margin-bottom: 5px;
  color: #667085;
  font-size: 10px;
}

.filter-control {
  box-sizing: border-box;
  width: 100%;
  height: 29px;
  min-width: 0;
  border: 1px solid #dde3eb;
  border-radius: 3px;
  background: #fff;
  padding: 0 8px;
  color: #202631;
  font: inherit;
  font-size: 10px;
}

.filter-control:focus-visible,
button:focus-visible {
  outline: 2px solid var(--color-info);
  outline-offset: 1px;
}

.control-with-action {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 29px;
  gap: 5px;
}

.filter-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 29px;
  border: 1px solid #dde3eb;
  border-radius: 3px;
  background: #fff;
  color: #667085;
  cursor: pointer;
}

.date-range {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 4px;
  color: #667085;
}

.date-range .filter-control {
  padding: 0 3px;
  font-size: 8px;
}

.source-actions {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.wide-action {
  width: 207px;
  height: 33px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.action-primary {
  background: var(--color-primary);
  color: #fff;
}

.action-outline {
  background: #fff;
  color: #b90008;
}

.selected-sources {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #edf0f4;
}

.selected-sources h3 {
  font-size: 11px;
}

.selected-sources ul {
  display: grid;
  gap: 9px;
  margin: 12px 0 9px;
  padding: 0;
  list-style: none;
}

.selected-sources li {
  display: grid;
  grid-template-columns: 14px 1fr auto;
  align-items: center;
  gap: 5px;
  font-size: 10px;
}

.selected-sources strong {
  font-size: 10px;
  font-weight: 500;
}

.success-check {
  color: #0b9b50;
  font-weight: 700;
}

.selected-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-info);
  font: inherit;
  font-size: 10px;
  cursor: pointer;
}

.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  background: rgb(32 38 49 / 28%);
}

.file-picker {
  width: 430px;
  max-height: 560px;
  overflow: hidden;
  border: 1px solid #dde3eb;
  border-radius: 4px;
  background: #fff;
}

.file-picker header,
.file-picker footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 14px;
}

.file-picker header {
  border-bottom: 1px solid #edf0f4;
}

.file-picker h3 {
  font-size: 14px;
}

.dialog-close {
  border: 0;
  background: transparent;
  color: #667085;
  font-size: 20px;
  cursor: pointer;
}

.file-options {
  max-height: 430px;
  overflow: auto;
  padding: 7px 14px;
}

.file-option {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  border-bottom: 1px solid #edf0f4;
  font-size: 11px;
}

.file-picker footer {
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #edf0f4;
}

.file-picker footer button {
  height: 29px;
  padding: 0 13px;
  border: 1px solid #dde3eb;
  border-radius: 4px;
  background: #fff;
  color: #202631;
  cursor: pointer;
}

.file-picker footer .confirm-button {
  border-color: #b90008;
  background: var(--color-primary);
  color: #fff;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
