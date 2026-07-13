<template>
  <svg class="task-icon" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'draft' || name === 'create'"><path d="M6 3.5h8l4 4V20.5H6z"/><path d="M14 3.5v4h4"/><path v-if="name === 'draft'" d="M9 13h6M9 16.5h4"/><path v-else d="M12 12v6M9 15h6"/></template>
    <template v-else-if="name === 'parse'"><path d="M5 5.5h9l3 3V19H5z"/><circle cx="11" cy="13" r="2.5"/><path d="m13 15 2.5 2.5"/></template>
    <template v-else-if="name === 'generate'"><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5"/><path d="M20.5 4v5h-5"/><path d="m9 12 2 2 4-4"/></template>
    <template v-else-if="name === 'confirm'"><circle cx="12" cy="8" r="3"/><path d="M5.5 20c.7-3.2 3.1-5 6.5-5s5.8 1.8 6.5 5"/><path d="m16.5 12.5 1.3 1.3 2.5-2.5"/></template>
    <template v-else-if="name === 'complete'"><circle cx="12" cy="12" r="8.5"/><path d="m8.3 12.1 2.4 2.4 5-5"/></template>
    <template v-else-if="name === 'archive'"><path d="M4.5 8h15v11.5h-15zM3.5 4.5h17v3.5h-17z"/><path d="M9 13h6"/></template>
    <template v-else-if="name === 'ability'"><rect x="5" y="4" width="14" height="16" rx="2"/><path d="m8.5 10 1.5 1.5 2.5-3M14 10h2M8.5 15 10 16.5l2.5-3M14 15h2"/></template>
    <template v-else-if="name === 'upload'"><path d="M6.5 18.5H6a3.5 3.5 0 0 1 0-7 6 6 0 0 1 11.5-1.6A4.2 4.2 0 0 1 17 18.5h-.5"/><path d="M12 18V9M8.8 12.2 12 9l3.2 3.2"/></template>
    <template v-else-if="name === 'report'"><path d="M5 20V5h14v15z"/><path d="M8.5 16v-3M12 16V9M15.5 16v-5"/></template>
    <template v-else-if="name === 'export'"><path d="M5 13.5v6h14v-6"/><path d="M12 4v10M8.5 7.5 12 4l3.5 3.5"/></template>
    <template v-else><path d="M4 7.5h16v11H4z"/><path d="M4 10.5h16M8 14h4M8 17h7"/><path d="M7 4.5h10"/></template>
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, default: 'tasks' },
  size: { type: [Number, String], default: 20 },
});
</script>

<style scoped>
.task-icon { display: block; flex: none; }
</style>
