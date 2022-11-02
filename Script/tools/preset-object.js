'use strict'

// ******************************** 场景预设对象窗口 ********************************

const PresetObject = {
  // properties
  list: $('#presetObject-list'),
  searcher: $('#presetObject-searcher'),
  target: null,
  nodes: null,
  // methods
  initialize: null,
  open: null,
  buildNodes: null,
  getDefaultPresetId: null,
  // events
  windowClosed: null,
  searcherKeydown: null,
  searcherInput: null,
  listOpen: null,
  confirm: null,
}

export { PresetObject }
