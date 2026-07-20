<template>
  <div class="material-import-page route-fill-page">
    <section class="material-import-head panel">
      <div>
        <span class="eyebrow">{{ activeConfig.eyebrow }}</span>
        <h2>{{ activeConfig.title }}</h2>
        <p>{{ activeConfig.description }}</p>
      </div>
      <RouterLink class="btn primary" :to="activeConfig.afterCompleteRoute">返回目标页面</RouterLink>
    </section>

    <section class="material-import-grid">
      <aside class="panel import-steps" aria-label="资料导入步骤">
        <button
          v-for="step in steps"
          :key="step.key"
          type="button"
          :class="{ active: step.key === activeStep.key, done: step.index < activeStep.index }"
        >
          <span>{{ step.index }}</span>
          <strong>{{ step.label }}</strong>
          <small>{{ step.hint }}</small>
        </button>
      </aside>

      <main class="panel import-workspace">
        <div class="panel-title">
          <div>
            <h3>{{ activeStep.label }}</h3>
            <p>{{ activeStep.detail }}</p>
          </div>
          <span class="status-tag warning">{{ activeConfig.ownerId }}</span>
        </div>

        <div class="workspace-preview">
          <article v-for="item in previewRows" :key="item.name" class="preview-row">
            <span :class="item.tone">{{ item.type }}</span>
            <div>
              <strong>{{ item.name }}</strong>
              <p>{{ item.desc }}</p>
            </div>
            <b>{{ item.status }}</b>
          </article>
        </div>

        <footer class="workspace-actions">
          <button class="btn" type="button">保存草稿</button>
          <button class="btn" type="button">上一步</button>
          <button class="btn primary" type="button">继续处理</button>
        </footer>
      </main>

      <aside class="panel import-rules">
        <div class="panel-title"><h3>场景规则</h3></div>
        <dl>
          <div>
            <dt>业务场景</dt>
            <dd>{{ activeConfig.scene }}</dd>
          </div>
          <div>
            <dt>必填字段</dt>
            <dd>{{ activeConfig.requiredFields.join('、') }}</dd>
          </div>
          <div>
            <dt>完成去向</dt>
            <dd>{{ activeConfig.afterCompleteRoute }}</dd>
          </div>
        </dl>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const sceneConfigs = {
  task: {
    scene: 'task',
    eyebrow: '任务资料导入',
    title: '通用资料导入工作区',
    description: '用于创建任务过程中的资料选择、解析、字段补全和预检。',
    ownerId: '任务资料',
    requiredFields: ['资料名称', '所属期间', '来源系统'],
    afterCompleteRoute: '/tasks/create?phase=materials'
  },
  supervision: {
    scene: 'supervision',
    eyebrow: '监督共享资料',
    title: '监督共享资料导入工作区',
    description: '统一处理监督共享资料上传、目录预览、字段补全、元数据映射和入库预检。',
    ownerId: '监督共享场景',
    requiredFields: ['部门', '期间', '资料类型'],
    afterCompleteRoute: '/tasks/detail/supervision-share'
  },
  'audit-report': {
    scene: 'audit-report',
    eyebrow: '报告资料导入',
    title: '审计报告资料导入工作区',
    description: '统一处理报告资料导入、补充资料预览和报告来源约束前置检查。',
    ownerId: '报告资料场景',
    requiredFields: ['报告任务', '资料来源', '引用范围'],
    afterCompleteRoute: '/audit-report/source-select'
  }
};

const steps = [
  { index: 1, key: 'upload', label: '上传资料', hint: '文件与目录接入', detail: '上传文件、选择文件夹，识别重复文件、格式异常和空目录。' },
  { index: 2, key: 'folder-preview', label: '文件夹预览', hint: '目录结构确认', detail: '检查资料目录、文件数量、格式和初始解析状态。' },
  { index: 3, key: 'field-edit', label: '三字段补全', hint: '字段完整性', detail: '补齐部门、期间、资料类型等业务字段。' },
  { index: 4, key: 'metadata', label: '元数据映射', hint: '入库映射', detail: '映射来源系统、审计期间、引用范围和标签。' },
  { index: 5, key: 'precheck', label: '入库预检', hint: '阻断项确认', detail: '检查重复、缺失、权限和引用约束，形成预检结果。' },
  { index: 6, key: 'supplement-preview', label: '补充预览', hint: '报告补充资料', detail: '仅报告场景使用，用于确认补充上传资料是否满足报告生成约束。' }
];

