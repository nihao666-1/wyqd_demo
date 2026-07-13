<template><p class="route-forward" role="status">正在进入费用审计结果页…</p></template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
onMounted(() => router.replace('/expense/anomaly/dashboard'));
</script>

<style scoped>.route-forward{padding:24px;color:#667085}</style>
