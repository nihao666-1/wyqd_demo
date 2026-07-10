<template>
  <svg class="audit-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <g v-if="name === 'workbench'">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 10h16M9 5v14M8 14h2M13 14h3" />
    </g>
    <g v-else-if="name === 'tasks'">
      <path d="M8 6h11M8 12h11M8 18h11" />
      <path d="M4.5 6.2l.8.8 1.5-1.8M4.5 12.2l.8.8 1.5-1.8M4.5 18.2l.8.8 1.5-1.8" />
    </g>
    <g v-else-if="name === 'knowledge'">
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21V5.5Z" />
      <path d="M9 7h7M9 11h7M9 15h4" />
    </g>
    <g v-else-if="name === 'compare'">
      <rect x="4" y="5" width="7" height="12" rx="1.5" />
      <rect x="13" y="7" width="7" height="12" rx="1.5" />
      <path d="M8 3v4M16 17v4M10 11h4M12 9l2 2-2 2" />
    </g>
    <g v-else-if="name === 'analysis'">
      <path d="M4 19V5M4 19h16" />
      <path d="M8 16v-5M12 16V8M16 16v-8" />
      <path d="M7 7.5 11 5l4 2 4-4" />
    </g>
    <g v-else-if="name === 'expense'">
      <path d="M7 3h10v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </g>
    <g v-else-if="name === 'report'">
      <path d="M7 3h7l4 4v14H7V3Z" />
      <path d="M14 3v5h4M9 12h7M9 16h7" />
    </g>
    <g v-else-if="name === 'files'">
      <path d="M3.5 7.5h6l1.8 2H20.5v8.5A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V7.5Z" />
      <path d="M3.5 10h17" />
    </g>
    <g v-else-if="name === 'config'">
      <path d="M5 7h14M5 12h14M5 17h14" />
      <circle cx="9" cy="7" r="1.8" />
      <circle cx="15" cy="12" r="1.8" />
      <circle cx="11" cy="17" r="1.8" />
    </g>
    <g v-else-if="name === 'records'">
      <path d="M5 5h14v14H5z" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </g>
    <g v-else-if="name === 'collapse'">
      <path d="M14 6 8 12l6 6M20 6l-6 6 6 6" />
    </g>
    <g v-else-if="name === 'in-progress'">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
    </g>
    <g v-else-if="name === 'anomaly'">
      <path d="M12 4 21 20H3L12 4Z" />
      <path d="M12 9v5M12 17h.01" />
    </g>
    <g v-else-if="name === 'review'">
      <path d="M7 3h7l4 4v14H7V3Z" />
      <path d="M14 3v5h4M9 15l2 2 4-5" />
    </g>
    <g v-else-if="name === 'failed'">
      <circle cx="12" cy="12" r="8" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </g>
    <g v-else-if="name === 'create'">
      <path d="M7 4h7l4 4v12H7V4Z" />
      <path d="M14 4v5h4M12 12v5M9.5 14.5h5" />
    </g>
    <g v-else-if="name === 'upload'">
      <path d="M4 17v2h16v-2" />
      <path d="M12 15V4M8 8l4-4 4 4" />
    </g>
    <g v-else-if="name === 'qa'">
      <path d="M5 5h14v10H9l-4 4V5Z" />
      <path d="M10 9a2 2 0 1 1 3 1.7c-.7.4-1 .8-1 1.3M12 15h.01" />
    </g>
    <g v-else-if="name === 'monitor'">
      <path d="M4 12h4l2-5 4 10 2-5h4" />
      <path d="M5 20h14" />
    </g>
    <g v-else-if="name === 'report-generate'">
      <path d="M7 3h7l4 4v14H7V3Z" />
      <path d="M14 3v5h4M9 14h6M9 18h4M10 10l2-2 2 2" />
    </g>
    <g v-else>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.audit-icon {
  width: 1em;
  height: 1em;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
