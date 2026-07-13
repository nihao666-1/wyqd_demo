<template>
  <header class="result-header">
    <div class="title-actions" data-audit-region="title-actions">
      <h1>审计规范生成</h1>
      <div class="actions" aria-label="审计规范操作">
        <button type="button" @click="$emit('back')">返回任务</button>
        <button type="button" :disabled="regenerating" @click="$emit('regenerate')">
          <span aria-hidden="true">↻</span>{{ regenerating ? '重新生成中' : '重新生成' }}
        </button>
        <button type="button" class="danger-outline" :disabled="saving" @click="$emit('save-draft')">
          {{ saving ? '保存中' : '保存草稿' }}
        </button>
        <button type="button" class="primary" @click="$emit('export-excel')">
          导出 Excel <span class="chevron" aria-hidden="true">⌄</span>
        </button>
      </div>
    </div>

    <dl class="task-meta" data-audit-region="task-meta">
      <div>
        <dt>被审计单位</dt>
        <dd>{{ meta.auditedUnit }}</dd>
      </div>
      <div>
        <dt>审计期间</dt>
        <dd>{{ meta.auditPeriod }}</dd>
      </div>
      <div>
        <dt>审计类型</dt>
        <dd>{{ meta.auditType }}</dd>
      </div>
      <div>
        <dt>当前模板</dt>
        <dd>{{ meta.currentTemplate }}</dd>
      </div>
      <div>
        <dt>状态</dt>
        <dd><span class="status-tag">{{ meta.status }}</span></dd>
      </div>
    </dl>
  </header>
</template>

<script setup>
defineProps({
  meta: {
    type: Object,
    default: () => ({
      auditedUnit: '上海分公司',
      auditPeriod: '2025Q1（2025-01-01 ~ 2025-03-31）',
      auditType: '常规审计',
      currentTemplate: '营业部综合审计规范模板 V2.1',
      status: '草稿生成中'
    })
  },
  saving: { type: Boolean, default: false },
  regenerating: { type: Boolean, default: false }
});

defineEmits(['back', 'regenerate', 'save-draft', 'export-excel']);
</script>

<style scoped>
.result-header{height:126px;color:#1f2329}.title-actions{height:46px;display:flex;align-items:center;justify-content:space-between;padding:0 10px 0 8px;background:#fff;border-bottom:1px solid #e4e8ee}.title-actions h1{margin:0;font-size:22px;line-height:30px;font-weight:600;letter-spacing:.01em}.actions{display:flex;align-items:center;gap:12px}.actions button{height:30px;min-width:84px;padding:0 14px;border:1px solid #d8dde6;border-radius:3px;background:#fff;color:#252a34;font:500 12px/28px inherit;white-space:nowrap;cursor:pointer}.actions button:hover:not(:disabled){border-color:#c50000;color:#c50000}.actions button:focus-visible{outline:2px solid #e5484d;outline-offset:2px}.actions button:disabled{cursor:not-allowed;opacity:.58}.actions .danger-outline{border-color:#ef8e8e;color:#c50000}.actions .primary{min-width:112px;border-color:#c60000;background:#c60000;color:#fff}.actions .primary:hover{border-color:#a80000;background:#a80000;color:#fff}.actions button span{margin-right:6px;font-size:16px}.actions .chevron{margin:0 0 0 5px;font-size:12px}.task-meta{width:1006px;height:69px;margin:11px 0 0;display:grid;grid-template-columns:1.05fr 2fr .95fr 1.75fr 1.15fr;padding:0 12px;background:#fff;border:1px solid #dfe4eb}.task-meta>div{min-width:0;padding:8px 30px 6px 0}.task-meta>div+div{padding-left:32px;border-left:1px solid #e6eaf0}.task-meta dt{margin:0 0 6px;color:#68707d;font-size:10px;line-height:14px}.task-meta dd{margin:0;overflow:hidden;color:#20242c;font-size:12px;line-height:20px;white-space:nowrap;text-overflow:ellipsis}.status-tag{display:inline-block;min-height:0;padding:0 5px;border:1px solid #ffd99b;border-radius:3px;background:#fff8e7;color:#f59a00;font-size:10px;line-height:18px}@media(max-width:1200px){.title-actions{padding-right:6px}.actions{gap:6px}.actions button{min-width:72px;padding:0 9px}.task-meta>div{padding-right:12px}.task-meta>div+div{padding-left:14px}}
.actions{margin-right:165px}.task-meta{grid-template-columns:134px 284px 132px 249px minmax(0,1fr)}.task-meta>div{padding-right:20px}
</style>
