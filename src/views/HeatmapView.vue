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
              <div class="d-flex align-items-center mb-1">
                <span class="d-flex align-items-center me-2">
                  <i
                    class="fa-solid fa-diamond me-1"
                    style="color: var(--my-color-yellow); font-size: 0.875rem"
                  ></i>
                  <span>平均 ({{ meanCenter.x.toFixed(2) }}, {{ meanCenter.y.toFixed(2) }})</span>
                  <span
                    class="ms-2 d-inline-block"
                    :style="{
                      width: '12px',
                      height: '12px',
                      backgroundColor: meanCenterColor,
                      border: '1px solid rgba(0,0,0,0.2)',
                    }"
                  ></span>
                  <span v-if="meanCenterHex" class="ms-1">{{ meanCenterHex }}</span>
                </span>
                <span class="mx-2">|</span>
                <span class="d-flex align-items-center me-2">
                  <i
                    class="fa-solid fa-diamond me-1"
                    style="color: var(--my-color-red); font-size: 0.875rem"
                  ></i>
                  <span
                    >中位數 ({{ medianCenter.x.toFixed(2) }}, {{ medianCenter.y.toFixed(2) }})</span
                  >
                  <span
                    class="ms-2 d-inline-block"
                    :style="{
                      width: '12px',
                      height: '12px',
                      backgroundColor: medianCenterColor,
                      border: '1px solid rgba(0,0,0,0.2)',
                    }"
                  ></span>
                  <span v-if="medianCenterHex" class="ms-1">{{ medianCenterHex }}</span>
                </span>
                <span class="mx-2">|</span>
                <span class="d-flex align-items-center me-2">
                  <i
                    class="fa-solid fa-diamond me-1"
                    style="color: var(--my-color-green); font-size: 0.875rem"
                  ></i>
                  <span
                    >中心 ({{ centralFeature.x.toFixed(2) }},
                    {{ centralFeature.y.toFixed(2) }})</span
                  >
                  <span
                    class="ms-2 d-inline-block"
                    :style="{
                      width: '12px',
                      height: '12px',
                      backgroundColor: centralFeatureColor,
                      border: '1px solid rgba(0,0,0,0.2)',
                    }"
                  ></span>
                  <span v-if="centralFeatureHex" class="ms-1">{{ centralFeatureHex }}</span>
                </span>
              </div>
              <div class="d-flex align-items-center">
                <span
                  >三角形面積平均：{{ averageTriangleArea.toFixed(2) }} 三角形面積中位數：{{
                    medianTriangleArea.toFixed(2)
                  }}
                  | MST線平均長度：{{ averageMSTEdgeLength.toFixed(2) }} MST線中位數：{{
                    medianMSTEdgeLength.toFixed(2)
                  }}
                  | NNR: {{ nearestNeighborRatio.toFixed(3) }}</span
                >
              </div>
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
              style="min-width: 100px"
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
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleDataPoints"
              type="button"
            >
              <span style="text-align: center">{{ showDataPoints ? '隱藏黑點' : '顯示黑點' }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleColorPoints"
              type="button"
            >
              <span style="text-align: center">{{
                showColorPoints ? '隱藏彩點' : '顯示彩點'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleCenterPoint"
              type="button"
            >
              <span style="text-align: center">{{
                showCenterPoint ? '隱藏中心點' : '顯示中心點'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleDBSCAN"
              type="button"
            >
              <span style="text-align: center">{{ showDBSCAN ? '隱藏分群' : '顯示分群' }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleMST"
              type="button"
            >
              <span style="text-align: center">{{ showMST ? '隱藏MST' : '顯示MST' }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleSDE"
              type="button"
            >
              <span style="text-align: center">{{ showSDE ? '隱藏橢圓' : '顯示橢圓' }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleDelaunay"
              type="button"
            >
              <span style="text-align: center">{{ showDelaunay ? '隱藏三角' : '顯示三角' }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleDelaunayFill"
              type="button"
            >
              <span style="text-align: center">{{
                showDelaunayFill ? '隱藏三角填' : '顯示三角填'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleColorDelaunay"
              type="button"
            >
              <span style="text-align: center">{{
                showColorDelaunay ? '隱藏彩色三角' : '顯示彩色三角'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleDarkGrid"
              type="button"
            >
              <span style="text-align: center">{{
                showDarkGrid ? '隱藏黑網格' : '顯示黑網格'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleGrid"
              type="button"
            >
              <span style="text-align: center">{{ showGrid ? '隱藏白網格' : '顯示白網格' }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleColorGrid"
              type="button"
            >
              <span style="text-align: center">{{
                showColorGrid ? '隱藏色網格' : '顯示色網格'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleGradient"
              type="button"
            >
              <span style="text-align: center">{{ showGradient ? '隱藏漸層' : '顯示漸層' }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="downloadImage"
              type="button"
            >
              <span style="text-align: center">下載圖片</span>
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

    <div
      ref="tooltip"
      class="my-tooltip position-fixed bg-dark text-white px-2 py-1 rounded"
      style="
        pointer-events: none;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.2s;
        font-size: 12px;
      "
    >
      0 個點
    </div>
  </div>
</template>

<script>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import * as d3 from 'd3';
  import { Delaunay } from 'd3-delaunay';
  import { getSupabaseClient, isConfigured } from '../config/supabase.js';
  import { POLITICIAN_NAMES } from '../config/constants.js';
  import { getCSSVariable, createGradientSpectrum } from '../utils/utils.js';

  export default {
    name: 'HeatmapView',
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
      const tooltip = ref(null);
      const showGrid = ref(false);
      const showColorGrid = ref(false);
      const showGradient = ref(true);
      const showDarkGrid = ref(false);
      const showDataPoints = ref(true);
      const showColorPoints = ref(false);
      const showDelaunay = ref(false);
      const showDelaunayFill = ref(false);
      const showColorDelaunay = ref(false);
      const showSDE = ref(false);
      const showDBSCAN = ref(false);
      const showMST = ref(false);
      const showCenterPoint = ref(true);
      const averageTriangleArea = ref(0);
      const medianTriangleArea = ref(0);
      const nearestNeighborRatio = ref(0);
      const averageMSTEdgeLength = ref(0);
      const medianMSTEdgeLength = ref(0);
      const meanCenter = ref({ x: 0, y: 0 });
      const medianCenter = ref({ x: 0, y: 0 });
      const centralFeature = ref({ x: 0, y: 0 });
      let svg = null;
      let cellGroup = null;
      let colorGridGroup = null;
      let gradientGroup = null;
      let darkGridGroup = null;
      let pointsGroup = null;
      let colorPointsGroup = null;
      let delaunayGroup = null;
      let delaunayFillGroup = null;
      let colorDelaunayGroup = null;
      let sdeGroup = null;
      let dbscanGroup = null;
      let mstGroup = null;
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

      const getInterpolatedColorAtPosition = (xPercent, yPercent) => {
        const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
        const lerp = (start, end, t) => start + (end - start) * t;
        const parseColor = (color) => {
          const parsed = d3.color(color);
          if (!parsed) return { r: 0, g: 0, b: 0 };
          const rgb = parsed.rgb();
          return { r: rgb.r, g: rgb.g, b: rgb.b };
        };

        const x = clamp(xPercent, 0, 1);
        const y = clamp(yPercent, 0, 1);

        const topLeft = parseColor(colors.blue || 'hsl(210, 85%, 65%)');
        const topRight = parseColor(colors.red || 'hsl(0, 85%, 65%)');
        const bottomLeft = parseColor(colors.green || 'hsl(150, 85%, 65%)');
        const bottomRight = parseColor(colors.white || 'hsl(210, 60%, 92%)');

        const top = {
          r: lerp(topLeft.r, topRight.r, x),
          g: lerp(topLeft.g, topRight.g, x),
          b: lerp(topLeft.b, topRight.b, x),
        };
        const bottom = {
          r: lerp(bottomLeft.r, bottomRight.r, x),
          g: lerp(bottomLeft.g, bottomRight.g, x),
          b: lerp(bottomLeft.b, bottomRight.b, x),
        };

        const r = Math.round(lerp(top.r, bottom.r, y));
        const g = Math.round(lerp(top.g, bottom.g, y));
        const b = Math.round(lerp(top.b, bottom.b, y));

        return `rgb(${r}, ${g}, ${b})`;
      };

      // 将 RGB 颜色字符串转换为 hex
      const rgbToHex = (rgbString) => {
        if (!rgbString || rgbString === 'transparent') {
          return '';
        }
        const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) {
          return '';
        }
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        const toHex = (n) => {
          const hex = n.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
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
        cellGroup = null;
        colorGridGroup = null;
        gradientGroup = null;
        darkGridGroup = null;
        pointsGroup = null;
        colorPointsGroup = null;
        colorPointsGroup = null;
        delaunayGroup = null;
        delaunayFillGroup = null;
        colorDelaunayGroup = null;
        sdeGroup = null;
        dbscanGroup = null;
        mstGroup = null;

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

        gradientGroup = createGradientSpectrum({
          svg,
          colors,
          gradientAreaLeft,
          gradientAreaTop,
          gradientAreaWidth,
          gradientAreaHeight,
        });
        if (gradientGroup) {
          gradientGroup.style('display', showGradient.value ? 'block' : 'none');
        }

        // 绘制网格
        const gridColumns = 20;
        const gridRows = 20;
        const cellWidth = gradientAreaWidth / gridColumns;
        const cellHeight = gradientAreaHeight / gridRows;

        // 计算每个网格单元格中的点数
        const cellPointCounts = new Map();
        if (allDataPoints.value.length > 0) {
          allDataPoints.value.forEach((item) => {
            const xPercent = parseFloat(item.x);
            const yPercent = parseFloat(item.y);

            const x = gradientAreaLeft + (xPercent / 100) * gradientAreaWidth;
            const y = gradientAreaTop + (yPercent / 100) * gradientAreaHeight;

            let col = Math.floor((x - gradientAreaLeft) / cellWidth);
            let row = Math.floor((y - gradientAreaTop) / cellHeight);

            // 确保索引在有效范围内
            col = Math.max(0, Math.min(col, gridColumns - 1));
            row = Math.max(0, Math.min(row, gridRows - 1));

            const cellKey = `${col},${row}`;
            cellPointCounts.set(cellKey, (cellPointCounts.get(cellKey) || 0) + 1);
          });
        }

        // 找到最大点数
        let maxCount = 0;
        cellPointCounts.forEach((count) => {
          if (count > maxCount) {
            maxCount = count;
          }
        });

        // 绘制颜色提示网格（在渐层上方，白色网格下方）
        colorGridGroup = svg
          .append('g')
          .attr('class', 'color-grid-cells')
          .style('pointer-events', 'all')
          .style('display', showColorGrid.value ? 'block' : 'none');
        for (let row = 0; row < gridRows; row++) {
          for (let col = 0; col < gridColumns; col++) {
            const x = gradientAreaLeft + col * cellWidth;
            const y = gradientAreaTop + row * cellHeight;
            const centerXPercent = (col + 0.5) / gridColumns;
            const centerYPercent = (row + 0.5) / gridRows;
            const gradientColor = getInterpolatedColorAtPosition(centerXPercent, centerYPercent);

            colorGridGroup
              .append('rect')
              .attr('x', x)
              .attr('y', y)
              .attr('width', cellWidth)
              .attr('height', cellHeight)
              .attr('fill', gradientColor)
              .attr('stroke', 'none')
              .on('mouseover', function (event) {
                if (tooltip.value) {
                  const tooltipElement = tooltip.value;
                  tooltipElement.textContent = gradientColor;
                  tooltipElement.style.opacity = '1';
                  tooltipElement.style.left = `${event.pageX + 10}px`;
                  tooltipElement.style.top = `${event.pageY + 10}px`;
                }
              })
              .on('mouseout', function () {
                if (tooltip.value) {
                  tooltip.value.style.opacity = '0';
                }
              });
          }
        }

        // 绘制可交互的网格单元格（填充矩形）
        cellGroup = svg
          .append('g')
          .attr('class', 'grid-cells')
          .style('pointer-events', 'all')
          .style('display', showGrid.value ? 'block' : 'none');
        for (let row = 0; row < gridRows; row++) {
          for (let col = 0; col < gridColumns; col++) {
            const x = gradientAreaLeft + col * cellWidth;
            const y = gradientAreaTop + row * cellHeight;
            const cellKey = `${col},${row}`;
            const pointCount = cellPointCounts.get(cellKey) || 0;

            // 计算 opacity: 0个点 = 1.0 (100%), 最多点 = 0.0 (0%)
            const opacity = maxCount > 0 ? 1 - pointCount / maxCount : 1.0;

            cellGroup
              .append('rect')
              .attr('x', x)
              .attr('y', y)
              .attr('width', cellWidth)
              .attr('height', cellHeight)
              .attr('fill', colors.backgroundGray)
              .attr('fill-opacity', opacity)
              .attr('stroke', 'none')
              .attr('data-point-count', pointCount)
              .on('mouseover', function (event) {
                if (tooltip.value) {
                  const tooltipElement = tooltip.value;
                  tooltipElement.textContent = `${pointCount} 個點`;
                  tooltipElement.style.opacity = '1';
                  tooltipElement.style.left = `${event.pageX + 10}px`;
                  tooltipElement.style.top = `${event.pageY + 10}px`;
                }
              })
              .on('mouseout', function () {
                if (tooltip.value) {
                  tooltip.value.style.opacity = '0';
                }
              });
          }
        }

        // 绘制黑网格（在白网格上面）- 有点不填充，没点用深灰色填充
        darkGridGroup = svg
          .append('g')
          .attr('class', 'dark-grid-cells')
          .style('pointer-events', 'all')
          .style('display', showDarkGrid.value ? 'block' : 'none');
        for (let row = 0; row < gridRows; row++) {
          for (let col = 0; col < gridColumns; col++) {
            const x = gradientAreaLeft + col * cellWidth;
            const y = gradientAreaTop + row * cellHeight;
            const cellKey = `${col},${row}`;
            const pointCount = cellPointCounts.get(cellKey) || 0;

            // 如果有点，不填充（transparent）；如果没有点，用深灰色填充
            const fillColor = pointCount > 0 ? 'transparent' : colors.darkGray;

            darkGridGroup
              .append('rect')
              .attr('x', x)
              .attr('y', y)
              .attr('width', cellWidth)
              .attr('height', cellHeight)
              .attr('fill', fillColor)
              .attr('stroke', 'none')
              .attr('data-point-count', pointCount)
              .on('mouseover', function (event) {
                if (tooltip.value) {
                  const tooltipElement = tooltip.value;
                  tooltipElement.textContent = `${pointCount} 個點`;
                  tooltipElement.style.opacity = '1';
                  tooltipElement.style.left = `${event.pageX + 10}px`;
                  tooltipElement.style.top = `${event.pageY + 10}px`;
                }
              })
              .on('mouseout', function () {
                if (tooltip.value) {
                  tooltip.value.style.opacity = '0';
                }
              });
          }
        }

        // 绘制 Delaunay 三角剖分（在数据点下方）
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

          // 创建 Delaunay 三角剖分
          const pointsArray = points.map((p) => [p.x, p.y]);
          const delaunay = Delaunay.from(pointsArray);
          const triangles = delaunay.triangles;

          // 计算每个三角形的面积和边长
          const triangleAreas = [];
          const edgeLengths = [];
          const triangleData = [];
          for (let i = 0; i < triangles.length; i += 3) {
            const i0 = triangles[i];
            const i1 = triangles[i + 1];
            const i2 = triangles[i + 2];

            const x0 = pointsArray[i0][0];
            const y0 = pointsArray[i0][1];
            const x1 = pointsArray[i1][0];
            const y1 = pointsArray[i1][1];
            const x2 = pointsArray[i2][0];
            const y2 = pointsArray[i2][1];

            // 计算三角形面积：|(x1-x0)(y2-y0) - (x2-x0)(y1-y0)| / 2
            const area = Math.abs((x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0)) / 2;

            // 计算三条边的长度
            const edge1 = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
            const edge2 = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const edge3 = Math.sqrt((x0 - x2) ** 2 + (y0 - y2) ** 2);

            // 使用最长边作为代表
            const maxEdge = Math.max(edge1, edge2, edge3);

            triangleAreas.push(area);
            edgeLengths.push(maxEdge);
            triangleData.push({ x0, y0, x1, y1, x2, y2, area, maxEdge, i0, i1, i2 });
          }

          // 找到最小和最大面积
          const minArea = Math.min(...triangleAreas);
          const maxArea = Math.max(...triangleAreas);

          // 计算平均面积
          const avgArea =
            triangleAreas.length > 0
              ? triangleAreas.reduce((sum, area) => sum + area, 0) / triangleAreas.length
              : 0;
          averageTriangleArea.value = avgArea;

          // 计算中位数面积
          let medianArea = 0;
          if (triangleAreas.length > 0) {
            const sortedAreas = [...triangleAreas].sort((a, b) => a - b);
            const mid = Math.floor(sortedAreas.length / 2);
            medianArea =
              sortedAreas.length % 2 === 0
                ? (sortedAreas[mid - 1] + sortedAreas[mid]) / 2
                : sortedAreas[mid];
          }
          medianTriangleArea.value = medianArea;

          // 计算 Nearest Neighbor Ratio (NNR)
          if (points.length >= 2) {
            // 计算每个点到其最近邻点的距离
            const nearestNeighborDistances = [];
            for (let i = 0; i < points.length; i++) {
              let minDist = Infinity;
              for (let j = 0; j < points.length; j++) {
                if (i !== j) {
                  const dx = points[i].x - points[j].x;
                  const dy = points[i].y - points[j].y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < minDist) {
                    minDist = dist;
                  }
                }
              }
              if (minDist !== Infinity) {
                nearestNeighborDistances.push(minDist);
              }
            }

            // 计算平均最近邻距离
            const avgObservedDistance =
              nearestNeighborDistances.length > 0
                ? nearestNeighborDistances.reduce((sum, dist) => sum + dist, 0) /
                  nearestNeighborDistances.length
                : 0;

            // 计算期望最近邻距离
            // 期望距离 = 1 / (2 * sqrt(密度))
            // 密度 = 点的数量 / 面积
            const area = gradientAreaWidth * gradientAreaHeight;
            const density = points.length / area;
            const expectedDistance = density > 0 ? 1 / (2 * Math.sqrt(density)) : 0;

            // 计算 NNR
            const nnr = expectedDistance > 0 ? avgObservedDistance / expectedDistance : 0;
            nearestNeighborRatio.value = nnr;
          } else {
            nearestNeighborRatio.value = 0;
          }

          // 找到最短和最长边
          const minEdge = Math.min(...edgeLengths);
          const maxEdge = Math.max(...edgeLengths);

          // 使用 d3 scale 创建 opacity 映射：最小面积 -> 0%，最大面积 -> 100%
          const opacityScale =
            minArea < maxArea
              ? d3.scaleLinear().domain([minArea, maxArea]).range([0, 1])
              : d3.scaleLinear().domain([minArea, minArea]).range([0, 1]);

          // 使用 d3 scale 创建边长 opacity 映射：最短边 -> 100%，最长边 -> 0%
          const edgeOpacityScale =
            minEdge < maxEdge
              ? d3.scaleLinear().domain([minEdge, maxEdge]).range([1, 0])
              : d3.scaleLinear().domain([minEdge, minEdge]).range([1, 1]);

          // 绘制填充的三角形（在三角剖分下方）
          delaunayFillGroup = svg.append('g').attr('class', 'delaunay-fill');
          if (delaunayFillGroup) {
            delaunayFillGroup.style('display', showDelaunayFill.value ? 'block' : 'none');
          }

          // 创建一个唯一的 mask ID
          const maskId = `triangle-mask-${Date.now()}`;
          const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');

          // 创建 mask：白色区域显示，黑色区域隐藏
          const mask = defs.append('mask').attr('id', maskId);

          // mask 的背景设为白色（显示）
          mask
            .append('rect')
            .attr('x', gradientAreaLeft)
            .attr('y', gradientAreaTop)
            .attr('width', gradientAreaWidth)
            .attr('height', gradientAreaHeight)
            .attr('fill', 'white');

          // 将所有三角形区域设为黑色（隐藏）
          triangleData.forEach((triangle) => {
            mask
              .append('polygon')
              .attr(
                'points',
                `${triangle.x0},${triangle.y0} ${triangle.x1},${triangle.y1} ${triangle.x2},${triangle.y2}`
              )
              .attr('fill', 'black');
          });

          // 绘制背景矩形（只在三角形外显示）
          delaunayFillGroup
            .append('rect')
            .attr('x', gradientAreaLeft)
            .attr('y', gradientAreaTop)
            .attr('width', gradientAreaWidth)
            .attr('height', gradientAreaHeight)
            .attr('fill', colors.backgroundGray)
            .attr('mask', `url(#${maskId})`);

          // 绘制三角形（带有根据面积计算的 opacity）
          triangleData.forEach((triangle) => {
            const opacity = opacityScale(triangle.area);
            delaunayFillGroup
              .append('polygon')
              .attr(
                'points',
                `${triangle.x0},${triangle.y0} ${triangle.x1},${triangle.y1} ${triangle.x2},${triangle.y2}`
              )
              .attr('fill', colors.backgroundGray)
              .attr('fill-opacity', opacity)
              .attr('stroke', 'none');
          });

          // 绘制三角剖分线条（在填充上方）
          delaunayGroup = svg.append('g').attr('class', 'delaunay-triangles');
          if (delaunayGroup) {
            delaunayGroup.style('display', showDelaunay.value ? 'block' : 'none');
          }

          triangleData.forEach((triangle) => {
            const strokeOpacity = edgeOpacityScale(triangle.maxEdge);
            delaunayGroup
              .append('polygon')
              .attr(
                'points',
                `${triangle.x0},${triangle.y0} ${triangle.x1},${triangle.y1} ${triangle.x2},${triangle.y2}`
              )
              .attr('fill', 'none')
              .attr('stroke', colors.darkGray)
              .attr('stroke-width', 0.5)
              .attr('stroke-opacity', strokeOpacity);
          });

          // 计算标准偏差椭圆 (Standard Deviational Ellipse, SDE)
          if (points.length >= 2) {
            // 计算平均值（中心）
            const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
            const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

            // 计算协方差矩阵的元素
            let covXX = 0;
            let covYY = 0;
            let covXY = 0;

            points.forEach((p) => {
              const dx = p.x - meanX;
              const dy = p.y - meanY;
              covXX += dx * dx;
              covYY += dy * dy;
              covXY += dx * dy;
            });

            const n = points.length;
            covXX /= n - 1;
            covYY /= n - 1;
            covXY /= n - 1;

            // 计算协方差矩阵的特征值和特征向量
            const trace = covXX + covYY;
            const det = covXX * covYY - covXY * covXY;
            const discriminant = trace * trace - 4 * det;

            if (discriminant >= 0) {
              const sqrtDisc = Math.sqrt(discriminant);
              const lambda1 = (trace + sqrtDisc) / 2; // 较大特征值
              const lambda2 = (trace - sqrtDisc) / 2; // 较小特征值

              // 计算主特征向量（对应较大特征值）
              let v1X, v1Y;
              if (Math.abs(covXY) < 1e-10) {
                // 协方差矩阵是对角矩阵
                v1X = covXX > covYY ? 1 : 0;
                v1Y = covXX > covYY ? 0 : 1;
              } else {
                v1X = 1;
                v1Y = (lambda1 - covXX) / covXY;
                const len = Math.sqrt(v1X * v1X + v1Y * v1Y);
                v1X /= len;
                v1Y /= len;
              }

              // 计算旋转角度（弧度）
              const angle = Math.atan2(v1Y, v1X);

              // 标准偏差椭圆的半轴长度（1个标准差，约68%的数据）
              const semiMajor = Math.sqrt(lambda1); // 长半轴
              const semiMinor = Math.sqrt(lambda2); // 短半轴

              // 绘制标准偏差椭圆（在数据点下方）
              sdeGroup = svg.append('g').attr('class', 'sde-ellipse');
              if (sdeGroup) {
                sdeGroup.style('display', showSDE.value ? 'block' : 'none');
              }

              sdeGroup
                .append('ellipse')
                .attr('cx', meanX)
                .attr('cy', meanY)
                .attr('rx', semiMajor)
                .attr('ry', semiMinor)
                .attr('transform', `rotate(${(angle * 180) / Math.PI} ${meanX} ${meanY})`)
                .attr('fill', 'none')
                .attr('stroke', colors.darkGray)
                .attr('stroke-width', 1)
                .attr('opacity', 0.5);
            }
          }

          // DBSCAN 分群
          if (points.length >= 2) {
            // 计算 eps（邻域半径）- 使用平均最近邻距离的 1.5 倍
            let avgNearestDistance = 0;
            for (let i = 0; i < points.length; i++) {
              let minDist = Infinity;
              for (let j = 0; j < points.length; j++) {
                if (i !== j) {
                  const dx = points[i].x - points[j].x;
                  const dy = points[i].y - points[j].y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < minDist) {
                    minDist = dist;
                  }
                }
              }
              if (minDist !== Infinity) {
                avgNearestDistance += minDist;
              }
            }
            avgNearestDistance /= points.length;
            const eps = avgNearestDistance * 3;
            const minPts = 4;

            // DBSCAN 算法
            const labels = new Array(points.length).fill(-1); // -1 表示噪声点
            let clusterId = 0;
            const clusterColors = [
              colors.blue,
              colors.green,
              colors.red,
              colors.white,
              colors.yellow,
            ];

            // 计算两点之间的距离
            const distance = (p1, p2) => {
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              return Math.sqrt(dx * dx + dy * dy);
            };

            // 获取邻域内的点
            const getNeighbors = (pointIndex) => {
              const neighbors = [];
              for (let i = 0; i < points.length; i++) {
                if (i !== pointIndex && distance(points[pointIndex], points[i]) <= eps) {
                  neighbors.push(i);
                }
              }
              return neighbors;
            };

            // 扩展群
            const expandCluster = (pointIndex, neighbors, clusterId) => {
              labels[pointIndex] = clusterId;
              let i = 0;
              while (i < neighbors.length) {
                const neighborIndex = neighbors[i];
                if (labels[neighborIndex] === -1) {
                  labels[neighborIndex] = clusterId;
                  const neighborNeighbors = getNeighbors(neighborIndex);
                  if (neighborNeighbors.length >= minPts) {
                    neighbors.push(...neighborNeighbors);
                  }
                } else if (labels[neighborIndex] === 0) {
                  labels[neighborIndex] = clusterId;
                }
                i++;
              }
            };

            // 执行 DBSCAN
            for (let i = 0; i < points.length; i++) {
              if (labels[i] !== -1) continue;

              const neighbors = getNeighbors(i);
              if (neighbors.length < minPts) {
                labels[i] = -1; // 噪声点
              } else {
                expandCluster(i, neighbors, clusterId);
                clusterId++;
              }
            }

            // 绘制 DBSCAN 分群（在数据点下方）
            dbscanGroup = svg.append('g').attr('class', 'dbscan-clusters');
            if (dbscanGroup) {
              dbscanGroup.style('display', showDBSCAN.value ? 'block' : 'none');
            }

            points.forEach((point, index) => {
              const clusterId = labels[index];
              if (clusterId >= 0) {
                // 有群的点
                const colorIndex = clusterId % clusterColors.length;
                dbscanGroup
                  .append('circle')
                  .attr('cx', point.x)
                  .attr('cy', point.y)
                  .attr('r', 8)
                  .attr('fill', clusterColors[colorIndex])
                  .attr('opacity', 0.7);
              }
            });
          }

          // 绘制 MST（最小生成树）
          if (points.length > 1) {
            // 使用 Kruskal 算法计算 MST
            const edges = [];
            for (let i = 0; i < points.length; i++) {
              for (let j = i + 1; j < points.length; j++) {
                const dx = points[i].x - points[j].x;
                const dy = points[i].y - points[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                edges.push({ from: i, to: j, distance });
              }
            }

            // 按距离排序
            edges.sort((a, b) => a.distance - b.distance);

            // Union-Find 数据结构
            const parent = Array.from({ length: points.length }, (_, i) => i);
            const find = (x) => {
              if (parent[x] !== x) {
                parent[x] = find(parent[x]);
              }
              return parent[x];
            };
            const union = (x, y) => {
              const rootX = find(x);
              const rootY = find(y);
              if (rootX !== rootY) {
                parent[rootX] = rootY;
                return true;
              }
              return false;
            };

            // Kruskal 算法
            const mstEdges = [];
            for (const edge of edges) {
              if (union(edge.from, edge.to)) {
                mstEdges.push(edge);
                if (mstEdges.length === points.length - 1) break;
              }
            }

            // 计算 MST 边的平均长度
            if (mstEdges.length > 0) {
              const totalLength = mstEdges.reduce((sum, edge) => sum + edge.distance, 0);
              averageMSTEdgeLength.value = totalLength / mstEdges.length;

              // 计算 MST 边的中位数长度
              const sortedEdgeLengths = mstEdges.map((edge) => edge.distance).sort((a, b) => a - b);
              const mid = Math.floor(sortedEdgeLengths.length / 2);
              medianMSTEdgeLength.value =
                sortedEdgeLengths.length % 2 === 0
                  ? (sortedEdgeLengths[mid - 1] + sortedEdgeLengths[mid]) / 2
                  : sortedEdgeLengths[mid];
            } else {
              averageMSTEdgeLength.value = 0;
              medianMSTEdgeLength.value = 0;
            }

            // 绘制 MST
            mstGroup = svg.append('g').attr('class', 'mst');
            if (mstGroup) {
              mstGroup.style('display', showMST.value ? 'block' : 'none');
            }
            mstEdges.forEach((edge) => {
              mstGroup
                .append('line')
                .attr('x1', points[edge.from].x)
                .attr('y1', points[edge.from].y)
                .attr('x2', points[edge.to].x)
                .attr('y2', points[edge.to].y)
                .attr('stroke', colors.darkGray)
                .attr('stroke-width', 1)
                .attr('opacity', 0.5);
            });
          }

          // 绘制彩色点（在数据点下方）
          colorPointsGroup = svg.append('g').attr('class', 'color-points');
          if (colorPointsGroup) {
            colorPointsGroup.style('display', showColorPoints.value ? 'block' : 'none');
          }
          points.forEach((point) => {
            // 计算该位置在渐层中的颜色
            const color = getInterpolatedColorAtPosition(
              point.xPercent / 100,
              point.yPercent / 100
            );
            colorPointsGroup
              .append('circle')
              .attr('cx', point.x)
              .attr('cy', point.y)
              .attr('r', 4)
              .attr('fill', color)
              .attr('opacity', 0.8);
          });

          // 绘制彩色三角图层（每条边的颜色是连接两个点的颜色渐变）
          colorDelaunayGroup = svg.append('g').attr('class', 'color-delaunay');
          if (colorDelaunayGroup) {
            colorDelaunayGroup.style('display', showColorDelaunay.value ? 'block' : 'none');
          }

          // 确保 defs 存在（重用已有的 defs）
          const svgDefs = svg.select('defs');
          const svgDefsElement = svgDefs.empty() ? svg.append('defs') : svgDefs;

          // 为每个三角形的三条边创建渐变
          triangleData.forEach((triangle, index) => {
            const point0 = points[triangle.i0];
            const point1 = points[triangle.i1];
            const point2 = points[triangle.i2];

            const color0 = getInterpolatedColorAtPosition(
              point0.xPercent / 100,
              point0.yPercent / 100
            );
            const color1 = getInterpolatedColorAtPosition(
              point1.xPercent / 100,
              point1.yPercent / 100
            );
            const color2 = getInterpolatedColorAtPosition(
              point2.xPercent / 100,
              point2.yPercent / 100
            );

            // 为三条边创建渐变 ID
            const gradientId01 = `gradient-${index}-01`;
            const gradientId12 = `gradient-${index}-12`;
            const gradientId20 = `gradient-${index}-20`;

            // 边 0-1 的渐变
            const gradient01 = svgDefsElement
              .append('linearGradient')
              .attr('id', gradientId01)
              .attr('x1', triangle.x0)
              .attr('y1', triangle.y0)
              .attr('x2', triangle.x1)
              .attr('y2', triangle.y1);
            gradient01.append('stop').attr('offset', '0%').attr('stop-color', color0);
            gradient01.append('stop').attr('offset', '100%').attr('stop-color', color1);

            // 边 1-2 的渐变
            const gradient12 = svgDefsElement
              .append('linearGradient')
              .attr('id', gradientId12)
              .attr('x1', triangle.x1)
              .attr('y1', triangle.y1)
              .attr('x2', triangle.x2)
              .attr('y2', triangle.y2);
            gradient12.append('stop').attr('offset', '0%').attr('stop-color', color1);
            gradient12.append('stop').attr('offset', '100%').attr('stop-color', color2);

            // 边 2-0 的渐变
            const gradient20 = svgDefsElement
              .append('linearGradient')
              .attr('id', gradientId20)
              .attr('x1', triangle.x2)
              .attr('y1', triangle.y2)
              .attr('x2', triangle.x0)
              .attr('y2', triangle.y0);
            gradient20.append('stop').attr('offset', '0%').attr('stop-color', color2);
            gradient20.append('stop').attr('offset', '100%').attr('stop-color', color0);

            // 绘制三条边
            colorDelaunayGroup
              .append('line')
              .attr('x1', triangle.x0)
              .attr('y1', triangle.y0)
              .attr('x2', triangle.x1)
              .attr('y2', triangle.y1)
              .attr('stroke', `url(#${gradientId01})`)
              .attr('stroke-width', 0.5)
              .attr('opacity', 0.8);

            colorDelaunayGroup
              .append('line')
              .attr('x1', triangle.x1)
              .attr('y1', triangle.y1)
              .attr('x2', triangle.x2)
              .attr('y2', triangle.y2)
              .attr('stroke', `url(#${gradientId12})`)
              .attr('stroke-width', 0.5)
              .attr('opacity', 0.8);

            colorDelaunayGroup
              .append('line')
              .attr('x1', triangle.x2)
              .attr('y1', triangle.y2)
              .attr('x2', triangle.x0)
              .attr('y2', triangle.y0)
              .attr('stroke', `url(#${gradientId20})`)
              .attr('stroke-width', 0.5)
              .attr('opacity', 0.8);
          });

          // 绘制数据点（在最上面）
          pointsGroup = svg.append('g').attr('class', 'data-points');
          if (pointsGroup) {
            pointsGroup.style('display', showDataPoints.value ? 'block' : 'none');
          }
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

          // 计算三种中心点
          if (showCenterPoint.value && allDataPoints.value.length > 0) {
            const validPoints = [];
            allDataPoints.value.forEach((item) => {
              const x = parseFloat(item.x);
              const y = parseFloat(item.y);

              if (!isNaN(x) && !isNaN(y) && x >= 0 && y >= 0 && x <= 100 && y <= 100) {
                validPoints.push({ x, y });
              }
            });

            if (validPoints.length > 0) {
              const contentRect = contentContainer.value.getBoundingClientRect();
              const iconSize = 16;
              const iconOffset = iconSize / 2;

              // 1. 平均中心（Mean Center）- 黄色
              let sumX = 0;
              let sumY = 0;
              validPoints.forEach((p) => {
                sumX += p.x;
                sumY += p.y;
              });
              const meanXPercent = sumX / validPoints.length;
              const meanYPercent = sumY / validPoints.length;
              meanCenter.value = { x: meanXPercent, y: meanYPercent };
              const meanXInContent = gradientAreaLeft + (meanXPercent / 100) * gradientAreaWidth;
              const meanYInContent = gradientAreaTop + (meanYPercent / 100) * gradientAreaHeight;
              const meanX = contentRect.left + meanXInContent;
              const meanY = contentRect.top + meanYInContent;

              const meanElement = document.createElement('div');
              meanElement.className =
                'position-absolute d-flex align-items-center justify-content-center';
              meanElement.style.left = `${meanX - iconOffset}px`;
              meanElement.style.top = `${meanY - iconOffset}px`;
              meanElement.style.width = `${iconSize}px`;
              meanElement.style.height = `${iconSize}px`;
              const meanIcon = document.createElement('i');
              meanIcon.className = 'fa-solid fa-diamond my-diamond-icon';
              meanIcon.style.fontSize = `${iconSize}px`;
              meanIcon.style.color = 'var(--my-color-yellow)';
              meanElement.appendChild(meanIcon);
              diamondContainer.value.appendChild(meanElement);

              // 2. 中位数中心（Median Center）- 红色
              const sortedX = validPoints.map((p) => p.x).sort((a, b) => a - b);
              const sortedY = validPoints.map((p) => p.y).sort((a, b) => a - b);
              const medianXPercent =
                validPoints.length % 2 === 0
                  ? (sortedX[validPoints.length / 2 - 1] + sortedX[validPoints.length / 2]) / 2
                  : sortedX[Math.floor(validPoints.length / 2)];
              const medianYPercent =
                validPoints.length % 2 === 0
                  ? (sortedY[validPoints.length / 2 - 1] + sortedY[validPoints.length / 2]) / 2
                  : sortedY[Math.floor(validPoints.length / 2)];
              medianCenter.value = { x: medianXPercent, y: medianYPercent };
              const medianXInContent =
                gradientAreaLeft + (medianXPercent / 100) * gradientAreaWidth;
              const medianYInContent =
                gradientAreaTop + (medianYPercent / 100) * gradientAreaHeight;
              const medianX = contentRect.left + medianXInContent;
              const medianY = contentRect.top + medianYInContent;

              const medianElement = document.createElement('div');
              medianElement.className =
                'position-absolute d-flex align-items-center justify-content-center';
              medianElement.style.left = `${medianX - iconOffset}px`;
              medianElement.style.top = `${medianY - iconOffset}px`;
              medianElement.style.width = `${iconSize}px`;
              medianElement.style.height = `${iconSize}px`;
              const medianIcon = document.createElement('i');
              medianIcon.className = 'fa-solid fa-diamond my-diamond-icon';
              medianIcon.style.fontSize = `${iconSize}px`;
              medianIcon.style.color = 'var(--my-color-red)';
              medianElement.appendChild(medianIcon);
              diamondContainer.value.appendChild(medianElement);

              // 3. 中心要素（Central Feature）- 绿色
              let minTotalDistance = Infinity;
              let centralFeatureIndex = 0;
              validPoints.forEach((point, index) => {
                let totalDistance = 0;
                validPoints.forEach((otherPoint) => {
                  const dx = point.x - otherPoint.x;
                  const dy = point.y - otherPoint.y;
                  totalDistance += Math.sqrt(dx * dx + dy * dy);
                });
                if (totalDistance < minTotalDistance) {
                  minTotalDistance = totalDistance;
                  centralFeatureIndex = index;
                }
              });
              const centralPoint = validPoints[centralFeatureIndex];
              centralFeature.value = { x: centralPoint.x, y: centralPoint.y };
              const centralXInContent =
                gradientAreaLeft + (centralPoint.x / 100) * gradientAreaWidth;
              const centralYInContent =
                gradientAreaTop + (centralPoint.y / 100) * gradientAreaHeight;
              const centralX = contentRect.left + centralXInContent;
              const centralY = contentRect.top + centralYInContent;

              const centralElement = document.createElement('div');
              centralElement.className =
                'position-absolute d-flex align-items-center justify-content-center';
              centralElement.style.left = `${centralX - iconOffset}px`;
              centralElement.style.top = `${centralY - iconOffset}px`;
              centralElement.style.width = `${iconSize}px`;
              centralElement.style.height = `${iconSize}px`;
              const centralIcon = document.createElement('i');
              centralIcon.className = 'fa-solid fa-diamond my-diamond-icon';
              centralIcon.style.fontSize = `${iconSize}px`;
              centralIcon.style.color = 'var(--my-color-green)';
              centralElement.appendChild(centralIcon);
              diamondContainer.value.appendChild(centralElement);
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

      const toggleCenterPoint = () => {
        showCenterPoint.value = !showCenterPoint.value;
        // 重新绘制以更新中心点的显示
        if (!loading.value) {
          setTimeout(() => {
            drawVisualization();
          }, 100);
        }
      };

      const downloadImage = () => {
        if (!svg || !contentContainer.value) return;

        const containerRect = contentContainer.value.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        const firstSectionWidth = calculateSideSectionWidth(containerWidth);
        const rightWidth = calculateSideSectionWidth(containerWidth);
        const titleAreaHeight = 0; // 与 drawVisualization 保持一致
        const gradientAreaWidth = containerWidth - firstSectionWidth - rightWidth;
        const gradientAreaHeight = containerHeight - titleAreaHeight;
        const gradientAreaLeft = firstSectionWidth;
        const gradientAreaTop = titleAreaHeight;

        // 获取原始 SVG
        const originalSvg = svg.node();
        if (!originalSvg) return;

        // 计算 viewBox，包含整个渐层区域
        // viewBox 直接使用整个渐层区域的尺寸和位置
        const viewBoxX = gradientAreaLeft;
        const viewBoxY = gradientAreaTop;
        const viewBoxWidth = gradientAreaWidth;
        const viewBoxHeight = gradientAreaHeight;

        // 创建新的 SVG，包含整个渐层区域，然后拉伸成正方形
        const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        newSvg.setAttribute('width', '1080');
        newSvg.setAttribute('height', '1080');
        newSvg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
        newSvg.setAttribute('preserveAspectRatio', 'none');

        // 克隆原始 SVG 的所有子元素
        const defs = originalSvg.querySelector('defs');
        if (defs) {
          const clonedDefs = defs.cloneNode(true);
          newSvg.appendChild(clonedDefs);
        }

        // 克隆所有组
        const groups = originalSvg.querySelectorAll('g');
        groups.forEach((group) => {
          const clonedGroup = group.cloneNode(true);
          newSvg.appendChild(clonedGroup);
        });

        // 将 SVG 转换为图片
        const svgData = new XMLSerializer().serializeToString(newSvg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // 创建 canvas 并绘制
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 1080, 1080);
          URL.revokeObjectURL(url);

          // 下载图片
          canvas.toBlob((blob) => {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `heatmap-${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(downloadUrl);
          }, 'image/png');
        };
        img.src = url;
      };

      const toggleDBSCAN = () => {
        showDBSCAN.value = !showDBSCAN.value;
        if (dbscanGroup) {
          dbscanGroup.style('display', showDBSCAN.value ? 'block' : 'none');
        }
      };

      const toggleDataPoints = () => {
        showDataPoints.value = !showDataPoints.value;
        if (pointsGroup) {
          pointsGroup.style('display', showDataPoints.value ? 'block' : 'none');
        }
      };

      const toggleColorPoints = () => {
        showColorPoints.value = !showColorPoints.value;
        if (colorPointsGroup) {
          colorPointsGroup.style('display', showColorPoints.value ? 'block' : 'none');
        }
      };

      const toggleDelaunay = () => {
        showDelaunay.value = !showDelaunay.value;
        if (delaunayGroup) {
          delaunayGroup.style('display', showDelaunay.value ? 'block' : 'none');
        }
      };

      const toggleDelaunayFill = () => {
        showDelaunayFill.value = !showDelaunayFill.value;
        if (delaunayFillGroup) {
          delaunayFillGroup.style('display', showDelaunayFill.value ? 'block' : 'none');
        }
      };

      const toggleColorDelaunay = () => {
        showColorDelaunay.value = !showColorDelaunay.value;
        if (colorDelaunayGroup) {
          colorDelaunayGroup.style('display', showColorDelaunay.value ? 'block' : 'none');
        }
      };

      const toggleSDE = () => {
        showSDE.value = !showSDE.value;
        if (sdeGroup) {
          sdeGroup.style('display', showSDE.value ? 'block' : 'none');
        }
      };

      const toggleMST = () => {
        showMST.value = !showMST.value;
        if (mstGroup) {
          mstGroup.style('display', showMST.value ? 'block' : 'none');
        }
      };

      const toggleDarkGrid = () => {
        showDarkGrid.value = !showDarkGrid.value;
        if (darkGridGroup) {
          darkGridGroup.style('display', showDarkGrid.value ? 'block' : 'none');
        }
      };

      const toggleGrid = () => {
        showGrid.value = !showGrid.value;
        if (cellGroup) {
          cellGroup.style('display', showGrid.value ? 'block' : 'none');
        }
      };

      const toggleColorGrid = () => {
        showColorGrid.value = !showColorGrid.value;
        if (colorGridGroup) {
          colorGridGroup.style('display', showColorGrid.value ? 'block' : 'none');
        }
      };

      const toggleGradient = () => {
        showGradient.value = !showGradient.value;
        if (gradientGroup) {
          gradientGroup.style('display', showGradient.value ? 'block' : 'none');
        }
      };

      onMounted(() => {
        const isLocalhost =
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname === '::1';

        const cookieId = cookieUtils.get('political-spectrum_id');
        if (!cookieId && !isLocalhost) {
          router.push('/');
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

      // 计算每个中心点的渐层颜色
      const meanCenterColor = computed(() => {
        if (meanCenter.value.x === 0 && meanCenter.value.y === 0) {
          return 'transparent';
        }
        return getInterpolatedColorAtPosition(meanCenter.value.x / 100, meanCenter.value.y / 100);
      });

      const medianCenterColor = computed(() => {
        if (medianCenter.value.x === 0 && medianCenter.value.y === 0) {
          return 'transparent';
        }
        return getInterpolatedColorAtPosition(
          medianCenter.value.x / 100,
          medianCenter.value.y / 100
        );
      });

      const centralFeatureColor = computed(() => {
        if (centralFeature.value.x === 0 && centralFeature.value.y === 0) {
          return 'transparent';
        }
        return getInterpolatedColorAtPosition(
          centralFeature.value.x / 100,
          centralFeature.value.y / 100
        );
      });

      // 计算每个中心点的 hex 值
      const meanCenterHex = computed(() => rgbToHex(meanCenterColor.value));
      const medianCenterHex = computed(() => rgbToHex(medianCenterColor.value));
      const centralFeatureHex = computed(() => rgbToHex(centralFeatureColor.value));

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
        tooltip,
        showGrid,
        showColorGrid,
        showGradient,
        showDarkGrid,
        showDataPoints,
        showColorPoints,
        showDelaunay,
        showDelaunayFill,
        showColorDelaunay,
        showSDE,
        showDBSCAN,
        showMST,
        showCenterPoint,
        averageTriangleArea,
        medianTriangleArea,
        nearestNeighborRatio,
        averageMSTEdgeLength,
        medianMSTEdgeLength,
        meanCenter,
        medianCenter,
        centralFeature,
        meanCenterColor,
        medianCenterColor,
        centralFeatureColor,
        meanCenterHex,
        medianCenterHex,
        centralFeatureHex,
        loading,
        error,
        goHome,
        toggleGrid,
        toggleColorGrid,
        toggleGradient,
        toggleDarkGrid,
        toggleDataPoints,
        toggleColorPoints,
        toggleDelaunay,
        toggleDelaunayFill,
        toggleColorDelaunay,
        toggleSDE,
        toggleDBSCAN,
        toggleMST,
        toggleCenterPoint,
        downloadImage,
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
