export function getCSSVariable(variableName) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  // 如果值为空，返回默认值（避免在CSS未加载时返回空字符串导致黑色）
  if (!value) {
    // 根据变量名返回对应的默认颜色值
    const defaults = {
      '--my-color-blue': 'hsl(210, 85%, 65%)',
      '--my-color-green': 'hsl(150, 85%, 65%)',
      '--my-color-red': 'hsl(0, 85%, 65%)',
      '--my-color-white': 'hsl(210, 60%, 92%)',
      '--my-color-yellow': 'hsl(60, 98%, 63%)',
      '--my-color-background-gray': '#dedede',
      '--my-color-dark-gray': '#393939',
      '--my-color-light-gray': '#7d7d7d',
      '--my-color-highlight-gray': '#c8c8c8',
    };
    return defaults[variableName] || value;
  }
  return value;
}

export function createGradientSpectrum({
  svg,
  colors,
  gradientAreaLeft,
  gradientAreaTop,
  gradientAreaWidth,
  gradientAreaHeight,
}) {
  // 验证颜色值，如果为空则使用默认值
  const blue = colors.blue || 'hsl(210, 85%, 65%)';
  const green = colors.green || 'hsl(150, 85%, 65%)';
  const red = colors.red || 'hsl(0, 85%, 65%)';
  const white = colors.white || 'hsl(210, 60%, 92%)';
  const backgroundGray = colors.backgroundGray || '#dedede';

  const defs = svg.append('defs');

  // 创建渐层组，用于控制显示/隐藏
  const gradientGroup = svg.append('g').attr('class', 'gradient-spectrum');

  const topLeftGradient = defs
    .append('radialGradient')
    .attr('id', 'topLeftGradient')
    .attr('gradientUnits', 'objectBoundingBox')
    .attr('cx', '0')
    .attr('cy', '0')
    .attr('r', '2.5');
  topLeftGradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', blue)
    .attr('stop-opacity', '1.0');
  topLeftGradient
    .append('stop')
    .attr('offset', '92%')
    .attr('stop-color', blue)
    .attr('stop-opacity', '0');

  const topRightGradient = defs
    .append('radialGradient')
    .attr('id', 'topRightGradient')
    .attr('gradientUnits', 'objectBoundingBox')
    .attr('cx', '1')
    .attr('cy', '0')
    .attr('r', '1.3');
  topRightGradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', red)
    .attr('stop-opacity', '1.0');
  topRightGradient
    .append('stop')
    .attr('offset', '60%')
    .attr('stop-color', red)
    .attr('stop-opacity', '0');

  const bottomLeftGradient = defs
    .append('radialGradient')
    .attr('id', 'bottomLeftGradient')
    .attr('gradientUnits', 'objectBoundingBox')
    .attr('cx', '0')
    .attr('cy', '1')
    .attr('r', '1.5');
  bottomLeftGradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', green)
    .attr('stop-opacity', '1.0');
  bottomLeftGradient
    .append('stop')
    .attr('offset', '70%')
    .attr('stop-color', green)
    .attr('stop-opacity', '0');

  const bottomRightGradient = defs
    .append('radialGradient')
    .attr('id', 'bottomRightGradient')
    .attr('gradientUnits', 'objectBoundingBox')
    .attr('cx', '1')
    .attr('cy', '1')
    .attr('r', '1.5');
  bottomRightGradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', white)
    .attr('stop-opacity', '1.0');
  bottomRightGradient
    .append('stop')
    .attr('offset', '70%')
    .attr('stop-color', white)
    .attr('stop-opacity', '0');

  gradientGroup
    .append('rect')
    .attr('x', gradientAreaLeft)
    .attr('y', gradientAreaTop)
    .attr('width', gradientAreaWidth)
    .attr('height', gradientAreaHeight)
    .attr('fill', backgroundGray);

  gradientGroup
    .append('rect')
    .attr('x', gradientAreaLeft)
    .attr('y', gradientAreaTop)
    .attr('width', gradientAreaWidth)
    .attr('height', gradientAreaHeight)
    .attr('fill', 'url(#topLeftGradient)')
    .attr('mix-blend-mode', 'screen');

  gradientGroup
    .append('rect')
    .attr('x', gradientAreaLeft)
    .attr('y', gradientAreaTop)
    .attr('width', gradientAreaWidth)
    .attr('height', gradientAreaHeight)
    .attr('fill', 'url(#topRightGradient)')
    .attr('mix-blend-mode', 'screen');

  gradientGroup
    .append('rect')
    .attr('x', gradientAreaLeft)
    .attr('y', gradientAreaTop)
    .attr('width', gradientAreaWidth)
    .attr('height', gradientAreaHeight)
    .attr('fill', 'url(#bottomLeftGradient)')
    .attr('mix-blend-mode', 'screen');

  gradientGroup
    .append('rect')
    .attr('x', gradientAreaLeft)
    .attr('y', gradientAreaTop)
    .attr('width', gradientAreaWidth)
    .attr('height', gradientAreaHeight)
    .attr('fill', 'url(#bottomRightGradient)')
    .attr('mix-blend-mode', 'screen');

  return gradientGroup;
}
