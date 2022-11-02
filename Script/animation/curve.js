'use strict'

// ******************************** 曲线窗口 ********************************

const Curve = {
  // properties
  state: 'closed',
  page: $('#animation-easing').hide(),
  head: $('#animation-easing-head'),
  list: $('#animation-easing-id').hide(),
  canvas: $('#animation-easing-canvas'),
  target: null,
  index: null,
  curveMap: null,
  // methods
  initialize: null,
  open: null,
  load: null,
  close: null,
  suspend: null,
  resume: null,
  updateHead: null,
  updateEasingOptions: null,
  updateTimeline: null,
  resize: null,
  drawCurve: null,
  requestRendering: null,
  renderingFunction: null,
  stopRendering: null,
  // events
  windowResize: null,
  themechange: null,
  datachange: null,
  easingIdWrite: null,
  easingIdInput: null,
  settingsPointerdown: null,
}

export { Curve }
