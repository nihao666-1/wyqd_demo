<template>
  <PageHeader eyebrow="文件资产详情" title="风险事项台账.xlsx" description="展示解析、元数据、引用关系、版本和阻断原因。">
    <button class="btn primary" @click="store.handleAssetAction('FA-001', 'invalidate')">设置失效校验</button>
    <RouterLink class="btn" to="/files">返回文件中心</RouterLink>
  </PageHeader>
  <section class="two-col">
    <div class="panel">
      <div class="panel-title"><h3>基础信息</h3></div>
      <div class="filter-grid">
        <label><span>适配机构</span><input value="上海分公司" readonly /></label>
        <label><span>适配部门</span><input value="经纪业务部" readonly /></label>
        <label><span>数据归属周期</span><input value="2026Q1" readonly /></label>
        <label><span>引用状态</span><input value="引用锁定" readonly /></label>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title"><h3>引用锁定规则</h3></div>
      <p>该文件已被监督共享报告和审计报告草稿引用，不能直接删除、失效或覆盖。需要发起解锁并回退相关草稿。</p>
      <div class="panel-actions">
        <button class="btn" @click="store.requestAssetUnlock('FA-001')">解锁申请</button>
        <button class="btn" @click="store.rollbackDraftForAsset('FA-001')">回退重生成草稿</button>
      </div>
    </div>
  </section>
  <section class="panel state-panel">
    <div>
      <span class="state-label">资产变更状态</span>
      <h3>{{ assetWorkflow.status }}</h3>
      <p>{{ assetWorkflow.nextStep }}</p>
    </div>
  </section>
  <DataTable :columns="columns" :rows="references" row-key="id" />
  <section class="panel">
    <div class="panel-title"><h3>解锁与回退状态链</h3></div>
    <DataTable :columns="requestColumns" :rows="requests" row-key="requestId" />
  </section>
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const assetWorkflow = computed(() => store.db.assetWorkflowState || { status: '引用锁定', nextStep: '需要发起解锁申请后才能回退相关草稿。' });
const columns = [
  { key: 'type', label: '引用对象' },
  { key: 'name', label: '名称' },
  { key: 'status', label: '状态' },
  { key: 'version', label: '版本' }
];
const references = [
  { id: 'REF-1', type: '监督共享报告', name: '2026Q1监督共享汇总', status: '已确认', version: 'V1.0' },
  { id: 'REF-2', type: '审计报告草稿', name: '营业部常规审计报告', status: '待确认', version: '草稿' }
];
const requests = computed(() => store.db.assetChangeRequests || []);
const requestColumns = [
  { key: 'action', label: '动作' },
  { key: 'status', label: '当前状态' },
  { key: 'nextStep', label: '下一步' },
  { key: 'createdBy', label: '发起人' },
  { key: 'createdAt', label: '时间' }
];
</script>
