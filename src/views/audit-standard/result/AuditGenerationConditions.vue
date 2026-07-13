<template>
  <aside class="generation-conditions" data-audit-region="generation-conditions">
    <h2>生成条件</h2>
    <form @submit.prevent="$emit('start-generation')">
      <label v-for="field in fields" :key="field.key" class="condition-field">
        <span :class="{ required: field.required }">{{ field.label }}</span>
        <select
          :value="conditions[field.key]"
          :aria-label="field.label"
          :disabled="generating"
          @change="$emit('update-condition', field.key, $event.target.value)"
        >
          <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>

      <button class="generate-button" type="submit" :disabled="generating">
        {{ generating ? '正在生成规范' : '开始生成规范' }}
      </button>
    </form>

    <section class="condition-hint" aria-labelledby="condition-hint-title">
      <h3 id="condition-hint-title">提示说明</h3>
      <ul>
        <li>系统将基于所选范围与模板生成审计规范条目</li>
        <li>生成完成后需人工审核并确认</li>
        <li>支持导出 Excel 并引用到报告</li>
      </ul>
    </section>
  </aside>
</template>

<script setup>
defineProps({
  conditions: {
    type: Object,
    default: () => ({
      template: '营业部综合审计规范模板 V2.1',
      policyScope: '全部相关制度',
      caseScope: '近2年监管案例与处罚',
      risks: '系统识别风险+自定义风险',
      historyVersion: 'V1.0（2024-12-01）',
      outputFormat: 'Excel（.xlsx）'
    })
  },
  generating: { type: Boolean, default: false }
});

defineEmits(['update-condition', 'start-generation']);

const fields = [
  { key: 'template', label: '审计规范模板', required: true, options: ['营业部综合审计规范模板 V2.1', '费用审计规范模板 V1.3'] },
  { key: 'policyScope', label: '内外规制度范围', required: true, options: ['全部相关制度', '仅内部制度', '仅外部法规'] },
  { key: 'caseScope', label: '监管案例范围', required: true, options: ['近2年监管案例与处罚', '近3年监管案例与处罚', '不引用监管案例'] },
  { key: 'risks', label: '风险事项', required: true, options: ['系统识别风险+自定义风险', '仅系统识别风险', '仅自定义风险'] },
  { key: 'historyVersion', label: '历史规范版本', required: false, options: ['V1.0（2024-12-01）', 'V0.9（2024-06-30）'] },
  { key: 'outputFormat', label: '输出格式', required: true, options: ['Excel（.xlsx）', 'Word（.docx）'] }
];
</script>

<style scoped>
.generation-conditions{box-sizing:border-box;height:100%;min-height:626px;padding:0 12px 12px;background:#fff;border:1px solid #dfe4eb;color:#252a34}.generation-conditions h2{height:43px;margin:0;display:flex;align-items:center;font-size:14px;line-height:20px;font-weight:600}.condition-field{display:block;margin-bottom:15px}.condition-field>span{display:block;margin-bottom:5px;color:#303642;font-size:11px;line-height:16px;font-weight:500}.condition-field>span.required::before{content:"*";margin-right:3px;color:#d50000}.condition-field select{box-sizing:border-box;width:100%;height:31px;padding:0 25px 0 8px;border:1px solid #d8dee8;border-radius:3px;background:#fff;color:#323844;font:400 10px/29px inherit;white-space:nowrap;text-overflow:ellipsis}.condition-field select:focus-visible{outline:2px solid #e5484d;outline-offset:1px}.condition-field select:disabled{background:#f5f6f8;color:#949ba6}.generate-button{width:100%;height:31px;margin-top:7px;border:1px solid #c50000;border-radius:3px;background:#c50000;color:#fff;font:500 12px/29px inherit;cursor:pointer}.generate-button:hover:not(:disabled){background:#a90000}.generate-button:focus-visible{outline:2px solid #e5484d;outline-offset:2px}.generate-button:disabled{cursor:not-allowed;opacity:.62}.condition-hint{margin-top:24px;padding:10px 8px;background:#fafbfc}.condition-hint h3{margin:0 0 7px;font-size:10px;line-height:16px;font-weight:600}.condition-hint ul{margin:0;padding:0;list-style:none}.condition-hint li{position:relative;margin:4px 0;padding-left:8px;color:#5f6774;font-size:9px;line-height:14px}.condition-hint li::before{content:"";position:absolute;top:6px;left:0;width:3px;height:3px;border-radius:50%;background:#5f6774}
.condition-field{margin-bottom:17px}.condition-hint{padding:8px}.condition-hint h3{margin-bottom:5px;line-height:14px}.condition-hint li{margin:2px 0;line-height:12px}.condition-hint li::before{top:5px}
</style>
