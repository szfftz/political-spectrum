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
              <i class="fa-solid fa-diamond my-diamond-icon"></i> 中心位置
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
              <div
                class="d-flex align-items-center justify-content-center rounded-circle mt-2 my-size-32 my-border-dark-gray"
              >
                <i :class="showDataPoints ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </div>
              <span class="mt-2" style="text-align: center">{{
                showDataPoints ? '隱藏黑點' : '顯示黑點'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleDelaunay"
              type="button"
            >
              <div
                class="d-flex align-items-center justify-content-center rounded-circle mt-2 my-size-32 my-border-dark-gray"
              >
                <i :class="showDelaunay ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </div>
              <span class="mt-2" style="text-align: center">{{
                showDelaunay ? '隱藏三角' : '顯示三角'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleDelaunayFill"
              type="button"
            >
              <div
                class="d-flex align-items-center justify-content-center rounded-circle mt-2 my-size-32 my-border-dark-gray"
              >
                <i :class="showDelaunayFill ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </div>
              <span class="mt-2" style="text-align: center">{{
                showDelaunayFill ? '隱藏三角填' : '顯示三角填'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleDarkGrid"
              type="button"
            >
              <div
                class="d-flex align-items-center justify-content-center rounded-circle mt-2 my-size-32 my-border-dark-gray"
              >
                <i :class="showDarkGrid ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </div>
              <span class="mt-2" style="text-align: center">{{
                showDarkGrid ? '隱藏黑網格' : '顯示黑網格'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleGrid"
              type="button"
            >
              <div
                class="d-flex align-items-center justify-content-center rounded-circle mt-2 my-size-32 my-border-dark-gray"
              >
                <i :class="showGrid ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </div>
              <span class="mt-2" style="text-align: center">{{
                showGrid ? '隱藏白網格' : '顯示白網格'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleColorGrid"
              type="button"
            >
              <div
                class="d-flex align-items-center justify-content-center rounded-circle mt-2 my-size-32 my-border-dark-gray"
              >
                <i :class="showColorGrid ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </div>
              <span class="mt-2" style="text-align: center">{{
                showColorGrid ? '隱藏色網格' : '顯示色網格'
              }}</span>
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1 d-flex flex-column align-items-center"
              style="min-width: 100px"
              @click="toggleGradient"
              type="button"
            >
              <div
                class="d-flex align-items-center justify-content-center rounded-circle mt-2 my-size-32 my-border-dark-gray"
              >
                <i :class="showGradient ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </div>
              <span class="mt-2" style="text-align: center">{{
                showGradient ? '隱藏漸層' : '顯示漸層'
              }}</span>
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
  import { ref, onMounted, onUnmounted } from 'vue';
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
      const showDelaunay = ref(false);
      const showDelaunayFill = ref(false);
      let svg = null;
      let cellGroup = null;
      let colorGridGroup = null;
      let gradientGroup = null;
      let darkGridGroup = null;
      let pointsGroup = null;
      let delaunayGroup = null;
      let delaunayFillGroup = null;
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
        delaunayGroup = null;
        delaunayFillGroup = null;

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
        const gridColumns = 14;
        const gridRows = 17;
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
            triangleData.push({ x0, y0, x1, y1, x2, y2, area, maxEdge });
          }

          // 找到最小和最大面积
          const minArea = Math.min(...triangleAreas);
          const maxArea = Math.max(...triangleAreas);

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

          // 计算所有点的平均位置
          if (allDataPoints.value.length > 0) {
            let sumX = 0;
            let sumY = 0;
            let validCount = 0;

            allDataPoints.value.forEach((item) => {
              const x = parseFloat(item.x);
              const y = parseFloat(item.y);

              if (!isNaN(x) && !isNaN(y) && x >= 0 && y >= 0 && x <= 100 && y <= 100) {
                sumX += x;
                sumY += y;
                validCount++;
              }
            });

            if (validCount > 0) {
              const avgXPercent = sumX / validCount;
              const avgYPercent = sumY / validCount;

              const xInContent = gradientAreaLeft + (avgXPercent / 100) * gradientAreaWidth;
              const yInContent = gradientAreaTop + (avgYPercent / 100) * gradientAreaHeight;

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

      const toggleDataPoints = () => {
        showDataPoints.value = !showDataPoints.value;
        if (pointsGroup) {
          pointsGroup.style('display', showDataPoints.value ? 'block' : 'none');
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
        showDelaunay,
        showDelaunayFill,
        loading,
        error,
        goHome,
        toggleGrid,
        toggleColorGrid,
        toggleGradient,
        toggleDarkGrid,
        toggleDataPoints,
        toggleDelaunay,
        toggleDelaunayFill,
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
