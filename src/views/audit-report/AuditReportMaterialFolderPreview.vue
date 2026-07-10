<template>
  <PageHeader
    eyebrow="上传后预览"
    title="报告资料文件夹预览"
    description="核对当前报告任务下的文件夹树、文件清单、失败文件、重复文件和格式异常。"
  >
    <RouterLink class="btn" to="/audit-report/material/import">返回上传</RouterLink>
    <RouterLink class="btn primary" to="/audit-report/material/field-edit">确认预览，补全三字段</RouterLink>
  </PageHeader>

  <MetricGrid :metrics="metrics" />
  <section class="two-col">
    <div class="panel">
      <div class="panel-title"><h3>报告资料文件夹树</h3></div>
      <div class="tree">
        <div class="tree-item">/营业部常规审计报告资料</div>
        <div class="tree-item">/营业部常规审计报告资料/经营数据</div>
        <div class="tree-item">客户投诉整改说明.docx <StatusTag text="上传成功" tone="success" /></div>
        <div class="tree-item">预算执行明细.xlsx <StatusTag text="上传成功" tone="success" /></div>
        <div class="tree-item">旧版人员名单.xlsx <StatusTag text="重复文件" tone="warning" /></div>
        <div class="tree-item">临时截图.bmp <StatusTag text="格式异常" tone="danger" /></div>
      </div>
    </div>
    <aside class="panel">
      <div class="panel-title"><h3>报告任务绑定</h3></div>
      <div class="summary-item">
        <strong>绑定对象</strong>
        <p>营业部常规审计报告 TASK-RPT-2026-001。资料不会进入无任务归属的公共上传结果。</p>
      </div>
      <div class="summary-item">
        <strong>异常处理</strong>
        <p>重复文件进入版本确认，格式异常不进入预检，上传失败文件要求重新上传。</p>
      </div>
    </aside>
  </section>

  <section class="panel">
    <div class="panel-title"><h3>报告资料文件清单</h3></div>
    <DataTable :columns="columns" :rows="rows" row-key="fileId" />
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
import MetricGrid from '../../components/common/MetricGrid.vue';
import StatusTag from '../../components/common/StatusTag.vue';
import DataTable from '../../components/common/DataTable.vue';

const metrics = [
  { label: '文件总数', value: '6', hint: '当前报告任务' },
  { label: '上传成功', value: '4', hint: '可进入三字段补全' },
  { label: '重复文件', value: '1', hint: '需确认版本' },
  { label: '格式异常', value: '1', hint: '阻断入库' }
];
const columns = [
  { key: 'fileName', label: '文件名' },
  { key: 'folderPath', label: '文件夹路径' },
  { key: 'fileType', label: '文件类型' },
  { key: 'uploadStatus', label: '上传状态' },
  { key: 'reason', label: '说明' }
];
const rows = [
  { fileId: 'RM-F-001', fileName: '客户投诉整改说明.docx', folderPath: '/经营数据', fileType: '整改说明', uploadStatus: '上传成功', reason: '待补三字段' },
  { fileId: 'RM-F-002', fileName: '预算执行明细.xlsx', folderPath: '/经营数据', fileType: '预算资料', uploadStatus: '上传成功', reason: '待补三字段' },
  { fileId: 'RM-F-003', fileName: '旧版人员名单.xlsx', folderPath: '/组织资料', fileType: '人员清单', uploadStatus: '重复文件', reason: '库内已有 V1.0' },
  { fileId: 'RM-F-004', fileName: '临时截图.bmp', folderPath: '/截图', fileType: '图片', uploadStatus: '格式异常', reason: '不在允许格式内' }
];
</script>

