<template>
  <div class="template-config-cards">
    <div class="template-config-three">
      <section v-for="group in visibleGroups" :key="group.key" class="template-config-card card-compact" :data-config-group="group.key">
        <CardTitle :icon="group.icon" :tone="group.tone">{{ group.title }}</CardTitle>
        <ConfigSelect label="业务模板" :value="fieldValue(group.templatePath)" :options="group.templateOptions" @change="setValue(group.templatePath, $event)" />
        <CheckRow v-if="group.outputType === 'multi'" label="输出格式" :items="group.outputOptions" :selected="fieldValue(group.outputPath)" @toggle="toggleArray(group.outputPath, $event)" />
        <ConfigSelect v-else label="输出格式" :value="fieldValue(group.outputPath)" :options="group.outputOptions" @change="setValue(group.outputPath, $event)" />
        <p v-if="groupError(group.key)" class="config-error">{{ groupError(group.key) }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue';
import AuditIcon from '../../components/common/AuditIcon.vue';
import { cloneTemplateOutputSettings, configurationGroups } from '../../domain/taskCreate/taskTemplateOutputSettings.js';

const props = defineProps({
  modelValue: { type: Object, required: true },
  visibleGroupKeys: { type: Array, default: () => configurationGroups.map((item) => item.key) },
  errors: { type: Object, default: () => ({}) }
});
const emit = defineEmits(['update:modelValue']);
const groupConfigs = {
  policyKnowledge: { title: '制度查询 / 制度变更', icon: 'knowledge', tone: 'blue', templatePath: 'policyKnowledge.businessTemplate', templateOptions: ['制度知识分析模板 V1.0', '制度变更摘要模板 V1.0'], outputPath: 'policyKnowledge.outputFormats', outputType: 'multi', outputOptions: ['PDF', 'Excel'] },
  policyCompare: { title: '制度比对', icon: 'compare', tone: 'green', templatePath: 'policyCompare.businessTemplate', templateOptions: ['制度比对业务模板 V1.0', '新旧制度差异模板 V1.0'], outputPath: 'policyCompare.output', outputOptions: ['Excel（差异清单）', 'Word（差异报告）'] },
  regulatoryAnalysis: { title: '监管案例舆情分析', icon: 'analysis', tone: 'purple', templatePath: 'regulatoryAnalysis.businessTemplate', templateOptions: ['监管案例舆情分析模板 V1.0', '监管关注点分析模板 V1.0'], outputPath: 'regulatoryAnalysis.output', outputOptions: ['监管关注点清单', '风险事件摘要'] },
  auditStandard: { title: '审计规范生成', icon: 'review', tone: 'blue', templatePath: 'auditStandard.template', templateOptions: ['常规审计规范模板 V2.1', '专项审计规范模板 V1.6'], outputPath: 'auditStandard.output', outputOptions: ['Excel', 'Word'] },
  supervisionAnalysis: { title: '监督共享信息分析', icon: 'analysis', tone: 'orange', templatePath: 'supervisionAnalysis.framework', templateOptions: ['监督共享分析报告模板', '监督事项汇总模板'], outputPath: 'supervisionAnalysis.outputFormats', outputType: 'multi', outputOptions: ['Excel', 'Word 报告'] },
  expenseAudit: { title: '费用审计', icon: 'expense', tone: 'green', templatePath: 'expenseAudit.businessTemplate', templateOptions: ['费用审计业务模板 V2.1', '费用审计专项模板 V2.0'], outputPath: 'expenseAudit.output', outputOptions: ['异常汇总 Excel', '费用审计报告'] },
  reportGeneration: { title: '报告生成', icon: 'report-generate', tone: 'red', templatePath: 'reportGeneration.reportTemplate', templateOptions: ['常规审计报告模板 V2.2', '营业部常规审计报告模板 V2.1'], outputPath: 'reportGeneration.outputFormats', outputType: 'multi', outputOptions: ['Word', 'PDF'] },
  reportReview: { title: '报告审核', icon: 'review', tone: 'blue', templatePath: 'reportReview.businessTemplate', templateOptions: ['报告审核业务模板 V1.0', '审计报告复核模板 V1.0'], outputPath: 'reportReview.output', outputOptions: ['审核问题清单（Excel）', '审核建议报告（Word）'] }
};
const visibleGroups = computed(() => props.visibleGroupKeys.map((key) => ({ key, ...groupConfigs[key] })).filter((group) => group.templatePath));

function update(path, value) {
  const next = cloneTemplateOutputSettings(props.modelValue);
  const parts = path.split('.');
  next[parts[0]][parts[1]] = value;
  emit('update:modelValue', next);
}
function setValue(path, value) { update(path, value); }
function fieldValue(path) {
  const [key, field] = path.split('.');
  return props.modelValue[key][field];
}
function groupError(key) {
  return errorsForKey(key)[0] || '';
}
function errorsForKey(key) {
  return Object.entries(props.errors)
    .filter(([path]) => path.startsWith(`${key}.`))
    .map(([, message]) => message);
}
function toggleArray(path, item) {
  const [key, field] = path.split('.');
  const values = props.modelValue[key][field];
  update(path, values.includes(item) ? values.filter((value) => value !== item) : [...values, item]);
}

const CardTitle = defineComponent({
  props: { icon: String, tone: String },
  setup(componentProps, { slots }) {
    return () => h('h3', { class: 'config-card-title' }, [h('span', { class: ['config-card-icon', componentProps.tone] }, [h(AuditIcon, { name: componentProps.icon })]), slots.default?.()]);
  }
});
const ConfigSelect = defineComponent({
  props: { label: String, value: String, options: Array }, emits: ['change'],
  setup(componentProps, { emit: childEmit }) {
    return () => h('label', { class: 'config-row' }, [h('span', componentProps.label), h('select', { value: componentProps.value, onChange: (event) => childEmit('change', event.target.value) }, componentProps.options.map((item) => h('option', { value: item }, item)))]);
  }
});
const CheckRow = defineComponent({
  props: { label: String, items: Array, selected: Array, compact: Boolean }, emits: ['toggle'],
  setup(componentProps, { emit: childEmit }) {
    return () => h('fieldset', { class: 'option-row' }, [h('legend', componentProps.label), h('div', { class: ['inline-options', { compact: componentProps.compact }] }, componentProps.items.map((item) => h('label', [h('input', { type: 'checkbox', checked: componentProps.selected.includes(item), onChange: () => childEmit('toggle', item) }), item])))]);
  }
});
</script>

<style>
.template-config-cards{padding:0 12px 10px}.template-config-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.template-report-row{display:grid;grid-template-columns:minmax(0,45fr) minmax(0,55fr);gap:10px;margin-top:10px}.template-config-card{box-sizing:border-box;min-width:0;border:1px solid #dfe5ed;border-radius:5px;background:#fff;padding:12px 13px}.card-tall{min-height:200px}.card-compact{min-height:154px}.report-card{min-height:174px}.config-card-title{display:flex;align-items:center;gap:8px;margin:0 0 8px;color:#252b35;font-size:15px;line-height:22px}.config-card-icon{display:grid;width:22px;height:22px;place-items:center;border-radius:4px;color:#fff;font-size:15px}.config-card-icon.blue{background:var(--color-info)}.config-card-icon.green{background:var(--color-success)}.config-card-icon.purple{background:#6f668f}.config-card-icon.orange{background:var(--color-warning)}.config-card-icon.red{background:#d22c33}.config-row{display:grid;grid-template-columns:88px minmax(0,1fr);align-items:center;gap:8px;box-sizing:border-box;width:100%;min-height:32px;margin:0;padding:0;border:0;color:#343b46;font-size:12px}.config-row>span:first-child{white-space:nowrap}.option-row{position:relative;box-sizing:border-box;width:100%;min-height:32px;margin:0;padding:0 0 0 96px;border:0;color:#343b46;font-size:12px}.option-row legend{position:absolute;top:7px;left:0;width:88px;padding:0;white-space:nowrap}.config-row select{box-sizing:border-box;width:100%;min-width:0;height:28px;padding:0 28px 0 9px;border:1px solid #d9dfe8;border-radius:4px;background:#fff;color:#3a424d;font:inherit;text-overflow:ellipsis}.inline-options{display:flex;flex-wrap:wrap;align-content:center;align-items:center;gap:5px 13px;min-width:0;min-height:32px}.inline-options.compact{gap:4px 10px}.inline-options label{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.inline-options input{width:13px;height:13px;margin:0;accent-color:var(--color-primary)}.switch-control{display:inline-flex;align-items:center;gap:7px}.switch-control input{position:absolute;width:1px;height:1px;opacity:0}.switch-control i{position:relative;width:26px;height:16px;border-radius:10px;background:#aab3bf}.switch-control i:after{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff;content:"";transition:left .16s}.switch-control input:checked+i{background:var(--color-success)}.switch-control input:checked+i:after{left:12px}.switch-control b{font-size:12px;font-weight:400}.config-row select:focus,.inline-options input:focus-visible,.switch-control input:focus-visible+i{outline:2px solid rgba(199,0,0,.24);outline-offset:1px}.config-error{margin:4px 0 0 96px;color:var(--color-primary);font-size:11px;line-height:15px}
@media(max-width:899px){.template-config-three,.template-report-row{grid-template-columns:repeat(2,minmax(0,1fr))}.card-tall,.card-compact,.report-card{min-height:0}}
@media(max-width:639px){.template-config-three,.template-report-row{grid-template-columns:1fr}.template-config-cards{padding:0 8px 8px}.config-row{grid-template-columns:92px minmax(0,1fr)}}
</style>
