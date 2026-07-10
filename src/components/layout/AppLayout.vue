<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <strong>审计大模型系统</strong>
      </div>

      <nav class="main-nav">
        <RouterLink v-for="item in businessNavItems" :key="item.path" :to="item.path">
          <span class="nav-icon"><AuditIcon :name="item.icon" /></span>
          {{ item.label }}
        </RouterLink>
      </nav>

      <nav class="bottom-nav">
        <RouterLink to="/demo-guide"><span class="nav-icon"><AuditIcon name="collapse" /></span>收起导航</RouterLink>
      </nav>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <span class="crumb">当前位置</span>
          <h1>{{ route.meta.title || '审计任务工作台' }}</h1>
        </div>

        <div class="topbar-right">
          <div class="top-icons" aria-label="全局操作">
            <button class="icon-btn" type="button" aria-label="通知">
              ♢
              <span v-if="!isEmptyMode" class="notice-dot">12</span>
            </button>
            <button class="icon-btn" type="button" aria-label="帮助">?</button>
          </div>
          <div class="user-scope" aria-label="当前用户">
            <span class="user-avatar">●</span>
            <strong>审计管理员</strong>
            <span class="user-caret">⌄</span>
          </div>
        </div>
      </header>

      <div v-if="store.notice && route.path !== '/workbench'" class="notice">{{ store.notice }}</div>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed, inject, watch } from 'vue';
import { useRoute } from 'vue-router';
import AuditIcon from '../common/AuditIcon.vue';

const store = inject('store');
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    store.closeDrawer();
    store.notice = '';
  }
);

const businessNavItems = [
  { icon: 'workbench', label: '审计工作台', path: '/workbench' },
  { icon: 'tasks', label: '任务中心', path: '/tasks' },
  { icon: 'knowledge', label: '审计知识库', path: '/audit-standard/policy' },
  { icon: 'compare', label: '制度比对', path: '/audit-standard/workbench' },
  { icon: 'analysis', label: '专项审计分析', path: '/regulatory/workbench' },
  { icon: 'expense', label: '费用审计分析', path: '/expense/workbench' },
  { icon: 'report', label: '报告智能化', path: '/audit-report/workbench' },
  { icon: 'files', label: '文件中心', path: '/files' },
  { icon: 'config', label: '配置中心', path: '/config' },
  { icon: 'records', label: '记录中心', path: '/records' }
];

const isEmptyMode = computed(() => store.demoDataMode === 'empty');
</script>
