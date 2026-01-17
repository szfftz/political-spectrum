<script>
  import { onMounted, onUnmounted } from 'vue';
  import { useRoute } from 'vue-router';

  export default {
    name: 'App',

    components: {},

    setup() {
      const route = useRoute();
      const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      let resizeTimer = null;
      const handleResize = () => {
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(() => {
          setViewportHeight();
        }, 100);
      };

      onMounted(() => {
        setViewportHeight();

        window.addEventListener('resize', handleResize);

        window.addEventListener('orientationchange', setViewportHeight);

        document.addEventListener('visibilitychange', setViewportHeight);
      });

      onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', setViewportHeight);
        document.removeEventListener('visibilitychange', setViewportHeight);
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
      });

      return {
        route,
      };
    },
  };
</script>

<template>
  <div class="app-root d-flex flex-column" style="height: calc(var(--vh, 1vh) * 100); overflow: hidden">
    <div class="d-flex flex-column overflow-hidden" style="flex: 1; min-height: 0">
      <router-view v-slot="{ Component }">
        <component :is="Component" v-if="Component" />
      </router-view>
    </div>
  </div>
</template>

<style>
  @import './assets/css/common.css';
</style>
