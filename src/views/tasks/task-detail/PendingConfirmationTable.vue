<template>
  <section ref="tableSection" class="confirmation-section">
    <div class="section-heading">
      <h2>待确认事项 <small>（共 {{ total }} 项）</small></h2>
    </div>
    <div class="confirmation-table-wrap">
      <table data-confirmation-table>
        <thead>
          <tr>
            <th>来源能力</th>
            <th>事项类型</th>
            <th>事项摘要</th>
            <th>风险等级</th>
            <th>依据来源</th>
            <th>处理意见</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" :class="{ selected: selectedItemId === item.id }">
            <td>{{ abilityNames[item.abilityId] }}</td>
            <td>{{ item.itemType }}</td>
            <td class="summary-cell" :title="item.summary">{{ item.summary }}</td>
            <td><span class="risk-tag" :class="item.risk">{{ riskLabel(item.risk) }}</span></td>
            <td class="source-cell" :title="item.sourceLabel">{{ item.sourceLabel }}</td>
            <td>
              <select :value="item.decision" aria-label="处理意见" @change="$emit('decision-change', item.id, $event.target.value)">
                <option>请选择处理意见</option>
                <option>确认该事项</option>
                <option>排除该事项</option>
              </select>
            </td>
            <td><span class="disposition" :class="item.disposition">{{ dispositionLabel(item.disposition) }}</span></td>
            <td class="row-actions">
              <button type="button" @click="$emit('view-evidence', item)">查看依据</button>
              <button type="button" @click="$emit('confirm', item)">确认</button>
              <button type="button" @click="$emit('exclude', item)">排除</button>
              <button type="button" @click="$emit('edit-note', item)">编辑说明</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <footer data-pagination class="pagination">
      <span>共 {{ total }} 条</span>
      <div>
        <button type="button" :disabled="page <= 1" aria-label="上一页" @click="$emit('page-change', page - 1)">‹</button>
        <button v-for="pageNo in totalPages" :key="pageNo" type="button" :class="{ active: pageNo === page }" @click="$emit('page-change', pageNo)">{{ pageNo }}</button>
        <button type="button" :disabled="page >= totalPages" aria-label="下一页" @click="$emit('page-change', page + 1)">›</button>
        <select :value="pageSize" aria-label="每页条数" @change="$emit('page-size-change', Number($event.target.value))">
          <option :value="10">10 条/页</option>
          <option :value="15">15 条/页</option>
        </select>
        <label>跳至 <input :value="page" inputmode="numeric" @change="$emit('page-change', Number($event.target.value))" /> 页</label>
      </div>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  abilityNames: { type: Object, required: true },
  total: { type: Number, required: true },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  selectedItemId: { type: String, default: '' }
});

defineEmits(['view-evidence', 'confirm', 'exclude', 'edit-note', 'decision-change', 'page-change', 'page-size-change']);

const tableSection = ref(null);
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

function riskLabel(risk) {
  return { high: '高风险', medium: '中风险', low: '低风险' }[risk] || risk;
}

function dispositionLabel(value) {
  return { pending: '待确认', confirmed: '已确认', excluded: '已排除', annotated: '已说明' }[value] || value;
}

defineExpose({
  focusSection() {
    tableSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
</script>

<style scoped>
.confirmation-section{background:#fff;border:1px solid #e5eaf0}.section-heading{height:29px;display:flex;align-items:center;padding:0 9px}.section-heading h2{margin:0;color:#202631;font-size:12px;line-height:20px;font-weight:600}.section-heading small{color:#667085;font-size:9px;font-weight:400}.confirmation-table-wrap{height:146px;overflow:auto;border-top:1px solid #edf0f4;border-bottom:1px solid #edf0f4}.confirmation-table-wrap::-webkit-scrollbar{width:5px;height:5px}.confirmation-table-wrap::-webkit-scrollbar-thumb{background:#d8dee8;border-radius:4px}table{width:100%;min-width:900px;border-collapse:collapse;table-layout:fixed;font-size:9px}th,td{height:22px;padding:2px 6px;border-right:1px solid #eef1f4;border-bottom:1px solid #eef1f4;color:#303642;text-align:left;vertical-align:middle;white-space:nowrap}th{position:sticky;top:0;z-index:1;height:25px;background:#f7f8fa;color:#4d5563;font-weight:600}th:nth-child(1){width:10%}th:nth-child(2){width:9%}th:nth-child(3){width:24%}th:nth-child(4){width:7%}th:nth-child(5){width:17%}th:nth-child(6){width:11%}th:nth-child(7){width:7%}th:nth-child(8){width:15%}tr.selected td{background:#fff8f7}.summary-cell,.source-cell{overflow:hidden;text-overflow:ellipsis}.risk-tag{display:inline-block;padding:0 4px;border-radius:3px;line-height:16px}.risk-tag.high{background:#fff0f0;color:var(--color-primary)}.risk-tag.medium{background:#fff6e8;color:var(--color-warning)}.risk-tag.low{background:#ebf8ef;color:var(--color-success)}select{width:100%;height:19px;border:1px solid #d8dee8;border-radius:3px;background:#fff;color:#667085;font-size:9px}.disposition{font-weight:500}.disposition.pending{color:var(--color-warning)}.disposition.confirmed{color:var(--color-success)}.disposition.excluded{color:#667085}.disposition.annotated{color:var(--color-info)}.row-actions{display:flex;align-items:center;gap:8px}.row-actions button{padding:0;border:0;background:transparent;color:var(--color-info);font-size:9px;white-space:nowrap}.pagination{height:31px;display:flex;align-items:center;justify-content:space-between;padding:0 10px;color:#667085;font-size:9px}.pagination>div{display:flex;align-items:center;gap:5px}.pagination button{min-width:20px;height:20px;padding:0 5px;border:1px solid #dfe4eb;border-radius:3px;background:#fff;color:#4d5563;font-size:9px}.pagination button.active{border-color:var(--color-primary);background:var(--color-primary);color:#fff}.pagination button:disabled{color:#c7cdd5}.pagination select{width:74px}.pagination label{display:flex;align-items:center;gap:4px}.pagination input{width:42px;height:20px;border:1px solid #dfe4eb;border-radius:3px;text-align:center;font-size:9px}
@media(max-height:850px){.confirmation-table-wrap{height:139px}}
</style>
