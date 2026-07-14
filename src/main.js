import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import { store } from './store/index.js';
import { installViewportScale } from './utils/viewportScale.js';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

const stopViewportScale = installViewportScale();
window.addEventListener('pagehide', stopViewportScale, { once: true });

createApp(App).use(router).provide('store', store).mount('#app');
