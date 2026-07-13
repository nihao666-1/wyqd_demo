<template>
  <div v-if="mode" ref="layer" class="dialog-layer" @keydown.tab="trapFocus" @mousedown.self="$emit('cancel')">
    <section v-if="mode === 'edit'" class="action-dialog" data-edit-dialog role="dialog" aria-modal="true" aria-labelledby="edit-title">
      <header><h2 id="edit-title">编辑条目</h2><button aria-label="关闭" @click="$emit('cancel')">×</button></header>
      <label for="standard-title">条目名称</label><textarea id="standard-title" ref="editInput" v-model="editValue" required maxlength="80"></textarea>
      <footer><button @click="$emit('cancel')">取消</button><button class="primary" @click="$emit('confirm-edit', editValue)">保存</button></footer>
    </section>
    <section v-else-if="mode === 'exclude'" class="action-dialog" data-exclude-dialog role="dialog" aria-modal="true" aria-labelledby="exclude-title">
      <header><h2 id="exclude-title">排除条目</h2><button aria-label="关闭" @click="$emit('cancel')">×</button></header>
      <p>排除后将写入操作留痕，请说明原因。</p><label for="exclude-reason">排除原因</label><textarea id="exclude-reason" ref="excludeInput" v-model="excludeReason" required maxlength="200" placeholder="请输入排除原因"></textarea>
      <span v-if="error" class="dialog-error" role="alert">{{ error }}</span>
      <footer><button @click="$emit('cancel')">取消</button><button class="primary" @click="$emit('confirm-exclude', excludeReason)">保存</button></footer>
    </section>
    <section v-else class="action-dialog trail-dialog" data-operation-trail-dialog role="dialog" aria-modal="true" aria-labelledby="trail-title">
      <header><h2 id="trail-title">操作留痕</h2><button ref="trailClose" aria-label="关闭" @click="$emit('cancel')">×</button></header>
      <div class="trail-head"><b>动作</b><b>条目</b><b>原因 / 详情</b><b>操作人</b><b>时间</b></div>
      <div class="trail-list">
        <article v-for="entry in operationTrail.slice().reverse()" :key="entry.id">
          <strong>{{ entry.action }}</strong><span>{{ entry.itemId || '—' }}</span><p>{{ entry.detail || '—' }}</p><span>{{ entry.operator }}</span><time>{{ entry.time }}</time>
        </article>
      </div>
      <footer><button class="primary" @click="$emit('cancel')">关闭</button></footer>
    </section>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
const props = defineProps({
  mode: { type: String, default: '' }, item: { type: Object, default: null }, error: { type: String, default: '' },
  operationTrail: { type: Array, default: () => [] }
});
defineEmits(['cancel', 'confirm-edit', 'confirm-exclude']);
const editValue = ref(''); const excludeReason = ref(''); const editInput = ref(null); const excludeInput = ref(null); const trailClose = ref(null); const layer = ref(null);

watch(() => props.mode, async (mode) => {
  editValue.value = props.item?.title || '';
  excludeReason.value = '';
  if (!mode) return;
  await nextTick();
  (mode === 'edit' ? editInput.value : mode === 'exclude' ? excludeInput.value : trailClose.value)?.focus();
}, { immediate: true });

function trapFocus(event) {
  const controls = [...(layer.value?.querySelectorAll('button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])') || [])]
    .filter((element) => element.getClientRects().length > 0);
  if (!controls.length) return;
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
</script>

<style scoped>
.dialog-layer{position:fixed;z-index:100;inset:0;display:grid;place-items:center;background:rgb(17 24 39 / 30%)}.action-dialog{width:420px;padding:0 18px 16px;border:1px solid #dce2e9;border-radius:5px;background:#fff;box-shadow:0 14px 34px rgb(20 30 45 / 20%)}.action-dialog header{display:flex;height:48px;align-items:center;justify-content:space-between;border-bottom:1px solid #e8ebef}.action-dialog h2{font-size:16px}.action-dialog header button{border:0;background:transparent;font-size:22px}.action-dialog>p{margin:12px 0 0;color:#697586;font-size:12px}.action-dialog>label{display:block;margin:13px 0 6px;font-size:12px;font-weight:600}.action-dialog textarea{width:100%;height:92px;resize:none;padding:9px;border:1px solid #ccd4df;border-radius:4px;font:12px/20px inherit}.dialog-error{display:block;margin-top:5px;color:#cc0000;font-size:11px}.action-dialog footer{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}.action-dialog footer button{height:32px;padding:0 18px;border:1px solid #d1d8e2;border-radius:4px;background:#fff}.action-dialog footer button.primary{border-color:#c70000;background:#c70000;color:#fff}.trail-dialog{width:720px}.trail-head,.trail-list article{display:grid;grid-template-columns:90px 80px minmax(170px,1fr) 110px 130px;gap:8px;align-items:center}.trail-head{padding:10px 8px;background:#f7f8fa;color:#626d7b;font-size:11px}.trail-list{max-height:360px;overflow:auto}.trail-list article{min-height:46px;padding:7px 8px;border-bottom:1px solid #edf0f4;font-size:10px}.trail-list article strong{color:#25303d}.trail-list article span,.trail-list article time{color:#667181}.trail-list article p{margin:0;line-height:15px;overflow-wrap:anywhere}
</style>
