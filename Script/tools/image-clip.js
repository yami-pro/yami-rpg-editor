'use strict'

// ******************************** 图像剪辑窗口 ********************************

const ImageClip = {
  // properties
  window: $('#imageClip'),
  screen: $('#imageClip-screen'),
  image: $('#imageClip-image').hide(),
  marquee: $('#imageClip-marquee').hide(),
  target: null,
  symbol: null,
  dragging: null,
  // methods
  initialize: null,
  open: null,
  loadImage: null,
  updateImage: null,
  updateTitle: null,
  updateMarquee: null,
  shiftMarquee: null,
  scrollToMarquee: null,
  startDragging: null,
  // events
  dprchange: null,
  windowClosed: null,
  windowResize: null,
  screenKeydown: null,
  marqueePointerdown: null,
  marqueeDoubleclick: null,
  pointerup: null,
  pointermove: null,
  paramInput: null,
  confirm: null,
}

export { ImageClip }
