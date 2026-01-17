<template>
  <div
    class="d-flex flex-column align-items-center m-0 p-0 w-100 h-100 overflow-hidden position-relative"
  >
    <div
      ref="nametagContainer"
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
            <h1 class="mb-0 my-text-lg my-color-light-gray">政治人物光譜</h1>
            <div class="my-text-sm my-text-dark-gray pt-3">
              把名字拖曳到最適合的顏色位置，上傳後看結果唷！
            </div>
          </div>
        </div>
        <div class="d-none d-md-block my-side-section my-width-20"></div>
      </div>

      <div
        ref="contentContainer"
        class="d-flex position-relative min-h-0 overflow-hidden my-flex-1-1-0"
      >
        <div ref="leftSection" class="my-side-section position-relative z-1 my-width-20"></div>

        <div
          ref="centerSection"
          class="flex-grow-1 my-flex-grow-1 position-relative min-w-0 min-h-0 overflow-hidden my-flex-1-1-0"
        ></div>

        <div ref="rightSection" class="my-side-section position-relative z-3 my-width-20">
          <div
            class="d-flex flex-column gap-2 align-items-start justify-content-center position-absolute top-0 start-0 end-0 bottom-0 ps-2 pe-0"
          >
            <button
              class="btn my-button rounded px-2 py-1"
              :class="{ 'cursor-not-allowed': !confirmEnabled || isSaving }"
              :disabled="!confirmEnabled || isSaving"
              @click="saveToSupabase"
              type="button"
            >
              確定送出
            </button>
            <button
              class="btn my-button my-text-sm rounded px-2 py-1"
              :class="{ 'cursor-not-allowed': isSaving }"
              :disabled="isSaving"
              @click="resetBoxes"
              type="button"
            >
              全部重設
            </button>
            <button
              class="btn my-button rounded px-2 py-1"
              :class="{ 'cursor-not-allowed': !hasCookieId }"
              :disabled="!hasCookieId"
              @click="goToResult"
              type="button"
            >
              查看結果
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
            <span class="my-text-sm my-text-dark-gray">
              目前有 {{ formattedTotalCookieIds }} 人參與
            </span>
          </div>

          <div class="my-text-sm my-text-dark-gray">szfftz</div>
        </div>
        <div class="d-none d-md-block my-width-20"></div>
      </div>
    </div>

    <div v-if="isSaving" class="my-loading-overlay text-center my-text-dark-gray">
      <div class="spinner-border mb-3 my-spinner-lg" role="status">
        <span class="visually-hidden">上傳中...</span>
      </div>
      <p class="mt-3 mb-0 my-text-sm my-text-dark-gray">上傳中</p>
    </div>

    <div v-if="isSaveSuccess" class="my-loading-overlay text-center my-text-dark-gray">
      <div class="d-flex flex-column align-items-center gap-2">
        <h2 class="mb-4 my-text-lg my-text-dark-gray">上傳成功！</h2>
        <div class="d-flex flex-column gap-2 align-items-center">
          <button class="btn my-button rounded px-2 py-1" @click="closeSuccessDialog" type="button">
            確定
          </button>
          <button class="btn my-button rounded px-2 py-1" @click="goToResult" type="button">
            查看結果
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import * as d3 from 'd3';
  import { getSupabaseClient, isConfigured } from '../config/supabase.js';
  import { POLITICIAN_NAMES } from '../config/constants.js';
  import { getCSSVariable, createGradientSpectrum } from '../utils/utils.js';

  export default {
    name: 'HomeView',
    setup() {
      const router = useRouter();
      const mainContainer = ref(null);
      const contentContainer = ref(null);
      const svgContainer = ref(null);
      const buttonContainer = ref(null);
      const boxesContainer = ref(null);
      const nametagContainer = ref(null);
      const leftSection = ref(null);
      const centerSection = ref(null);
      const rightSection = ref(null);
      const rightSectionWidth = ref(0);
      let svg = null;
      let resizeTimer = null;
      let boxes = [];
      let linesGroup = null;
      const confirmEnabled = ref(true);
      const totalNames = ref(0);
      const totalCookieIds = ref(0);

      const loadTotalCookieIds = async () => {
        // 优先从本地JSON文件读取数据
        try {
          const response = await fetch('/data/data.json');
          if (response.ok) {
            const jsonData = await response.json();

            // 统计唯一的 cookie_id
            const uniqueCookieIds = new Set();
            jsonData.forEach((item) => {
              if (item.cookie_id !== null && item.cookie_id !== undefined) {
                uniqueCookieIds.add(item.cookie_id);
              }
            });

            totalCookieIds.value = uniqueCookieIds.size;
            return;
          }
        } catch (jsonError) {
          // JSON文件不存在或读取失败，继续从数据库读取
          console.log('無法讀取本地JSON檔案，將從資料庫讀取');
        }

        // 如果JSON文件不存在或读取失败，从数据库读取
        if (!isConfigured()) {
          totalCookieIds.value = 0;
          return;
        }

        try {
          const supabase = getSupabaseClient();

          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
              'count_distinct_cookie_ids'
            );

            if (!rpcError && rpcData !== null && rpcData !== undefined) {
              totalCookieIds.value = rpcData;
              return;
            }
          } catch (rpcErr) {
            return;
          }

          const uniqueCookieIds = new Set();
          const pageSize = 1000;
          let from = 0;
          let hasMore = true;

          while (hasMore) {
            const { data: pageData, error: queryError } = await supabase
              .from('data')
              .select('cookie_id')
              .not('cookie_id', 'is', null)
              .order('id', { ascending: true })
              .range(from, from + pageSize - 1);

            if (queryError) {
              totalCookieIds.value = 0;
              return;
            }

            if (pageData && pageData.length > 0) {
              pageData.forEach((item) => {
                if (item.cookie_id !== null && item.cookie_id !== undefined) {
                  uniqueCookieIds.add(item.cookie_id);
                }
              });

              from += pageSize;

              if (pageData.length < pageSize) {
                hasMore = false;
              }
            } else {
              hasMore = false;
            }
          }

          totalCookieIds.value = uniqueCookieIds.size;
        } catch (err) {
          totalCookieIds.value = 0;
        }
      };

      // 获取颜色的函数，确保每次调用时都重新获取最新的CSS变量值
      const getColors = () => {
        return {
          blue: getCSSVariable('--my-color-blue'),
          green: getCSSVariable('--my-color-green'),
          red: getCSSVariable('--my-color-red'),
          white: getCSSVariable('--my-color-white'),
          backgroundGray: getCSSVariable('--my-color-background-gray'),
          darkGray: getCSSVariable('--my-color-dark-gray'),
        };
      };

      const tagWidth = 60;

      const boxWidth = tagWidth * (4 / 3);
      const boxHeight = 30;
      let prevWidth = 0;
      let prevHeight = 0;
      let prevFirstSectionWidth = 0;
      let prevThirdSectionWidth = 0;
      const isSaving = ref(false);
      const isSaveSuccess = ref(false);
      const currentUniqueId = ref(null);
      const createdAt = ref(null);
      const updatedAt = ref(null);
      const hasCookieId = ref(false);

      const isTextInGradientArea = (
        box,
        grayAreaLeft,
        grayAreaTop,
        grayAreaRight,
        grayAreaBottom
      ) => {
        return (
          box.x >= grayAreaLeft &&
          box.x <= grayAreaRight &&
          box.y >= grayAreaTop &&
          box.y <= grayAreaBottom
        );
      };

      const initHTMLBoxes = (
        firstSectionWidth,
        gradientAreaWidth,
        gradientAreaHeight,
        thirdSectionWidth,
        containerHeight
      ) => {
        if (!mainContainer.value || !contentContainer.value) return;

        const titleAreaHeight = 0;

        const grayAreaLeft = firstSectionWidth;
        const grayAreaTop = titleAreaHeight;
        const grayAreaRight = grayAreaLeft + gradientAreaWidth;
        const grayAreaBottom = grayAreaTop + gradientAreaHeight;

        if (nametagContainer.value) {
          nametagContainer.value.innerHTML = '';
        }

        const contentRect = contentContainer.value.getBoundingClientRect();

        boxes.forEach((box) => {
          const boxElement = document.createElement('div');
          boxElement.className =
            'my-name-box cursor-grab position-absolute d-flex align-items-center justify-content-center text-dark user-select-none bg-transparent border-0';
          boxElement.setAttribute('data-name', box.name);

          boxElement.style.width = `${boxWidth}px`;
          boxElement.style.height = `${boxHeight}px`;
          boxElement.style.pointerEvents = 'auto';

          const x = contentRect.left + box.x;
          const y = contentRect.top + box.y;

          const translateX = -boxWidth / 2;
          const translateY = -boxHeight / 2;
          boxElement.style.transform = `translate(${translateX}px, ${translateY}px)`;
          boxElement.style.left = `${x}px`;
          boxElement.style.top = `${y}px`;

          const textContainer = document.createElement('div');
          textContainer.className =
            'position-relative d-inline-block px-2 py-1 rounded bg-transparent';

          const textElement = document.createElement('span');
          textElement.className = 'my-name-box-text position-relative lh-1 text-nowrap';
          textElement.textContent = box.name;

          textContainer.appendChild(textElement);
          boxElement.appendChild(textContainer);

          let isDragging = false;
          let currentBox = box;
          let animationFrameId = null;

          const handleMove = (e) => {
            if (!isDragging || currentBox !== box || !contentContainer.value) return;

            if (e?.type?.startsWith?.('touch') && e.cancelable) {
              e.preventDefault();
            }

            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }

            animationFrameId = requestAnimationFrame(() => {
              const containerRect = contentContainer.value.getBoundingClientRect();
              let clientX, clientY;

              if (e.type.startsWith('touch')) {
                const touch = e.touches[0] || e.changedTouches[0];
                clientX = touch.clientX - containerRect.left;
                clientY = touch.clientY - containerRect.top;
              } else {
                clientX = e.clientX - containerRect.left;
                clientY = e.clientY - containerRect.top;
              }

              const containerWidth = containerRect.width;
              const containerHeight = containerRect.height;
              const minX = 0;
              const maxX = containerWidth;
              const minY = 0;
              const maxY = containerHeight;

              const constrainedX = Math.max(minX, Math.min(maxX, clientX));
              const constrainedY = Math.max(minY, Math.min(maxY, clientY));

              box.x = constrainedX;
              box.y = constrainedY;

              const x = containerRect.left + constrainedX;
              const y = containerRect.top + constrainedY;
              const translateX = -boxWidth / 2;
              const translateY = -boxHeight / 2;
              boxElement.style.transform = `translate(${translateX}px, ${translateY}px)`;
              boxElement.style.left = `${x}px`;
              boxElement.style.top = `${y}px`;

              updateCoordinates();
            });
          };

          const handleEnd = () => {
            if (!isDragging || currentBox !== box) return;
            isDragging = false;
            boxElement.style.zIndex = '1';
            boxElement.classList.remove('my-dragging');

            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }

            const isInGrayArea = isTextInGradientArea(
              box,
              grayAreaLeft,
              grayAreaTop,
              grayAreaRight,
              grayAreaBottom
            );

            if (!isInGrayArea) {
              if (box.x < firstSectionWidth) {
                rearrangeWhiteAreaBoxes(firstSectionWidth, containerHeight);
              } else {
                boxElement.classList.add('my-smooth-transition');

                box.x = box.defaultX;
                box.y = box.defaultY;

                const containerRect = contentContainer.value.getBoundingClientRect();
                const x = containerRect.left + box.x;
                const y = containerRect.top + box.y;
                const translateX = -boxWidth / 2;
                const translateY = -boxHeight / 2;
                boxElement.style.transform = `translate(${translateX}px, ${translateY}px)`;
                boxElement.style.left = `${x}px`;
                boxElement.style.top = `${y}px`;

                setTimeout(() => {
                  boxElement.classList.remove('my-smooth-transition');
                }, 300);

                rearrangeWhiteAreaBoxes(firstSectionWidth, containerHeight);
              }
            } else {
              rearrangeWhiteAreaBoxes(firstSectionWidth, containerHeight);
            }

            updateCoordinates();

            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
            document.removeEventListener('touchcancel', handleEnd);
          };

          const handleStart = (e) => {
            isDragging = true;
            currentBox = box;
            boxElement.style.zIndex = '1000';
            boxElement.classList.add('my-dragging');

            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleEnd);

            document.addEventListener('touchcancel', handleEnd);

            e.preventDefault();
          };

          boxElement.addEventListener('mousedown', handleStart);
          boxElement.addEventListener('touchstart', handleStart, { passive: false });

          if (nametagContainer.value) {
            nametagContainer.value.appendChild(boxElement);
          }
        });

        rearrangeWhiteAreaBoxes(firstSectionWidth, containerHeight);
      };

      const rearrangeWhiteAreaBoxes = (whiteAreaWidth, containerHeight) => {
        if (!nametagContainer.value || !contentContainer.value) return;

        let whiteAreaBoxes = boxes
          .filter((box) => box.x < whiteAreaWidth)
          .sort((a, b) => {
            const indexA = POLITICIAN_NAMES.indexOf(a.name);
            const indexB = POLITICIAN_NAMES.indexOf(b.name);
            return indexA - indexB;
          });

        if (whiteAreaBoxes.length === 0) return;

        const titleAreaHeight = 0;

        const itemHeight = boxHeight + 20;
        const totalHeight = whiteAreaBoxes.length * itemHeight - 20;

        const gradientAreaHeight = containerHeight - titleAreaHeight;

        const centerStartY =
          titleAreaHeight + (gradientAreaHeight - totalHeight) / 2 + boxHeight / 2;
        const startY = Math.max(titleAreaHeight + boxHeight / 2, centerStartY);

        const rightPadding = 10;
        const rightX = whiteAreaWidth - boxWidth / 2 - rightPadding;

        whiteAreaBoxes.forEach((box, index) => {
          const newX = rightX;
          const newY = startY + index * itemHeight;

          box.x = newX;
          box.y = newY;
          box.defaultX = newX;
          box.defaultY = newY;
        });

        const contentRect = contentContainer.value.getBoundingClientRect();

        if (nametagContainer.value) {
          boxes.forEach((box) => {
            const boxElement = nametagContainer.value.querySelector(`[data-name="${box.name}"]`);
            if (boxElement) {
              boxElement.classList.add('my-smooth-transition');

              const x = contentRect.left + box.x;
              const y = contentRect.top + box.y;
              const translateX = -boxWidth / 2;
              const translateY = -boxHeight / 2;
              boxElement.style.transform = `translate(${translateX}px, ${translateY}px)`;
              boxElement.style.left = `${x}px`;
              boxElement.style.top = `${y}px`;

              setTimeout(() => {
                boxElement.classList.remove('my-smooth-transition');
              }, 300);
            }
          });
        }
      };

      const calculateSideSectionWidth = (containerWidth) => {
        if (!containerWidth || containerWidth <= 0) return 0;
        return containerWidth * 0.2;
      };

      const calculateBoxPositions = (areaWidth, areaLeft = 0, containerHeight = null) => {
        const positions = [];
        const itemHeight = boxHeight + 20;

        const names = POLITICIAN_NAMES;

        const totalHeight = names.length * itemHeight - 20;

        let startY = boxHeight / 2;
        if (containerHeight) {
          const centerStartY = (containerHeight - totalHeight) / 2 + boxHeight / 2;
          startY = Math.max(boxHeight / 2, centerStartY);
        }

        const rightPadding = 10;
        const rightX = areaLeft + areaWidth - boxWidth / 2 - rightPadding;

        names.forEach((name, index) => {
          const x = rightX;
          const y = startY + index * itemHeight;

          positions.push({
            x,
            y,
            defaultX: x,
            defaultY: y,
            name,
          });
        });

        return positions;
      };

      const updateCoordinates = () => {
        if (!linesGroup || !svg || !svgContainer.value) return;

        if (!contentContainer.value) return;
        const containerRect = contentContainer.value.getBoundingClientRect();
        const containerHeight = containerRect.height;
        const containerWidth = containerRect.width;

        const firstSectionWidth = calculateSideSectionWidth(containerWidth);
        const thirdSectionWidth = calculateSideSectionWidth(containerWidth);
        rightSectionWidth.value = thirdSectionWidth;

        const titleAreaHeight = 0;

        const grayAreaWidth = containerWidth - firstSectionWidth - thirdSectionWidth;
        const grayAreaHeight = containerHeight - titleAreaHeight;

        const grayAreaLeft = firstSectionWidth;
        const grayAreaTop = titleAreaHeight;
        const grayAreaRight = grayAreaLeft + grayAreaWidth;
        const grayAreaBottom = grayAreaTop + grayAreaHeight;

        linesGroup.selectAll('*').remove();

        const displayList = [];
        boxes.forEach((box, index) => {
          const isInGrayArea = isTextInGradientArea(
            box,
            grayAreaLeft,
            grayAreaTop,
            grayAreaRight,
            grayAreaBottom
          );

          if (isInGrayArea) {
            const relativeX = box.x - grayAreaLeft;
            const relativeY = box.y - grayAreaTop;
            const xPercent = Math.max(0, Math.min(100, (relativeX / grayAreaWidth) * 100));
            const yPercent = Math.max(0, Math.min(100, (relativeY / grayAreaHeight) * 100));
            displayList.push({
              name: box.name || `方塊 ${index + 1}`,
              x: box.x,
              y: box.y,
              xPercent: Math.round(xPercent * 100) / 100,
              yPercent: Math.round(yPercent * 100) / 100,
            });
          }
        });

        const namesInGradientArea = displayList.map((item) => item.name);

        const hasNameNotInGradient = POLITICIAN_NAMES.some(
          (name) => !namesInGradientArea.includes(name)
        );
        const nextConfirmEnabled = !hasNameNotInGradient;
        const prevConfirmEnabled = confirmEnabled.value;
        confirmEnabled.value = nextConfirmEnabled;

        if (
          !nextConfirmEnabled &&
          (prevConfirmEnabled !== nextConfirmEnabled || namesInGradientArea.length)
        ) {
          return;
        }

        displayList.sort((a, b) => a.xPercent - b.xPercent);
      };

      const drawVisualization = () => {
        if (!svgContainer.value || !contentContainer.value) return;

        // 验证颜色是否已正确加载
        const currentColors = getColors();
        const hasValidColors =
          currentColors.blue &&
          currentColors.green &&
          currentColors.red &&
          currentColors.white &&
          currentColors.backgroundGray;

        // 如果颜色未加载，延迟重试
        if (!hasValidColors) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              drawVisualization();
            }, 50);
          });
          return;
        }

        d3.select(svgContainer.value).selectAll('svg').remove();

        const containerRect = contentContainer.value.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // 确保容器有有效的尺寸
        if (containerWidth <= 0 || containerHeight <= 0) {
          requestAnimationFrame(() => {
            drawVisualization();
          });
          return;
        }

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

        // 在渲染时动态获取颜色，确保CSS变量已加载
        createGradientSpectrum({
          svg,
          colors: currentColors,
          gradientAreaLeft,
          gradientAreaTop,
          gradientAreaWidth,
          gradientAreaHeight,
        });

        linesGroup = svg.append('g').attr('class', 'position-lines');

        totalNames.value = POLITICIAN_NAMES.length;

        if (boxes.length === 0) {
          boxes = calculateBoxPositions(firstSectionWidth, 0, containerHeight);
        } else {
          const newPositions = calculateBoxPositions(firstSectionWidth, 0, containerHeight);
          boxes = newPositions.map((newPos, index) => {
            const existing = boxes[index];
            return {
              ...existing,
              x: existing ? existing.x : newPos.x,
              y: existing ? existing.y : newPos.y,
              defaultX: existing && existing.defaultX ? existing.defaultX : newPos.defaultX,
              defaultY: existing && existing.defaultY ? existing.defaultY : newPos.defaultY,
              name: newPos.name,
            };
          });
        }

        initHTMLBoxes(
          firstSectionWidth,
          gradientAreaWidth,
          gradientAreaHeight,
          rightWidth,
          containerHeight
        );

        requestAnimationFrame(() => {
          updateCoordinates();
        });

        if (contentContainer.value) {
          const containerRect = contentContainer.value.getBoundingClientRect();
          prevWidth = containerRect.width;
          prevHeight = containerRect.height;
          prevFirstSectionWidth = firstSectionWidth;
          prevThirdSectionWidth = rightWidth;
        }
      };

      const handleResize = () => {
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(() => {
          if (!contentContainer.value) return;
          const containerRect = contentContainer.value.getBoundingClientRect();
          const newWidth = containerRect.width;
          const newHeight = containerRect.height;

          const newFirstSectionWidth = calculateSideSectionWidth(newWidth);
          const newThirdSectionWidth = calculateSideSectionWidth(newWidth);

          const newGrayAreaWidth = newWidth - newFirstSectionWidth - newThirdSectionWidth;
          const newGrayAreaHeight = newHeight;

          const newGrayAreaLeft = newFirstSectionWidth;
          const newGrayAreaTop = 0;
          const newGrayAreaRight = newGrayAreaLeft + newGrayAreaWidth;
          const newGrayAreaBottom = newGrayAreaTop + newGrayAreaHeight;

          const scaleX = newWidth / prevWidth;
          const scaleY = newHeight / prevHeight;

          boxes = boxes.map((box) => {
            const wasInTemporaryArea = prevFirstSectionWidth > 0 && box.x < prevFirstSectionWidth;

            let newX, newY, newDefaultX, newDefaultY;

            if (wasInTemporaryArea) {
              const relativeX =
                prevFirstSectionWidth > 0 ? box.defaultX / prevFirstSectionWidth : 0.5;
              newX = Math.max(0, Math.min(newFirstSectionWidth, newFirstSectionWidth * relativeX));

              newY = Math.max(0, Math.min(newHeight, box.y * scaleY));

              const tempPositions = calculateBoxPositions(newFirstSectionWidth, 0, newHeight);
              const tempPos = tempPositions.find((p) => p.name === box.name);
              if (tempPos) {
                newDefaultX = tempPos.defaultX;
                newDefaultY = tempPos.defaultY;
              } else {
                newDefaultX = newX;
                newDefaultY = newY;
              }
            } else {
              const prevGrayAreaWidth = prevWidth - prevFirstSectionWidth - prevThirdSectionWidth;
              const prevGrayAreaHeight = prevHeight;
              const prevGrayAreaLeft = prevFirstSectionWidth;
              const prevGrayAreaTop = 0;

              if (prevGrayAreaWidth > 0 && prevGrayAreaHeight > 0) {
                const relativeX = (box.x - prevGrayAreaLeft) / prevGrayAreaWidth;
                const relativeY = (box.y - prevGrayAreaTop) / prevGrayAreaHeight;

                const clampedRelativeX = Math.max(0, Math.min(1, relativeX));
                const clampedRelativeY = Math.max(0, Math.min(1, relativeY));

                newX = newGrayAreaLeft + clampedRelativeX * newGrayAreaWidth;
                newY = newGrayAreaTop + clampedRelativeY * newGrayAreaHeight;

                const minX = newGrayAreaLeft;
                const maxX = newGrayAreaRight;
                const minY = newGrayAreaTop;
                const maxY = newGrayAreaBottom;
                newX = Math.max(minX, Math.min(maxX, newX));
                newY = Math.max(minY, Math.min(maxY, newY));
              } else {
                newX = box.x * scaleX;
                newY = box.y * scaleY;
              }

              const tempPositions = calculateBoxPositions(newFirstSectionWidth, 0, newHeight);
              const tempPos = tempPositions.find((p) => p.name === box.name);
              if (tempPos) {
                newDefaultX = tempPos.defaultX;
                newDefaultY = tempPos.defaultY;
              } else {
                newDefaultX = Math.max(0, Math.min(newFirstSectionWidth, box.defaultX));
                newDefaultY = box.defaultY * scaleY;
              }
            }

            return {
              ...box,
              x: newX,
              y: newY,
              defaultX: newDefaultX,
              defaultY: newDefaultY,
            };
          });

          if (svg) {
            svg.attr('width', newWidth).attr('height', newHeight);
          }

          drawVisualization();
        }, 100);
      };

      const generateUniqueId = async (data) => {
        try {
          const timestamp = Date.now().toString();
          const random = Math.random().toString(36).substring(2, 15);
          const dataString = JSON.stringify(data);
          const combined = `${timestamp}-${random}-${dataString}`;

          const encoder = new TextEncoder();
          const dataBuffer = encoder.encode(combined);
          const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

          return hashHex.substring(0, 32);
        } catch (error) {
          const timestamp = Date.now().toString(36);
          const random = Math.random().toString(36).substring(2, 15);
          const dataHash = btoa(JSON.stringify(data)).substring(0, 10);
          return `${timestamp}-${random}-${dataHash}`;
        }
      };

      const cookieUtils = {
        set(name, value, days = 365) {
          const expires = new Date();
          expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

          const isSecure = window.location.protocol === 'https:';
          const secureFlag = isSecure ? '; Secure' : '';
          document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/; SameSite=Lax${secureFlag}`;
        },

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

        test() {
          try {
            const testName = 'cookie_test_' + Date.now();
            this.set(testName, 'test', 1);
            const result = this.get(testName) === 'test';
            this.remove(testName);
            return result;
          } catch (e) {
            return false;
          }
        },

        remove(name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        },
      };

      const handleVisibilityChange = () => {
        if (!document.hidden) {
          loadTotalCookieIds();
        }
      };

      onMounted(() => {
        cookieUtils.test();

        loadTotalCookieIds();

        document.addEventListener('visibilitychange', handleVisibilityChange);

        const savedUniqueId = cookieUtils.get('political-spectrum_id');
        if (savedUniqueId) {
          currentUniqueId.value = savedUniqueId;
          hasCookieId.value = true;
        } else {
          hasCookieId.value = false;
        }

        if (savedUniqueId) {
          const savedCreatedAt = cookieUtils.get('political-spectrum_created_at');
          if (savedCreatedAt) {
            createdAt.value = savedCreatedAt;
          }

          const savedUpdatedAt = cookieUtils.get('political-spectrum_update_at');
          if (savedUpdatedAt) {
            updatedAt.value = savedUpdatedAt;
          }
        }

        let hasSavedData = false;

        let savedPositionsMap = null;

        const savedPositionsJSON = cookieUtils.get('political-spectrum_positions');
        if (savedPositionsJSON) {
          try {
            const parsed = JSON.parse(savedPositionsJSON);
            if (parsed && typeof parsed === 'object') {
              savedPositionsMap = parsed;

              hasSavedData = POLITICIAN_NAMES.some((name) => {
                const p = savedPositionsMap?.[name];
                return p && p.x !== undefined && p.y !== undefined && p.x !== null && p.y !== null;
              });
            }
          } catch (e) {
            savedPositionsMap = null;
          }
        }

        if (!hasSavedData) {
          hasSavedData = POLITICIAN_NAMES.some((name) => {
            const xPercent = cookieUtils.get(`political-spectrum_${name}_x`);
            const yPercent = cookieUtils.get(`political-spectrum_${name}_y`);

            return xPercent !== null && yPercent !== null;
          });
        }

        // 使用 nextTick 确保DOM已准备好，然后使用 requestAnimationFrame 确保浏览器准备好渲染
        nextTick(() => {
          requestAnimationFrame(() => {
            if (!contentContainer.value) return;
            const containerRect = contentContainer.value.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const containerHeight = containerRect.height;

            // 如果容器尺寸无效，延迟重试
            if (containerWidth <= 0 || containerHeight <= 0) {
              setTimeout(() => {
                if (!contentContainer.value) return;
                const retryRect = contentContainer.value.getBoundingClientRect();
                if (retryRect.width > 0 && retryRect.height > 0) {
                  drawVisualization();
                }
              }, 100);
              return;
            }

            const firstSectionWidth = calculateSideSectionWidth(containerWidth);

            const defaultPositions = calculateBoxPositions(firstSectionWidth, 0, containerHeight);

            if (hasSavedData) {
              if (!contentContainer.value) return;
              const containerRect = contentContainer.value.getBoundingClientRect();
              const containerWidth = containerRect.width;
              const containerHeight = containerRect.height;

              const thirdSectionWidth = calculateSideSectionWidth(containerWidth);
              rightSectionWidth.value = thirdSectionWidth;

              const grayAreaWidth = containerWidth - firstSectionWidth - thirdSectionWidth;
              const grayAreaHeight = containerHeight;

              const grayAreaLeft = firstSectionWidth;
              const grayAreaTop = 0;

              boxes = POLITICIAN_NAMES.map((name, index) => {
                const defaultPos = defaultPositions[index];

                const savedFromJson = savedPositionsMap?.[name];
                const savedXPercent =
                  savedFromJson?.x !== undefined && savedFromJson?.x !== null
                    ? String(savedFromJson.x)
                    : cookieUtils.get(`political-spectrum_${name}_x`);
                const savedYPercent =
                  savedFromJson?.y !== undefined && savedFromJson?.y !== null
                    ? String(savedFromJson.y)
                    : cookieUtils.get(`political-spectrum_${name}_y`);

                let x = defaultPos.x;
                let y = defaultPos.y;

                if (
                  savedXPercent !== null &&
                  savedYPercent !== null &&
                  savedXPercent !== '-1' &&
                  savedYPercent !== '-1'
                ) {
                  const xPercent = parseFloat(savedXPercent);
                  const yPercent = parseFloat(savedYPercent);
                  x = grayAreaLeft + (xPercent / 100) * grayAreaWidth;
                  y = grayAreaTop + (yPercent / 100) * grayAreaHeight;
                }

                return {
                  x: x,
                  y: y,
                  defaultX: defaultPos.defaultX,
                  defaultY: defaultPos.defaultY,
                  name: name,
                };
              });

              rearrangeWhiteAreaBoxes(firstSectionWidth, containerHeight);
            } else {
              boxes = defaultPositions;
            }

            drawVisualization();
            window.addEventListener('resize', handleResize);
          });
        });
      });

      const saveToSupabase = async () => {
        if (isSaving.value) return;

        isSaving.value = true;

        try {
          if (!contentContainer.value) return;
          const containerRect = contentContainer.value.getBoundingClientRect();
          const containerWidth = containerRect.width;
          const containerHeight = containerRect.height;

          const firstSectionWidth = calculateSideSectionWidth(containerWidth);
          const thirdSectionWidth = calculateSideSectionWidth(containerWidth);
          rightSectionWidth.value = thirdSectionWidth;

          const grayAreaWidth = containerWidth - firstSectionWidth - thirdSectionWidth;
          const grayAreaHeight = containerHeight;

          const grayAreaLeft = firstSectionWidth;
          const grayAreaTop = 0;
          const grayAreaRight = grayAreaLeft + grayAreaWidth;
          const grayAreaBottom = grayAreaTop + grayAreaHeight;

          const allRecords = POLITICIAN_NAMES.map((name) => {
            const box = boxes.find((b) => b.name === name);
            let x = -1;
            let y = -1;

            if (box) {
              const isInGrayArea = isTextInGradientArea(
                box,
                grayAreaLeft,
                grayAreaTop,
                grayAreaRight,
                grayAreaBottom
              );

              if (isInGrayArea) {
                const relativeX = box.x - grayAreaLeft;
                const xPercent = Math.max(0, Math.min(100, (relativeX / grayAreaWidth) * 100));
                x = Math.round(xPercent * 100) / 100;

                const relativeY = box.y - grayAreaTop;
                const yPercent = Math.max(0, Math.min(100, (relativeY / grayAreaHeight) * 100));
                y = Math.round(yPercent * 100) / 100;
              }
            }

            return {
              name: name,
              x: x,
              y: y,
            };
          });

          let uniqueId = currentUniqueId.value;
          if (!uniqueId) {
            uniqueId = await generateUniqueId(allRecords);
            currentUniqueId.value = uniqueId;
          }

          const nowISO = new Date().toISOString();
          const records = allRecords.map((item) => ({
            cookie_id: uniqueId,
            name: item.name,
            x: item.x,
            y: item.y,
            update_at: nowISO,
          }));

          cookieUtils.set('political-spectrum_id', uniqueId, 365);

          const now = new Date().toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          if (!createdAt.value) {
            createdAt.value = now;
            cookieUtils.set('political-spectrum_created_at', now, 365);
          }

          updatedAt.value = now;
          cookieUtils.set('political-spectrum_update_at', now, 365);

          const positionsForCookie = {};

          boxes.forEach((box) => {
            const isInGrayArea = isTextInGradientArea(
              box,
              grayAreaLeft,
              grayAreaTop,
              grayAreaRight,
              grayAreaBottom
            );

            if (isInGrayArea) {
              const relativeX = box.x - grayAreaLeft;
              const xPercent = Math.max(
                0,
                Math.min(100, (relativeX / grayAreaWidth) * 100)
              ).toFixed(2);

              const relativeY = box.y - grayAreaTop;
              const yPercent = Math.max(
                0,
                Math.min(100, (relativeY / grayAreaHeight) * 100)
              ).toFixed(2);

              positionsForCookie[box.name] = { x: xPercent, y: yPercent };
            } else {
              positionsForCookie[box.name] = { x: '-1', y: '-1' };
            }
          });

          cookieUtils.set('political-spectrum_positions', JSON.stringify(positionsForCookie), 365);

          currentUniqueId.value = uniqueId;
          hasCookieId.value = true;

          updateCoordinates();

          if (!isConfigured()) {
            isSaving.value = false;
            router.push('/');
            return;
          }

          const supabase = getSupabaseClient();

          const { data: maxIdData, error: maxIdError } = await supabase
            .from('data')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (maxIdError) {
            throw new Error(`查詢最大ID時發生錯誤: ${maxIdError.message}`);
          }

          const maxId = maxIdData?.id || 0;

          const recordsToInsert = [];
          const recordsToUpdate = [];
          let nextId = maxId + 1;

          for (const record of records) {
            const { data: existingData, error: queryError } = await supabase
              .from('data')
              .select('id')
              .eq('cookie_id', record.cookie_id)
              .eq('name', record.name)
              .maybeSingle();

            if (queryError) {
              throw new Error(`查詢記錄時發生錯誤: ${queryError.message}`);
            }

            if (existingData) {
              recordsToUpdate.push({
                id: existingData.id,
                x: record.x,
                y: record.y,
                update_at: record.update_at,
              });
            } else {
              recordsToInsert.push({
                ...record,
                id: nextId++,
              });
            }
          }

          if (recordsToInsert.length > 0) {
            const { error: insertError } = await supabase.from('data').insert(recordsToInsert);

            if (insertError) {
              throw new Error(`插入數據時發生錯誤: ${insertError.message}`);
            }
          }

          if (recordsToUpdate.length > 0) {
            for (const record of recordsToUpdate) {
              const { error: updateError } = await supabase
                .from('data')
                .update({
                  x: record.x,
                  y: record.y,
                  update_at: record.update_at,
                })
                .eq('id', record.id);

              if (updateError) {
                throw new Error(`更新數據時發生錯誤: ${updateError.message}`);
              }
            }
          }

          await loadTotalCookieIds();

          isSaveSuccess.value = true;
        } catch (error) {
          router.push('/');
        } finally {
          isSaving.value = false;
        }
      };

      const resetBoxes = () => {
        if (!contentContainer.value) return;
        const containerRect = contentContainer.value.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        const firstSectionWidth = calculateSideSectionWidth(containerWidth);

        const newPositions = calculateBoxPositions(firstSectionWidth, 0, containerHeight);

        boxes.forEach((box, index) => {
          if (newPositions[index]) {
            box.x = newPositions[index].defaultX;
            box.y = newPositions[index].defaultY;
            box.defaultX = newPositions[index].defaultX;
            box.defaultY = newPositions[index].defaultY;
          }
        });

        drawVisualization();
      };

      onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
      });

      const goToResult = () => {
        isSaveSuccess.value = false;
        router.push('/result');
      };

      const closeSuccessDialog = () => {
        isSaveSuccess.value = false;
      };

      const formatNumber = (value) => {
        const formatter = d3.format(',');
        return formatter(value);
      };

      const formattedTotalCookieIds = computed(() => {
        return formatNumber(totalCookieIds.value);
      });

      return {
        mainContainer,
        contentContainer,
        svgContainer,
        buttonContainer,
        boxesContainer,
        nametagContainer,
        leftSection,
        centerSection,
        rightSection,
        rightSectionWidth,
        confirmEnabled,
        isSaving,
        isSaveSuccess,
        totalCookieIds,
        formattedTotalCookieIds,
        hasCookieId,
        saveToSupabase,
        resetBoxes,
        goToResult,
        closeSuccessDialog,
      };
    },
  };
</script>

<style>
  @import '../assets/css/common.css';
</style>
