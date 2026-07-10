<template>
  <PageHeader eyebrow="线下回传" title="上传线下修改稿" description="只有锁定报告才能回传线下修改稿，回传后进入系统版本与线下稿比对。">
    <RouterLink class="btn" to="/audit-report/draft">返回锁定报告</RouterLink>
    <RouterLink class="btn primary" to="/audit-report/diff">上传并开始比对</RouterLink>
  </PageHeader>
  <section class="panel">
    <div class="panel-title"><h3>回传条件</h3></div>
    <div class="filter-grid">
      <label><span>系统锁定版本</span><input value="营业部常规审计报告 V1.1" readonly /></label>
      <label><span>锁定时间</span><input value="2026-07-08 10:46" readonly /></label>
      <label><span>回传文件</span><input value="营业部常规审计报告_线下修改稿.docx" readonly /></label>
      <label><span>回传状态</span><input value="待比对" readonly /></label>
    </div>
  </section>
  <section class="panel">
    <div class="panel-title"><h3>回传规则说明</h3></div>
    <p>未锁定报告不能回传；回传文件不会覆盖系统锁定版本，必须先比对差异，再选择形成新版本或仅归档。</p>
  </section>
</template>

<script setup>
import PageHeader from '../../components/common/PageHeader.vue';
</script>