const previewRows = [
  { type: 'XLSX', name: '风险事项台账.xlsx', desc: '已识别 128 行，字段完整度 96%', status: '可入库', tone: 'excel' },
  { type: 'DOCX', name: '整改跟踪说明.docx', desc: '需补充所属期间', status: '待补全', tone: 'word' },
  { type: 'PDF', name: '监管规则更新提示.pdf', desc: '已建立来源引用', status: '可引用', tone: 'pdf' }
];

const activeConfig = computed(() => sceneConfigs[route.query.scene] || sceneConfigs.task);
const activeStep = computed(() => steps.find((step) => step.key === route.query.step) || steps[0]);
</script>

<style scoped>
.material-import-page {
  display: grid;
  gap: var(--ui-space-4);
  min-height: 0;
  overflow: auto;
  padding: var(--ui-space-4);
}

.panel {
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: #fff;
  box-shadow: var(--shadow-subtle);
}

.material-import-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-5);
  padding: var(--ui-space-5);
}

.material-import-head h2 {
  margin: 4px 0 6px;
  font-size: var(--ui-font-xl);
}

.material-import-head p,
.panel-title p,
.preview-row p,
.import-steps small,
.import-rules dd {
  color: var(--color-muted);
}

.eyebrow {
  color: var(--color-primary);
  font-size: var(--ui-font-xs);
  font-weight: 800;
}

.material-import-grid {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 286px;
  gap: var(--ui-space-4);
  min-height: 0;
}

.import-steps {
  display: grid;
  gap: var(--ui-space-3);
  align-content: start;
  padding: var(--ui-space-4);
}

.import-steps button {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 2px 10px;
  min-height: 58px;
  padding: 9px;
  border: 1px solid var(--color-line);
  border-radius: 6px;
  background: #fff;
  color: var(--color-text);
  text-align: left;
}

.import-steps button.active {
  border-color: rgba(166, 25, 46, 0.45);
  background: #fff6f7;
}

.import-steps button.done span,
.import-steps button.active span {
  background: var(--color-primary);
  color: #fff;
}

.import-steps span {
  grid-row: span 2;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 999px;
  background: #eef2f7;
  color: #667085;
  font-weight: 800;
}

.import-workspace {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-height: 520px;
  padding: var(--ui-space-5);
}

.panel-title {
  display: flex;
  justify-content: space-between;
  gap: var(--ui-space-4);
  margin-bottom: var(--ui-space-4);
  padding-bottom: var(--ui-space-3);
  border-bottom: 1px solid var(--color-line);
}

.panel-title h3 {
  margin: 0 0 4px;
  font-size: var(--ui-font-lg);
}

.status-tag {
  align-self: start;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: var(--ui-font-xs);
  font-weight: 800;
}

.status-tag.warning {
  background: #fff4e8;
  color: var(--color-warning);
}

.workspace-preview {
  display: grid;
  gap: var(--ui-space-3);
  align-content: start;
}

.preview-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--ui-space-4);
  min-height: 74px;
  padding: var(--ui-space-4);
  border: 1px solid var(--color-line);
  border-radius: 6px;
}

.preview-row span {
  display: grid;
  height: 34px;
  place-items: center;
  border-radius: 5px;
  color: #fff;
  font-size: var(--ui-font-xs);
  font-weight: 800;
}

.preview-row span.excel {
  background: var(--color-success);
}

.preview-row span.word {
  background: var(--color-info);
}

.preview-row span.pdf {
  background: var(--color-primary);
}

.preview-row b {
  color: var(--color-primary);
}

.workspace-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-space-3);
  padding-top: var(--ui-space-4);
}

.btn {
  display: inline-flex;
  min-height: var(--ui-control-md);
  align-items: center;
  justify-content: center;
  padding: 0 var(--ui-space-4);
  border: 1px solid #ccd5e2;
  border-radius: 4px;
  background: #fff;
  color: #344054;
}

.btn.primary {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.import-rules {
  padding: var(--ui-space-5);
}

.import-rules dl {
  display: grid;
  gap: var(--ui-space-4);
  margin: 0;
}

.import-rules div {
  display: grid;
  gap: 4px;
  padding-bottom: var(--ui-space-3);
  border-bottom: 1px solid var(--color-line);
}

.import-rules dt {
  font-weight: 800;
}

@media (max-width: 1180px) {
  .material-import-grid {
    grid-template-columns: 1fr;
  }
}
</style>
