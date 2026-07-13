<script setup>
const props = defineProps({
  task: { type: Object, required: true },
  extraction: { type: Object, required: true }
});

defineEmits(['back', 'restart', 'generate-report', 'export-excel']);
</script>

<template>
  <header class="result-header" data-result-region="result-header">
    <div class="title-row">
      <div class="title-copy">
        <h1>监督共享信息分析</h1>
        <span class="info-icon" aria-hidden="true">i</span>
        <span class="sr-only">监督共享信息分析结果页</span>
      </div>
      <div class="header-actions">
        <button class="header-action action-back" type="button" @click="$emit('back')">返回任务</button>
        <button class="header-action action-outline" type="button" @click="$emit('restart')">重新提取</button>
        <button class="header-action action-primary" type="button" @click="$emit('generate-report')">生成报告</button>
        <button class="header-action action-outline" type="button" @click="$emit('export-excel')">导出Excel</button>
      </div>
    </div>

    <dl class="task-meta" data-result-region="task-meta">
      <div class="meta-item">
        <dt>被分析单位</dt>
        <dd>{{ props.task.organization }}</dd>
      </div>
      <div class="meta-item">
        <dt>分析期间</dt>
        <dd>{{ props.task.period }}</dd>
      </div>
      <div class="meta-item">
        <dt>来源部门</dt>
        <dd>{{ props.task.sourceDepartment || props.extraction.sourceDepartment || '3个部门' }}</dd>
      </div>
      <div class="meta-item">
        <dt>任务状态</dt>
        <dd><span class="status-chip">{{ props.extraction.status || props.task.status }}</span></dd>
      </div>
      <div class="meta-item">
        <dt>创建时间</dt>
        <dd>{{ props.task.createdAt }}</dd>
      </div>
      <div class="meta-item">
        <dt>创建人</dt>
        <dd>{{ props.task.creator }}</dd>
      </div>
    </dl>
  </header>
</template>

<style scoped>
.result-header {
  color: #202631;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;
}

.title-copy {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 7px;
}

.title-row h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  line-height: 1;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: 1px solid #98a2b3;
  border-radius: 4px;
  color: #667085;
  font-size: 9px;
  font-style: normal;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.header-action {
  height: 32px;
  padding: 0 15px;
  border: 1px solid;
  border-radius: 4px;
  background: #fff;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.header-action:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}

.action-back {
  border-color: #c8cfd9;
  color: #475467;
}

.action-outline {
  border-color: #c9000b;
  color: #b90008;
}

.action-primary {
  border-color: #b90008;
  background: #c9000b;
  color: #fff;
}

.task-meta {
  display: grid;
  grid-template-columns: 147px 249px 230px 101px 173px 143px;
  width: 1043px;
  height: 72px;
  margin: 7px 0 0;
  border: 1px solid #dde3eb;
  border-radius: 4px;
  background: #fff;
}

.meta-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 0 15px;
  border-right: 1px solid #edf0f4;
}

.meta-item:last-child {
  border-right: 0;
}

.meta-item dt {
  margin-bottom: 7px;
  color: #667085;
  font-size: 10px;
}

.meta-item dd {
  overflow: hidden;
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-chip {
  display: inline-block;
  padding: 2px 6px;
  border: 1px solid #f08a00;
  border-radius: 3px;
  background: #fff7e8;
  color: #f08a00;
  font-size: 10px;
  line-height: 16px;
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
