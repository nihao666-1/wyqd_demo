<script setup>
import { computed } from 'vue';

const props = defineProps({
  versions: { type: Array, default: () => [] },
  currentVersion: { type: String, default: 'V1.1' },
  autoSave: { type: Boolean, default: true },
  versionDirty: { type: Boolean, default: false }
});

const versionDefinitions = [
  { number: 'V0.1', note: '初始提取', time: '09:18' },
  { number: 'V0.5', note: '标签归类', time: '09:42' },
  { number: 'V0.8', note: '汇总分析', time: '10:05' },
  { number: 'V0.9', note: '人工复核', time: '10:12' },
  { number: 'V1.0', note: '报告生成', time: '10:20' },
  { number: 'V1.1', note: '当前草稿', time: '未保存' }
];

const timelineVersions = computed(() => versionDefinitions.map((definition) => {
  const version = props.versions.find((item) => item.number === definition.number) || {};
  const saved = version.saved || version.status === 'saved';
  const active = definition.number === props.currentVersion && !saved;
  return {
    ...definition,
    ...version,
    nodeState: saved ? 'completed' : (active ? 'active' : 'pending'),
    note: definition.number === 'V1.1' && saved ? '版本已保存' : (version.note || definition.note),
    time: definition.number === 'V1.1' && saved ? (version.time || '已保存') : (version.time || definition.time)
  };
}));

const currentVersionNode = computed(() => props.versions.find((version) => version.number === props.currentVersion));
const currentVersionSaved = computed(() => Boolean(
  currentVersionNode.value?.saved || currentVersionNode.value?.status === 'saved'
));
const phaseMessage = computed(() => {
  if (props.versionDirty) return '有未保存修改';
  return currentVersionSaved.value ? '已保存' : '未保存';
});
</script>

<template>
  <section class="version-timeline" data-result-region="version-timeline">
    <h2>版本与过程记录</h2>
    <ol class="timeline-track">
      <li v-for="version in timelineVersions" :key="version.number" :class="version.nodeState">
        <span class="version-node" aria-hidden="true">{{ version.nodeState === 'completed' ? '✓' : '' }}</span>
        <strong>{{ version.number }}</strong>
        <small>{{ version.note }}</small>
        <time>{{ version.time }}</time>
      </li>
    </ol>
    <footer>
      <span>当前版本：{{ currentVersion }}</span>
      <span>{{ phaseMessage }}</span>
      <span v-if="autoSave">自动保存：已开启</span>
      <span v-else>自动保存：未开启</span>
      <span class="history-link">查看版本记录</span>
    </footer>
  </section>
</template>

<style scoped>
.version-timeline {
  box-sizing: border-box;
  width: 575px;
  height: 169px;
  overflow: hidden;
  border: 1px solid #dde3eb;
  border-radius: 4px;
  background: #fff;
  color: #202631;
}

h2 {
  height: 37px;
  margin: 0;
  padding: 0 13px;
  border-bottom: 1px solid #edf0f4;
  font-size: 13px;
  line-height: 37px;
}

.timeline-track {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  margin: 0;
  padding: 14px 13px 10px;
  list-style: none;
}

.timeline-track::before {
  position: absolute;
  z-index: 0;
  top: 24px;
  right: 55px;
  left: 55px;
  height: 1px;
  background: #dde3eb;
  content: '';
}

li {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 3px;
  min-width: 0;
}

.version-node {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: 2px solid #cfd5df;
  border-radius: 50%;
  background: #fff;
  color: #fff;
  font-size: 10px;
}

.completed .version-node {
  border-color: #0b9b50;
  background: #0b9b50;
}

.active .version-node {
  border: 3px solid #c9000b;
  background: #fff;
}

.pending .version-node {
  border-color: #cfd5df;
  background: #edf0f4;
}

li strong {
  font-size: 10px;
}

li small,
li time {
  max-width: 80px;
  overflow: hidden;
  color: #667085;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

footer {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 28px;
  padding: 0 13px;
  border-top: 1px solid #edf0f4;
  color: #667085;
  font-size: 10px;
}

.history-link {
  margin-left: auto;
  color: #1677ff;
}
</style>
