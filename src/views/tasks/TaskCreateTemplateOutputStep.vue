<template>
  <section class="task-template-output-step" data-step="template-output">
    <div class="step4-layout">
      <main class="step4-main">
        <header class="step4-title-row">
          <button type="button" aria-label="返回全部任务" @click="$emit('request-exit')">←</button>
          <h2>创建审计任务</h2>
        </header>

        <section class="step4-surface">
          <nav class="step4-wizard" aria-label="创建审计任务步骤">
            <template v-for="(item, index) in steps" :key="item">
              <div class="step4-wizard-item" :class="{ done: index < currentStep, active: index === currentStep }" :aria-current="index === currentStep ? 'step' : undefined">
                <span>{{ index < currentStep ? '✓' : index + 1 }}</span><b>{{ item }}</b>
              </div>
              <i v-if="index < steps.length - 1" aria-hidden="true"></i>
            </template>
          </nav>

          <header class="step4-intro">
            <h3>模板与输出设置</h3>
            <p>根据所选能力配置各项输出模板、规则与格式，提交后将按照以下设置执行分析与生成。</p>
          </header>

          <TaskTemplateOutputCardGrid :model-value="modelValue" :visible-group-keys="visibleGroupKeys" :errors="validationErrors" @update:model-value="handleModelUpdate" />

          <section class="step4-global-settings" aria-labelledby="global-setting-title">
            <h3 id="global-setting-title">全局输出与过程设置</h3>
            <div class="global-setting-grid">
              <label v-for="item in globalSettingItems" :key="item.key" class="global-setting-item">
                <span><b>{{ item.title }}</b><span class="global-switch"><input :checked="modelValue.global[item.key]" type="checkbox" @change="updateGlobal(item.key, $event.target.checked)" /><i></i><em>{{ modelValue.global[item.key] ? '启用' : '停用' }}</em></span></span>
                <small>{{ item.description }}</small>
              </label>
            </div>
          </section>
        </section>

        <footer class="step4-actions">
          <button type="button" class="step4-button draft" @click="$emit('request-save')">保存草稿</button>
          <p v-if="validationMessage" class="validation-alert" role="alert"><AuditIcon name="anomaly" />{{ validationMessage }}</p>
          <p v-else-if="summary.risks.length" class="step4-risk-inline"><AuditIcon name="anomaly" />{{ summary.risks[0] }}</p>
          <div><button type="button" class="step4-button previous" @click="$emit('request-previous')">上一步</button><button type="button" class="step4-button submit" @click="handleSubmit">提交任务</button></div>
        </footer>
      </main>

      <TaskCreateConfirmationAside :summary="summary" @request-summary-detail="$emit('request-summary-detail', $event)" />
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import AuditIcon from '../../components/common/AuditIcon.vue';
import TaskTemplateOutputCardGrid from './TaskTemplateOutputCardGrid.vue';
import TaskCreateConfirmationAside from './TaskCreateConfirmationAside.vue';
import { capabilityDefinitions, cloneTemplateOutputSettings, createPreSubmitSummary, getVisibleSettingGroups, referenceMaterials, referenceTaskSummary, validateTemplateOutputSettings } from '../../domain/taskCreate/taskTemplateOutputSettings.js';

const props = defineProps({
  modelValue: { type: Object, required: true },
  steps: { type: Array, default: () => ['选择能力', '填写基础信息', '资料选择', '模板与输出设置', '确认提交'] },
  currentStep: { type: Number, default: 4 },
  taskSummary: { type: Object, default: () => ({ ...referenceTaskSummary }) },
  selectedCapabilities: { type: Array, default: () => capabilityDefinitions.map((item) => ({ ...item })) },
  materials: { type: Array, default: () => referenceMaterials.map((item) => ({ ...item })) }
});
const emit = defineEmits(['update:modelValue', 'request-save', 'request-previous', 'request-submit', 'request-summary-detail', 'request-exit']);

const selectedCapabilityIds = computed(() => props.selectedCapabilities.map((item) => item.id || item.capabilityId));
const visibleGroupKeys = computed(() => getVisibleSettingGroups(selectedCapabilityIds.value).map((item) => item.key));
const summary = computed(() => createPreSubmitSummary({ taskSummary: props.taskSummary, selectedCapabilityIds: selectedCapabilityIds.value, materials: props.materials, settings: props.modelValue }));
const validationErrors = ref({});
const validationMessage = computed(() => Object.values(validationErrors.value)[0] || '');
const globalSettingItems = [
  { key: 'aiGeneratedLabel', title: '启用AI生成标识', description: '在生成内容中标识 AI 生成来源' },
  { key: 'multiModelReview', title: '启用多模型复核', description: '使用多模型交叉复核关键结果' },
  { key: 'saveProcessVersions', title: '保存过程版本', description: '按阶段保存过程版本与快照' },
  { key: 'exportAuditTrail', title: '导出操作留痕', description: '导出文件包含操作日志与流转记录' }
];

function updateGlobal(key, value) {
  const next = cloneTemplateOutputSettings(props.modelValue);
  next.global[key] = value;
  emit('update:modelValue', next);
}
function handleModelUpdate(next) {
  validationErrors.value = {};
  emit('update:modelValue', next);
}
function handleSubmit() {
  validationErrors.value = validateTemplateOutputSettings(props.modelValue, selectedCapabilityIds.value);
  if (Object.keys(validationErrors.value).length) return;
  emit('request-submit');
}
</script>

