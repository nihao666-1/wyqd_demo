<template>
  <div class="template-config-cards">
    <div class="template-config-three">
      <section v-if="visible.has('policyKnowledge')" class="template-config-card card-tall" data-config-group="policyKnowledge">
        <CardTitle icon="knowledge" tone="blue">制度查询 / 制度变更</CardTitle>
        <ConfigSelect label="知识库范围" :value="modelValue.policyKnowledge.knowledgeScope" :options="['全部制度库', '公司制度库', '外部法规库']" @change="setValue('policyKnowledge.knowledgeScope', $event)" />
        <ConfigSelect label="生效时间" :value="modelValue.policyKnowledge.effectiveTime" :options="['最新有效', '任务期间有效', '全部历史版本']" @change="setValue('policyKnowledge.effectiveTime', $event)" />
        <CheckRow label="输出格式" :items="['PDF', 'Excel']" :selected="modelValue.policyKnowledge.outputFormats" @toggle="toggleArray('policyKnowledge.outputFormats', $event)" />
        <SwitchRow label="引用到任务" :checked="modelValue.policyKnowledge.citeToTask" @change="setValue('policyKnowledge.citeToTask', $event)" />
      </section>

      <section v-if="visible.has('policyCompare')" class="template-config-card card-tall" data-config-group="policyCompare">
        <CardTitle icon="compare" tone="green">制度比对</CardTitle>
        <ConfigSelect label="外部制度范围" :value="modelValue.policyCompare.externalScope" :options="['证监会+自律规则', '证监会规则', '行业自律规则']" @change="setValue('policyCompare.externalScope', $event)" />
        <ConfigSelect label="内部制度范围" :value="modelValue.policyCompare.internalScope" :options="['公司制度库（全量）', '当前有效制度', '指定制度目录']" @change="setValue('policyCompare.internalScope', $event)" />
        <CheckRow label="比对规则" :items="['缺失识别', '口径差异', '时限差异']" :selected="modelValue.policyCompare.rules" compact @toggle="toggleArray('policyCompare.rules', $event)" />
        <ConfigSelect label="输出格式" :value="modelValue.policyCompare.output" :options="['Excel（差异清单）', 'Word（差异报告）']" @change="setValue('policyCompare.output', $event)" />
      </section>

      <section v-if="visible.has('regulatoryAnalysis')" class="template-config-card card-tall" data-config-group="regulatoryAnalysis">
        <CardTitle icon="analysis" tone="purple">监管案例舆情分析</CardTitle>
        <ConfigSelect label="案例来源" :value="modelValue.regulatoryAnalysis.caseSource" :options="['证监会+交易所', '证监会', '证券交易所']" @change="setValue('regulatoryAnalysis.caseSource', $event)" />
        <ConfigSelect label="舆情来源" :value="modelValue.regulatoryAnalysis.sentimentSource" :options="['新闻+监管通报', '新闻媒体', '监管通报']" @change="setValue('regulatoryAnalysis.sentimentSource', $event)" />
        <ConfigSelect label="风险等级阈值" :value="modelValue.regulatoryAnalysis.riskThreshold" :options="['中风险及以上', '高风险', '全部风险']" @change="setValue('regulatoryAnalysis.riskThreshold', $event)" />
        <ConfigSelect label="输出结果" :value="modelValue.regulatoryAnalysis.output" :options="['监管关注点清单', '风险事件摘要']" @change="setValue('regulatoryAnalysis.output', $event)" />
      </section>

      <section v-if="visible.has('auditStandard')" class="template-config-card card-compact" data-config-group="auditStandard">
        <CardTitle icon="review" tone="blue">审计规范生成</CardTitle>
        <ConfigSelect label="审计规范模板" :value="modelValue.auditStandard.template" :options="['常规审计规范模板 V2.1', '专项审计规范模板 V1.6']" @change="setValue('auditStandard.template', $event)" />
        <ConfigSelect label="输出格式" :value="modelValue.auditStandard.output" :options="['Excel', 'Word']" @change="setValue('auditStandard.output', $event)" />
        <SwitchRow label="生成审计重点建议" :checked="modelValue.auditStandard.includeKeyPoints" @change="setValue('auditStandard.includeKeyPoints', $event)" />
      </section>

      <section v-if="visible.has('supervisionAnalysis')" class="template-config-card card-compact" data-config-group="supervisionAnalysis">
        <CardTitle icon="analysis" tone="orange">监督共享信息分析</CardTitle>
        <ConfigSelect label="报告框架" :value="modelValue.supervisionAnalysis.framework" :options="['监督共享分析报告模板', '监督事项汇总模板']" @change="setValue('supervisionAnalysis.framework', $event)" />
        <ConfigSelect label="标签提取规则" :value="modelValue.supervisionAnalysis.taxonomy" :options="['监管标签体系 V1.0', '风险标签体系 V2.0']" @change="setValue('supervisionAnalysis.taxonomy', $event)" />
        <CheckRow label="输出格式" :items="['Excel', 'Word 报告']" :selected="modelValue.supervisionAnalysis.outputFormats" @toggle="toggleArray('supervisionAnalysis.outputFormats', $event)" />
      </section>

      <section v-if="visible.has('expenseAudit')" class="template-config-card card-compact" data-config-group="expenseAudit">
        <CardTitle icon="expense" tone="green">费用审计</CardTitle>
        <ConfigSelect label="费用规则版本" :value="modelValue.expenseAudit.ruleVersion" :options="['费用规则库 V2.1', '费用规则库 V2.0']" @change="setValue('expenseAudit.ruleVersion', $event)" />
        <ConfigSelect label="异常类型" :value="modelValue.expenseAudit.anomalyType" :options="['全部异常类型', '预算异常', '报销合规异常']" @change="setValue('expenseAudit.anomalyType', $event)" />
        <ConfigSelect label="输出结果" :value="modelValue.expenseAudit.output" :options="['异常汇总 Excel', '费用审计报告']" @change="setValue('expenseAudit.output', $event)" />
      </section>
    </div>

    <div class="template-report-row">
      <section v-if="visible.has('reportGeneration')" class="template-config-card report-card" data-config-group="reportGeneration">
        <CardTitle icon="report-generate" tone="red">报告生成</CardTitle>
        <RadioRow label="报告类型" :items="['常规审计', '反洗钱', '离任审计']" :value="modelValue.reportGeneration.reportType" @change="setValue('reportGeneration.reportType', $event)" />
        <ConfigSelect label="报告模板" :value="modelValue.reportGeneration.reportTemplate" :options="['常规审计报告模板 V2.2', '营业部常规审计报告模板 V2.1']" @change="setValue('reportGeneration.reportTemplate', $event)" />
        <ConfigSelect label="格式模板" :value="modelValue.reportGeneration.formatTemplate" :options="['证券行业格式模板 V2.0', '东方证券报告格式 V1.8']" @change="setValue('reportGeneration.formatTemplate', $event)" />
        <CheckRow label="输出格式" :items="['Word', 'PDF']" :selected="modelValue.reportGeneration.outputFormats" @toggle="toggleArray('reportGeneration.outputFormats', $event)" />
        <p v-if="errors['reportGeneration.reportTemplate'] || errors['reportGeneration.outputFormats']" class="config-error">{{ errors['reportGeneration.reportTemplate'] || errors['reportGeneration.outputFormats'] }}</p>
      </section>

      <section v-if="visible.has('reportReview')" class="template-config-card report-card" data-config-group="reportReview">
        <CardTitle icon="review" tone="blue">报告审核</CardTitle>
        <CheckRow label="检查规则" :items="['字体规范', '格式规范', '标题编号', '文字优化']" :selected="modelValue.reportReview.rules" @toggle="toggleArray('reportReview.rules', $event)" />
        <ConfigSelect label="输出结果" :value="modelValue.reportReview.output" :options="['审核问题清单（Excel）', '审核建议报告（Word）']" @change="setValue('reportReview.output', $event)" />
        <p v-if="errors['reportReview.rules']" class="config-error">{{ errors['reportReview.rules'] }}</p>
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
const visible = computed(() => new Set(props.visibleGroupKeys));

