<template>
  <section class="panel filter-panel">
    <div class="filter-caption">
      <div>
        <h3>查询条件</h3>
        <p>按权限范围、业务对象和状态过滤当前可办理数据。</p>
      </div>
      <span class="pill">只读 Mock 条件</span>
    </div>
    <div class="filter-grid">
      <label v-for="item in items" :key="item.label">
        <span>{{ item.label }}</span>
        <input :value="item.value" readonly />
      </label>
    </div>
    <div class="panel-actions">
      <button class="btn primary" @click="$emit('query')">查询</button>
      <button class="btn">重置</button>
    </div>
  </section>
</template>

<script setup>
defineProps({ items: { type: Array, required: true } });
defineEmits(['query']);
</script>
