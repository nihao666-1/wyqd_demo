<script setup>
import { computed } from 'vue';

const props = defineProps({
  outputs: { type: Array, default: () => [] }
});

const cardDefinitions = [
  { id: 'excel', title: 'Excel汇总表', icon: 'XLS' },
  { id: 'word', title: 'Word汇总分析报告', icon: 'DOC' },
  { id: 'appendix', title: '附录明细', icon: 'ZIP' }
];

const outputCards = computed(() => cardDefinitions.map((definition, index) => {
  const output = props.outputs.find((item) => item.id === definition.id) || props.outputs[index] || {};
  return {
    ...definition,
    name: output.name || '—',
    size: output.size || '—',
    status: output.status,
    progress: output.progress
  };
}));
</script>

<template>
  <section class="output-panel" data-result-region="outputs">
    <h2>输出结果（预览）</h2>
    <div class="output-cards">
      <article v-for="(card, index) in outputCards" :key="card.id" class="output-card">
        <span class="file-icon" :class="`file-icon-${index + 1}`" aria-hidden="true">{{ card.icon }}</span>
        <strong>{{ card.title }}</strong>
        <span class="filename" :title="card.name">{{ card.name }}</span>
        <small>{{ card.size }}</small>
        <span v-if="card.status === 'generating'" class="status generating">生成中{{ card.progress }}%</span>
        <span v-else-if="card.status === 'generated'" class="status complete">已生成</span>
        <span v-else class="status">未生成</span>
      </article>
    </div>
  </section>
</template>

<style scoped>
.output-panel {
  box-sizing: border-box;
  width: 453px;
  height: 176px;
  overflow: hidden;
  border: 1px solid #dde3eb;
  border-radius: 4px;
  background: #fff;
  color: #202631;
}

h2 {
  height: 37px;
  margin: 0;
  padding: 0 12px;
  border-bottom: 1px solid #edf0f4;
  font-size: 13px;
  line-height: 37px;
}

.output-cards {
  display: flex;
  gap: 7px;
  padding: 11px 13px;
}

.output-card {
  box-sizing: border-box;
  width: 133px;
  height: 115px;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  grid-template-rows: 28px 17px 16px 18px;
  align-items: center;
  column-gap: 7px;
  padding: 9px;
  border: 1px solid #dde3eb;
  border-radius: 4px;
  background: #fff;
}

.file-icon {
  display: grid;
  grid-row: 1 / 3;
  place-items: center;
  width: 27px;
  height: 31px;
  border-radius: 3px;
  background: #0b9b50;
  color: #fff;
  font-size: 7px;
}

.file-icon-2 {
  background: var(--color-info);
}

.file-icon-3 {
  background: #667085;
}

strong,
.filename {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

strong {
  font-size: 10px;
}

.filename {
  font-size: 10px;
}

small {
  grid-column: 1;
  color: #667085;
  font-size: 10px;
}

.status {
  grid-column: 2;
  color: #98a2b3;
  font-size: 10px;
  text-align: right;
}

.status.generating {
  color: var(--color-primary);
}

.status.complete {
  color: #0b9b50;
}
</style>
