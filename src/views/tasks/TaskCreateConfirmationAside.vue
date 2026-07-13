<template>
  <aside class="submit-confirmation" aria-labelledby="submit-confirmation-title">
    <h2 id="submit-confirmation-title">提交前确认</h2>

    <section class="confirm-section task-section" data-confirm-section="task">
      <h3>任务概要</h3>
      <dl>
        <div><dt>任务名称</dt><dd>{{ summary.task.taskName }}</dd></div>
        <div><dt>被审计单位</dt><dd>{{ summary.task.auditedUnit }}</dd></div>
        <div><dt>审计期间</dt><dd>{{ summary.task.auditPeriod }}</dd></div>
        <div><dt>任务类型</dt><dd>{{ summary.task.taskType }}</dd></div>
        <div><dt>负责人</dt><dd>{{ summary.task.owner }}</dd></div>
      </dl>
      <button type="button" @click="$emit('request-summary-detail', 'task')">查看更多 <span>›</span></button>
    </section>

    <section class="confirm-section capability-section" data-confirm-section="capabilities">
      <h3>已选择能力 <small>（{{ summary.capabilities.length }} 项）</small></h3>
      <ul class="capability-list">
        <li v-for="item in summary.capabilities" :key="item.id"><span>✓</span>{{ item.name }}</li>
      </ul>
      <button type="button" @click="$emit('request-summary-detail', 'capabilities')">查看详情 <span>›</span></button>
    </section>

    <section class="confirm-section material-section" data-confirm-section="materials">
      <h3>所需资料 <small>（{{ summary.materials.length }} 项）</small></h3>
      <table class="confirm-material-table">
        <thead><tr><th>资料名称</th><th>状态</th><th>来源</th></tr></thead>
        <tbody><tr v-for="item in summary.materials" :key="item.id || item.name"><td>{{ item.name }}</td><td><b :class="materialStatusClass(item.status)">{{ item.status }}</b></td><td>{{ item.source }}</td></tr></tbody>
      </table>
    </section>

    <section class="confirm-section output-section" data-confirm-section="outputs">
      <h3>输出结果 <small>（预计 {{ summary.outputs.length }} 项）</small></h3>
      <ul class="output-list"><li v-for="item in summary.outputs" :key="item.capabilityId">{{ item.label }}</li></ul>
    </section>

    <section class="confirm-section risk-section" data-confirm-section="risk">
      <h3>风险提示</h3>
      <div v-if="summary.risks.length" class="risk-message"><AuditIcon name="anomaly" /><p>{{ summary.risks[0] }}</p></div>
      <div v-else class="ready-message"><AuditIcon name="review" /><p>资料与输出设置均已就绪，可以提交任务。</p></div>
    </section>
  </aside>
</template>

<script setup>
import AuditIcon from '../../components/common/AuditIcon.vue';

defineProps({ summary: { type: Object, required: true } });
defineEmits(['request-summary-detail']);

function materialStatusClass(status) {
  return status.includes('缺少') || status.includes('未就绪') ? 'status-missing' : 'status-ready';
}
</script>

<style scoped>
.submit-confirmation{box-sizing:border-box;min-width:0;border:1px solid #dfe5ed;border-radius:5px;background:#fff;color:#292f39}.submit-confirmation>h2{height:38px;margin:0;padding:0 13px;border-bottom:1px solid #dfe5ed;font-size:16px;line-height:38px}.confirm-section{padding:11px 13px;border-bottom:1px solid #dfe5ed}.confirm-section:last-child{border-bottom:0}.confirm-section h3{margin:0 0 8px;font-size:14px;line-height:20px}.confirm-section h3 small{color:#525d6d;font:400 12px/1 inherit}.confirm-section button{display:block;margin:7px auto 0;padding:0;border:0;background:none;color:#2573cc;font:400 12px/20px inherit;cursor:pointer}.confirm-section button:focus-visible{outline:2px solid rgba(37,115,204,.26);outline-offset:2px}.task-section dl{display:grid;gap:5px;margin:0}.task-section dl div{display:grid;grid-template-columns:95px minmax(0,1fr);gap:8px;font-size:12px;line-height:19px}.task-section dt{color:#5c6573}.task-section dd{min-width:0;margin:0;color:#2f3540;overflow-wrap:anywhere}.capability-list,.output-list{display:grid;margin:0;padding:0;list-style:none}.capability-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:3px 11px}.capability-list li{display:flex;align-items:center;gap:7px;min-width:0;font-size:12px;line-height:20px}.capability-list li span{display:grid;width:11px;height:11px;flex:0 0 11px;place-items:center;border-radius:50%;background:#149452;color:#fff;font-size:8px}.confirm-material-table{width:100%;min-width:0;max-width:100%;table-layout:fixed;border:1px solid #e4e8ef;border-collapse:separate;border-spacing:0;border-radius:4px;font-size:11px;line-height:16px}.confirm-material-table th,.confirm-material-table td{min-width:0;padding:4px 5px;border-top:1px solid #edf0f4;text-align:left;overflow-wrap:anywhere}.confirm-material-table thead th{border-top:0;background:#fafbfc;color:#555f6d;font-weight:600}.confirm-material-table th:first-child{width:50%}.confirm-material-table th:nth-child(2),.confirm-material-table th:nth-child(3){width:25%}.confirm-material-table b{font-weight:400}.status-ready{color:#188a4f}.status-missing{color:#ed861b}.output-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 12px}.output-list li{position:relative;padding-left:9px;color:#5c6574;font-size:11px;line-height:19px}.output-list li:before{position:absolute;top:8px;left:1px;width:3px;height:3px;border-radius:50%;background:#98a2b1;content:""}.risk-message,.ready-message{display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px;align-items:start}.risk-message{color:#f28a20}.ready-message{color:#159054}.risk-message .audit-icon,.ready-message .audit-icon{width:19px;font-size:19px}.risk-message p,.ready-message p{margin:0;color:#616a78;font-size:11px;line-height:18px}
@media(max-width:1199px){.submit-confirmation{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.submit-confirmation>h2{grid-column:1/-1}.confirm-section{border-right:1px solid #dfe5ed}.material-section,.risk-section{grid-column:1/-1}.risk-section{border-right:0}.output-section{border-right:0}}
@media(max-width:639px){.submit-confirmation{grid-template-columns:1fr}.submit-confirmation>h2,.material-section,.risk-section{grid-column:auto}.confirm-section{border-right:0}.output-list{grid-template-columns:1fr}}
</style>
