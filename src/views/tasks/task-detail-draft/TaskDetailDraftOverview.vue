<template>
  <section class="task-detail-draft-overview">
    <section class="task-detail-draft-start" aria-labelledby="task-detail-draft-start-title">
      <svg class="task-detail-draft-illustration" viewBox="0 0 300 210" aria-hidden="true">
        <path d="M42 167h216" fill="none" stroke="#e9edf3" stroke-width="2" />
        <path d="M64 82h66l17 17h76a12 12 0 0 1 12 12v55H52V94a12 12 0 0 1 12-12Z" fill="#edf2f8" stroke="#afbdd0" />
        <path d="M75 61h70l18 19h51a10 10 0 0 1 10 10v69H65V71a10 10 0 0 1 10-10Z" fill="#f6f8fb" stroke="#a8b7ca" />
        <path d="M84 31h59l27 28v82H75V40a9 9 0 0 1 9-9Z" fill="#fff" stroke="#a8b7ca" />
        <path d="M143 31v28h27M96 75h48M96 91h60" fill="none" stroke="#c2cddb" />
        <circle cx="210" cy="139" r="37" fill="#fff" stroke="#b8c4d3" />
        <path d="M192 144a12 12 0 0 1 5-23 16 16 0 0 1 30 7 10 10 0 0 1-1 20h-31" fill="none" stroke="#1f7aee" stroke-linecap="round" stroke-width="3" />
        <path d="m209 147 8-8 8 8m-8-8v18" fill="none" stroke="#1f7aee" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" />
      </svg>

      <div class="task-detail-draft-start-content">
        <h2 id="task-detail-draft-start-title">任务已创建，尚未添加资料</h2>
        <p>请上传制度文件、费用数据、监督共享文件或选择历史资料，系统解析后才能执行智能分析。</p>
        <div class="task-detail-draft-actions">
          <button type="button" class="task-detail-draft-action task-detail-draft-action--primary" data-source="local" @click="emit('open-material-source', 'local')">
            <span class="task-detail-draft-action-icon" aria-hidden="true"><AuditIcon name="upload" /></span>上传资料
          </button>
          <button type="button" class="task-detail-draft-action" data-source="fileCenter" @click="emit('open-material-source', 'fileCenter')">
            <span class="task-detail-draft-action-icon" aria-hidden="true"><AuditIcon name="files" /></span>从文件中心选择
          </button>
          <button type="button" class="task-detail-draft-action" data-source="simulation" @click="emit('open-material-source', 'simulation')">
            <span class="task-detail-draft-action-icon" aria-hidden="true"><FontAwesomeIcon :icon="faDatabase" /></span>使用模拟数据
          </button>
        </div>
      </div>
    </section>

    <section class="task-detail-draft-section" aria-labelledby="task-detail-draft-capability-title">
      <h2 id="task-detail-draft-capability-title">所选审计能力</h2>
      <div class="task-detail-draft-capabilities">
        <article v-for="capability in task.capabilities" :key="capability.id" :class="['task-detail-draft-capability', `task-detail-draft-capability--${capability.tone}`]">
          <header class="task-detail-draft-capability-header">
            <span class="task-detail-draft-capability-icon" aria-hidden="true"><AuditIcon :name="capabilityIcons[capability.name] || 'review'" /></span>
            <h3>{{ capability.name }}</h3>
            <span class="task-detail-draft-capability-state">待资料</span>
          </header>
          <p>{{ capability.description }}</p>
          <strong>输出结果：<span>{{ capability.output }}</span></strong>
        </article>
      </div>
    </section>

    <section class="task-detail-draft-section task-detail-draft-timeline" aria-labelledby="task-detail-draft-timeline-title">
      <h2 id="task-detail-draft-timeline-title">任务流程</h2>
      <ol class="task-detail-draft-timeline-list" aria-label="任务流程：创建任务至导出归档">
        <li v-for="step in task.timeline" :key="step.label" :class="['task-detail-draft-timeline-step', { 'task-detail-draft-timeline-step--complete': step.complete }]">
          <span class="task-detail-draft-timeline-node" aria-hidden="true"><AuditIcon :name="timelineIcons[step.label] || 'review'" /></span>
          <strong>{{ step.label }}</strong>
          <span class="task-detail-draft-timeline-state">{{ step.state }}</span>
          <time v-if="step.occurredAt" :datetime="step.occurredAt.replace(' ', 'T')">{{ step.occurredAt }}</time>
        </li>
      </ol>
    </section>
  </section>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import AuditIcon from '../../../components/common/AuditIcon.vue';

