<script setup>
defineProps({
  sections: { type: Array, required: true }
});

const sectionTitles = ['报告摘要', '问题发现及整改', '合规事项', '合规与风险管理情况', '附录（来源文件清单）'];
const sectionIcons = ['摘', '改', '规', '险', '附'];
</script>

<template>
  <section class="report-outline" data-result-region="report-outline">
    <h2>汇总分析框架</h2>
    <ol>
      <li v-for="(section, index) in sections" :key="section.id">
        <span class="section-icon" :class="`icon-${index + 1}`" aria-hidden="true">{{ sectionIcons[index] }}</span>
        <span class="section-copy">
          <strong>{{ sectionTitles[index] }}</strong>
          <small>来源 {{ section.sourceCount }} 份</small>
        </span>
        <span class="section-status" :class="{ active: index === 0 }">
          {{ index === 0 ? '生成中 78%' : '未开始' }}
        </span>
        <span class="chevron" aria-hidden="true">›</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.report-outline {
  box-sizing: border-box;
  width: 310px;
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
  padding: 0 13px;
  border-bottom: 1px solid #edf0f4;
  font-size: 13px;
  line-height: 36px;
}

ol {
  margin: 0;
  padding: 8px 11px;
  list-style: none;
}

li {
  display: grid;
  grid-template-columns: 27px minmax(0, 1fr) auto 9px;
  align-items: center;
  min-width: 0;
  height: 51px;
  border-bottom: 1px solid #edf0f4;
  column-gap: 8px;
}

li:last-child {
  border-bottom: 0;
}

.section-icon {
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  border-radius: 4px;
  color: #fff;
  font-size: 9px;
}

.icon-1 { background: var(--color-primary); }
.icon-2 { background: #f08a00; }
.icon-3 { background: var(--color-info); }
.icon-4 { background: #0b9b50; }
.icon-5 { background: #667085; }

.section-copy {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.section-copy strong {
  overflow: hidden;
  font-size: 10px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-copy small {
  color: #667085;
  font-size: 8px;
}

.section-status {
  color: #98a2b3;
  font-size: 8px;
  white-space: nowrap;
}

.section-status.active {
  color: var(--color-primary);
}

.chevron {
  color: #98a2b3;
  font-size: 15px;
}
</style>
