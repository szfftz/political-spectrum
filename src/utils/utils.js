export function getCSSVariable(variableName) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

export function createGradientSpectrum({
  svg,
  colors,
  gradientAreaLeft,
  gradientAreaTop,
  gradientAreaWidth,
  gradientAreaHeight,
}) {
  const defs = svg.append('defs');

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
    .attr('stop-color', colors.blue)
    .attr('stop-opacity', '1.0');
  topLeftGradient
    .append('stop')
    .attr('offset', '92%')
    .attr('stop-color', colors.blue)
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
    .attr('stop-color', colors.red)
    .attr('stop-opacity', '1.0');
  topRightGradient
    .append('stop')
    .attr('offset', '60%')
    .attr('stop-color', colors.red)
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
    .attr('stop-color', colors.green)
    .attr('stop-opacity', '1.0');
  bottomLeftGradient
    .append('stop')
    .attr('offset', '70%')
    .attr('stop-color', colors.green)
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
    .attr('stop-color', colors.white)
    .attr('stop-opacity', '1.0');
  bottomRightGradient
    .append('stop')
    .attr('offset', '70%')
    .attr('stop-color', colors.white)
    .attr('stop-opacity', '0');

  svg
    .append('rect')
    .attr('x', gradientAreaLeft)
    .attr('y', gradientAreaTop)
    .attr('width', gradientAreaWidth)
    .attr('height', gradientAreaHeight)
    .attr('fill', colors.backgroundGray);

  svg
    .append('rect')
    .attr('x', gradientAreaLeft)
    .attr('y', gradientAreaTop)
    .attr('width', gradientAreaWidth)
    .attr('height', gradientAreaHeight)
    .attr('fill', 'url(#topLeftGradient)')
    .attr('mix-blend-mode', 'screen');

  svg
    .append('rect')
    .attr('x', gradientAreaLeft)
    .attr('y', gradientAreaTop)
    .attr('width', gradientAreaWidth)
    .attr('height', gradientAreaHeight)
    .attr('fill', 'url(#topRightGradient)')
    .attr('mix-blend-mode', 'screen');

  svg
    .append('rect')
    .attr('x', gradientAreaLeft)
    .attr('y', gradientAreaTop)
    .attr('width', gradientAreaWidth)
    .attr('height', gradientAreaHeight)
    .attr('fill', 'url(#bottomLeftGradient)')
    .attr('mix-blend-mode', 'screen');

  svg
    .append('rect')
    .attr('x', gradientAreaLeft)
    .attr('y', gradientAreaTop)
    .attr('width', gradientAreaWidth)
    .attr('height', gradientAreaHeight)
    .attr('fill', 'url(#bottomRightGradient)')
    .attr('mix-blend-mode', 'screen');
}
