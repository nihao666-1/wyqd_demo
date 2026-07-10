<template>
  <aside v-if="open" class="trace-panel" aria-label="依据与追溯">
    <header class="trace-header">
      <h2>依据与追溯</h2>
      <button type="button" aria-label="关闭依据与追溯" @click="$emit('close')">×</button>
    </header>
    <div class="current-item">当前事项：<strong>{{ item?.itemType || '制度缺失' }}</strong> <span>（{{ riskLabel(item?.risk) }}）</span></div>
    <nav class="trace-tabs" aria-label="追溯信息栏目">
      <button data-trace-tab="source" type="button" :class="{ active: activeTab === 'source' }" @click="$emit('tab-change', 'source')">来源条款</button>
      <button data-trace-tab="files" type="button" :class="{ active: activeTab === 'files' }" @click="$emit('tab-change', 'files')">关联文件</button>
      <button data-trace-tab="session" type="button" :class="{ active: activeTab === 'session' }" @click="$emit('tab-change', 'session')">智能体会话</button>
      <button data-trace-tab="versions" type="button" :class="{ active: activeTab === 'versions' }" @click="$emit('tab-change', 'versions')">版本快照</button>
      <button data-trace-tab="logs" type="button" :class="{ active: activeTab === 'logs' }" @click="$emit('tab-change', 'logs')">操作日志</button>
    </nav>

    <div class="trace-scroll">
      <template v-if="activeTab === 'source'">
        <section class="trace-block">
          <h3>来源条款（1）</h3>
          <div class="clause-title">
            <strong>{{ evidence.clauseTitle }}</strong>
            <button type="button" @click="$emit('view-source')">查看原文</button>
          </div>
          <p><b>{{ evidence.clauseNumber }}</b> <span class="effective">{{ evidence.effectiveState }}</span> {{ evidence.effectiveDate }}</p>
          <p>{{ evidence.clauseText }}</p>
        </section>
        <section class="trace-block">
          <h3>引用证据片段</h3>
          <blockquote>{{ evidence.quote }}</blockquote>
          <p class="source-file">来源：{{ evidence.sourceFile }}（第 {{ evidence.pageNumber }} 页）</p>
        </section>
        <section class="trace-block">
          <h3>相似条款（2）</h3>
          <ul><li v-for="clause in evidence.similarClauses" :key="clause">{{ clause }}</li></ul>
        </section>
        <section class="trace-block">
          <h3>适用说明</h3>
          <p>{{ evidence.applicability }}</p>
        </section>
      </template>

      <section v-else-if="activeTab === 'files'" class="trace-block">
        <h3>关联文件（{{ evidence.relatedFiles.length }}）</h3>
        <button v-for="file in evidence.relatedFiles" :key="file.id" type="button" class="trace-list-item" @click="$emit('view-related-file', file)">
          <strong>{{ file.name }}</strong><small>{{ file.detail }}</small>
        </button>
      </section>

      <section v-else-if="activeTab === 'session'" class="trace-block">
        <h3>智能体会话</h3>
        <div class="trace-card"><strong>{{ evidence.session.title }}</strong><p>{{ evidence.session.summary }}</p><small>{{ evidence.session.id }}</small></div>
      </section>

      <section v-else-if="activeTab === 'versions'" class="trace-block">
        <h3>版本快照</h3>
        <div v-for="snapshot in evidence.snapshots" :key="snapshot.version" class="trace-card">
          <strong>{{ snapshot.version }} · {{ snapshot.content }}</strong><small>{{ snapshot.time }}</small>
        </div>
      </section>

      <section v-else class="trace-block">
        <h3>操作日志</h3>
        <div v-for="log in logs" :key="log.id" class="trace-card">
          <strong>{{ log.action }}</strong><p>{{ log.operator }} · {{ log.result }}</p><small>{{ log.time }}</small>
        </div>
      </section>

      <section class="manual-processing">
        <h3>人工处理</h3>
        <label class="field-label">处理意见</label>
        <div class="decision-options">
          <label><input type="radio" name="decision" value="确认该事项" :checked="decision === '确认该事项'" @change="$emit('decision-change', '确认该事项')" /> 确认缺失</label>
          <label><input type="radio" name="decision" value="排除该事项" :checked="decision === '排除该事项'" @change="$emit('decision-change', '排除该事项')" /> 排除该事项</label>
        </div>
        <label class="field-label" for="trace-note">处理说明</label>
        <div class="note-box">
          <textarea id="trace-note" :value="note" maxlength="200" placeholder="请填写处理说明（选填）" @input="$emit('note-change', $event.target.value)"></textarea>
          <span>{{ note.length }}/200</span>
        </div>
      </section>
    </div>

    <footer class="trace-actions">
      <button type="button" class="primary" @click="$emit('confirm-item')">确认该事项</button>
      <button type="button" @click="$emit('exclude-item')">排除并说明</button>
      <button type="button" @click="$emit('link-report')">引用到报告</button>
    </footer>
  </aside>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: true },
  item: { type: Object, default: null },
  evidence: { type: Object, required: true },
  activeTab: { type: String, default: 'source' },
  decision: { type: String, default: '确认该事项' },
  note: { type: String, default: '' },
  logs: { type: Array, default: () => [] }
});

