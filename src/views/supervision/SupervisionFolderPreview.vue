<template>
  <PageHeader eyebrow="上传后预览" title="监督共享文件夹预览" description="核对目录树、文件清单、上传失败、重复文件和格式异常。">
    <RouterLink class="btn" to="/supervision/import/upload">返回上传</RouterLink>
    <RouterLink class="btn primary" to="/supervision/import/field-edit">确认预览，补全三字段</RouterLink>
  </PageHeader>
  <MetricGrid :metrics="metrics" />
  <section class="two-col">
    <div class="panel">
      <div class="panel-title"><h3>文件夹树</h3></div>
      <div class="tree">
        <div class="tree-item">/监督共享资料</div>
        <div class="tree-item">/监督共享资料/经纪业务部</div>
        <div class="tree-item">风险事项台账.xlsx <StatusTag text="上传成功" tone="success" /></div>
        <div class="tree-item">整改跟踪表.xlsx <StatusTag text="重复文件" tone="warning" /></div>
        <div class="tree-item">临时说明.tmp <StatusTag text="格式异常" tone="danger" /></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title"><h3>异常处理</h3></div>
      <div class="summary-item">
        <strong>处理原则</strong>
        <p>失败文件要求重新上传，重复文件进入版本确认，格式异常文件不进入入库预检。</p>
      </div>
      <div class="panel-actions">
        <button class="btn" @click="store.handleUploadException('failed')">处理上传失败</button>
        <button class="btn" @click="store.handleUploadException('duplicate')">处理重复文件</button>
        <button class="btn" @click="store.handleUploadException('format')">处理格式异常</button>
      </div>
    </div>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>异常文件办理结果</h3></div>
    <DataTable :columns="exceptionColumns" :rows="exceptionRows" row-key="issueId" />
  </section>
</template>

<script setup>
import { computed, inject } from 'vue';
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import StatusTag from '../../components/common/StatusTag.vue';
import DataTable from '../../components/common/DataTable.vue';

const store = inject('store');
const metrics = [
  { label: '文件总数', value: '8', hint: '当前批次' },
  { label: '上传成功', value: '5', hint: '可进入字段补全' },
  { label: '重复文件', value: '1', hint: '需确认版本策略' },
  { label: '格式异常', value: '1', hint: '入库前阻断' }
];
const fallbackRows = [
  { issueId: 'UE-FAIL', fileName: '客户投诉说明缺失.docx', issueType: '上传失败', processStatus: '待处理', result: '等待重新上传', operator: '-' },
  { issueId: 'UE-DUP', fileName: '整改跟踪表.xlsx', issueType: '重复文件', processStatus: '待处理', result: '等待版本确认', operator: '-' },
  { issueId: 'UE-FMT', fileName: '临时说明.tmp', issueType: '格式异常', processStatus: '待处理', result: '等待排除入库', operator: '-' }
];
const exceptionRows = computed(() => store.db.uploadExceptionRows || fallbackRows);
const exceptionColumns = [
  { key: 'fileName', label: '文件名' },
  { key: 'issueType', label: '异常类型' },
  { key: 'processStatus', label: '办理状态' },
  { key: 'result', label: '处理结果' },
  { key: 'operator', label: '处理人' }
];
</script>
