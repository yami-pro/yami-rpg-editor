'use strict'

// ******************************** 窗口对象 ********************************

const Window = {
  // properties
  ambient: $('#window-ambient'),
  frames: [],
  positionMode: 'center',
  absolutePos: {x: 0, y: 0},
  overlapRoot: null,
  activeElement: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  closeAll: null,
  setPositionMode: null,
  saveActiveElement: null,
  restoreActiveElement: null,
  refocus: null,
  confirm: null,
  // events
  keydown: null,
  cancel: null,
}

export { Window }
