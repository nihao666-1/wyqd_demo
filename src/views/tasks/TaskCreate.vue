<template>
  <section class="task-create-page" :class="{ 'parsing-page': step === 3 && stepFourStage === 'parsing', 'template-output-page': step === 4 && stepFourStage === 'template' }" data-page="task-create">
    <header v-if="step <= 1" class="create-title-row">
      <RouterLink class="create-back" to="/tasks" aria-label="返回任务中心"><AuditIcon name="collapse" /></RouterLink>
      <h2>创建审计任务</h2>
    </header>

    <div v-if="step === 1" class="create-workspace" data-step="basic-info">
      <main class="create-primary-column">
        <form id="task-create-form" class="task-create-card" novalidate @submit.prevent="goNext">
          <nav class="wizard-steps" aria-label="创建审计任务步骤">
            <template v-for="(item, index) in steps" :key="item">
              <button class="wizard-step" :class="{ active: step === index, done: step > index }" type="button" :aria-current="step === index ? 'step' : undefined" :disabled="index > step" @click="goStep(index)">
                <span class="step-number"><AuditIcon v-if="step > index" name="review" /><template v-else>{{ index + 1 }}</template></span><span>{{ item }}</span>
              </button>
              <i v-if="index < steps.length - 1" class="step-connector" aria-hidden="true"></i>
            </template>
          </nav>

          <section class="basic-info-section" aria-labelledby="basic-info-title">
            <h3 id="basic-info-title">填写基础信息</h3>
            <div class="basic-form-grid">
              <label class="form-field"><span>任务名称 <b>*</b></span><div><input :ref="(element) => setFieldRef('taskName', element)" v-model="form.taskName" type="text" placeholder="请输入任务名称" :aria-invalid="Boolean(errors.taskName)" /><small>任务名称将作为报告标题默认前缀</small><p v-if="errors.taskName" class="field-error" role="alert">{{ errors.taskName }}</p></div></label>
              <label class="form-field"><span>被审计单位 <b>*</b></span><div><select :ref="(element) => setFieldRef('auditedUnit', element)" v-model="form.auditedUnit" :aria-invalid="Boolean(errors.auditedUnit)"><option value="">请选择被审计单位</option><option v-for="item in auditedUnits" :key="item" :value="item">{{ item }}</option></select><p v-if="errors.auditedUnit" class="field-error" role="alert">{{ errors.auditedUnit }}</p></div></label>
              <div class="form-field"><span>审计期间 <b>*</b></span><div><div class="date-range"><input :ref="(element) => setFieldRef('auditPeriod', element)" v-model="form.auditStart" type="date" aria-label="审计开始日期" /><i>—</i><input v-model="form.auditEnd" type="date" aria-label="审计结束日期" /></div><small>审计期间影响资料筛选与规则命中范围</small><p v-if="errors.auditPeriod" class="field-error" role="alert">{{ errors.auditPeriod }}</p></div></div>
              <label class="form-field"><span>任务类型 <b>*</b></span><div><select :ref="(element) => setFieldRef('taskType', element)" v-model="form.taskType" :aria-invalid="Boolean(errors.taskType)"><option v-for="item in taskTypes" :key="item" :value="item">{{ item }}</option></select><p v-if="errors.taskType" class="field-error" role="alert">{{ errors.taskType }}</p></div></label>
              <label class="form-field"><span>负责人 <b>*</b></span><div><select :ref="(element) => setFieldRef('owner', element)" v-model="form.owner" :aria-invalid="Boolean(errors.owner)"><option value="">请选择负责人</option><option v-for="person in ownerOptions" :key="person.userId" :value="person.name">{{ person.name }}</option></select><p v-if="errors.owner" class="field-error" role="alert">{{ errors.owner }}</p></div></label>
              <div class="form-field"><span>参与人员</span><details class="participant-picker"><summary><span v-if="!form.participants.length" class="participant-placeholder">请选择参与人员</span><span v-for="person in form.participants" :key="person" class="participant-tag">{{ person }}<button type="button" :aria-label="`移除${person}`" @click.prevent="removeParticipant(person)">×</button></span></summary><div class="participant-options"><label v-for="person in availablePersonnel" :key="person.userId"><input v-model="form.participants" type="checkbox" :value="person.name" />{{ person.name }} · {{ person.department }}</label></div></details></div>
              <label class="form-field form-field-textarea"><span>审计范围 <b>*</b></span><div><textarea v-model="form.auditScope" maxlength="200" placeholder="请输入本次审计覆盖的业务范围与重点内容"></textarea><em>{{ form.auditScope.length }}/200</em><small>请简要描述本次审计覆盖的业务范围与重点内容</small></div></label>
              <label class="form-field form-field-textarea"><span>任务说明 <b>*</b></span><div><textarea v-model="form.description" maxlength="200" placeholder="请输入任务说明"></textarea><em>{{ form.description.length }}/200</em><small>任务说明将用于审计计划与报告摘要</small></div></label>
            </div>
          </section>
        </form>

        <section class="scope-risk-card" aria-labelledby="scope-risk-title">
          <h3 id="scope-risk-title">审计口径与数据范围</h3>
          <div class="scope-risk-grid">
            <fieldset class="data-scope"><legend>数据范围（可多选） <b>*</b></legend><div class="scope-choice-list"><label v-for="item in dataScopeOptions" :key="item"><input v-model="form.dataScope" type="checkbox" :value="item" />{{ item }}</label></div><p>所选数据范围将用于资料筛选、规则匹配与分析建模</p></fieldset>
            <fieldset class="risk-level"><legend>风险等级 <b>*</b></legend><div class="risk-option-list"><label v-for="item in riskOptions" :key="item.value" :class="{ selected: form.riskLevel === item.value }"><input v-model="form.riskLevel" type="radio" name="riskLevel" :value="item.value" /><span><strong>{{ item.label }}</strong><small>{{ item.detail }}</small></span></label></div></fieldset>
          </div>
        </section>

        <footer class="create-footer">
          <p>当前步骤 <strong>2</strong> / 5 <span aria-live="polite">{{ draftSaved ? '基础信息已暂存' : '' }}</span></p>
          <div><button class="btn" type="button" @click="saveDraft">保存草稿</button><button class="btn" type="button" @click="goBack">上一步</button><button class="btn primary" type="submit" form="task-create-form">下一步：资料选择</button></div>
        </footer>
      </main>

      <aside class="create-guide-column">
        <section class="guide-card" data-role="task-type-profile">
          <h3>任务口径说明</h3>
          <article class="guide-callout blue"><span><AuditIcon name="qa" /></span><div><b>基础信息用途</b><p>用于明确审计目标、范围与责任人，作为后续审计执行与报告生成的基础。</p></div></article>
          <article class="guide-callout green"><span><AuditIcon name="analysis" /></span><div><b>后续步骤影响</b><p>本页设置将影响资料筛选、能力推荐、模板匹配与报告输出格式。</p></div></article>
          <section class="required-checks"><div class="guide-callout orange"><span><AuditIcon name="review" /></span><b>必填项检查</b></div><ul><li v-for="item in requiredChecks" :key="item.label" :class="{ ready: item.complete }"><AuditIcon :name="item.complete ? 'review' : 'anomaly'" />{{ item.label }}</li></ul></section>
        </section>
        <section class="materials-card"><h3>预计所需资料</h3><ul><li v-for="item in materialRequirements" :key="item.name"><span><AuditIcon :name="item.required ? 'report' : 'files'" />{{ item.name }}</span><b :class="{ required: item.required }">{{ item.required ? '必填' : '可选' }}</b></li></ul></section>
      </aside>
    </div>

    <TaskCreateTemplateOutputStep
      v-else-if="step === 4 && stepFourStage === 'template'"
      v-model="templateOutputSettings"
      :steps="steps"
      :current-step="4"
      :task-summary="templateTaskSummary"
      :selected-capabilities="selectedCapabilities"
      @request-save="saveDraft"
      @request-previous="backToParsing"
      @request-submit="submitTemplateTask"
      @request-summary-detail="handleTemplateSummaryDetail"
      @request-exit="exitTaskCreate"
    />

    <section v-else class="downstream-panel" :class="{ 'parsing-downstream': step === 3 && stepFourStage === 'parsing' }">
   
      <nav class="wizard-steps compact" :class="{ 'parsing-stage': step === 3 && stepFourStage === 'parsing' }" aria-label="创建审计任务步骤"><template v-for="(item, index) in steps" :key="item"><button class="wizard-step" :class="{ active: step === index, done: step > index }" type="button" :disabled="index > step" @click="goStep(index)"><span class="step-number"><FontAwesomeIcon v-if="step > index && !(step === 3 && stepFourStage === 'parsing' && index === 2)" :icon="faCheck" /><template v-else>{{ index + 1 }}</template></span><span>{{ item }}</span></button><i v-if="index < steps.length - 1" class="step-connector" aria-hidden="true"></i></template></nav>
      <header v-if="step !== 2 && !(step === 3 && stepFourStage === 'parsing')"><p>步骤 {{ step + 1 }} / 5</p><h3>{{ steps[step] }}</h3><span>{{ stepHelp }}</span></header>
      <div v-if="step === 0" class="ability-grid" role="radiogroup" aria-label="选择审计能力"><button v-for="capability in availableCapabilities" :key="capability.id" class="ability-card" :class="{ selected: selectedIds.includes(capability.id) }" type="button" role="radio" :aria-checked="selectedIds.includes(capability.id)" @click="selectCapability(capability.id)"><span class="ability-icon" :class="capability.colorClass">{{ capability.icon }}</span><span><b>{{ capability.name }}</b><small>{{ capability.description }}</small></span></button></div>
      <div v-else-if="step === 2" class="materials-selection-page" data-step="material-selection">
        <div class="materials-workspace">
          <main class="materials-primary">
            <p class="materials-alert"><AuditIcon name="anomaly" />已根据所选能力自动生成资料清单，请上传或选择资料后继续。<span v-if="materialNotice">{{ materialNotice }}</span></p>
            <section class="material-source-card" aria-label="资料来源">
              <nav class="material-source-tabs">
                <button v-for="item in [{ key: 'local', label: '本地上传', icon: 'upload' }, { key: 'fileCenter', label: '文件中心选择', icon: 'files' }, { key: 'history', label: '历史任务复用', icon: 'records' }, { key: 'simulation', label: '系统模拟数据', icon: 'report' }]" :key="item.key" :class="{ active: materialSource === item.key }" type="button" @click="selectMaterialSource(item.key)"><AuditIcon :name="item.icon" />{{ item.label }}</button>
              </nav>
              <div class="material-dropzone">
                <span class="dropzone-icon"><AuditIcon name="upload" /></span><h3>拖拽文件或文件夹到此处</h3>
                <div><button class="btn primary" type="button" @click="uploadMaterialRows(materialProgress.blockingItems.slice(0, 2).map((item) => item.id))">上传文件</button><button class="btn" type="button" @click="uploadMaterialRows(materialProgress.blockingItems.map((item) => item.id))">上传文件夹</button></div>
                <p>支持 PDF、Word、Excel、ZIP 等格式，单个文件最大 500MB，单次最多上传 20 个文件</p>
              </div>
            </section>
            <section class="material-list-card">
              <h3>所需资料清单 <small>（必填 {{ materialProgress.required.total }} 项，可选 {{ materialProgress.optional.total }} 项）</small></h3>
              <div class="materials-table-scroll"><table><thead><tr><th>资料名称</th><th>对应能力</th><th>必填/可选</th><th>文件来源</th><th>上传状态</th><th>解析状态</th><th>操作</th></tr></thead><tbody><tr v-for="row in materialRows" :key="row.id"><td>{{ row.name }}</td><td>{{ row.ability }}</td><td :class="{ required: row.required }">{{ row.required ? '必填' : '可选' }}</td><td>{{ row.source }}</td><td><span class="material-status" :class="row.uploadStatus === '已上传' ? 'complete' : row.uploadStatus.includes('选择') ? 'selected' : 'empty'">{{ row.uploadStatus }}</span></td><td><span v-if="row.parseStatus !== '—'" class="material-status parsing">{{ row.parseStatus }}</span><template v-else>—</template></td><td><button type="button" @click="uploadMaterialRows([row.id])">{{ row.uploadStatus === '已上传' ? '查看' : '上传' }}</button><button v-if="row.uploadStatus === '已上传'" type="button" @click="removeMaterial(row.id)">删除</button></td></tr></tbody></table></div>
              <div class="material-card-list"><article v-for="row in materialRows" :key="row.id"><div><b>{{ row.name }}</b><span :class="{ required: row.required }">{{ row.required ? '必填' : '可选' }}</span></div><p>{{ row.ability }} · {{ row.source }}</p><p><span class="material-status" :class="row.uploadStatus === '已上传' ? 'complete' : 'empty'">{{ row.uploadStatus }}</span> {{ row.parseStatus }}</p><button type="button" @click="uploadMaterialRows([row.id])">{{ row.uploadStatus === '已上传' ? '查看资料' : '上传资料' }}</button></article></div>
            </section>
          </main>
          <aside class="materials-sidebar">
            <section class="material-progress-card"><h3>资料完成度</h3><div class="progress-summary"><div class="progress-ring" :style="{ '--completion': `${materialProgress.percentage}%` }"><div><strong>{{ materialProgress.percentage }}%</strong><span>完成度</span></div></div><ul><li><i class="red"></i>必需资料 <b>{{ materialProgress.required.completed }} / {{ materialProgress.required.total }}</b></li><li><i class="orange"></i>可选资料 <b>{{ materialProgress.optional.completed }} / {{ materialProgress.optional.total }}</b></li><li><i class="green"></i>已上传文件 <b>{{ materialProgress.uploadedFiles }} 个</b></li></ul></div><section v-if="materialProgress.blockingItems.length" class="blocking-items"><h4>阻断项（{{ materialProgress.blockingItems.length }} 项）</h4><p v-for="item in materialProgress.blockingItems" :key="item.id"><AuditIcon name="anomaly" />{{ item.name }} 未上传</p></section><section class="material-help"><h4>资料说明</h4><ul><li>必需资料为完成审计任务的必备资料，请尽快上传。</li><li>建议文件内容完整、清晰，确保能准确解析。</li><li>上传后系统将自动解析并建立知识关联。</li></ul></section><button class="btn primary" type="button" @click="uploadBlockingMaterials"><AuditIcon name="upload" />批量上传</button><button class="btn" type="button" @click="simulateFillMaterials"><AuditIcon name="files" />使用模拟数据补齐</button></section>
          </aside>
        </div>
      </div>
      <MaterialParsingWorkspace
        v-else-if="step === 3 && stepFourStage === 'parsing'"
        :source-materials="materialRows"
        @save-draft="saveDraft"
        @back="backFromParsing"
        @continue="continueToConfirmation"
      />
      <div v-else class="submit-summary"><h3>任务配置已完成</h3><p>提交后进入资料准备和文件导入流程，所有操作写入任务记录。</p></div>
      <footer v-if="!(step === 3 && stepFourStage === 'parsing')" class="create-footer" :class="{ 'materials-footer': step === 2 }"><p>当前步骤 <strong>{{ step + 1 }}</strong> / 5</p><div><button class="btn" type="button" @click="saveDraft">保存草稿</button><RouterLink v-if="step === 0" class="btn" to="/tasks">取消</RouterLink><button v-else class="btn" type="button" @click="goBack">上一步</button><button v-if="step < steps.length - 1" class="btn primary" type="button" :disabled="(step === 0 && !selectedIds.length) || (step === 2 && !materialProgress.canProceed)" @click="goNext">{{ nextStepButtonText }}</button><button v-else class="btn primary" type="button" @click="submitTaskAndReturn">提交任务</button></div></footer>
    </section>
  </section>
