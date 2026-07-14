<script setup>
defineProps({
  stages: { type: Array, required: true },
  logs: { type: Array, required: true }
});

const emit = defineEmits(['show-all-logs']);
const stageLabels = ['选择共享文件', '解析元数据', '提取文字内容', '标签归类', '生成汇总分析', '生成报告'];
</script>

<template>
  <section class="extraction-workspace" data-result-region="extraction-progress">
    <ol class="progress-steps" aria-label="提取进度">
      <li
        v-for="(stage, index) in stages"
        :key="stage.id"
        class="progress-step"
        :class="`is-${stage.status}`"
        :aria-current="stage.status === 'active' ? 'step' : undefined"
      >
        <span class="step-node" aria-hidden="true">{{ stage.status === 'completed' ? '✓' : index + 1 }}</span>
        <span class="step-label">{{ stageLabels[index] }}</span>
      </li>
    </ol>

    <section class="execution-log" aria-labelledby="execution-log-title">
      <header>
        <h2 id="execution-log-title">执行日志（实时）</h2>
        <button class="log-link" type="button" @click="emit('show-all-logs')">查看完整日志</button>
      </header>
      <ul>
        <li v-for="(log, index) in logs" :key="`${log.id}-${index}`">
          <span class="log-dot" aria-hidden="true"></span>
          <time>{{ log.time }}</time>
          <span class="log-message">{{ log.message || `${log.action}：${log.detail}` }}</span>
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.extraction-workspace {
  box-sizing: border-box;
  width: 805px;
  height: 242px;
  border: 1px solid #dde3eb;
  border-radius: 4px;
  background: #fff;
  padding: 20px 28px 13px;
  color: #202631;
}

.progress-steps {
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.progress-steps::before {
  position: absolute;
  top: 13px;
  right: 9%;
  left: 9%;
  height: 1px;
  background: #dde3eb;
  content: '';
}

.progress-step {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  min-width: 0;
  gap: 6px;
  color: #667085;
  font-size: 10px;
}

.step-node {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 27px;
  height: 27px;
  border: 1px solid #c8cfd9;
  border-radius: 50%;
  background: #fff;
  font-size: 10px;
}

.is-completed .step-node {
  border-color: #0b9b50;
  background: #0b9b50;
  color: #fff;
}

.is-completed .step-label {
  color: #0b9b50;
}

.is-active .step-node {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.is-active .step-label {
  color: var(--color-primary);
  font-weight: 600;
}

.execution-log {
  margin-top: 17px;
  padding-top: 11px;
  border-top: 1px solid #edf0f4;
}

.execution-log header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.execution-log h2 {
  margin: 0;
  font-size: 13px;
}

.log-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-info);
  font: inherit;
  font-size: 10px;
  cursor: pointer;
}

.execution-log ul {
  display: grid;
  gap: 5px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.execution-log li {
  display: grid;
  grid-template-columns: 6px 132px minmax(0, 1fr);
  align-items: center;
  min-width: 0;
  color: #667085;
  font-size: 9px;
}

.log-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #0b9b50;
}

.log-message {
  overflow: hidden;
  min-width: 0;
  color: #202631;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