defineEmits([
  'close', 'tab-change', 'view-source', 'view-related-file', 'decision-change',
  'note-change', 'confirm-item', 'exclude-item', 'link-report'
]);

function riskLabel(risk) {
  return { high: '高风险', medium: '中风险', low: '低风险' }[risk] || '高风险';
}
</script>

<style scoped>
.trace-panel{height:calc(100dvh - 56px);min-width:0;background:#fff;border-left:1px solid #e5eaf0;box-shadow:-4px 0 12px rgba(16,24,40,.06);display:grid;grid-template-rows:54px 35px 33px minmax(0,1fr) 66px;color:#303642}.trace-header{display:flex;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid #e8ebf0}.trace-header h2{margin:0;color:#171a22;font-size:16px;line-height:24px;font-weight:600}.trace-header button{width:28px;height:28px;border:0;background:transparent;color:#202631;font-size:21px}.current-item{display:flex;align-items:center;padding:0 13px;font-size:11px}.current-item strong{margin-left:4px}.current-item span{color:#d71920}.trace-tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));padding:0 10px;border-bottom:1px solid #e8ebf0}.trace-tabs button{position:relative;padding:0 2px;border:0;background:transparent;color:#303642;font-size:10px;white-space:nowrap}.trace-tabs button.active{color:#d71920;font-weight:600}.trace-tabs button.active::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2px;background:#d71920}.trace-scroll{min-height:0;overflow-y:auto;padding:0 12px}.trace-scroll::-webkit-scrollbar{width:5px}.trace-scroll::-webkit-scrollbar-thumb{background:#d8dee8;border-radius:4px}.trace-block,.manual-processing{padding:12px 0;border-bottom:1px solid #e8ebf0}.trace-block h3,.manual-processing h3{margin:0 0 10px;color:#202631;font-size:11px;line-height:18px;font-weight:600}.trace-block p{margin:5px 0;color:#303642;font-size:10px;line-height:18px}.clause-title{display:flex;align-items:center;justify-content:space-between;gap:8px}.clause-title strong{font-size:11px}.clause-title button{height:24px;padding:0 8px;border:1px solid #b8d7ff;border-radius:3px;background:#fff;color:#1677ff;font-size:9px}.effective{display:inline-block;margin:0 5px;padding:0 4px;border-radius:3px;background:#ebf8ef;color:#249b57;font-size:9px}blockquote{margin:0;padding:9px;border:1px solid #ffd5ca;border-radius:4px;background:#fff1ed;color:#754238;font-size:10px;line-height:18px}.source-file{color:#667085!important;font-size:9px!important}.trace-block ul{margin:0;padding-left:18px}.trace-block li{margin:7px 0;font-size:10px;line-height:17px}.trace-list-item,.trace-card{display:block;width:100%;margin-bottom:8px;padding:9px;border:1px solid #e5eaf0;border-radius:4px;background:#fff;text-align:left}.trace-list-item strong,.trace-list-item small,.trace-card strong,.trace-card small{display:block}.trace-list-item strong,.trace-card strong{font-size:10px}.trace-list-item small,.trace-card small{margin-top:5px;color:#667085;font-size:9px}.trace-card p{font-size:10px}.field-label{display:block;margin:8px 0 5px;color:#667085;font-size:10px}.decision-options{display:flex;gap:28px;font-size:10px}.decision-options label{display:flex;align-items:center;gap:5px}.decision-options input{accent-color:#d71920}.note-box{position:relative}.note-box textarea{width:100%;height:81px;resize:none;padding:8px 9px 20px;border:1px solid #d8dee8;border-radius:4px;color:#303642;font:10px/18px inherit}.note-box span{position:absolute;right:8px;bottom:6px;color:#98a2b3;font-size:9px}.trace-actions{display:grid;grid-template-columns:1.05fr 1fr 1fr;gap:8px;align-items:center;padding:0 12px;border-top:1px solid #e8ebf0;background:#fff}.trace-actions button{height:34px;padding:0 8px;border:1px solid #d8dee8;border-radius:4px;background:#fff;color:#303642;font-size:10px;white-space:nowrap}.trace-actions button.primary{border-color:#b40000;background:#b40000;color:#fff}
@media(max-height:850px){.trace-panel{grid-template-rows:48px 31px 30px minmax(0,1fr) 56px}.trace-block,.manual-processing{padding:9px 0}.trace-actions{padding:0 8px;gap:5px}.trace-actions button{height:31px;font-size:9px}}
</style>
