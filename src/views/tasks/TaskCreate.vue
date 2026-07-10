<template>
  <PageHeader
    eyebrow="任务创建向导"
    title="创建审计任务"
    description="先确认基础信息，再选择审计能力、资料范围、模板输出，最后提交任务。"
  >
    <RouterLink class="btn" to="/tasks">返回任务列表</RouterLink>
  </PageHeader>

  <section class="panel create-stepper">
    <button
      v-for="(item, index) in steps"
      :key="item"
      class="step-choice"
      :class="{ active: step === index, done: step > index }"
      @click="step = index"
    >
      <span>{{ index + 1 }}</span>
      {{ item }}
    </button>
  </section>

  <section class="create-layout">
    <div class="panel">
      <div class="panel-title">
        <div>
          <h3>{{ steps[step] }}</h3>
          <p>{{ stepHelp }}</p>
        </div>
      </div>

      <div class="filter-grid">
        <label v-for="field in baseFields" :key="field.label">
          <span>{{ field.label }}</span>
          <input :value="field.value" readonly />
        </label>
      </div>

      <template v-if="step === 1">
        <div class="ability-head">
          <h3>选择审计能力 <small>可多选</small></h3>
          <span class="pill">点击卡片切换选择状态</span>
        </div>
        <div class="ability-grid">
          <button
            v-for="capability in capabilities"
            :key="capability.id"
            class="ability-card"
            :class="{ selected: selectedIds.includes(capability.id) }"
            @click="toggleCapability(capability.id)"
          >
            <span class="ability-icon" :class="capability.colorClass">{{ capability.icon }}</span>
            <span class="ability-copy">
              <strong>{{ capability.name }}</strong>
              <em>{{ capability.description }}</em>
            </span>
            <span class="ability-check">{{ selectedIds.includes(capability.id) ? '✓' : '' }}</span>
          </button>
        </div>
      </template>

      <template v-else-if="step === 2">
        <div class="three-col">
          <div v-for="item in materialCards" :key="item.title" class="summary-item">
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </template>

      <template v-else-if="step === 3">
        <div class="three-col">
          <div v-for="item in templateCards" :key="item.title" class="summary-item">
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </template>

      <template v-else-if="step === 4">
        <div class="state-panel">
          <div>
            <span class="state-label">提交校验</span>
            <h3>任务信息、能力、资料和输出设置已完成</h3>
            <p>提交后进入资料准备和文件导入流程，所有操作写入任务记录。</p>
          </div>
          <RouterLink class="btn primary" to="/supervision/import/upload">提交并准备资料</RouterLink>
        </div>
      </template>
    </div>

    <aside class="panel create-side">
      <div class="panel-title">
        <h3>所需资料与输出结果</h3>
        <button class="btn" @click="step = 2">编辑</button>
      </div>

      <div class="side-section">
        <h4>所需资料</h4>
        <ol>
          <li v-for="item in requiredMaterials" :key="item.name">
            <span>{{ item.name }}</span>
            <b :class="item.required ? 'required' : 'optional'">{{ item.required ? '必填' : '可选' }}</b>
          </li>
        </ol>
      </div>

      <div class="side-section">
        <h4>输出结果</h4>
        <ol>
          <li v-for="item in outputResults" :key="item.name">
            <span>{{ item.name }}</span>
            <b :class="item.required ? 'required' : 'optional'">{{ item.required ? '必填' : '可选' }}</b>
          </li>
        </ol>
      </div>

      <div class="side-section">
        <h4>当前选择能力（{{ selectedCapabilities.length }} 项）</h4>
        <ul class="selected-list">
          <li v-for="capability in selectedCapabilities" :key="capability.id">{{ capability.name }}</li>
        </ul>
      </div>
    </aside>
  </section>

  <section class="panel create-footer">
    <button class="btn" @click="saveDraft">保存草稿</button>
    <div class="panel-actions">
      <button class="btn" :disabled="step === 0" @click="step -= 1">上一步</button>
      <button v-if="step < steps.length - 1" class="btn primary" @click="step += 1">下一步</button>
      <RouterLink v-else class="btn primary" to="/supervision/import/upload">提交并准备资料</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';

