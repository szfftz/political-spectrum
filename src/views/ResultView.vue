<template>
  <div
    class="d-flex flex-column align-items-center m-0 p-0 w-100 h-100 overflow-hidden position-relative"
  >
    <div
      ref="diamondContainer"
      class="pe-none"
      style="
        position: fixed;
        z-index: 10000;
        pointer-events: none;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      "
    ></div>
    <div
      ref="mainContainer"
      class="col-12 col-md-10 d-flex flex-column position-relative h-100 overflow-x-hidden"
    >
      <div class="d-flex">
        <div class="d-none d-md-block my-width-20"></div>
        <div
          class="text-center text-md-start d-flex flex-column justify-content-center py-3 my-title-content"
        >
          <div>
            <h1 class="mb-0 my-text-lg my-color-light-gray">
              {{ selectedName ? `${selectedName}的光譜` : '政治人物的光譜' }}
            </h1>
            <div class="my-text-sm my-text-dark-gray pt-3">
              <i class="fa-solid fa-diamond my-diamond-icon"></i> 是你放的位置
            </div>
          </div>
        </div>
        <div class="d-none d-md-block my-side-section my-width-20"></div>
      </div>

      <div
        ref="contentContainer"
        class="d-flex position-relative min-w-0 min-h-0 overflow-hidden my-flex-1-1-0"
      >
        <div ref="leftSection" class="my-side-section position-relative z-1 my-width-20">
          <div
            class="d-flex flex-column gap-2 align-items-end justify-content-center position-absolute top-0 start-0 end-0 bottom-0 pe-2 ps-0"
          >
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              @click="goHome"
              type="button"
            >
              <div
                class="d-flex align-items-center justify-content-center rounded-circle mt-2 my-size-32 my-border-dark-gray"
              >
                <i class="fas fa-arrow-left"></i>
              </div>
              <span class="mt-2">返回首頁</span>
            </button>
          </div>
        </div>

        <div
          ref="centerSection"
          class="flex-grow-1 my-flex-grow-1 position-relative min-w-0 min-h-0 overflow-hidden my-flex-1-1-0"
        ></div>

        <div ref="rightSection" class="my-side-section position-relative z-3 my-width-20">
          <div
            class="left-section d-flex flex-column align-items-start justify-content-center position-absolute top-0 start-0 end-0 bottom-0 ps-2 pe-0 overflow-y-auto gap-4"
          >
            <button
              v-for="name in POLITICIAN_NAMES"
              :key="name"
              class="btn my-button my-text-sm rounded px-2 py-1"
              :class="{ active: selectedName === name }"
              @click="handleNameClick(name)"
              type="button"
            >
              {{ name }}
            </button>
          </div>
        </div>

        <div
          ref="svgContainer"
          class="position-absolute top-0 start-0 end-0 bottom-0 z-2 pe-none"
        ></div>

        <div
          ref="boxesContainer"
          class="position-absolute top-0 start-0 end-0 bottom-0 z-3 pe-none"
        ></div>
      </div>

      <div class="d-flex">
        <div class="d-none d-md-block my-width-20"></div>
        <div
          class="d-flex justify-content-between align-items-center py-2 px-2 px-md-0 my-footer-content"
        >
          <div class="d-flex align-items-center gap-3">
            <span class="my-text-sm my-text-dark-gray">共有 {{ totalDataPoints }} 個點</span>
          </div>

          <div class="my-text-sm my-text-dark-gray">szfftz</div>
        </div>
        <div class="d-none d-md-block my-width-20"></div>
      </div>
    </div>

    <div v-if="loading" class="my-loading-overlay text-center my-text-dark-gray">
      <div class="spinner-border mb-3 my-spinner-lg" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-3 mb-0 my-text-sm my-text-dark-gray">正在載入數據...</p>
    </div>

    <div v-if="error" class="my-error-overlay text-center p-5 rounded my-text-dark-gray">
      <div class="alert alert-danger mb-0" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i><strong>錯誤：</strong>{{ error }}
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import * as d3 from 'd3';
  import { getSupabaseClient, isConfigured } from '../config/supabase.js';
  import { POLITICIAN_NAMES } from '../config/constants.js';
  import { getCSSVariable, createGradientSpectrum } from '../utils/utils.js';

  export default {
    name: 'ResultView',
    setup() {
      const router = useRouter();
      const mainContainer = ref(null);
      const contentContainer = ref(null);
      const svgContainer = ref(null);
      const boxesContainer = ref(null);
      const diamondContainer = ref(null);
      const leftSection = ref(null);
      const centerSection = ref(null);
      const rightSection = ref(null);
      const rightSectionWidth = ref(0);
      let svg = null;
      let resizeTimer = null;
      const loading = ref(false);
      const error = ref(null);
      const allDataPoints = ref([]);
      const totalDataPoints = ref(0);
      const selectedName = ref(null);
      const cookieDataPoints = ref([]);

      const colors = {
        blue: getCSSVariable('--my-color-blue'),
        green: getCSSVariable('--my-color-green'),
        red: getCSSVariable('--my-color-red'),
        white: getCSSVariable('--my-color-white'),
        yellow: getCSSVariable('--my-color-yellow'),
        dataPoint: getCSSVariable('--my-color-data-point'),
        backgroundGray: getCSSVariable('--my-color-background-gray'),
        darkGray: getCSSVariable('--my-color-dark-gray'),
      };

      const cookieUtils = {
        get(name) {
          const nameEQ = name + '=';
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
            if (cookie.indexOf(nameEQ) === 0) {
              return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
            }
          }
          return null;
        },
      };

      const loadCookieData = () => {
        const cookiePointsMap = new Map();

        let positionsMap = null;
        const savedPositionsJSON = cookieUtils.get('political-spectrum_positions');
        if (savedPositionsJSON) {
          try {
            const parsed = JSON.parse(savedPositionsJSON);
            if (parsed && typeof parsed === 'object') {
              positionsMap = parsed;
            }
          } catch (e) {
            positionsMap = null;
          }
        }

        POLITICIAN_NAMES.forEach((name) => {
          const fromJson = positionsMap?.[name];
          const xPercent =
            fromJson?.x !== undefined && fromJson?.x !== null
              ? String(fromJson.x)
              : cookieUtils.get(`political-spectrum_${name}_x`);
          const yPercent =
            fromJson?.y !== undefined && fromJson?.y !== null
              ? String(fromJson.y)
              : cookieUtils.get(`political-spectrum_${name}_y`);

          if (
            xPercent !== null &&
            yPercent !== null &&
            xPercent !== '-1' &&
            yPercent !== '-1' &&
            xPercent !== undefined &&
            yPercent !== undefined
          ) {
            cookiePointsMap.set(name, {
              name: name,
              x: parseFloat(xPercent),
              y: parseFloat(yPercent),
            });
          }
        });

        cookieDataPoints.value = Array.from(cookiePointsMap.values());
      };

      const calculateSideSectionWidth = (containerWidth) => {
        if (!containerWidth || containerWidth <= 0) return 0;
        return containerWidth * 0.2;
      };

      const loadData = async (name = null) => {
        allDataPoints.value = [];
        if (svgContainer.value) {
          d3.select(svgContainer.value).selectAll('svg').remove();
        }

        if (!isConfigured()) {
          error.value = 'Supabase 配置未完成';
          loading.value = false;
          totalDataPoints.value = 0;

          setTimeout(() => {
            drawVisualization();
          }, 100);
          return;
        }

        try {
          const supabase = getSupabaseClient();

          const allResults = [];
          const pageSize = 1000;
          let from = 0;
          let hasMore = true;
          let totalCount = null;

          while (hasMore) {
            let pageQuery = supabase.from('data').select('*', { count: 'exact' });

            if (name) {
              pageQuery = pageQuery.eq('name', name);
            }

            const {
              data: pageData,
              error: queryError,
              count,
            } = await pageQuery
              .order('update_at', { ascending: false })
              .range(from, from + pageSize - 1);

            if (queryError) {
              throw new Error(`查詢數據時發生錯誤: ${queryError.message}`);
            }

            if (count !== null && totalCount === null) {
              totalCount = count;
            }

            if (pageData && pageData.length > 0) {
              allResults.push(...pageData);
              from += pageSize;

              if (pageData.length < pageSize) {
                hasMore = false;
              }
            } else {
              hasMore = false;
            }
          }

          const resultData = allResults;

          if (!resultData) {
            allDataPoints.value = [];
            totalDataPoints.value = 0;
            loading.value = false;
            loadCookieData();
            setTimeout(() => {
              drawVisualization();
            }, 100);
            return;
          }

          const validPoints = resultData.filter((item) => {
            const x = parseFloat(item.x);
            const y = parseFloat(item.y);

            return (
              x !== -1 &&
              y !== -1 &&
              item.x !== null &&
              item.y !== null &&
              item.x !== undefined &&
              item.y !== undefined &&
              !isNaN(x) &&
              !isNaN(y)
            );
          });

          allDataPoints.value = validPoints;

          totalDataPoints.value =
            totalCount !== null ? totalCount : resultData ? resultData.length : 0;
        } catch (err) {
          error.value = err.message;
          totalDataPoints.value = 0;
        } finally {
          loading.value = false;

          loadCookieData();
          setTimeout(() => {
            drawVisualization();
          }, 100);
        }
      };

      const handleNameClick = (name) => {
        if (selectedName.value === name) {
          selectedName.value = null;

          allDataPoints.value = [];
          totalDataPoints.value = 0;
          loading.value = false;

          if (svgContainer.value) {
            d3.select(svgContainer.value).selectAll('svg').remove();
          }

          loadCookieData();

          setTimeout(() => {
            drawVisualization();
          }, 100);
        } else {
          selectedName.value = name;
          loading.value = true;
          loadData(selectedName.value);
        }
      };

      const drawVisualization = () => {
        if (!svgContainer.value || !contentContainer.value) return;

        d3.select(svgContainer.value).selectAll('svg').remove();

        const containerRect = contentContainer.value.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        const firstSectionWidth = calculateSideSectionWidth(containerWidth);
        const rightWidth = calculateSideSectionWidth(containerWidth);
        rightSectionWidth.value = rightWidth;

        const titleAreaHeight = 0;

        const gradientAreaWidth = containerWidth - firstSectionWidth - rightWidth;
        const gradientAreaHeight = containerHeight - titleAreaHeight;

        const gradientAreaLeft = firstSectionWidth;
        const gradientAreaTop = titleAreaHeight;

        svg = d3
          .select(svgContainer.value)
          .append('svg')
          .attr('width', containerWidth)
          .attr('height', containerHeight)
          .attr('class', 'd-block position-relative w-100 h-100')
          .style('pointer-events', 'none');

        createGradientSpectrum({
          svg,
          colors,
          gradientAreaLeft,
          gradientAreaTop,
          gradientAreaWidth,
          gradientAreaHeight,
        });

        if (allDataPoints.value.length > 0) {
          const points = allDataPoints.value.map((item) => {
            const xPercent = parseFloat(item.x);
            const yPercent = parseFloat(item.y);

            const x = gradientAreaLeft + (xPercent / 100) * gradientAreaWidth;
            const y = gradientAreaTop + (yPercent / 100) * gradientAreaHeight;

            return {
              name: item.name,
              x: x,
              y: y,
              xPercent: xPercent,
              yPercent: yPercent,
            };
          });

          const pointsGroup = svg.append('g').attr('class', 'data-points');
          points.forEach((point) => {
            pointsGroup
              .append('circle')
              .attr('cx', point.x)
              .attr('cy', point.y)
              .attr('r', 2)
              .attr('fill', colors.darkGray)
              .attr('opacity', 0.5);
          });
        }

        if (diamondContainer.value && contentContainer.value) {
          diamondContainer.value.innerHTML = '';

          if (selectedName.value && cookieDataPoints.value.length > 0) {
            const selectedCookiePoint = cookieDataPoints.value.find(
              (item) => item.name === selectedName.value
            );

            if (selectedCookiePoint) {
              const xPercent = parseFloat(selectedCookiePoint.x);
              const yPercent = parseFloat(selectedCookiePoint.y);

              const xInContent = gradientAreaLeft + (xPercent / 100) * gradientAreaWidth;
              const yInContent = gradientAreaTop + (yPercent / 100) * gradientAreaHeight;

              const contentRect = contentContainer.value.getBoundingClientRect();

              const x = contentRect.left + xInContent;
              const y = contentRect.top + yInContent;

              const iconSize = 16;
              const iconOffset = iconSize / 2;

              const diamondElement = document.createElement('div');
              diamondElement.className =
                'position-absolute d-flex align-items-center justify-content-center';
              diamondElement.style.left = `${x - iconOffset}px`;
              diamondElement.style.top = `${y - iconOffset}px`;
              diamondElement.style.width = `${iconSize}px`;
              diamondElement.style.height = `${iconSize}px`;
              diamondElement.setAttribute('data-name', selectedCookiePoint.name);

              const iconElement = document.createElement('i');
              iconElement.className = 'fa-solid fa-diamond my-diamond-icon';
              iconElement.style.fontSize = `${iconSize}px`;

              diamondElement.appendChild(iconElement);
              diamondContainer.value.appendChild(diamondElement);
            }
          }
        }
      };

      const handleResize = () => {
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(() => {
          if (!loading.value && allDataPoints.value.length > 0) {
            drawVisualization();
          }
        }, 100);
      };

      const goHome = () => {
        router.push('/');
      };

      onMounted(async () => {
        const isLocalhost =
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname === '::1';

        const cookieId = cookieUtils.get('political-spectrum_id');
        if (!cookieId && !isLocalhost) {
          await router.push('/');
          return;
        }

        loadCookieData();

        if (POLITICIAN_NAMES.length > 0) {
          selectedName.value = POLITICIAN_NAMES[0];
          loading.value = true;
          loadData(selectedName.value);
        } else {
          loading.value = false;
        }
        window.addEventListener('resize', handleResize);
      });

      onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
      });

      return {
        mainContainer,
        contentContainer,
        svgContainer,
        boxesContainer,
        diamondContainer,
        leftSection,
        centerSection,
        rightSection,
        rightSectionWidth,
        loading,
        error,
        goHome,
        POLITICIAN_NAMES,
        selectedName,
        handleNameClick,
        allDataPoints,
        totalDataPoints,
      };
    },
  };
</script>

<style>
  @import '../assets/css/common.css';
</style>