</template>

<script setup>
import { computed, inject, nextTick, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import AuditIcon from '../../components/common/AuditIcon.vue';
import MaterialParsingWorkspace from './MaterialParsingWorkspace.vue';
import TaskCreateTemplateOutputStep from './TaskCreateTemplateOutputStep.vue';
import { applyMaterialSource, createMaterialSelectionRows, createTaskDraftSnapshot, filterTaskPersonnel, getMaterialSelectionProgress, getTaskMaterialRequirements, getTaskTypeProfile, initialTaskCreateForm, validateTaskCreateForm } from '../../domain/taskCreate/taskCreateForm.js';
import { resolveTaskCreateEntry } from '../../domain/taskCreate/taskCreateEntry.js';
import { cloneTemplateOutputSettings, createTemplateOutputSettings, referenceTaskSummary } from '../../domain/taskCreate/taskTemplateOutputSettings.js';

const store = inject('store');
const route = useRoute();
const router = useRouter();
const taskCreateEntry = resolveTaskCreateEntry(route.query);
const step = ref(taskCreateEntry.step);
const stepFourStage = ref(taskCreateEntry.stage);
const steps = ['选择能力', '填写基础信息', '资料选择', '模板与输出设置', '确认提交'];
const form = reactive({ ...initialTaskCreateForm, participants: [...initialTaskCreateForm.participants], dataScope: [...initialTaskCreateForm.dataScope] });
const templateOutputSettings = ref(createTemplateOutputSettings());
const errors = ref({});
const draftSaved = ref(false);
const materialSource = ref(taskCreateEntry.source);
const materialNotice = ref('');
const materialRows = ref([]);
const shouldAutoFillSimulation = ref(taskCreateEntry.stage === 'materials' && taskCreateEntry.source === 'simulation');
const fieldRefs = {};
const auditedUnits = ['上海分公司', '北京分公司', '深圳分公司', '总部经纪业务部'];
const taskTypes = ['常规审计', '专项审计', '制度比对', '费用审计'];
const dataScopeOptions = ['财务数据', '费用明细', '制度文件', '监管案例', '共享信息', '历史报告', '外部舆情'];
const riskOptions = [{ value: '常规', label: '常规', detail: '一般风险，常规审计' }, { value: '重点', label: '重点', detail: '较高风险，重点关注' }, { value: '专项', label: '专项', detail: '重大风险，专项治理' }];
const capabilities = [
  { id: 'policy-query', name: '制度查询', icon: '制', colorClass: 'blue', description: '快速检索相关制度条款与要求。', materials: [['相关制度文件（最新版）', true]], outputs: [['制度差异分析报告', true]] },
  { id: 'policy-change', name: '制度变更', icon: '变', colorClass: 'orange', description: '识别制度变更内容和执行要求。', materials: [['制度历史版本', true]], outputs: [['制度变更影响分析', true]] },
  { id: 'policy-compare', name: '制度比对', icon: '比', colorClass: 'teal', description: '生成新旧制度差异分析结果。', materials: [['新旧制度版本', true]], outputs: [['差异定位清单', true]] },
  { id: 'regulatory', name: '监管案例舆情分析', icon: '监', colorClass: 'purple', description: '识别监管案例与舆情风险线索。', materials: [['监管案例库', false]], outputs: [['风险提示清单', false]] },
  { id: 'standard', name: '审计规范生成', icon: '规', colorClass: 'blue', description: '生成审计规范与实施要点。', materials: [['内部制度', true]], outputs: [['审计规范草稿', true]] },
  { id: 'supervision', name: '监督共享信息分析', icon: '共', colorClass: 'orange', description: '整合监督共享信息并识别异常。', materials: [['监督共享文件', true]], outputs: [['监督共享信息分析结果', false]] },
  { id: 'expense', name: '费用审计', icon: '费', colorClass: 'green', description: '对费用数据进行合规性审计。', materials: [['费用明细台账', true]], outputs: [['异常候选清单', true]] },
  { id: 'report-generate', name: '报告生成', icon: '报', colorClass: 'red', description: '基于分析结果生成报告草稿。', materials: [['报告模板', true]], outputs: [['审计报告（草稿）', true]] },
  { id: 'report-review', name: '报告审核', icon: '审', colorClass: 'blue', description: '按字体、格式、标题和文字规则复核报告。', materials: [['报告草稿', true]], outputs: [['审核问题清单', true]] }
];
const taskTypeProfile = computed(() => getTaskTypeProfile(form.taskType));
const materialRequirements = computed(() => getTaskMaterialRequirements(form.taskType));
const ownerOptions = computed(() => (store.db.auditPersonnel || []).filter((person) => person.active));
const availablePersonnel = computed(() => filterTaskPersonnel(store.db.auditPersonnel || [], { owner: form.owner }));
const requiredChecks = computed(() => [
  { label: '任务名称', complete: Boolean(form.taskName.trim()) },
  { label: '被审计单位', complete: Boolean(form.auditedUnit) },
  { label: '审计期间', complete: Boolean(form.auditStart && form.auditEnd) },
  { label: '任务类型', complete: Boolean(form.taskType) },
  { label: '负责人', complete: Boolean(form.owner) },
  { label: '选择审计能力', complete: Boolean(selectedIds.value.length) }
]);
const availableCapabilities = computed(() => capabilities);
const selectedIds = ref([capabilities[0].id]);
const selectedCapabilities = computed(() => availableCapabilities.value.filter((item) => selectedIds.value.includes(item.id)));
const selectedAbilityNames = computed(() => selectedCapabilities.value.map((item) => item.name));
const templateTaskSummary = computed(() => ({
  taskName: form.taskName.trim() || referenceTaskSummary.taskName,
  auditedUnit: form.auditedUnit || referenceTaskSummary.auditedUnit,
  auditPeriod: form.auditStart && form.auditEnd ? `${form.auditStart} ～ ${form.auditEnd}` : referenceTaskSummary.auditPeriod,
  taskType: form.taskType || referenceTaskSummary.taskType,
  owner: form.owner || referenceTaskSummary.owner,
  defaultOutputTemplateLabel: '默认输出模板'
}));
const materialProgress = computed(() => getMaterialSelectionProgress(materialRows.value));
const materialCards = computed(() => taskTypeProfile.value.materials.map((title) => ({ title, description: '下一步将以该资料作为建议资料，可在资料选择阶段调整。' })));
const stepHelp = computed(() => ['按任务目标选择一个审计能力。', '确认任务对象、期间、负责人和权限范围。', '确认资料和数据源范围。', '选择模板、输出格式和版本归档方式。', '确认配置并进入资料准备流程。'][step.value]);
const nextStepButtonText = computed(() => {
  if (step.value === 0) return '下一步：填写基础信息';
  if (step.value === 2) return '下一步：解析资料';
  return '下一步';
});

function setFieldRef(name, element) { if (element) fieldRefs[name] = element; }
function goStep(index) {
  if (index > step.value) return;
  step.value = index;
  if (index === 0) { syncStepFourQuery('ability'); return; }
  if (index === 1) { syncStepFourQuery('basic'); return; }
  if (index === 2) { syncStepFourQuery('materials'); return; }
  if (index === 3) { stepFourStage.value = 'parsing'; syncStepFourQuery('parse'); return; }
  if (index === 4) { stepFourStage.value = 'template'; syncStepFourQuery('confirm'); return; }
  syncStepFourQuery('');
}
function removeParticipant(person) { form.participants = form.participants.filter((item) => item !== person); }
function selectCapability(id) { selectedIds.value = [id]; }
function resetMaterialRows() {
  materialRows.value = createMaterialSelectionRows(form.taskType, selectedAbilityNames.value);
  materialNotice.value = '';
  if (shouldAutoFillSimulation.value) {
    shouldAutoFillSimulation.value = false;
    simulateFillMaterials();
  }
}
function selectMaterialSource(source) { materialSource.value = source; }
function uploadMaterialRows(ids) { materialRows.value = applyMaterialSource(materialRows.value, ids, materialSource.value); materialNotice.value = '资料已加入解析队列。'; }
function uploadBlockingMaterials() { uploadMaterialRows(materialProgress.value.blockingItems.map((item) => item.id)); }
function simulateFillMaterials() { materialRows.value = applyMaterialSource(materialRows.value, materialRows.value.map((item) => item.id), 'simulation'); materialNotice.value = '已使用系统模拟数据补齐资料。'; }
function removeMaterial(id) { materialRows.value = materialRows.value.map((item) => item.id === id ? { ...item, source: '—', uploadStatus: '未上传', parseStatus: '—' } : item); }
function saveDraft() {
  draftSaved.value = true;
  store.saveTaskDraft({
    ...createTaskDraftSnapshot(form, taskTypeProfile.value, materialRows.value),
    selectedCapabilityIds: [...selectedIds.value],
    templateOutputSettings: cloneTemplateOutputSettings(templateOutputSettings.value)
  });
}
function syncStepFourQuery(stage) {
  const query = { ...route.query };
  if (stage) query.phase = stage;
  else delete query.phase;
  router.replace({ query });
}
function backFromParsing() { step.value = 2; syncStepFourQuery('materials'); }
function continueToConfirmation() { step.value = 4; stepFourStage.value = 'template'; syncStepFourQuery('confirm'); }
function backToParsing() { step.value = 3; stepFourStage.value = 'parsing'; syncStepFourQuery('parse'); }
function handleTemplateSummaryDetail(section) { goStep(section === 'task' ? 1 : 0); }
function exitTaskCreate() { router.push('/tasks'); }
function submitTemplateTask() {
  saveDraft();
  store.setNotice('任务已提交，模板、输出规则和合规设置已写入任务记录。');
  router.push('/tasks');
}
function submitTaskAndReturn() {
  saveDraft();
  store.setNotice('任务已提交，可在任务中心继续查看执行进度。');
  router.push('/tasks');
}
function goBack() {
  if (step.value === 4 && stepFourStage.value === 'template') { backToParsing(); return; }
  if (step.value <= 0) return;
  step.value -= 1;
  if (step.value === 0) syncStepFourQuery('ability');
  else if (step.value === 1) syncStepFourQuery('basic');
  else if (step.value === 2) syncStepFourQuery('materials');
  else syncStepFourQuery('');
}
watch(() => form.taskType, () => { if (!selectedIds.value.length) selectedIds.value = [capabilities[0].id]; });
watch(() => form.owner, () => { form.participants = form.participants.filter((person) => person !== form.owner); });
watch([() => form.taskType, selectedAbilityNames], resetMaterialRows, { immediate: true });
async function goNext() {
  if (step.value === 0) { step.value = 1; syncStepFourQuery('basic'); return; }
  if (step.value === 1) {
    errors.value = validateTaskCreateForm(form);
    const firstInvalid = ['taskName', 'auditedUnit', 'auditPeriod', 'taskType', 'owner'].find((key) => errors.value[key]);
    if (firstInvalid) { await nextTick(); fieldRefs[firstInvalid]?.focus(); return; }
    draftSaved.value = false;
    step.value = 2;
    syncStepFourQuery('materials');
    return;
  }
  if (step.value === 2) { if (!materialProgress.value.canProceed) { materialNotice.value = '请先补齐阻断资料后再进入下一步。'; return; } step.value = 3; stepFourStage.value = 'parsing'; syncStepFourQuery('parse'); return; }
  if (step.value < steps.length - 1) { step.value += 1; return; }
}
</script>

<style scoped>
.task-create-page{--create-red:var(--color-primary);--create-line:#dfe5ed;--create-soft:#f6f8fb;--create-muted:#778497;box-sizing:border-box;width:100%;max-width:none;margin:0;padding:12px 14px 22px;color:#202938}.create-title-row{display:flex;align-items:center;gap:16px;height:50px;padding:0 4px}.create-title-row h2{margin:0;font-size:24px;line-height:1.2}.create-back{display:grid;width:28px;height:28px;place-items:center;color:#273345}.create-back .audit-icon{width:22px;font-size:22px}.create-workspace{display:grid;grid-template-columns:minmax(0,1fr) 286px;gap:10px;align-items:start}.create-primary-column{min-width:0}.task-create-card,.scope-risk-card,.create-footer,.guide-card,.materials-card,.downstream-panel{box-sizing:border-box;border:1px solid var(--create-line);border-radius:5px;background:#fff}.task-create-card{overflow:hidden}.wizard-steps{display:flex;align-items:center;min-width:0;min-height:78px;padding:0 38px;border-bottom:1px solid var(--create-line)}.wizard-step{display:inline-flex;flex:0 0 auto;align-items:center;gap:12px;border:0;background:transparent;color:#596577;font:600 15px/1 inherit;white-space:nowrap}.wizard-step:disabled{cursor:default}.wizard-step:not(:disabled){cursor:pointer}.step-number{display:grid;width:30px;height:30px;place-items:center;border:1px solid #b9c2cf;border-radius:50%;background:#fff;color:#374151;font-size:14px;font-weight:500}.wizard-step.active{color:var(--create-red)}.wizard-step.active .step-number,.wizard-step.done .step-number{border-color:var(--create-red);background:var(--create-red);color:#fff}.wizard-step.done{color:#283446}.step-connector{display:block;flex:1 1 32px;min-width:26px;max-width:68px;height:1px;margin:0 18px;background:#dce2eb}.basic-info-section{padding:18px 28px 20px}.basic-info-section h3,.scope-risk-card h3,.guide-card h3,.materials-card h3{margin:0;font-size:18px;line-height:1.35}.basic-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 46px;margin-top:14px}.form-field{display:grid;grid-template-columns:94px minmax(0,1fr);align-items:start;gap:16px;min-width:0;font-size:14px;line-height:38px}.form-field>span{font-weight:600;white-space:nowrap}.form-field b,.data-scope b,.risk-level b{color:var(--create-red)}.form-field>div{position:relative;min-width:0}.form-field input,.form-field select,.form-field textarea,.participant-picker{box-sizing:border-box;width:100%;border:1px solid #d7dee8;border-radius:5px;background:#fff;color:#2f3a4a;font:400 14px/1.45 inherit}.form-field input,.form-field select{height:38px;padding:0 11px}.form-field textarea{display:block;height:114px;padding:9px 11px;resize:vertical}.form-field input:focus,.form-field select:focus,.form-field textarea:focus,.participant-picker:focus-within{border-color:var(--create-red);outline:2px solid rgba(199,0,0,.1)}.form-field small{display:block;margin-top:6px;color:var(--create-muted);font-size:12px;line-height:1.45}.form-field em{position:absolute;right:10px;bottom:30px;color:#697789;font-size:12px;font-style:normal;line-height:1}.field-error{margin:5px 0 0;color:var(--create-red);font-size:12px;line-height:1.3}.date-range{display:grid;grid-template-columns:minmax(0,1fr) 18px minmax(0,1fr);align-items:center;gap:6px}.date-range i{color:#667386;font-style:normal;text-align:center}.participant-picker{position:relative;min-height:38px;line-height:1.2}.participant-picker summary{display:flex;flex-wrap:wrap;align-items:center;gap:5px;min-height:36px;padding:5px 28px 5px 8px;cursor:pointer;list-style:none}.participant-picker summary::-webkit-details-marker{display:none}.participant-picker summary:after{position:absolute;right:10px;top:13px;width:7px;height:7px;border-right:1px solid #667386;border-bottom:1px solid #667386;content:"";transform:rotate(45deg)}.participant-placeholder{color:#8b96a5;font-size:13px}.participant-tag{display:inline-flex;align-items:center;gap:6px;padding:4px 7px;border-radius:4px;background:#f1f3f6;color:#344054;font-size:12px}.participant-tag button{padding:0;border:0;background:none;color:#687588;font:inherit;cursor:pointer}.participant-options{position:absolute;z-index:2;top:42px;right:0;left:0;display:grid;gap:5px;padding:8px;border:1px solid #d7dee8;border-radius:5px;background:#fff;box-shadow:0 8px 18px rgba(22,32,51,.1)}.participant-options label{display:flex;align-items:center;gap:7px;padding:3px 4px;font-size:13px;line-height:1.4}.participant-options input,.scope-choice-list input,.risk-option-list input{width:14px;height:14px;margin:0;accent-color:var(--create-red)}.form-field-textarea{line-height:1.4}.scope-risk-card{margin-top:8px;padding:17px 28px 22px}.scope-risk-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:30px;margin-top:18px}.scope-risk-card fieldset{min-width:0;margin:0;padding:0;border:0}.scope-risk-card legend{padding:0;margin-bottom:10px;font-size:14px;font-weight:600}.scope-choice-list{display:flex;flex-wrap:wrap}.scope-choice-list label{display:flex;align-items:center;gap:7px;height:46px;padding:0 10px;border:1px solid #e1e6ed;margin:-1px 0 0 -1px;font-size:13px;white-space:nowrap}.data-scope p{margin:12px 0 0;color:var(--create-muted);font-size:12px}.risk-option-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.risk-option-list label{display:flex;gap:8px;min-height:70px;padding:12px;border:1px solid #e0e6ed;border-radius:5px;cursor:pointer}.risk-option-list label.selected{border-color:#e36a6a;background:#fffafa}.risk-option-list span{display:grid;gap:5px}.risk-option-list strong{font-size:14px}.risk-option-list small{color:var(--create-muted);font-size:12px;line-height:1.35}.create-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:8px;padding:18px 22px}.create-footer p{margin:0;font-size:14px}.create-footer p strong{padding:0 4px;color:var(--create-red);font-size:18px}.create-footer p span{margin-left:8px;color:#258554;font-size:12px}.create-footer>div{display:flex;gap:12px}.btn{display:inline-flex;min-width:136px;height:38px;align-items:center;justify-content:center;box-sizing:border-box;border:1px solid #d2d9e4;border-radius:5px;background:#fff;color:#344054;font:500 14px/1 inherit;text-decoration:none;cursor:pointer}.btn.primary{min-width:226px;border-color:var(--create-red);background:var(--create-red);color:#fff;font-weight:600}.create-guide-column{display:grid;gap:18px;min-width:0}.guide-card,.materials-card{padding:14px}.guide-card>h3,.materials-card>h3{margin-bottom:14px}.guide-callout{display:grid;grid-template-columns:32px minmax(0,1fr);gap:10px;margin-top:12px;padding:12px;border:1px solid #e0e5ec;border-radius:5px;background:#fafbfd}.guide-callout>span{display:grid;width:32px;height:32px;place-items:center;border-radius:50%;font-size:18px}.guide-callout.blue>span{background:#eaf2ff;color:#2770e5}.guide-callout.green>span{background:#eaf9f0;color:#1da35a}.guide-callout.orange>span{background:#fff4e9;color:#ed811f}.guide-callout b{font-size:14px}.guide-callout p{margin:6px 0 0;color:#6f7d8f;font-size:12px;line-height:1.55}.required-checks{margin-top:12px;padding:0 12px 12px;border:1px solid #e0e5ec;border-radius:5px;background:#fafbfd}.required-checks .guide-callout{padding:12px 0 8px;margin:0;border:0;border-bottom:1px solid #e7ebf1;border-radius:0;background:transparent}.required-checks ul{display:grid;gap:8px;margin:10px 0 0;padding:0;list-style:none}.required-checks li{display:flex;align-items:center;gap:8px;color:#d85c1d;font-size:13px}.required-checks li.ready{color:#229953}.required-checks li .audit-icon{width:16px;font-size:16px}.materials-card ul{display:grid;gap:11px;margin:0;padding:0;list-style:none}.materials-card li{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px}.materials-card li>span{display:flex;align-items:center;gap:8px;min-width:0}.materials-card .audit-icon{width:16px;color:#5a6878;font-size:16px}.materials-card b{padding:3px 7px;border-radius:4px;background:#f1f4f8;color:#687587;font-size:12px;font-weight:500}.materials-card b.required{background:#fff0f0;color:var(--create-red)}.downstream-panel{padding:0 26px 18px}.downstream-panel>header{padding:20px 0;border-bottom:1px solid var(--create-line)}.downstream-panel>header p{margin:0;color:var(--create-red);font-size:12px;font-weight:600}.downstream-panel>header h3{margin:6px 0;font-size:20px}.downstream-panel>header span{color:var(--create-muted);font-size:13px}.wizard-steps.compact{min-height:64px;padding:0}.ability-grid,.summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding-top:18px}.ability-card,.summary-grid article{min-height:96px;padding:13px;border:1px solid #e0e5ec;border-radius:5px;background:#fff;text-align:left}.ability-card{display:grid;grid-template-columns:34px minmax(0,1fr);gap:10px;cursor:pointer}.ability-card.selected{border-color:var(--create-red);background:#fffafa}.ability-icon{display:grid;width:32px;height:32px;place-items:center;border-radius:5px;color:#fff;font-size:13px;font-weight:700}.blue{background:var(--color-info)}.orange{background:#e98723}.teal{background:#239c9d}.purple{background:#7b61b8}.green{background:#248a59}.red{background:#cf3038}.ability-card b,.summary-grid b{display:block;font-size:14px}.ability-card small,.summary-grid p{display:block;margin-top:5px;color:var(--create-muted);font-size:12px;line-height:1.5}.summary-grid p{margin-bottom:0}.submit-summary{padding:28px 0}.submit-summary h3{margin:0;font-size:18px}.submit-summary p{color:var(--create-muted);font-size:13px}
@media (max-width:1199px){.create-workspace{grid-template-columns:1fr}.create-guide-column{grid-template-columns:repeat(2,minmax(0,1fr));order:2}.basic-form-grid{gap:22px 28px}.scope-risk-grid{grid-template-columns:1fr}.create-title-row{height:46px}.wizard-steps{padding:0 22px}}
@media (max-width:899px){.task-create-page{padding:8px 12px 18px}.create-title-row h2{font-size:21px}.wizard-steps{overflow-x:auto;padding:0 12px}.wizard-step{gap:8px;font-size:13px}.step-connector{flex:0 0 28px;min-width:28px;margin:0 8px}.basic-info-section,.scope-risk-card{padding:16px}.basic-form-grid{grid-template-columns:1fr;gap:18px}.form-field{grid-template-columns:86px minmax(0,1fr);gap:10px;font-size:13px}.form-field-textarea{grid-template-columns:1fr}.scope-risk-grid{gap:20px}.risk-option-list{grid-template-columns:1fr}.risk-option-list label{min-height:56px}.create-guide-column{grid-template-columns:1fr;gap:10px}.create-footer{align-items:stretch;flex-direction:column;padding:14px}.create-footer>div{display:grid;grid-template-columns:1fr;gap:8px}.btn,.btn.primary{width:100%;min-width:0}.downstream-panel{padding:0 14px 14px}.ability-grid,.summary-grid{grid-template-columns:1fr}.wizard-steps.compact{padding:0;overflow:auto}.wizard-steps.compact .wizard-step span:last-child{display:none}}
@media (max-width:430px){.form-field{grid-template-columns:1fr;gap:6px}.form-field>span{line-height:1.3}.date-range{grid-template-columns:minmax(0,1fr) 12px minmax(0,1fr);gap:4px}.date-range input{padding:0 4px;font-size:12px}.scope-choice-list label{height:40px;padding:0 8px;font-size:12px}.create-title-row{padding:0}.guide-card,.materials-card{padding:12px}}
.guide-callout.blue,.guide-callout.green,.guide-callout.orange{background:#fafbfd}
@media (min-width:1200px) and (max-width:1439px){.form-field{grid-template-columns:82px minmax(0,1fr);gap:12px}}
@media (min-width:900px) and (max-width:1099px){.basic-form-grid{grid-template-columns:1fr}}
.materials-selection-page{padding:10px 0 0}.materials-alert{display:flex;align-items:center;gap:10px;margin:0 0 14px;padding:13px 16px;border-radius:6px;background:#fff5f5;color:#2b3441;font-size:14px;line-height:1.5}.materials-alert .audit-icon{width:18px;color:var(--create-red);font-size:18px}.materials-alert span{color:#a43a3a}.materials-workspace{display:grid;grid-template-columns:minmax(0,1fr) 326px;gap:16px;align-items:start}.materials-primary,.materials-sidebar{min-width:0}.material-source-card,.material-list-card,.material-progress-card{border:1px solid var(--create-line);border-radius:6px;background:#fff}.material-source-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-bottom:1px solid var(--create-line)}.material-source-tabs button{display:flex;align-items:center;justify-content:center;gap:9px;min-width:0;min-height:45px;border:0;border-right:1px solid var(--create-line);background:#fff;color:#364152;font:500 14px/1 inherit;white-space:nowrap;cursor:pointer}.material-source-tabs button:last-child{border-right:0}.material-source-tabs button.active{color:var(--create-red);font-weight:700}.material-source-tabs .audit-icon{width:18px;font-size:18px}.material-dropzone{display:grid;place-items:center;min-height:202px;padding:18px;border:1px dashed #bcc7d7;border-radius:8px;margin:14px;text-align:center}.dropzone-icon{display:grid;width:44px;height:44px;place-items:center;color:#bcc4cf;font-size:44px}.dropzone-icon .audit-icon{width:44px}.material-dropzone h3{margin:5px 0 13px;font-size:16px}.material-dropzone>div{display:flex;gap:12px}.material-dropzone .btn{min-width:134px}.material-dropzone p{margin:14px 0 0;color:var(--create-muted);font-size:13px}.material-list-card{margin-top:14px;padding:0 16px 16px}.material-list-card>h3{margin:0;padding:12px 0 8px;font-size:16px}.material-list-card h3 small{color:var(--create-muted);font-size:12px;font-weight:400}.materials-table-scroll{min-width:0;max-width:100%;overflow-x:auto;overscroll-behavior-x:contain}.materials-table-scroll table{width:100%;min-width:908px;border-collapse:separate;border-spacing:0;border:1px solid #e3e8ef;border-radius:6px;overflow:hidden}.materials-table-scroll th,.materials-table-scroll td{padding:8px 10px;border-right:1px solid #e5e9f0;border-bottom:1px solid #e5e9f0;color:#485463;font-size:12px;line-height:1.35;text-align:center}.materials-table-scroll th{background:#f6f8fb;color:#354052;font-weight:600;white-space:nowrap}.materials-table-scroll th:first-child,.materials-table-scroll td:first-child,.materials-table-scroll th:nth-child(2),.materials-table-scroll td:nth-child(2){text-align:left}.materials-table-scroll th:last-child,.materials-table-scroll td:last-child{border-right:0}.materials-table-scroll tbody tr:last-child td{border-bottom:0}.materials-table-scroll td.required,.material-card-list .required{color:var(--create-red);font-weight:700}.materials-table-scroll td button,.material-card-list button{margin:0 5px;padding:0;border:0;background:transparent;color:#2d68d7;font:inherit;cursor:pointer}.material-status{display:inline-flex;padding:3px 7px;border-radius:4px;background:#f2f4f7;color:#707b8b;white-space:nowrap}.material-status.empty{background:#fff1f1;color:var(--create-red)}.material-status.complete{background:#eaf8ef;color:#219150}.material-status.selected{background:#eaf8ef;color:#219150}.material-status.parsing{background:#fff5df;color:var(--color-warning)}.material-card-list{display:none}.material-progress-card{padding:14px}.material-progress-card h3{margin:0 0 16px;font-size:17px}.progress-summary{display:grid;grid-template-columns:112px minmax(0,1fr);gap:12px;align-items:center}.progress-ring{display:grid;width:112px;height:112px;place-items:center;border-radius:50%;background:conic-gradient(var(--create-red) var(--completion),#e8ebef 0)}.progress-ring>div{display:grid;width:90px;height:90px;place-items:center;border-radius:50%;background:#fff}.progress-ring strong{font-size:24px;line-height:1}.progress-ring span{margin-top:-16px;font-size:13px}.progress-summary ul{display:grid;gap:13px;margin:0;padding:0;list-style:none}.progress-summary li{display:grid;grid-template-columns:9px minmax(0,1fr) auto;align-items:center;gap:7px;font-size:13px;white-space:nowrap}.progress-summary i{width:7px;height:7px;border-radius:50%}.progress-summary i.red{background:var(--color-primary)}.progress-summary i.orange{background:var(--color-warning)}.progress-summary i.green{background:var(--color-success)}.blocking-items,.material-help{margin-top:16px;padding:13px;border:1px solid #f5dedb;border-radius:6px;background:#fffafa}.blocking-items h4,.material-help h4{margin:0 0 10px;font-size:14px}.blocking-items p{display:flex;align-items:center;gap:7px;margin:8px 0;color:#454f5e;font-size:12px}.blocking-items .audit-icon{width:15px;color:var(--create-red);font-size:15px}.material-help{border-color:#e4e8ef;background:#fff}.material-help ul{display:grid;gap:8px;margin:0;padding-left:17px;color:#596575;font-size:12px;line-height:1.5}.material-progress-card>.btn{width:100%;margin-top:14px}.material-progress-card>.btn .audit-icon{width:17px;margin-right:8px;font-size:17px}.materials-footer{margin-top:14px}.materials-footer .btn:disabled{border-color:#e5e8ed;background:#e8ebef;color:#b6bdc8;cursor:not-allowed}.materials-footer>div{margin-left:auto}.materials-footer p{display:none}
@media (max-width:1199px){.materials-workspace{grid-template-columns:1fr}.materials-sidebar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.material-progress-card{grid-column:1 / -1}.material-progress-card .progress-summary{max-width:460px}.materials-footer{margin-top:14px}}
@media (max-width:899px){.materials-selection-page{padding-top:8px}.materials-alert{align-items:flex-start;font-size:13px}.material-source-tabs{overflow-x:auto}.material-source-tabs button{min-width:148px}.materials-sidebar{grid-template-columns:1fr}.material-progress-card{grid-column:auto}.materials-table-scroll{display:none}.material-card-list{display:grid;gap:8px}.material-card-list article{padding:11px;border:1px solid #e3e8ef;border-radius:5px}.material-card-list article>div{display:flex;align-items:center;justify-content:space-between;gap:8px}.material-card-list b{font-size:14px}.material-card-list p{margin:7px 0;color:var(--create-muted);font-size:12px}.material-card-list button{margin:0;padding:5px 0}.materials-footer p{display:block}.materials-footer>div{margin-left:0}.material-dropzone{min-height:188px}.material-dropzone p{font-size:12px}}
@media (max-width:560px){.material-source-tabs{grid-template-columns:repeat(2,minmax(0,1fr));overflow:visible}.material-source-tabs button{min-width:0;border-bottom:1px solid var(--create-line);font-size:12px}.material-source-tabs button:nth-child(2n){border-right:0}.material-dropzone{min-height:210px;margin:10px;padding:14px}.material-dropzone>div{display:grid;width:100%;grid-template-columns:1fr}.material-dropzone .btn{width:100%;min-width:0}.material-dropzone p{line-height:1.55}.progress-summary{grid-template-columns:92px minmax(0,1fr)}.progress-ring{width:92px;height:92px}.progress-ring>div{width:72px;height:72px}.progress-ring strong{font-size:20px}.progress-ring span{font-size:12px}.materials-footer>div{display:grid;grid-template-columns:1fr}.materials-footer .btn{width:100%}}
.step-number .audit-icon{width:16px;font-size:16px}
.material-list-card>h3{padding:7px 0 3px}.materials-table-scroll td{padding-top:5px;padding-bottom:5px}.materials-table-scroll th{padding-top:7px;padding-bottom:7px}
.task-create-page.parsing-page{max-width:none;padding:12px 0 22px}.downstream-panel.parsing-downstream{padding:0;border:0;background:transparent}.parse-page-title{height:28px;margin:0;color:#202938;font-size:18px;line-height:28px}.parsing-downstream>.wizard-steps{min-height:44px;margin-right:368px;padding:0 38px;border:1px solid var(--create-line);border-radius:5px;background:#fff}.parsing-downstream .wizard-step{font-size:12px}.parsing-downstream .step-number{width:22px;height:22px;font-size:11px}.parsing-downstream .step-connector{margin:0 14px}.parsing-stage .wizard-step.done .step-number{border-color:var(--color-success);background:var(--color-success);color:#fff}.parsing-stage .wizard-step.done{color:#324152}.parsing-stage .step-number svg{font-size:10px}:global(.task-parsing-shell .sidebar){width:202px}
.task-create-page.template-output-page{max-width:none;padding:0}:global(.task-template-shell .sidebar){width:196px;flex:0 0 196px}:global(.task-template-shell .brand){min-height:60px;background:var(--color-primary)}:global(.task-template-shell .brand strong){font-size:19px}:global(.task-template-shell .sidebar a){min-height:48px;font-size:14px}:global(.task-template-shell .nav-icon){font-size:18px}:global(.task-template-shell .bottom-nav){box-sizing:border-box;min-height:124px;align-content:start}
@media(max-width:1439px){.task-create-page.parsing-page{padding-right:12px;padding-left:12px}.parsing-downstream>.wizard-steps{margin-right:0}}
@media(max-width:1366px){:global(.task-parsing-shell .sidebar),:global(.task-template-shell .sidebar){width:72px;flex:0 0 72px}:global(.task-template-shell .brand strong){font-size:0}}
@media(min-width:1440px) and (max-width:1499px){.task-create-page.parsing-page{padding-right:12px;padding-left:12px}.parsing-downstream>.wizard-steps{margin-right:0}}
@media(min-width:1500px){.parse-page-title{margin-left:9px}.parsing-downstream>.wizard-steps{margin-left:4px}}
.materials-footer>div{display:grid;grid-template-columns:minmax(0,1fr) 170px 280px;width:100%;margin-left:0}.materials-footer>div .btn:first-child{justify-self:start}.materials-footer>div .btn:nth-child(2){grid-column:2}.materials-footer>div .btn:nth-child(3){grid-column:3}
@media (max-width:560px){.materials-footer>div{grid-template-columns:1fr}.materials-footer>div .btn:first-child{justify-self:stretch}.materials-footer>div .btn:nth-child(2),.materials-footer>div .btn:nth-child(3){grid-column:auto}}
@media (max-width:1199px){.downstream-panel{min-width:0}.wizard-steps.compact{min-width:0;overflow-x:auto}}
</style>
