'use strict'

// ******************************** 编辑器对象 ********************************

const Editor = {
  // properties
  state: 'closed',
  config: null,
  project: null,
  promises: [],
  // methods
  initialize: null,
  open: null,
  close: null,
  quit: null,
  updatePath: null,
  switchHotkey: null,
  protectPromise: null,
  saveConfig: null,
  loadConfig: null,
  saveProject: null,
  loadProject: null,
  saveManifest: null,
}

export { Editor }