defineProps({ task: { type: Object, required: true } });
const emit = defineEmits(['open-material-source']);
const capabilityIcons = Object.freeze({ 制度比对: 'compare', 费用审计: 'expense', 报告生成: 'report-generate' });
const timelineIcons = Object.freeze({ 创建任务: 'create', 上传资料: 'upload', 解析资料: 'review', 生成分析: 'analysis', 人工确认: 'qa', 保存版本: 'config', 导出归档: 'report' });
</script>

<style scoped>
.task-detail-draft-overview {
  display: grid;
  gap: 0;
  color: #232936;
}

.task-detail-draft-start,
.task-detail-draft-section {
  border: 1px solid #e0e5ec;
  background: #fff;
}

.task-detail-draft-start {
  display: grid;
  grid-template-columns: minmax(250px, 38%) minmax(0, 1fr);
  min-height: 274px;
  align-items: center;
}

.task-detail-draft-illustration {
  display: block;
  width: min(86%, 300px);
  max-height: 210px;
  margin: auto;
}

.task-detail-draft-start-content {
  min-width: 0;
  padding: 24px 32px 24px 8px;
}

.task-detail-draft-start-content h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 600;
}

.task-detail-draft-start-content p {
  max-width: 440px;
  margin: 14px 0 18px;
  color: #657083;
  font-size: 14px;
  line-height: 1.8;
}

.task-detail-draft-actions {
  display: flex;
  gap: 22px;
  align-items: center;
}

.task-detail-draft-action {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 29px;
  border: 1px solid #cdd5df;
  border-radius: 5px;
  background: #fff;
  color: #2c3440;
  font: inherit;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
}

.task-detail-draft-action:hover {
  border-color: #c7000b;
  color: #c7000b;
}

.task-detail-draft-action:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}

.task-detail-draft-action--primary {
  padding-right: 22px;
  padding-left: 22px;
  border-color: #c7000b;
  background: #c7000b;
  color: #fff;
}

.task-detail-draft-action--primary:hover {
  border-color: #a90009;
  background: #a90009;
  color: #fff;
}

.task-detail-draft-action-icon {
  width: 20px;
  font-size: 19px;
  line-height: 1;
}

.task-detail-draft-section {
  padding: 8px 16px;
}

.task-detail-draft-section > h2 {
  margin: 0 0 8px;
  font-size: 16px;
  line-height: 24px;
}

.task-detail-draft-capabilities {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.task-detail-draft-capability {
  height: 126px;
  box-sizing: border-box;
  min-width: 0;
  padding: 12px 16px;
  border: 1px solid #dfe4eb;
  border-radius: 5px;
}

.task-detail-draft-capability-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-detail-draft-capability-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border-radius: 5px;
  background: #eaf7ef;
  color: #139657;
  font-weight: 700;
  font-size: 20px;
}

.task-detail-draft-capability--orange .task-detail-draft-capability-icon {
  background: #fff2e8;
  color: #f06b12;
}

.task-detail-draft-capability--blue .task-detail-draft-capability-icon {
  background: #eaf2ff;
  color: #2878df;
}

.task-detail-draft-capability h3 {
  min-width: 0;
  margin: 0;
  font-size: 15px;
}