<style scoped>
.task-template-output-step{--step4-red:var(--color-primary);--step4-line:#dfe5ed;box-sizing:border-box;width:100%;max-width:none;margin:0;color:#242b36;container-type:inline-size}.step4-layout{display:grid;grid-template-columns:minmax(0,1fr) clamp(336px,27.3%,374px);gap:12px;align-items:start}.step4-main{min-width:0}.step4-title-row{display:flex;min-height:45px;align-items:center;gap:12px}.step4-title-row button{display:grid;width:27px;height:27px;place-items:center;padding:0;border:0;background:transparent;color:#222a36;font-size:24px;line-height:1;cursor:pointer}.step4-title-row h2{margin:0;font-size:22px;line-height:1.2}.step4-surface{overflow:hidden;border:1px solid var(--step4-line);border-radius:5px;background:#fff}.step4-wizard{display:flex;min-width:0;min-height:54px;align-items:center;padding:0 34px;border-bottom:1px solid var(--step4-line)}.step4-wizard-item{display:flex;flex:0 0 auto;align-items:center;gap:9px;color:#343d4a;white-space:nowrap}.step4-wizard-item>span{display:grid;width:30px;height:30px;place-items:center;border:1px solid #c5ccd6;border-radius:50%;background:#fff;font-size:14px}.step4-wizard-item b{font-size:14px;font-weight:500}.step4-wizard-item.done>span{border-color:#cfd6df;color:var(--step4-red);font-weight:700}.step4-wizard-item.active{color:var(--step4-red)}.step4-wizard-item.active>span{border-color:var(--step4-red);background:var(--step4-red);color:#fff;font-weight:700}.step4-wizard-item.active b{font-weight:700}.step4-wizard>i{display:block;flex:1 1 55px;min-width:26px;max-width:74px;height:1px;margin:0 16px;background:#d7dde5}.step4-intro{padding:12px 16px 9px}.step4-intro h3,.step4-global-settings>h3{margin:0;font-size:16px;line-height:23px}.step4-intro p{margin:4px 0 0;color:#687383;font-size:12px;line-height:19px}.step4-global-settings{min-height:126px;padding:6px 12px 12px;border-top:1px solid var(--step4-line)}.step4-global-settings>h3{margin-bottom:6px}.global-setting-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.global-setting-item{box-sizing:border-box;min-width:0;min-height:70px;padding:10px 13px;border:1px solid #e1e6ed;border-radius:5px;background:#fff;cursor:pointer}.global-setting-item>span{display:flex;align-items:center;justify-content:space-between;gap:8px}.global-setting-item b{font-size:13px;font-weight:600;white-space:nowrap}.global-setting-item small{display:block;margin-top:8px;color:#727d8c;font-size:11px;line-height:17px}.global-switch{display:inline-flex;align-items:center;gap:6px;flex:0 0 auto}.global-switch input{position:absolute;width:1px;height:1px;opacity:0}.global-switch i{position:relative;width:26px;height:16px;border-radius:10px;background:#aeb6c1}.global-switch i:after{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff;content:""}.global-switch input:checked+i{background:#159454}.global-switch input:checked+i:after{left:12px}.global-switch input:focus-visible+i{outline:2px solid rgba(199,0,0,.25);outline-offset:2px}.global-switch em{font-size:11px;font-style:normal}.step4-actions{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:0 14px;border:1px solid var(--step4-line);border-radius:5px;background:#fff;margin-top:6px}.step4-actions>div{display:flex;gap:14px}.step4-button{height:38px;padding:0 27px;border:1px solid #d2d9e3;border-radius:5px;background:#fff;color:#333b47;font:500 14px/1 inherit;cursor:pointer}.step4-button.previous{min-width:134px;border-color:#df4242;color:var(--color-primary)}.step4-button.submit{min-width:135px;border-color:var(--step4-red);background:var(--step4-red);color:#fff;font-weight:600}.step4-risk-inline,.validation-alert{display:none;align-items:center;gap:6px;margin:0;color:var(--color-warning);font-size:11px;line-height:16px}.validation-alert{display:flex;color:var(--color-primary)}.step4-risk-inline .audit-icon,.validation-alert .audit-icon{width:16px;font-size:16px}.step4-layout>:deep(.submit-confirmation){align-self:stretch;margin-top:14px}
@container(max-width:1139px){.step4-layout{grid-template-columns:1fr}.step4-layout>:deep(.submit-confirmation){align-self:start;margin-top:0}.step4-risk-inline{display:flex;max-width:360px}}
@container(max-width:819px){.global-setting-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.step4-wizard{overflow-x:auto;padding:0 14px}.step4-wizard>i{flex:0 0 30px;margin:0 8px}.step4-actions{align-items:stretch;flex-direction:column;padding:12px}.step4-actions>.draft{width:100%}.step4-actions>div{display:grid;grid-template-columns:1fr 1fr}.step4-risk-inline{max-width:none}.step4-button{width:100%}}
@container(max-width:559px){.task-template-output-step{width:100%}.global-setting-grid{grid-template-columns:1fr}.step4-wizard-item b{display:none}.step4-title-row h2{font-size:20px}.step4-actions>div{grid-template-columns:1fr}}
@media(max-width:1199px){.step4-layout{grid-template-columns:1fr}.step4-layout>:deep(.submit-confirmation){margin-top:0}.step4-risk-inline{display:flex}}
@media(min-width:1200px) and (max-width:1499px){.task-template-output-step{width:100%}.step4-layout{grid-template-columns:minmax(0,1fr)}}
</style>