const store = inject('store');
const step = ref(1);
const steps = ['基础信息', '选择能力', '资料选择', '模板与输出设置', '确认提交'];

const capabilities = [
  { id: 'policy-query', name: '制度查询', icon: '制', colorClass: 'blue', description: '基于内外部制度库，快速检索相关制度条款与要求。', materials: [['相关制度文件（最新版）', true], ['监管通报与案例库', false]], outputs: [['制度差异分析报告', true], ['审计问题清单', false]] },
  { id: 'policy-change', name: '制度变更', icon: '变', colorClass: 'orange', description: '识别制度变更内容，分析变更影响及执行要求。', materials: [['制度历史版本', true], ['变更说明文件', true]], outputs: [['制度变更影响分析', true], ['执行要求清单', false]] },
  { id: 'policy-compare', name: '制度比对', icon: '比', colorClass: 'teal', description: '对比不同版本制度差异，生成差异分析报告。', materials: [['新旧制度版本', true], ['适用范围说明', false]], outputs: [['制度差异分析报告', true], ['差异定位清单', true]] },
  { id: 'regulatory', name: '监管案例舆情分析', icon: '监', colorClass: 'purple', description: '分析监管案例与舆情信息，识别风险点与趋势。', materials: [['监管案例库', false], ['舆情线索', false]], outputs: [['监管案例与舆情分析报告', false], ['风险提示清单', false]] },
  { id: 'standard', name: '审计规范生成', icon: '规', colorClass: 'blue', description: '根据审计对象与范围，生成审计规范与实施要点。', materials: [['内部制度', true], ['外部法规', true], ['历史规范', false]], outputs: [['审计规范草稿', true], ['来源依据清单', true]] },
  { id: 'supervision', name: '监督共享信息分析', icon: '共', colorClass: 'orange', description: '整合监督共享信息，识别异常与风险线索。', materials: [['监督共享文件', true], ['适配机构/部门/周期', true]], outputs: [['监督共享信息分析结果', false], ['可引用附件清单', false]] },
  { id: 'expense', name: '费用审计', icon: '费', colorClass: 'green', description: '对费用类数据进行合规性与合理性审计分析。', materials: [['财务报表（2025年Q1）', true], ['费用明细台账（2025年Q1）', true], ['预算执行情况表', false]], outputs: [['费用审计分析报告', true], ['异常候选清单', true]] },
  { id: 'report-generate', name: '报告生成', icon: '报', colorClass: 'red', description: '基于分析结果自动生成审计报告草稿。', materials: [['报告模板', true], ['已确认分析结果', true]], outputs: [['审计报告（草稿）', true], ['报告附件包', false]] },
  { id: 'report-review', name: '报告审核', icon: '审', colorClass: 'navy', description: '对审计报告进行内容校验与质量审核。', materials: [['审计报告草稿', true], ['报告模板版本', true]], outputs: [['报告审核建议', true], ['复核记录', false]] }
];

const selectedIds = ref(['policy-query', 'policy-change', 'policy-compare', 'expense', 'report-generate']);

const baseFields = [
  { label: '任务名称 *', value: '上海分公司 Q1 常规审计任务' },
  { label: '被审计单位 *', value: '上海分公司' },
  { label: '审计期间 *', value: '2025-01-01 — 2025-03-31' },
  { label: '任务类型 *', value: '常规审计' },
  { label: '负责人 *', value: '张三' },
  { label: '参与人员', value: '李四、王五、赵六' }
];

const materialCards = [
  { title: '任务资料导入', description: '支持文件和文件夹导入，上传后进入预览、三字段补全、元数据映射和预检。' },
  { title: '系统数据源', description: '接入 OA、费控、预算、财务总账、发票、合同和 HR/组织。' },
  { title: '资料缺口处理', description: '关键资料缺失阻断正式锁定，可选资料缺失可生成带提示草稿。' }
];

