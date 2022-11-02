'use strict'

// ******************************** 预设元素窗口 ********************************

const PresetElement = {
  // properties
  ui: $('#presetElement-uiId'),
  list: $('#presetElement-list'),
  target: null,
  nodes: null,
  // methods
  initialize: null,
  open: null,
  buildNodes: null,
  getDefaultPresetId: null,
  // events
  windowClosed: null,
  uiIdWrite: null,
  listOpen: null,
  confirm: null,
}

export { PresetElement }
