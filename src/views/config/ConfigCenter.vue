<template>
  <PageHeader eyebrow="支撑中心" title="配置中心" description="管理规则、模板、标签、权限、数据源和系统参数。">
    <button class="btn primary" @click="store.openDrawer('config-create', { title: '新增配置版本', rule: '配置新版本必须走差异分析和发布记录。' })">新增配置</button>
  </PageHeader>
  <FilterPanel :items="filters" @query="store.addLog('查询配置中心', '配置中心', 'CONFIG')" />
  <MetricGrid :metrics="metrics" />
  <section class="section-grid">
    <div>
      <DataTable :columns="columns" :rows="rows" row-key="id">
        <template #actions="{ row }">
          <button class="btn" @click="store.openConfigDetail(row)">参数详情</button>
          <button class="btn" @click="store.validateConfigEdit(row)">编辑校验</button>
        </template>
      </DataTable>
    </div>
    <aside class="panel">
      <div class="panel-title"><h3>配置使用规范</h3></div>
      <div class="summary-item">
        <strong>被引用配置不覆盖</strong>
        <p>模板、规则、标签、权限、数据源字段一旦被任务或报告引用，只能发新版本，不能直接改历史版本。</p>
      </div>
      <div class="summary-item">
        <strong>费用规则参数</strong>
        <p>27 条费用异常规则统一记录版本、依赖系统、必要字段、阈值和启停状态。</p>
      </div>
      <div class="summary-item">
        <strong>制度比对规则</strong>
        <p>制度查询、制度变更和制度比对只做结构化执行，不提供开放式聊天入口。</p>
      </div>
      <div class="summary-item">
        <strong>生成内容标识</strong>
        <p>系统生成内容进入正式结果前必须人工确认，确认动作写入记录中心。</p>
      </div>
    </aside>
  </section>
  <aside v-if="store.activeDrawer === 'config-detail' || store.activeDrawer === 'config-create'" class="drawer">
    <div class="panel-title">
      <h3>{{ store.drawerPayload.title || store.drawerPayload.name }}</h3>
      <button class="btn" @click="store.closeDrawer()">关闭</button>
    </div>
    <div v-if="store.activeDrawer === 'config-create'" class="summary-item">
      <strong>新增规则</strong>
      <p>{{ store.drawerPayload.rule }}</p>
    </div>
    <div v-else class="summary-rail">
      <div class="summary-item"><strong>配置类型</strong><p>{{ store.drawerPayload.type }}</p></div>
      <div class="summary-item"><strong>当前版本</strong><p>{{ store.drawerPayload.version }} / {{ store.drawerPayload.status }}</p></div>
      <div class="summary-item"><strong>引用状态</strong><p>{{ store.drawerPayload.reference }}；已引用版本只能新增版本，不能覆盖。</p></div>
    </div>
  </aside>
</template>

<script setup>
import { inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import FilterPanel from '../../components/common/FilterPanel.vue';
import DataTable from '../../components/common/DataTable.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';

const store = inject('store');
const filters = [
  { label: '配置类型', value: '模板、规则、标签、权限、数据源' },
  { label: '覆盖部门', value: '上海分公司' },
  { label: '生效部门', value: '审计部' },
  { label: '是否有效', value: '有效' },
  { label: '创建人', value: '配置管理员' },
  { label: '确认人', value: '任务负责人' }
];
const columns = [
  { key: 'name', label: '配置名称' },
  { key: 'type', label: '类型' },
  { key: 'version', label: '版本' },
  { key: 'status', label: '状态' },
  { key: 'reference', label: '引用状态' }
];
const metrics = [
  { label: '规则参数', value: '27', hint: '费用异常规则' },
  { label: '模板版本', value: '6', hint: '报告与格式模板' },
  { label: '制度配置', value: '3', hint: '查询、变更、比对' },
  { label: '引用锁定', value: '8', hint: '只能新增版本' }
];
const rows = [
  { id: 'CFG-1', name: '费用异常规则台账', type: '规则', version: 'V2026.07', status: '有效', reference: '已引用' },
  { id: 'CFG-2', name: '营业部常规审计报告模板', type: '模板', version: 'V2.1', status: '有效', reference: '已引用' },
  { id: 'CFG-3', name: '监督共享标签定义', type: '标签', version: 'V1.0', status: '有效', reference: '未引用' },
  { id: 'CFG-4', name: '制度比对规则', type: '制度规则', version: 'V1.2', status: '有效', reference: '已引用' },
  { id: 'CFG-5', name: '系统生成内容标识规则', type: '确认规则', version: 'V1.0', status: '有效', reference: '未引用' },
  { id: 'CFG-6', name: '多模型复核配置', type: '复核配置', version: 'Mock V0.3', status: '展示态', reference: '未引用' }
];
</script>