function update(path, value) {
  const next = cloneTemplateOutputSettings(props.modelValue);
  const parts = path.split('.');
  next[parts[0]][parts[1]] = value;
  emit('update:modelValue', next);
}
function setValue(path, value) { update(path, value); }
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
const RadioRow = defineComponent({
  props: { label: String, items: Array, value: String }, emits: ['change'],
  setup(componentProps, { emit: childEmit }) {
    return () => h('fieldset', { class: 'option-row' }, [h('legend', componentProps.label), h('div', { class: 'inline-options' }, componentProps.items.map((item) => h('label', [h('input', { type: 'radio', name: 'report-type', checked: componentProps.value === item, onChange: () => childEmit('change', item) }), item])))]);
  }
});
const SwitchRow = defineComponent({
  props: { label: String, checked: Boolean }, emits: ['change'],
  setup(componentProps, { emit: childEmit }) {
    return () => h('label', { class: 'config-row' }, [h('span', componentProps.label), h('span', { class: 'switch-control' }, [h('input', { type: 'checkbox', checked: componentProps.checked, onChange: (event) => childEmit('change', event.target.checked) }), h('i'), h('b', componentProps.checked ? '启用' : '停用')])]);
  }
});
</script>

<style>
.template-config-cards{padding:0 12px 10px}.template-config-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.template-report-row{display:grid;grid-template-columns:minmax(0,45fr) minmax(0,55fr);gap:10px;margin-top:10px}.template-config-card{box-sizing:border-box;min-width:0;border:1px solid #dfe5ed;border-radius:5px;background:#fff;padding:12px 13px}.card-tall{min-height:200px}.card-compact{min-height:154px}.report-card{min-height:174px}.config-card-title{display:flex;align-items:center;gap:8px;margin:0 0 8px;color:#252b35;font-size:15px;line-height:22px}.config-card-icon{display:grid;width:22px;height:22px;place-items:center;border-radius:4px;color:#fff;font-size:15px}.config-card-icon.blue{background:#2f75d9}.config-card-icon.green{background:#2b9b68}.config-card-icon.purple{background:#7b57c2}.config-card-icon.orange{background:#ef8a25}.config-card-icon.red{background:#d22c33}.config-row{display:grid;grid-template-columns:88px minmax(0,1fr);align-items:center;gap:8px;box-sizing:border-box;width:100%;min-height:32px;margin:0;padding:0;border:0;color:#343b46;font-size:12px}.config-row>span:first-child{white-space:nowrap}.option-row{position:relative;box-sizing:border-box;width:100%;min-height:32px;margin:0;padding:0 0 0 96px;border:0;color:#343b46;font-size:12px}.option-row legend{position:absolute;top:7px;left:0;width:88px;padding:0;white-space:nowrap}.config-row select{box-sizing:border-box;width:100%;min-width:0;height:28px;padding:0 28px 0 9px;border:1px solid #d9dfe8;border-radius:4px;background:#fff;color:#3a424d;font:inherit;text-overflow:ellipsis}.inline-options{display:flex;flex-wrap:wrap;align-content:center;align-items:center;gap:5px 13px;min-width:0;min-height:32px}.inline-options.compact{gap:4px 10px}.inline-options label{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.inline-options input{width:13px;height:13px;margin:0;accent-color:#c70000}.switch-control{display:inline-flex;align-items:center;gap:7px}.switch-control input{position:absolute;width:1px;height:1px;opacity:0}.switch-control i{position:relative;width:26px;height:16px;border-radius:10px;background:#aab3bf}.switch-control i:after{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff;content:"";transition:left .16s}.switch-control input:checked+i{background:#169554}.switch-control input:checked+i:after{left:12px}.switch-control b{font-size:12px;font-weight:400}.config-row select:focus,.inline-options input:focus-visible,.switch-control input:focus-visible+i{outline:2px solid rgba(199,0,0,.24);outline-offset:1px}.config-error{margin:4px 0 0 96px;color:#c70000;font-size:11px;line-height:15px}
@media(max-width:899px){.template-config-three,.template-report-row{grid-template-columns:repeat(2,minmax(0,1fr))}.card-tall,.card-compact,.report-card{min-height:0}}
@media(max-width:639px){.template-config-three,.template-report-row{grid-template-columns:1fr}.template-config-cards{padding:0 8px 8px}.config-row{grid-template-columns:92px minmax(0,1fr)}}
</style>