.task-detail-draft-capability-state {
  margin-left: auto;
  padding: 4px 8px;
  border-radius: 4px;
  background: #fff5e5;
  color: #ad6800;
  font-size: 12px;
}

.task-detail-draft-capability p {
  margin: 8px 0;
  color: #657083;
  font-size: 12px;
  line-height: 1.5;
}

.task-detail-draft-capability strong {
  font-size: 13px;
  font-weight: 600;
}

.task-detail-draft-capability strong span {
  font-weight: 400;
}

.task-detail-draft-timeline {
  min-height: 204px;
  box-sizing: border-box;
  margin-top: 16px;
  padding: 12px 14px 18px;
}

.task-detail-draft-timeline-list {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin: 0;
  padding: 8px 0 0;
  list-style: none;
}

.task-detail-draft-timeline-step {
  position: relative;
  min-width: 0;
  padding: 64px 4px 0;
  text-align: center;
}

.task-detail-draft-timeline-step::before {
  position: absolute;
  top: 26px;
  right: 50%;
  left: -50%;
  height: 1px;
  background: repeating-linear-gradient(90deg, #bdc7d4 0 5px, transparent 5px 9px);
  content: "";
}

.task-detail-draft-timeline-step:first-child::before {
  display: none;
}

.task-detail-draft-timeline-step--complete + .task-detail-draft-timeline-step::before {
  background: #d71920;
}

.task-detail-draft-timeline-node {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 50%;
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border: 1px solid #cfd6e0;
  border-radius: 50%;
  background: #fff;
  color: #8792a2;
  font-size: 27px;
  transform: translateX(-50%);
}

.task-detail-draft-timeline-step--complete::before {
  background: #d71920;
}

.task-detail-draft-timeline-step--complete .task-detail-draft-timeline-node {
  border-color: #f2b7ba;
  background: #fff5f5;
  color: #d71920;
}

.task-detail-draft-timeline-step strong,
.task-detail-draft-timeline-state,
.task-detail-draft-timeline-step time {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-detail-draft-timeline-step strong {
  font-size: 14px;
}

.task-detail-draft-timeline-state,
.task-detail-draft-timeline-step time {
  margin-top: 5px;
  color: #7b8492;
  font-size: 12px;
}

.task-detail-draft-timeline-step--complete strong,
.task-detail-draft-timeline-step--complete .task-detail-draft-timeline-state {
  color: #d71920;
}

@media (max-width: 900px) {
  .task-detail-draft-start {
    grid-template-columns: 1fr;
  }

  .task-detail-draft-illustration {
    width: 220px;
  }

  .task-detail-draft-start-content {
    padding: 0 20px 24px;
    text-align: center;
  }

  .task-detail-draft-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .task-detail-draft-capabilities {
    grid-template-columns: 1fr;
  }

  .task-detail-draft-timeline-list {
    grid-template-columns: 1fr;
  }

  .task-detail-draft-timeline-step {
    min-height: 62px;
    padding: 8px 8px 8px 52px;
    text-align: left;
  }

  .task-detail-draft-timeline-step::before {
    top: -50%;
    bottom: 50%;
    left: 17px;
    width: 1px;
    height: auto;
  }

  .task-detail-draft-timeline-node {
    top: 6px;
    left: 0;
    transform: none;
  }

  .task-detail-draft-timeline-step strong,
  .task-detail-draft-timeline-state,
  .task-detail-draft-timeline-step time {
    white-space: normal;
  }
}

@media (min-width: 901px) and (max-width: 1450px) {
  .task-detail-draft-actions { gap: 10px; }
  .task-detail-draft-action,
  .task-detail-draft-action--primary { padding-right: 14px; padding-left: 14px; }
}

@media (max-width: 520px) {
  .task-detail-draft-actions {
    display: grid;
    gap: 10px;
  }

  .task-detail-draft-action {
    width: 100%;
  }

  .task-detail-draft-start-content h2 {
    font-size: 20px;
  }
}
</style>
