<template>
  <section class="panel state-panel" :class="`state-${state}`">
    <div>
      <span class="state-label">{{ label }}</span>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
    <div v-if="primaryText || secondaryText" class="panel-actions">
      <RouterLink v-if="primaryTo" class="btn primary" :to="primaryTo">{{ primaryText }}</RouterLink>
      <button v-else-if="primaryText" class="btn primary" @click="$emit('primary')">{{ primaryText }}</button>
      <RouterLink v-if="secondaryTo" class="btn" :to="secondaryTo">{{ secondaryText }}</RouterLink>
      <button v-else-if="secondaryText" class="btn" @click="$emit('secondary')">{{ secondaryText }}</button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  state: { type: String, default: 'empty' },
  label: { type: String, default: '页面状态' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  primaryText: { type: String, default: '' },
  primaryTo: { type: String, default: '' },
  secondaryText: { type: String, default: '' },
  secondaryTo: { type: String, default: '' }
});
defineEmits(['primary', 'secondary']);
</script>
