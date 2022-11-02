'use strict'

// ******************************** 图块节点窗口 ********************************

const TileNode = {
  // properties
  canvas: $('#autoTile-selectNode-canvas'),
  context: null,
  screen: $('#autoTile-selectNode-screen'),
  marquee: $('#autoTile-selectNode-marquee'),
  dragging: null,
  nodes: null,
  image: null,
  offsetX: null,
  offsetY: null,
  hframes: null,
  vframes: null,
  scrollLeft: null,
  scrollTop: null,
  scrollRight: null,
  scrollBottom: null,
  // methods
  initialize: null,
  open: null,
  updateTransform: null,
  updateBackground: null,
  drawNodes: null,
  requestRendering: null,
  renderingFunction: null,
  stopRendering: null,
  scrollToSelection: null,
  getDevicePixelClientBoxSize: null,
  // events
  dprchange: null,
  windowClosed: null,
  keydown: null,
  screenScroll: null,
  marqueePointerdown: null,
  pointerup: null,
  pointermove: null,
}

export { TileNode }
