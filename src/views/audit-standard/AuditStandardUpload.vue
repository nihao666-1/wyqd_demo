<template>
  <PageHeader eyebrow="上传标准规范" title="标准规范上传与版本校验" description="同名规范必须上传更高版本；文件名前缀不一致时需要用户确认是否为新规范。">
    <RouterLink class="btn" to="/audit-standard/workbench">返回工作台</RouterLink>
    <RouterLink class="btn primary" to="/audit-standard/diff">校验并进入差异分析</RouterLink>
  </PageHeader>
  <section class="panel">
    <div class="panel-title"><h3>上传校验</h3></div>
    <div class="filter-grid">
      <label><span>上传文件</span><input value="费用报销审计规范_V2.2.docx" readonly /></label>
      <label><span>库内同名版本</span><input value="费用报销审计规范_V2.1.docx" readonly /></label>
      <label><span>版本校验</span><input value="通过：V2.2 大于 V2.1" readonly /></label>
      <label><span>前缀校验</span><input value="通过：费用报销审计规范" readonly /></label>
    </div>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>异常样例</h3></div>
    <p>如果文件名为“差旅报销审计规范_V2.2.docx”，系统提示：文件名前缀与库内规范不完全一致，请确认是否上传了一个新的规范；确认则按新规范模板上传，取消则修改文件名后重新上传。</p>
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
</script>
