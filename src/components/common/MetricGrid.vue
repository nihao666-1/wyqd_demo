<template>
  <section class="metric-grid">
    <article v-for="metric in metrics" :key="metric.label" class="metric-card">
      <span>{{ metric.label }}</span>
      <strong>{{ metric.value }}</strong>
      <p>{{ metric.hint }}</p>
    </article>
  </section>
</template>

<script setup>
defineProps({ metrics: { type: Array, required: true } });
</script>
