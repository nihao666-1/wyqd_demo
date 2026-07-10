<template>
  <PageHeader
    eyebrow="审计报告资料导入"
    title="报告资料上传"
    description="请选择报告资料文件或文件夹。上传完成后进入报告资料专属预览，不进入监督共享导入。"
  >
    <RouterLink class="btn" to="/audit-report/workbench">返回报告入口</RouterLink>
  </PageHeader>

  <section class="panel">
    <div class="panel-title"><h3>上传范围与权限</h3></div>
    <div class="filter-grid">
      <label><span>所属报告任务</span><input value="营业部常规审计报告 TASK-RPT-2026-001" readonly /></label>
      <label><span>可选机构</span><input value="上海分公司" readonly /></label>
      <label><span>可选部门</span><input value="经纪业务部、计划财务部、审计部" readonly /></label>
      <label><span>后续步骤</span><input value="上传后进入报告资料预览" readonly /></label>
    </div>
  </section>

  <section class="card-grid">
    <article class="business-card upload-choice">
      <div class="choice-mark">文</div>
      <h3>上传文件</h3>
      <p>用于少量报告资料补充，上传完成后进入文件清单预览。</p>
      <RouterLink class="btn" to="/audit-report/material/folder-preview">选择文件</RouterLink>
    </article>
    <article class="business-card upload-choice primary-choice">
      <div class="choice-mark">夹</div>
      <h3>上传文件夹</h3>
      <p>用于整目录导入报告资料，上传后核对文件夹树、文件清单和异常文件。</p>
      <RouterLink class="btn primary" to="/audit-report/material/folder-preview">选择文件夹</RouterLink>
    </article>
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
</script>

