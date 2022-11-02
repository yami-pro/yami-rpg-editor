'use strict'

// ******************************** 图块帧索引窗口 ********************************

const TileFrame = {
  // properties
  window: $('#autoTile-frameIndex'),
  screen: $('#autoTile-frameIndex-screen'),
  clip: $('#autoTile-frameIndex-image-clip'),
  mask: $('#autoTile-frameIndex-mask'),
  image: $('#autoTile-frameIndex-image'),
  marquee: $('#autoTile-frameIndex-marquee'),
  info: $('#autoTile-frameIndex-info'),
  dragging: null,
  hframes: null,
  vframes: null,
  // methods
  initialize: null,
  open: null,
  selectTileFrame: null,
  scrollToSelection: null,
  getDevicePixelClientBoxSize: null,
  // events
  dprchange: null,
  windowClosed: null,
  keydown: null,
  marqueePointerdown: null,
  marqueePointermove: null,
  marqueePointerleave: null,
  pointerup: null,
  pointermove: null,
}

export { TileFrame }