const templateCards = [
  { title: '报告模板', description: '选择报告类型、模板版本和格式模板。' },
  { title: '输出文件', description: '生成草稿、锁定版本、导出 Word/PDF/Excel。' },
  { title: '版本归档', description: '线下回传后进行系统版本与线下稿比对。' }
];

const selectedCapabilities = computed(() => capabilities.filter((item) => selectedIds.value.includes(item.id)));

const requiredMaterials = computed(() => {
  const map = new Map();
  selectedCapabilities.value.forEach((capability) => {
    capability.materials.forEach(([name, required]) => {
      if (!map.has(name) || required) map.set(name, { name, required });
    });
  });
  return Array.from(map.values()).slice(0, 8);
});

const outputResults = computed(() => {
  const map = new Map();
  selectedCapabilities.value.forEach((capability) => {
    capability.outputs.forEach(([name, required]) => {
      if (!map.has(name) || required) map.set(name, { name, required });
    });
  });
  return Array.from(map.values()).slice(0, 8);
});

const stepHelp = computed(() => [
  '确认任务对象、期间、负责人和权限范围。',
  '按任务目标选择能力，系统同步展示所需资料与输出结果。',
  '确认上传资料、库内资料和系统数据源范围。',
  '选择报告模板、输出格式和版本归档方式。',
  '确认任务配置并进入资料准备流程。'
][step.value]);

function toggleCapability(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id);
    return;
  }
  selectedIds.value = [...selectedIds.value, id];
}

function saveDraft() {
  store.saveTaskDraft();
}
</script>

<style scoped>
.create-stepper {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.step-choice {
  min-height: 56px;
  border: 0;
  border-bottom: 2px solid var(--color-line);
  background: transparent;
  color: var(--color-muted);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.step-choice span {
  display: inline-grid;
  width: 34px;
  height: 34px;
  margin-right: 8px;
  place-items: center;
  border: 1px solid var(--color-line-strong);
  border-radius: 50%;
  background: #fff;
}

.step-choice.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.step-choice.active span,
.step-choice.done span {
  color: #fff;
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.create-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 18px;
}

.ability-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0 14px;
}

.ability-head h3 {
  font-size: 16px;
}

.ability-head small {
  color: var(--color-muted);
  font-size: 13px;
}

.ability-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.ability-card {
  position: relative;
  min-height: 120px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 22px;
  gap: 14px;
  padding: 18px;
  text-align: left;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: #fff;
  box-shadow: var(--shadow-subtle);
  cursor: pointer;
}

.ability-card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 10px 24px rgba(166, 25, 46, 0.12);
}

.ability-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  font-weight: 800;
}

.ability-icon.blue { background: #3b82f6; }
.ability-icon.orange { background: #f97316; }
.ability-icon.teal { background: #14b8a6; }
.ability-icon.purple { background: #7c3aed; }
.ability-icon.green { background: #16a34a; }
.ability-icon.red { background: #ef4444; }
.ability-icon.navy { background: #1d4ed8; }

.ability-copy strong {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text);
  font-size: 16px;
}

.ability-copy em {
  color: var(--color-muted);
  font-style: normal;
  line-height: 1.7;
}

.ability-check {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border: 1px solid var(--color-line-strong);
  border-radius: 3px;
  color: #fff;
  background: #fff;
  font-size: 13px;
  font-weight: 800;
}

.ability-card.selected .ability-check {
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.create-side {
  align-self: start;
}

.side-section {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-line);
}

.side-section:last-child {
  border-bottom: 0;
}

.side-section h4 {
  margin-bottom: 12px;
  font-size: 15px;
}

.side-section ol {
  display: grid;
  gap: 10px;
  padding-left: 20px;
}

.side-section li {
  color: var(--color-text);
}

.side-section li span {
  display: inline-block;
  max-width: 210px;
}

.side-section b {
  float: right;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.side-section .required {
  color: var(--color-danger);
  background: #fff1f2;
}

.side-section .optional {
  color: #2563eb;
  background: #eff6ff;
}

.selected-list {
  columns: 2;
  padding-left: 18px;
  color: var(--color-text);
}

.create-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
