import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ResultView from '../views/ResultView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/result',
    name: 'Result',
    component: ResultView,
  },
];

const getBasePath = () => {
  if (typeof window !== 'undefined') {
    if (
      window.location.hostname.includes('netlify.app') ||
      window.location.hostname.includes('netlify.com')
    ) {
      return '/';
    }
    if (
      window.location.hostname.includes('github.io') ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      return '/political-spectrum/';
    }
  }
  return '/political-spectrum/';
};

const router = createRouter({
  history: createWebHistory(getBasePath()),
  routes,
});

router.afterEach((to) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-W4V1DVT65L', {
      page_path: to.fullPath,
    });
  }
});

export default router;
