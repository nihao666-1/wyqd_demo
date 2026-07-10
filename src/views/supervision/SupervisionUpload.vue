<template>
  <PageHeader eyebrow="上传前" title="监督共享文件导入" description="请选择文件或文件夹。上传完成后自动进入下一步预览。">
    <RouterLink class="btn" to="/supervision/workbench">返回入口</RouterLink>
  </PageHeader>
  <section class="panel">
    <div class="panel-title"><h3>上传范围与权限</h3></div>
    <div class="filter-grid">
      <label><span>适配机构范围</span><input value="上海分公司" readonly /></label>
      <label><span>可选部门</span><input value="经纪业务部、计划财务部" readonly /></label>
      <label><span>允许格式</span><input value="xlsx、docx、pdf、zip" readonly /></label>
      <label><span>后续步骤</span><input value="上传完成后进入预览核对" readonly /></label>
    </div>
  </section>
  <section class="card-grid">
    <article class="business-card upload-choice">
      <div class="choice-mark">文</div>
      <h3>上传文件</h3>
      <p>用于少量单文件补充资料，上传完成后进入文件清单预览。</p>
      <RouterLink class="btn" to="/supervision/import/folder-preview">选择文件</RouterLink>
    </article>
    <article class="business-card upload-choice primary-choice">
      <div class="choice-mark">夹</div>
      <h3>上传文件夹</h3>
      <p>用于整目录批量导入，上传完成后进入下一步核对。</p>
      <RouterLink class="btn primary" to="/supervision/import/folder-preview">选择文件夹</RouterLink>
    </article>
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
</script>
